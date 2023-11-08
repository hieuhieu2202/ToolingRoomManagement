$(function () {
    GetUserSigns();
});
$(document).off('focusin.modal');
function GetUserSigns(IsTable = true) {
    $.ajax({
        type: "POST",
        url: "/NVIDIA/BorrowManagement/GetUserBorrowSigns",
        dataType: "json",
        contentType: "application/json;charset=utf-8",
        success: function (response) {
            if (response.status) {
                var borrows = JSON.parse(response.borrows);

                const counts = {
                    totalRequest: borrows.length,
                    totalPending: 0,
                    totalApproved: 0,
                    totalRejected: 0
                };

                $.each(borrows, function (index, borrow) {
                    counts["total" + borrow.Status]++;
                });
                $('#info-request').text(counts.totalRequest);
                $('#info-pending').text(counts.totalPending);
                $('#info-approved').text(counts.totalApproved);
                $('#info-rejected').text(counts.totalRejected);

                if (IsTable)
                    CreateTableBorrow(borrows);
            }
            else {
                toastr["error"](response.message, "ERROR");
            }
        },
        error: function (error) {
            Swal.fire("Something went wrong!", GetAjaxErrorMessage(error), "error");
        }
    });
}

// table
var table_Borrow;
async function CreateTableBorrow(borrows) {
    if (table_Borrow) table_Borrow.destroy();

    $('#table_Borrows-tbody').html('');
    await $.each(borrows, function (no, item) {
        var row = DrawDatatableRow(no, item);

        $('#table_Borrows-tbody').append(row);
    });

    const options = {
        scrollY: 480,
        scrollX: true,
        order: [],
        autoWidth: false,
        columnDefs: [           
            { targets: [7], className: "text-center", orderable: false, width: "50px" },
            { targets: [4, 5, 6], className: "text-center", orderable: true, width: "100px" },
            { targets: "_all", orderable: false },
        ],
        "lengthMenu": [[10, 15, 25, 50, -1], [10, 15, 25, 50, "All"]]
    };
    table_Borrow = $('#table_Borrows').DataTable(options);
    table_Borrow.columns.adjust();
}

// show modal
$('#table_Borrows tbody').on('dblclick', 'tr', function (event) {

    var Id = $(this).data('id');
    var IdSign = $(this).data('idsign')

    Details(Id, IdSign);
});
function Details(Id, IdSign) {
    if (IdSign) {
        $('#action_footer').show();
        $('#normal_footer').hide();

        $('#action_footer button[btn-reject]').data('id', Id);
        $('#action_footer button[btn-reject]').data('idsign', IdSign);

        $('#action_footer button[btn-approve]').data('id', Id);      
        $('#action_footer button[btn-approve]').data('idsign', IdSign);
    }
    else {
        $('#action_footer').hide();
        $('#normal_footer').show();
    }

    RequestDetails(Id);

    
}

