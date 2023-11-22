$(function () {
    GetUserBorrows();
});
function GetUserBorrows() {
    $.ajax({
        type: "GET",
        url: "/NVIDIA/BorrowManagement/GetUserBorrows",
        dataType: "json",
        contentType: "application/json;charset=utf-8",
        success: function (response) {
            if (response.status) {
                var borrows = response.borrows;
                var returns = response.returns;

                var counts = {
                    totalRequest: borrows.length + returns.length,
                    totalPending: 0,
                    totalApproved: 0,
                    totalRejected: 0
                };

                $.each(borrows, function (index, borrow) {
                    counts["total" + borrow.Status]++;                   
                });
                $.each(returns, function (index, returnRQ) {
                    counts["total" + returnRQ.Status]++;
                });

                $('#info-request').text(counts.totalRequest);
                $('#info-pending').text(counts.totalPending);
                $('#info-approved').text(counts.totalApproved);
                $('#info-rejected').text(counts.totalRejected);

                CreateTableBorrow(borrows, returns);
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
async function CreateTableBorrow(borrows, returns) {
    if (table_Borrow) table_Borrow.destroy(); 

    $('#table_Borrows-tbody').html('');

    // Borrow
    await $.each(borrows, function (no, item) {
        var row = $(`<tr class="align-middle" data-id="${item.Id}" title="Double-click to view device details." IsBorrow></tr>`);

        // ID
        row.append(`<td>${moment(item.DateBorrow).format('YYYYMMDDHHmm')}-${item.Id}</td>`);
        // Created By
        row.append(CreateTableCellUser(item.User));
        // Created Date
        row.append(`<td>${moment(item.DateBorrow).format('YYYY-MM-DD HH:mm:ss')}</td>`);
        // Due Date
        row.append(`<td>${item.DateDue ? moment(item.DateDue).format('YYYY-MM-DD HH:mm:ss') : ''}</td>`);
        // Return Date
        row.append(`<td>${item.DateReturn ? moment(item.DateReturn).format('YYYY-MM-DD HH:mm:ss') : ''}</td>`);
        // Note
        row.append(`<td title="${item.Note ? item.Note : ''}s">${item.Note ? item.Note : ''}</td>`);
        // Type
        switch (item.Type) {
            case "Borrow": {
                row.append(`<td><span class="badge bg-primary"><i class="fa-solid fa-left-to-line"></i> Borrow</span></td>`);
                break;
            }
            case "Take": {
                row.append(`<td><span class="badge bg-secondary"><i class="fa-regular fa-inbox-full"></i> Take</span></td>`);
                break;
            }
            case "Return": {
                row.append(`<td><span class="badge bg-info"><i class="fa-solid fa-right-to-line"></i> Return</span></td>`);
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
                row.addClass('hl-pending');
                break;
            }
            case "Approved": {
                row.append(`<td><span class="badge bg-success"><i class="fa-solid fa-check"></i> Approved</span></td>`);
                break;
            }
            case "Rejected": {
                row.append(`<td><span class="badge bg-danger"><i class="fa-solid fa-xmark"></i> Rejected</span></td>`);
                //row.addClass('hl-danger');
                break;
            }
            default: {
                row.append(`<td><span class="badge bg-secondary">N/A</span></td>`);
                break;
            }
        }
        // Action
        row.append(`<td class="order-action d-flex text-center justify-content-center">
                         <a href="javascript:;" class="text-info bg-light-info border-0" title="Details" data-id="${item.Id}" onclick="RequestDetails(${item.Id})"><i class="fa-regular fa-circle-info"></i></a>
                    </td>`);

        $('#table_Borrows-tbody').append(row);
    });

    // Return
    await $.each(returns, function (no, item) {
        var row = $(`<tr class="align-middle" data-id="${item.Id}" title="Double-click to view device details." IsReturn></tr>`);

        // ID
        row.append(`<td>${moment(item.DateBorrow).format('YYYYMMDDHHmm')}-${item.Id}</td>`);
        // Created By
        row.append(CreateTableCellUser(item.User));
        // Created Date
        row.append(`<td>${moment(item.DateBorrow).format('YYYY-MM-DD HH:mm:ss')}</td>`);
        // Due Date
        row.append(`<td>${item.DateDue ? moment(item.DateDue).format('YYYY-MM-DD HH:mm:ss') : ''}</td>`);
        // Return Date
        row.append(`<td>${item.DateReturn ? moment(item.DateReturn).format('YYYY-MM-DD HH:mm:ss') : ''}</td>`);
        // Note
        row.append(`<td title="${item.Note ? item.Note : ''}s">${item.Note ? item.Note : ''}</td>`);
        // Type
        switch (item.Type) {
            case "Borrow": {
                row.append(`<td><span class="badge bg-primary"><i class="fa-solid fa-left-to-line"></i> Borrow</span></td>`);
                break;
            }
            case "Take": {
                row.append(`<td><span class="badge bg-secondary"><i class="fa-regular fa-inbox-full"></i> Take</span></td>`);
                break;
            }
            case "Return": {
                row.append(`<td><span class="badge bg-info"><i class="fa-solid fa-right-to-line"></i> Return</span></td>`);
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
                row.addClass('hl-pending');
                break;
            }
            case "Approved": {
                row.append(`<td><span class="badge bg-success"><i class="fa-solid fa-check"></i> Approved</span></td>`);
                break;
            }
            case "Rejected": {
                row.append(`<td><span class="badge bg-danger"><i class="fa-solid fa-xmark"></i> Rejected</span></td>`);
                //row.addClass('hl-danger');
                break;
            }
            default: {
                row.append(`<td><span class="badge bg-secondary">N/A</span></td>`);
                break;
            }
        }
        // Action
        row.append(`<td class="order-action d-flex text-center justify-content-center">
                         <a href="javascript:;" class="text-info bg-light-info border-0" title="Details" data-id="${item.Id}" onclick="ReturnDetails(${item.Id})"><i class="fa-regular fa-circle-info"></i></a>
                    </td>`);

        $('#table_Borrows-tbody').append(row);
    });

    const options = {
        scrollY: 480,
        scrollX: true,
        order: [2],
        autoWidth: false,
        columnDefs: [            
            { targets: [6, 7], className: "text-center" },
            { targets: [8], className: "text-center", orderable: false, width: '20px;' },
            { targets: "_all", orderable: false },
        ],
        "lengthMenu": [[10, 15, 25, 50, -1], [10, 15, 25, 50, "All"]]
    };
    table_Borrow = $('#table_Borrows').DataTable(options);
    table_Borrow.columns.adjust();
}

$('#table_Borrows tbody').on('dblclick', 'tr', function (event) {
    var dataId = $(this).data('id');
    var type = $(this).is('[IsBorrow]') ? "Borrow" : "Return";

    if (type == "Borrow") RequestDetails(dataId);
    else if (type == "Return") ReturnDetails(dataId);
});

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