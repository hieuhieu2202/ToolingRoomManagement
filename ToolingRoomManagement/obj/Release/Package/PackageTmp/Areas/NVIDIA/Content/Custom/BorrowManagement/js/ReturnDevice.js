var users, roles;
$(function () {
    GetUserAndRole();
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
function GetUserAndRole() {
    $.ajax({
        type: "GET",
        url: "/NVIDIA/BorrowManagement/GetUserAndRole",
        dataType: "json",
        contentType: "application/json;charset=utf-8",
        success: function (response) {
            if (response.status) {
                users = response.users;
                roles = response.roles;
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
        if (item.BorrowDevices.length == 0) return;

        var row = $(`<tr class="align-middle" data-id="${item.Id}" title="Double-click to view device details."></tr>`);

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
                break;
            }
            default: {
                row.append(`<td><span class="badge bg-secondary">N/A</span></td>`);
                break;
            }
        }
        // Action
        row.append(`<td class="order-action d-flex text-center justify-content-center">
                         <a href="javascript:;" class="text-info bg-light-info border-0" title="Return" data-id="${item.Id}" onclick="Return(${item.Id})"><i class="fa-regular fa-arrow-turn-down-left"></i></a>
                    </td>`);

        $('#table_Borrows-tbody').append(row);
    });

    const options = {
        scrollY: 480,
        scrollX: true,
        order: [0],
        autoWidth: false,
        columnDefs: [         
            { targets: [4], visible: false },
            { targets: [6], className: "text-end", width: '70px' },        
            { targets: "_all", orderable: false },
        ],
        "lengthMenu": [[10, 15, 25, 50, -1], [10, 15, 25, 50, "All"]]
    };
    table_Borrow = $('#table_Borrows').DataTable(options);
    table_Borrow.columns.adjust();
}

// Return
function Return(Id) {
    $.ajax({
        type: "GET",
        url: "/NVIDIA/BorrowManagement/GetBorrow?Id=" + Id,
        dataType: "json",
        contentType: "application/json;charset=utf-8",
        success: function (response) {
            if (response.status) {
                var borrow = response.borrow;
                CreateReturnModal(borrow);

                $('#CreateReturnRequest').attr('id', Id);

                $('#return_modal').modal('show');
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
    $('#CreateReturnRequest').data('idborrow', borrow.Id);
    $('#CreateReturnRequest').data('iduser', borrow.User.Id);

    $('#return_modal-CardId').val(borrow.User.Username);
    $('#return_modal-Username').val(CreateUserName(borrow.User));

    $('#return_modal-BorrowDate').val(moment(borrow.DateBorrow).format('YYYY-MM-DDTHH:mm:ss'));
    $('#return_modal-DuaDate').val(moment(borrow.DateDue).format('YYYY-MM-DDTHH:mm:ss'));
    $('#return_modal-ReturnDate').val(moment().format('YYYY-MM-DDTHH:mm:ss'));

    $('#return_modal-Note').text('');

    $('#return_modal-table-tbody').empty();
    $.each(borrow.BorrowDevices, function (k, item) {
        var borrowQty = item.BorrowQuantity ? item.BorrowQuantity : '';
        var deviceCode = item.Device.DeviceCode ? item.Device.DeviceCode : '';
        var deviceName = item.Device.DeviceName ? item.Device.DeviceName : '';
        var unit = item.Device.Unit ? item.Device.Unit : 'NA';
        var mts = item.Device.Product.MTS;

        var row = $(`<tr data-iddevice="${item.Device.Id}"></tr>`);
        row.append(`<td>${mts}</td>`);
        row.append(`<td>${deviceCode}</td>`);
        row.append(`<td>${deviceName}</td>`);
        row.append(`<td class="text-center">${unit}</td>`);
        row.append(`<td class="text-center">${borrowQty}</td>`);      
        row.append(`<td><input type="number" class="form-control" placeholder="No return No enter quantity" data-index="${k}" returnqty min="0"/></td>`);
        row.append(`<td class="text-center"><input class="form-check-input" type="checkbox" data-index="${k}" ng></td>`);
        row.append(`<td class="text-center"><input class="form-check-input" type="checkbox" data-index="${k}" swap></td>`);

        row.dblclick(function (e) {
            if ($(e.target).is('input')) return;   
            GetDeviceDetails(item.Device.Id);
        });

        $('#return_modal-table-tbody').append(row);
    });

    // sign

    //// Leader
    $('#sign-LeaderRole').empty();
    $('#sign-LeaderUser').empty();
    $.each(roles, function (k, role) {
        if (role.Id == 4) {
            var otp = $(`<option value="${role.Id}">${role.RoleName}</option>`);
            $('#sign-LeaderRole').append(otp);
        }
    });
    $.each(users, function (k, user) {
        $.each(user.UserRoles, function (k, UserRole) {
            if (UserRole.Role.Id == 4) {
                var opt = CreateUserOption(user);
                $('#sign-LeaderUser').append(opt);
            }
        });
    });
    //// WH manager
    $('#sign-WarehouseManagerRole').empty();
    $('#sign-WarehouseManagerUser').empty();
    $.each(roles, function (k, role) {
        if (role.Id == 3) {
            var otp = $(`<option value="${role.Id}">${role.RoleName}</option>`);
            $('#sign-WarehouseManagerRole').append(otp);
        }        
    });
    $.each(users, function (k, user) {
        $.each(user.UserRoles, function (k, UserRole) {
            if (UserRole.Role.Id == 3) {
                var opt = CreateUserOption(user);
                $('#sign-WarehouseManagerUser').append(opt);
            }   
        });      
    });
}
$('#CreateReturnRequest').click(function (e) {
    e.preventDefault();

    var IdBorrow = $(this).data('idborrow');
    var IdUser = $(this).data('iduser');

    var Id = $(this).data('id');
    var Index = table_Borrow.row(`[data-id="${Id}"]`).index();
    

    var data = GetDataReturn(IdBorrow, IdUser);

    $.ajax({
        type: "POST",
        url: "/NVIDIA/BorrowManagement/ReturnDevices",
        data: JSON.stringify(data),
        dataType: "json",
        contentType: "application/json;charset=utf-8",
        success: function (response) {
            if (response.status) {
                $('#return_modal').modal('hide');

                if (response.borrow.BorrowDevices.length == 0) {
                    table_Borrow.row(Index).remove().draw(false);
                }

                toastr["success"]("Create return request success.", "SUCCRESS");
            }
            else {
                toastr["error"](response.message, "ERROR");
            }
        },
        error: function (error) {
            Swal.fire(i18next.t('global.swal_title'), GetAjaxErrorMessage(error), "error");
        }
    });
});
function GetDataReturn(idborrow, iduser) {
    var data = {
        IdBorrow: idborrow,
        IdUser: iduser,
        Note: $('#return_modal-Note').val(),
        Type: "Return",
        Status: "Pending",
        DateReturn: moment().format("YYYY-MM-DD HH:mm:ss"),
        ReturnDevices: [],
        UserReturnSigns: []
    }

    // Devices
    var rows = $('#return_modal-table-tbody tr');
    $.each(rows, function (k, row) {
        if ($(row).find('[returnqty]').val() > 0) {
            var ReturnDevice = {
                IdDevice: $(row).data('iddevice'),
                ReturnQuantity: $(row).find('[returnqty]').val(),
                IsNG: $(row).find('[ng]').is(':checked'),
                IsSwap: $(row).find('[swap]').is(':checked'),
            }
            data.ReturnDevices.push(ReturnDevice);
        }
    });

    // Sign
    data.UserReturnSigns.push({
        SignOrder: 1,
        Status: "Pending",
        Type: "Return",
        IdUser: $('#sign-LeaderUser').val()
    });
    data.UserReturnSigns.push({
        SignOrder: 2,
        Status: "Waitting",
        Type: "Return",
        IdUser: $('#sign-WarehouseManagerUser').val()
    });
    return data;
}

// Details
$('#table_Borrows tbody').on('dblclick', 'tr', function (event) {
    var dataId = $(this).data('id');
    RequestDetails(dataId);
});
function CreateUserOption(user) {
    var opt = $(`<option value="${user.Id}"></option>`);

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
    //if (user.Email != null && user.Email != '') {
    //    var addUserEnName = opt.text();
    //    addUserEnName += ` - [${user.Email}]`;
    //    opt.text(addUserEnName);
    //}
    return opt;
}
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