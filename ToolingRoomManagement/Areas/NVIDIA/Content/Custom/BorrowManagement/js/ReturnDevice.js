$(function () {
    GetListBorrowRequests();
});
function GetListBorrowRequests() {
    $.ajax({
        type: "GET",
        url: "/NVIDIA/BorrowManagement/GetListBorrowRequests",
        dataType: "json",
        contentType: "application/json;charset=utf-8",
        success: function (response) {
            if (response.status) {
                var borrows = JSON.parse(response.borrows);              

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
        var dueDate;
        var currentDate;
        var overDate = false;
     
        // check due date
        if (item.DateDue) {
            dueDate = new Date(item.DateDue);
            currentDate = new Date();

            if (currentDate > dueDate) {
                overDate = true;
            }
            else {
                overDate = false;
            }
        }
        else {
            overDate = false;
        }

        var row = $(`<tr class="align-middle" data-id="${item.Id}"></tr>`);

        // Created By
        row.append(CreateTableCellUser(item.User));
        // Created Date
        row.append(`<td>${moment(item.DateBorrow).format('YYYY-MM-DD HH:mm:ss')}</td>`);
        // Due Date
        row.append(`<td class="${overDate ? 'fw-bold text-danger' : ''}">${item.DateDue ? moment(item.DateDue).format('YYYY-MM-DD HH:mm:ss') : ''}</td>`);

        // Total Quantity       
        row.append(`<td>${item.BorrowDevices.reduce((acc, bd) => acc + bd.BorrowQuantity, 0)}</td>`);
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
        // Action
        row.append(`<td>
                        <button type="button" class="btn btn-hover p-0 m-0 border-0" data-id="${item.Id}" onclick="Return(this, event)" title="Return"><span class="badge bg-light-info text-info"><i class="fa-solid fa-right-to-line"></i> Return</span></button>
                   </td>`);

        $('#table_Borrows-tbody').append(row);
    });

    const options = {
        scrollY: 460,
        scrollX: true,
        order: [1],
        autoWidth: false,
        columnDefs: [         
            { targets: [4, 5], className: "text-center" },
            { targets: [6], className: "text-end", orderable: false, width: '70px' },
            { targets: "_all", orderable: true },
        ],
        "lengthMenu": [[10, 15, 25, 50, -1], [10, 15, 25, 50, "All"]]
    };
    table_Borrow = $('#table_Borrows').DataTable(options);
    table_Borrow.columns.adjust();
}

// Return
function Return(elm, e) {
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

                CreateReturnModal(borrow);

                $('#ReturnButton').data('id', Id);

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
function CreateReturnModal(borrow) {
    $('#borrow_modal-CardId').val(borrow.User.Username);
    $('#borrow_modal-Username').val(borrow.User.VnName ? borrow.User.VnName : (borrow.User.CnName ? borrow.User.CnName : (borrow.User.EnName ? borrow.User.EnName : "")));

    $('#borrow_modal-BorrowDate').val(moment(borrow.DateBorrow).format('YYYY-MM-DDTHH:mm:ss'));
    $('#borrow_modal-DuaDate').val(moment(borrow.DateDue).format('YYYY-MM-DDTHH:mm:ss'));
    $('#borrow_modal-ReturnDate').val(moment().format('YYYY-MM-DDTHH:mm:ss'));

    $('#borrow_modal-Note').html(`<p>${borrow.Note}</p>`);

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
}
$('#ReturnButton').on('click', function (e) {
    e.preventDefault();

    var IdBorrow = $(this).data('id');

    $.ajax({
        type: "POST",
        url: "/NVIDIA/BorrowManagement/ReturnDevices",
        data: JSON.stringify({ IdBorrow: IdBorrow }),
        dataType: "json",
        contentType: "application/json;charset=utf-8",
        success: function (response) {
            if (response.status) {
                toastr["success"]("Create Return Reuqest success.", "SUCCRESS");

                var Index = table_Borrow.row(`[data-id="${IdBorrow}"]`).index();
                table_Borrow.row(Index).remove().draw(false);

                $('#borrow_modal-modal').modal('hide');
            }
            else {
                toastr["error"](response.message, "ERROR");
            }
        },
        error: function (error) {
            Swal.fire("Something went wrong!", GetAjaxErrorMessage(error), "error");
        }
    });
});

// Details
$('#table_Borrows tbody').on('dblclick', 'tr', function (event) {

    var dataId = $(this).data('id');

    BorrowDetails(dataId);
});
function BorrowDetails(Id) {
    //var Id = $(elm).data('id');

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
    $('#borrow_modal-Username').val(CreateUserName(borrow.User));

    $('#borrow_modal-Model').val(borrow.Model ? borrow.Model.ModelName ? borrow.Model.ModelName : '' : '');
    $('#borrow_modal-Station').val(borrow.Station ? borrow.Station.StationName ? borrow.Station.StationName : '' : '');

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
    $.each(borrow.UserBorrowSigns, function (k, bs) { //bs == borrow sign
        var username = CreateUserName(bs.User);
        var date = moment(bs.DateSign).format('YYYY-MM-DD | h:mm A');

        var title = {
            Approved: { color: 'success', text: 'Approved', icon: 'check' },
            Rejected: { color: 'danger', text: 'Rejected', icon: 'xmark' },
            Pending: { color: 'warning', text: 'Pending', icon: 'timer' },
            Waitting: { color: 'secondary', text: 'Waitting', icon: 'circle-pause' },
        }[bs.Status] || { color: 'secondary', text: 'Closed' };

        var line = {
            top: k === 0 ? '' : 'border-end',
            bot: (k === 0 && borrow.UserBorrowSigns.length === 1) ? '' : 'border-end'
        };

        var lineDot = `<div class="col-sm-1 text-center flex-column d-none d-sm-flex">
                           <div class="row h-50">
                               <div class="col ${line.top}">&nbsp;</div>
                               <div class="col">&nbsp;</div>
                           </div>
                           <h5 class="m-2 red-dot">
                               <span class="badge rounded-pill bg-${title.color}">&nbsp;</span>
                           </h5>
                           <div class="row h-50">
                               <div class="col ${line.bot}">&nbsp;</div>
                               <div class="col">&nbsp;</div>
                           </div>
                       </div>`;
        var signCard = `<div class="row">
                        ${k % 2 === 0 ? '' : '<div class="col-sm"></div>'}
                        ${k % 2 === 0 ? '' : lineDot}
                        <div class="col-sm py-2">
                            <div class="card border-primary shadow radius-15 card-sign">
                                <div class="card-body">
                                    <div class="float-end">${date === 'Invalid date' ? '' : date}</div>
                                    <label class="mb-3"><span class="badge bg-${title.color}"><i class="fa-solid fa-${title.icon}"></i> ${title.text}</span></label>
                                    <label class="mb-3">${bs.Type == 'Borrow' ? '<span class="badge bg-primary"><i class="fa-solid fa-left-to-line"></i> Borrow</span>' : '<span class="badge bg-info"><i class="fa-solid fa-right-to-line"></i> Return</span>'}</label>
                                    <p class="card-text mb-1">${username}</p>
                                    <p class="card-text mb-1">${bs.User.Email || ''}</p>
                                    <button class="btn btn-sm btn-outline-secondary collapsed ${title.text == null ? 'd-none' : title.text != 'Rejected' ? 'd-none' : ''}" type="button" data-bs-target="#details_${k}" data-bs-toggle="collapse" aria-expanded="false">Show Details ▼</button>
                                    <div class="border collapse" id="details_${k}" style="">
                                        <div class="p-2 text-monospace">
                                            <div>${bs.Note}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        ${k % 2 === 0 ? lineDot : ''}
                        ${k % 2 === 0 ? '<div class="col-sm"></div>' : ''}
                    </div>`;

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