// approve
function Approve(elm, e) {
    e.preventDefault();

    var Ids = {
        IdBorrow: $(elm).data('id'),
        IdSign: $(elm).data('idsign')
    };
    var Index = table_Borrow.row(`[data-id="${Ids.IdBorrow}"]`).index();

    $.ajax({
        type: "GET",
        url: "/NVIDIA/BorrowManagement/GetBorrow?Id=" + Ids.IdBorrow,
        dataType: "json",
        contentType: "application/json;charset=utf-8",
        success: async function (response) {
            if (response.status) {
                var borrow = JSON.parse(response.borrow);

                var html = $(`<p>User: <b>${CreateUserName(borrow.User)}</b></p>`);              

                html.append(`<p>Created Date: <b>${moment(borrow.DateBorrow).format('YYYY-MM-DD HH:mm:ss') }</b></p>`);

                Swal.fire({
                    title: `<strong style="font-size: 25px;">Do you want Approve this borrow request?</strong>`,
                    html: html,
                    icon: 'question',
                    reverseButtons: false,
                    confirmButtonText: 'Approve',
                    showCancelButton: true,
                    cancelButtonText: 'Cancel',
                    buttonsStyling: false,
                    reverseButtons: true,
                    customClass: {
                        cancelButton: 'btn btn-outline-secondary fw-bold me-3',
                        confirmButton: 'btn btn-success fw-bold'
                    },
                }).then((result) => {
                    if (result.isConfirmed) {
                        $.ajax({
                            type: "POST",
                            url: "/NVIDIA/BorrowManagement/Approve",
                            data: JSON.stringify(Ids),
                            dataType: "json",
                            contentType: "application/json;charset=utf-8",
                            success: function (response) {
                                if (response.status) {
                                    var row = DrawDatatableArray(JSON.parse(response.borrow));



                                    var rows = table_Borrow.row(Index).data(row).draw(false);
                                    var rowElement = rows.node();
                                    if (rowElement) {
                                        rowElement.classList.remove('hl-pending');
                                    }

                                    GetUserSigns(false);

                                    toastr["success"]("Borrow request was Approved.", "SUCCRESS");

                                    $('#borrow_modal').modal('hide');
                                }
                                else {
                                    toastr["error"](response.message, "ERROR");
                                }
                            },
                            error: function (error) {
                                Swal.fire("Something went wrong!", GetAjaxErrorMessage(error), "error");
                            }
                        });
                    }
                });
            }
            else {
                toastr["error"](response.message, "ERROR");
            }
        },
        error: function (error) {
            Swal.fire("Something went wrong!", GetAjaxErrorMessage(error), "error");
        }
    });
}
function Reject(elm, e) {
    e.preventDefault();

    var Ids = {
        IdBorrow: $(elm).data('id'),
        IdSign: $(elm).data('idsign')
    };
    var Index = table_Borrow.row(`[data-id="${Ids.IdBorrow}"]`).index();

    $.ajax({
        type: "GET",
        url: "/NVIDIA/BorrowManagement/GetBorrow?Id=" + Ids.IdBorrow,
        dataType: "json",
        contentType: "application/json;charset=utf-8",
        success: async function (response) {
            if (response.status) {
                var borrow = JSON.parse(response.borrow);


                var html = $(`<div></div>`);
                html.append(`<p>User: <b>${CreateUserName(borrow.User)}</b></p>`);
                html.append(`<p>Created Date: <b>${moment(borrow.DateBorrow).format('YYYY-MM-DD HH:mm:ss')}</b></p>`);
                html.append(`<div class="text-start">
                                 <label class="form-label">Note</label>
                                 <textarea class="form-control" rows="3" style="resize: none" id="reject-Note"></textarea>
                             </div>`);
                Swal.fire({
                    title: `<strong style="font-size: 25px;">Do you want Reject this borrow request?</strong>`,
                    html: html,
                    icon: 'question',
                    reverseButtons: false,
                    confirmButtonText: 'Reject',
                    showCancelButton: true,
                    cancelButtonText: 'Cancel',
                    buttonsStyling: false,
                    reverseButtons: true,
                    customClass: {
                        cancelButton: 'btn btn-outline-secondary fw-bold me-3',
                        confirmButton: 'btn btn-danger fw-bold'
                    },
                }).then((result) => {
                    if (result.isConfirmed) {
                        Ids.Note = $('#reject-Note').val();

                        $.ajax({
                            type: "POST",
                            url: "/NVIDIA/BorrowManagement/Reject",
                            data: JSON.stringify(Ids),
                            dataType: "json",
                            contentType: "application/json;charset=utf-8",
                            success: function (response) {
                                if (response.status) {
                                    var row = DrawDatatableArray(JSON.parse(response.borrow));                                    

                                    var rows = table_Borrow.row(Index).data(row).draw(false);
                                    var rowElement = rows.node();
                                    if (rowElement) {
                                        rowElement.classList.remove('hl-pending');
                                    }

                                    GetUserSigns(false);

                                    toastr["success"]("Borrow request was Approved.", "SUCCRESS");
                                }
                                else {
                                    toastr["error"](response.message, "ERROR");
                                }
                            },
                            error: function (error) {
                                Swal.fire("Something went wrong!", GetAjaxErrorMessage(error), "error");
                            }
                        });  

                        $('#borrow_modal').modal('hide');
                    }
                });
                
            }
            else {
                toastr["error"](response.message, "ERROR");
            }
        },
        error: function (error) {
            Swal.fire("Something went wrong!", GetAjaxErrorMessage(error), "error");
        }
    });
}

