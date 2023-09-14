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
        var row = $(`<tr class="align-middle"></tr>`);

        // Created Date
        row.append(`<td>${moment(item.DateBorrow).format('YYYY-MM-DD HH:mm:ss')}</td>`);
        // Created By
        row.append(CreateTableCellUser(item.User));
        // Due Date
        row.append(`<td>${item.DateDue ? moment(item.DateDue).format('YYYY-MM-DD HH:mm:ss') : ''}</td>`);
        // Return Date
        row.append(`<td>${item.DateReturn ? moment(item.DateReturn).format('YYYY-MM-DD HH:mm:ss') : ''}</td>`);
        // Type
        switch (item.Type) {
            case "Borrow": {
                row.append(`<td><span class="badge bg-primary"><i class="bx bx-arrow-to-left"></i> Borrow</span></td>`);
                break;
            }
            case "Return": {
                row.append(`<td><span class="badge bg-info"><i class="bx bx-arrow-to-right"></i> Return</span></td>`);
                break;
            }
            default: {
                row.append(`<td><span class="text-secondary fw-bold">N/A</span></td>`);
                break;
            }
        }
        // Status
        switch (item.Status) {
            case "Pending": {
                row.append(`<td><span class="badge bg-warning"><i class="bx bx-time"></i> Pending</span></td>`);
                break;
            }
            case "Approved": {
                row.append(`<td><span class="badge bg-success"><i class="bx bx-check"></i> Approved</span></td>`);
                break;
            }
            case "Rejected": {
                row.append(`<td><span class="badge bg-danger"><i class="bx bx-x"></i> Rejected</span></td>`);
                break;
            }
            default: {
                row.append(`<td><span class="text-secondary fw-bold">N/A</span></td>`);
                break;
            }
        }
        // Action
        row.append(`<td><button type="button" class="btn btn-outline-info p-0 m-0 border-0 btn-custom" data-id="${item.Id}" onclick="BorrowDetails(this, event)"><i class="bx bx-info-circle"></i></button></td>`);

        $('#table_Borrows-tbody').append(row);
    });

    const options = {
        scrollY: 420,
        scrollX: true,
        order: [0],
        autoWidth: false,
        columnDefs: [
            { targets: "_all", orderable: true },
            { targets: [4, 5], className: "text-center" },
            { targets: [6], className: "text-end", orderable: false },
        ],
        "lengthMenu": [[10, 15, 25, 50, -1], [10, 15, 25, 50, "All"]]
    };
    table_Borrow = $('#table_Borrows').DataTable(options);
    table_Borrow.columns.adjust();
}

