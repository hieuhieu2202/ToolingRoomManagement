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
                console.log(borrows);

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
        row.append(`<td><button type="button" class="btn btn-outline-info p-0 m-0 border-0" data-id="${item.Id}" onclick="BorrowDetails(this, event)"><i class="bx bx-info-circle"></i></button></td>`);

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
                console.log(JSON.parse(response.borrow));

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

    //$('#sign-container').empty();

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