// other
function CreateTableCellUser(user) {
    var opt = $(`<td></td>`);

    if (user.VnName && user.VnName != '') {
        opt.text(`${user.Username} - ${user.VnName}`);
    }
    else if (user.CnName && user.CnName != '') {
        opt.text(`${user.Username} - ${user.CnName}`);
    }

    if (user.EnName != null && user.EnName != '') {
        var addUserEnName = opt.text();
        addUserEnName += ` (${user.EnName})`;
        opt.text(addUserEnName);
    }
    return opt;
}

function DrawDatatableRow(no, item) {
    var showButton = false;
    var idSign = 0;
    var signStatus = '';
    $.each(item.UserBorrowSigns, function (k, v) {
        if (v.Status == "Pending") {
            if (v.User.Username == $('#CardID').text()) {
                showButton = true;
                idSign = v.Id;
                signStatus = v.Status;
                return false;
            }
        }
        else {
            if (v.User.Username == $('#CardID').text()) {
                signStatus = v.Status;
            }
        }
    });

    var row = $(`<tr class="align-middle" data-id="${item.Id}" data-idsign="${idSign}"></tr>`);

    // ID
    row.append(`<td>${moment(item.DateBorrow).format('YYYYMMDDHHmm')}-${item.Id}</td>`);
    // Created By
    row.append(CreateTableCellUser(item.User));
    // Created Date
    row.append(`<td>${moment(item.DateBorrow).format('YYYY-MM-DD HH:mm:ss')}</td>`);  
    // Note
    row.append(`<td title="${item.Note}">${item.Note ? item.Note : ''}</td>`);
    // Type
    switch (item.Type) {
        case "Borrow": {
            row.append(`<td><span class="badge bg-primary"><i class="fa-solid fa-left-to-line"></i> Borrow</span></td>`);
            break;
        }
        case "Return": {
            row.append(`<td><span class="badge bg-info"><i class="fa-solid fa-right-to-line"></i> Return</span></td>`);
            break;
        }
        case "Take": {
            row.append(`<td><span class="badge bg-secondary"><i class="fa-regular fa-inbox-full"></i> Take</span></td>`);
            break;
        }
        default: {
            row.append(`<td><span class="badge bg-secondary">N/A</span></td>`);
            break;
        }
    }   
    // Status
    switch (item.Status) {
        case "Pending": {
            row.append(`<td><span class="badge bg-warning"><i class="fa-solid fa-timer"></i> Pending</span></td>`);
            break;
        }
        case "Approved": {
            row.append(`<td><span class="badge bg-success"><i class="fa-solid fa-check"></i> Approved</span></td>`);
            break;
        }
        case "Rejected": {
            row.append(`<td><span class="badge bg-danger"><i class="fa-solid fa-xmark"></i> Rejected</span></td>`);
            break;
        }
        default: {
            row.append(`<td><span class="badge bg-secondary">N/A</span></td>`);
            break;
        }
    }
    
    

    // Sign
    switch (signStatus) {
        case "Approved": {
            row.append(`<td><span class="badge bg-success"><i class="fa-solid fa-check"></i> Approved</span></td>`);
            
            break;
        }
        case "Rejected": {
            row.append(`<td><span class="badge bg-danger"><i class="fa-solid fa-xmark"></i> Rejected</span></td>`);
            //row.addClass('hl-danger');
            break;
        }
        case "Pending": {
            row.append(`<td><span class="badge bg-warning"><i class="fa-solid fa-timer"></i> Pending</span></td>`);
            row.addClass('hl-pending');
            break;
        }
        default: {
            row.append(`<td><span class="badge bg-secondary"><i class="fa-regular fa-circle-pause"></i> Waitting</span></td>`);           
            break;
        }
    }
    // Action
    if (showButton)
        row.append(`<td class="order-action d-flex text-center justify-content-center">
                        <a href="javascript:;" class="text-info    bg-light-info    border-0" title="Details" onclick="Details(${item.Id}, ${idSign})"><i class="fa-regular fa-circle-info"></i></a>
                        <a href="javascript:;" class="text-success bg-light-success border-0" title="Approve" data-id="${item.Id}" data-idsign="${idSign}" onclick="Approve(this, event)"><i class="fa-duotone fa-check"></i></a>                                
                        <a href="javascript:;" class="text-danger  bg-light-danger  border-0" title="Reject " data-id="${item.Id}" data-idsign="${idSign}" onclick="Reject(this, event) "><i class="fa-solid fa-x"></i></a>   
                    </td>`);
    else
        row.append(`<td class="order-action d-flex text-center justify-content-center">
                        <a href="javascript:;" class="text-info    bg-light-info    border-0" title="Details" onclick="Details(${item.Id}, ${idSign})"><i class="fa-regular fa-circle-info"></i></a> 
                    </td>`);
    return row;
}
function DrawDatatableArray(item) {
    var row = [];

    // ID
    row.push(`${moment(item.DateBorrow).format('YYYYMMDDHHmm')}-${item.Id}`);
    // Created By
    row.push(CreateUserName(item.User));
    // Created Date
    row.push(moment(item.DateBorrow).format('YYYY-MM-DD HH:mm:ss'));
    // Note
    row.push(item.Note ? item.Note : '');
    // Type
    switch (item.Type) {
        case "Borrow": {
            row.push(`<span class="badge bg-primary"><i class="bx bx-arrow-to-left"></i> Borrow</span>`);
            break;
        }
        case "Return": {
            row.push(`<span class="badge bg-info"><i class="bx bx-arrow-to-right"></i> Return</span>`);
            break;
        }
        case "Take": {
            row.push(`<span class="badge bg-secondary"><i class="fa-regular fa-inbox-full"></i> Take</span>`);
            break;
        }
        default: {
            row.push(`<span class="text-secondary fw-bold">N/A</span>`);
            break;
        }
    }
    // Status
    switch (item.Status) {
        case "Pending": {
            row.push(`<span class="badge bg-warning"><i class="bx bx-time"></i> Pending</span>`);
            break;
        }
        case "Approved": {
            row.push(`<span class="badge bg-success"><i class="bx bx-check"></i> Approved</span>`);
            break;
        }
        case "Rejected": {
            row.push(`<span class="badge bg-danger"><i class="bx bx-x"></i> Rejected</span>`);
            break;
        }
        default: {
            row.push(`<span class="text-secondary fw-bold">N/A</span>`);
            break;
        }
    }
    var showButton = false;
    var idSign = 0;
    var signStatus = '';
    $.each(item.UserBorrowSigns, function (k, v) {
        if (v.Status == "Pending") {
            if (v.User.Username == $('#CardID').text()) {
                showButton = true;
                idSign = v.Id;
                signStatus = v.Status;
                return false;
            }
        }
        else {
            if (v.User.Username == $('#CardID').text()) {
                signStatus = v.Status;
            }
        }
    });

    // Sign
    switch (signStatus) {
        case "Approved": {
            row.push(`<span class="badge bg-success"><i class="bx bx-check"></i> Approved</span>`);
            break;
        }
        case "Rejected": {
            row.push(`<span class="badge bg-danger"><i class="bx bx-x"></i> Rejected</span>`);
            break;
        }
        case "Pending": {
            row.push(`<span class="badge bg-warning"><i class="fa-solid fa-timer"></i> Pending</span>`);
            break;
        }
        default: {
            row.push(`<span class="text-secondary fw-bold">N/A</span>`);
            break;
        }
    }
    // Action
    if (showButton) {
        row.push(`<a href="javascript:;" class="text-info    bg-light-info    border-0" title="Details" onclick="Details(${item.Id}, ${idSign})"><i class="fa-regular fa-circle-info"></i></a>
                  <a href="javascript:;" class="text-success bg-light-success border-0" title="Approve" data-id="${item.Id}" data-idsign="${idSign}" onclick="Approve(this, event)"><i class="fa-duotone fa-check"></i></a>                                
                  <a href="javascript:;" class="text-danger  bg-light-danger  border-0" title="Reject " data-id="${item.Id}" data-idsign="${idSign}" onclick="Reject(this, event) "><i class="fa-solid fa-x"></i></a>   `);
    }
    else {
        row.push(`<a href="javascript:;" class="text-info    bg-light-info    border-0" title="Details" onclick="Details(${item.Id}, ${idSign})"><i class="fa-regular fa-circle-info"></i></a> `);
    }

    return row;
}