function BorrowDetails(elm, e) {
    e.preventDefault();

    var Id = $(elm).data('id');

    $.ajax({
        type: "GET",
        url: "/NVIDIA/BorrowManagement/GetBorrow?Id=" + Id,
        dataType: "json",
        contentType: "application/json;charset=utf-8",
        success: function (response) {
            if (response.status) {
                var borrow = JSON.parse(response.borrow);

                CreateModal(borrow);

                $('#borrow_modal').modal('show');
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
function CreateModal(borrow) {
    $('#borrow_modal-CardId').val(borrow.User.Username);
    $('#borrow_modal-Username').val(borrow.User.VnName ? borrow.User.VnName : (borrow.User.CnName ? borrow.User.CnName : (borrow.User.EnName ? borrow.User.EnName : "")));

    $('#borrow_modal-BorrowDate').val(moment(borrow.DateBorrow).format('YYYY-MM-DDTHH:mm:ss'));
    $('#borrow_modal-DuaDate').val(moment(borrow.DateDue).format('YYYY-MM-DDTHH:mm:ss'));
    $('#borrow_modal-ReturnDate').val(moment(borrow.DateReturn).format('YYYY-MM-DDTHH:mm:ss'));

    $('#borrow_modal-Note').html(`<p>${borrow.Note}</p>`);

    if (borrow.Type == 'Return') {
        $('#borrow_modal-title').text('Return Request Details');
        $('#borrow_modal-name').text('RETURN REQUEST');
    }
    else {
        $('#borrow_modal-title').text('Borrow Request Details');
        $('#borrow_modal-name').text('BORROW REQUEST');
    }

    $('#borrow_modal-table-tbody').empty();
    $.each(borrow.BorrowDevices, function (k, item) {
        var borrowQty = item.BorrowQuantity ? item.BorrowQuantity : '';
        var deviceCode = item.Device.DeviceCode ? item.Device.DeviceCode : '';
        var deviceName = item.Device.DeviceName ? item.Device.DeviceName : '';
        var deviceModel = item.Device.Model ? item.Device.Model.ModelName : '';
        var deviceStation = item.Device.Station ? item.Device.Station.StationName : '';

        var row = $('<tr></tr>');
        row.append(`<td>${deviceCode}</td>`);
        row.append(`<td>${deviceName}</td>`);
        row.append(`<td>${deviceModel}</td>`);
        row.append(`<td>${deviceStation}</td>`);
        row.append(`<td class="text-center">${borrowQty}</td>`);

        $('#borrow_modal-table-tbody').append(row);
    });

    $('#sign-container').empty();
    $('#sign-container').append(`<h4 class="font-weight-light text-center text-white py-3">SIGN PROCESS</h4>`);
    var pendingUsed = false;
    $.each(borrow.UserBorrowSigns, function (k, bs) { //bs == borrow sign
        var color = '';
        var text = '';
        var username = CreateUserName(bs.User);
        var date = moment(bs.DateSign).format('ddd, MMM Do YYYY h:mm A');

        if (bs.IsApproved != null) {
            if (bs.IsApproved) {
                color = 'success';
                text = 'Approved';
            }
            else {
                color = 'danger';
                text = 'Rejected';
            }
        }
        else {
            if (!pendingUsed) {
                color = 'warning';
                text = 'Pending';
            }
            else {
                color = 'secondary';
                text = 'Pending';
            }

            pendingUsed = true;
        }

        var line = {
            top: '',
            bot: ''
        }
        if (k == 0 && borrow.UserBorrowSigns.length == 1) {
            line.top = '';
            line.bot = '';
        }
        else if (k == 0) {
            line.top = '';
            line.bot = 'border-end';
        }
        else if (k == (borrow.UserBorrowSigns.length - 1)) {
            line.top = 'border-end';
            line.bot = '';
        }
        else {
            line.top = 'border-end';
            line.bot = 'border-end';
        }

        var lineDot = `<div class="col-sm-1 text-center flex-column d-none d-sm-flex">
                           <div class="row h-50">
                               <div class="col ${line.top}">&nbsp;</div>
                               <div class="col">&nbsp;</div>
                           </div>
                           <h5 class="m-2">
                               <span class="badge rounded-pill bg-${color}">&nbsp;</span>
                           </h5>
                           <div class="row h-50">
                               <div class="col ${line.bot}">&nbsp;</div>
                               <div class="col">&nbsp;</div>
                           </div>
                       </div>`;
        var signCard = '';
        if (borrow.UserBorrowSigns.length > 1) {
            signCard = `<div class="row">
                            ${(k % 2 == 0) ? '' : '<div class="col-sm"></div>'}
                            ${(k % 2 == 0) ? '' : lineDot}
                            <div class="col-sm py-2">
                                <div class="card border-primary shadow radius-15 card-sign">
                                    <div class="card-body">
                                        <div class="float-end">${date == 'Invalid date' ? '' : date}</div>
                                        <h5 class="card-title bg-${color} sign-badge">${text}</h5>
                                        <p class="card-text mb-1">${username}</p>
                                        <p class="card-text mb-1">${bs.User.Email ? bs.User.Email : ''}</p>
                                        <button class="btn btn-sm btn-outline-secondary collapsed ${text == 'Reject' ? '' : 'd-none'}" type="button" data-bs-target="#t2_details" data-bs-toggle="collapse" aria-expanded="false">Show Details ▼</button>
                                        <div class="border collapse" id="t2_details" style="">
                                            <div class="p-2 text-monospace">
                                                <div>${bs.Note}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            ${(k % 2 == 0) ? lineDot : ''}
                            ${(k % 2 == 0) ? '<div class="col-sm"></div>' : ''}
                        </div>`;
        }
        else {
            signCard = `<div class="row">
                            ${lineDot}
                            <div class="col-sm py-2">
                                <div class="card border-primary shadow radius-15 card-sign">
                                    <div class="card-body">
                                        <div class="float-end">${date == 'Invalid date' ? '' : date}</div>
                                        <h5 class="card-title bg-${color} sign-badge">${text}</h5>
                                        <p class="card-text mb-1">${username}</p>
                                        <p class="card-text mb-1">${bs.User.Email ? bs.User.Email : ''}</p>
                                        <button class="btn btn-sm btn-outline-secondary collapsed ${text == 'Reject' ? '' : 'd-none'}" type="button" data-bs-target="#t2_details" data-bs-toggle="collapse" aria-expanded="false">Show Details ▼</button>
                                        <div class="border collapse" id="t2_details" style="">
                                            <div class="p-2 text-monospace">
                                                <div>${bs.Note}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>`;
        }

        $('#sign-container').append(signCard);
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
function CreateUserName(user) {
    var username = '';
    if (user.VnName && user.VnName != '') {
        username = `${user.Username} - ${user.VnName}`;
    }
    else if (user.CnName && user.CnName != '') {
        username = `${user.Username} - ${user.CnName}`;
    }
    if (user.EnName != null && user.EnName != '') {
        username += ` (${user.EnName})`;
    }

    return username;
}