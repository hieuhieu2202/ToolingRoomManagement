$(function () {
    GetSelectData();
    GetUserAndRole();

    //GetWarehouseDevices();
});

// Get Select data
var users, roles;
function GetSelectData() {
    $.ajax({
        type: "GET",
        url: "/NVIDIA/DeviceManagement/GetSelectData",
        dataType: "json",
        contentType: "application/json;charset=utf-8",
        success: function (response) {
            if (response.status) {
                // WareHouse
                $('#input_WareHouse').empty();
                $('#device_edit-WareHouse').empty();
                $.each(response.warehouses, function (k, item) {
                    var opt1 = $(`<option value="${item.Id}">${item.WarehouseName}</option>`);
                    var opt2 = $(`<option value="${item.Id}">${item.WarehouseName}</option>`);
                    $('#device_edit-WareHouse').append(opt1);
                    $('#input_WareHouse').append(opt2);
                });
                $('#input_WareHouse').change();
                // Product
                $('#device_edit-Product').empty();
                $('#filter_Product').html($('<option value="Product" selected>Product</option>'));
                $.each(response.products, function (k, item) {
                    let opt = $(`<option value="${item.Id}">${item.ProductName} | ${item.MTS}</option>`);
                    $('#device_edit-Product').append(opt);

                    let opt1 = $(`<option value="${item.ProductName}">${item.ProductName}</option>`);
                    $('#filter_Product').append(opt1);
                });
                // Model
                $('#device_edit-Model').empty();
                $('#form_borrow-Model').empty();
                $('#filter_Model').html($('<option value="Model" selected>Model</option>'));
                $.each(response.models, function (k, item) {
                    let opt = $(`<option value="${item.Id}">${item.ModelName}</option>`);
                    $('#device_edit-Model').append(opt);

                    let opt1 = $(`<option value="${item.ModelName}">${item.ModelName}</option>`);
                    $('#filter_Model').append(opt1);

                    let opt2 = $(`<option value="${item.Id}">${item.ModelName != null ? item.ModelName : 'unknown'}</option>`);
                    $('#form_borrow-Model').append(opt2);
                });
                // Station
                $('#device_edit-Station').empty();
                $('#form_borrow-Station').empty();
                $('#filter_Station').html($('<option value="Station" selected>Station</option>'));
                $.each(response.stations, function (k, item) {
                    let opt = $(`<option value="${item.Id}">${item.StationName}</option>`);
                    $('#device_edit-Station').append(opt);

                    let opt1 = $(`<option value="${item.StationName}">${item.StationName}</option>`);
                    $('#filter_Station').append(opt1);

                    let opt2 = $(`<option value="${item.Id}">${item.StationName != null ? item.StationName : 'unknown'}</option>`);
                    $('#form_borrow-Station').append(opt2);
                });
                // Group
                $('#device_edit-Group').empty();
                $('#filter_Group').html($('<option value="Group" selected>Group</option>'));
                $.each(response.groups, function (k, item) {
                    let opt = $(`<option value="${item.Id}">${item.GroupName}</option>`);
                    $('#device_edit-Group').append(opt);

                    let opt1 = $(`<option value="${item.GroupName}">${item.GroupName}</option>`);
                    $('#filter_Group').append(opt1);
                });
                // Vendor
                $('#device_edit-Vendor').empty();
                $('#filter_Vendor').html($('<option value="Vendor" selected>Vendor</option>'));
                $.each(response.vendors, function (k, item) {
                    let opt = $(`<option value="${item.Id}">${item.VendorName}</option>`);
                    $('#device_edit-Vendor').append(opt);

                    let opt1 = $(`<option value="${item.VendorName}">${item.VendorName}</option>`);
                    $('#filter_Vendor').append(opt1);
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

// Device table
var tableDeviceInfo;
function GetWarehouseDevices(IdWarehouse = 0) {
    Pace.track(function () {
        $.ajax({
            url: "/NVIDIA/BorrowManagement/GetWarehouseDevices",
            data: JSON.stringify({ IdWarehouse: IdWarehouse }),
            type: "POST",
            dataType: "json",
            contentType: "application/json;charset=utf-8",
            success: function (response) {
                if (response.status) {
                    var warehouse = response.warehouse;
                    var devices = warehouse.Devices;

                    CreateTableAddDevice(devices);

                    $('#sign-WarehouseManagerUser').empty();
                    if (warehouse.User != null) {
                        var opt = $(`<option value="${warehouse.User.Id}"></option>`);

                        if (warehouse.User.VnName && warehouse.User.VnName != '') {
                            opt.text(`${warehouse.User.Username} - ${warehouse.User.VnName}`);
                        }
                        else if (warehouse.User.CnName && warehouse.User.CnName != '') {
                            opt.text(`${warehouse.User.Username} - ${warehouse.User.CnName}`);
                        }

                        if (warehouse.User.EnName != null && warehouse.User.EnName != '') {
                            var addUserEnName = opt.text();
                            addUserEnName += ` (${warehouse.User.EnName})`;
                            opt.text(addUserEnName);
                        }
                        //if (warehouse.User.Email != null && warehouse.User.Email != '') {
                        //    var addUserEnName = opt.text();
                        //    addUserEnName += ` - [${warehouse.User.Email}]`;
                        //    opt.text(addUserEnName);
                        //}
                        $('#sign-WarehouseManagerUser').append(opt);
                    }
                }
                else {
                    Swal.fire('Sorry, something went wrong!', response.message, 'error');
                }
            },
            error: function (error) {
                Swal.fire('Sorry, something went wrong!', GetAjaxErrorMessage(error), 'error');
            },
            complete: function () {
                // Dừng Pace.js sau khi AJAX request hoàn thành
                Pace.stop();
            }
        });
    });
}
async function CreateTableAddDevice(devices) {
    if (tableDeviceInfo) tableDeviceInfo.destroy();

    $('#table_Devices_tbody').html('');
    await $.each(devices, function (no, item) {
        if (item.Status != "Confirmed" && item.Status != "Part Confirmed" && item.Status != "Out Range") return true;

        var row = $(`<tr class="align-middle" data-id="${item.Id}"></tr>`);

        // MTS
        row.append(`<td>${item.Id}</td>`);
        // Product Name
        row.append(`<td title="${(item.Product) ? item.Product.ProductName : ""}">${(item.Product) ? item.Product.ProductName : ""}</td>`);
        // Model
        row.append(`<td>${(item.Model) ? item.Model.ModelName : ""}</td>`);
        // Station
        row.append(`<td>${(item.Station) ? item.Station.StationName : ""}</td>`);
        // DeviceCode - PN
        row.append(`<td data-id="${item.Id}" data-code="${item.DeviceCode}" title="${item.DeviceCode}">${item.DeviceCode}</td>`);
        // DeviceName
        row.append(`<td title="${item.DeviceName}">${item.DeviceName}</td>`);
        // Group
        row.append(`<td>${(item.Group) ? item.Group.GroupName : ""}</td>`);
        // Vendor
        row.append(`<td title="${(item.Vendor) ? item.Vendor.VendorName : ""}">${(item.Vendor) ? item.Vendor.VendorName : ""}</td>`);
        // Buffer
        row.append(`<td title="${item.Buffer}">${item.Buffer * 100}%</td>`);
        // Quantity
        row.append(`<td title="Real Quantity">${(item.RealQty != null) ? item.RealQty : 0}</td>`);
        // Type
        switch (item.Type) {
            case "S": {
                row.append(`<td><span class="text-success fw-bold">Static</span></td>`);
                break;
            }
            case "D": {
                row.append(`<td><span class="text-info fw-bold">Dynamic</span></td>`);
                break;
            }
            default: {
                row.append(`<td><span class="text-secondary fw-bold">N/A</span></td>`);
                break;
            }
        }
        // Status
        switch (item.Status) {
            case "Unconfirmed": {
                row.append(`<td><span class="badge bg-primary">Unconfirmed</span></td>`);
                break;
            }
            case "Part Confirmed": {
                row.append(`<td><span class="badge bg-warning">Part Confirmed</span></td>`);
                break;
            }
            case "Confirmed": {
                row.append(`<td><span class="badge bg-success">Confirmed</span></td>`);
                break;
            }
            case "Locked": {
                row.append(`<td><span class="badge bg-secondary">Locked</span></td>`);
                break;
            }
            case "Out Range": {
                row.append(`<td><span class="badge bg-danger">Out Range</span></td>`);
                break;
            }
            default: {
                row.append(`<td>N/A</td>`);
                break;
            }
        }
        row.append(`<td class="order-action d-flex text-center justify-content-center">
                        <a href="javascript:;" class="text-primary    bg-light-primary    border-0" title="Select This Device"><i class="fa-regular fa-circle-check"></i></a> 
                    </td>`);
        //// Action
        //row.append(`<td><button class="btn btn-outline-primary button_dot" type="button" title="Select Device">
        //                        <i class="bx bx-check"></i>
        //                    </button></td>`);

        $('#table_Devices_tbody').append(row);
    });

    var height = window.innerHeight / 2 + (window.innerHeight * 0.05);

    $('#form_device-select').empty();

    const options = {
        scrollY: 500,
        scrollX: true,
        order: [0],
        autoWidth: false,
        columnDefs: [
            { targets: "_all", orderable: false },
            { targets: [9, 10, 11, 12], className: "text-center" },
            { targets: [0, 1, 2, 3, 6, 7, 8], visible: false },
        ],
        "lengthMenu": [[10, 15, 25, 50, -1], [10, 15, 25, 50, "All"]],
        createdRow: function (row, data, dataIndex) {
            attachButtonClickEvent(row, data, dataIndex);
        },
    };
    //const options = {
    //    scrollY: height,
    //    scrollX: true,
    //    paging: false,
    //    scrollCollapse: true,
    //    order: [],
    //    autoWidth: false,
    //    columnDefs: [
    //        { targets: "_all", orderable: false },
    //        { targets: [9, 10, 11, 12], className: "text-center" },
    //        { targets: [0, 1, 2, 3, 6, 7, 8], visible: false },
    //    ],
    //    createdRow: function (row, data, dataIndex) {
    //        attachButtonClickEvent(row, data, dataIndex);
    //    },
    //};
    tableDeviceInfo = $('#table_Devices').DataTable(options);
    tableDeviceInfo.columns.adjust();
}
function attachButtonClickEvent(row, data, dataIndex) {
    var check = $('td', row).eq(5).find('a');

    check.off('click').on('click', function () {
        if ($('#form_device-select .input-group').length < 10) {
            let inputGroup = $('<div class="input-group input-group-sm mb-3"></div>');
            let formControl = $(`<div class="form-control" data-id="${data[0]}" data-index="${dataIndex}"></div>`);
            let deviceName = $(`<p class="m-0 overflow-hidden text-nowrap text-truncate" title="${data[4]}">${data[5]}</p>`);
            let deleteBtn = $(`<button class="btn btn-sm btn-outline-danger" type="button"><i class="bx bx-trash m-0"></i></button>`);

            deleteBtn.on('click', function (e) {
                inputGroup.remove();
            });
            formControl.append(deviceName);

            inputGroup.append(formControl);
            inputGroup.append(deleteBtn);

            let bodyInputGroups = $('#form_device-select .input-group');
            let check = false;
            $.each(bodyInputGroups, function (k, v) {
                if ($(v).html() === $(inputGroup[0]).html()) {
                    check = true;
                    return false;
                }
            });
            if (!check) {
                $('#form_device-select').append(inputGroup);
            }
            else {
                toastr["error"]('This device has been selected.', "ERROR");
            }
        }
        else {
            Swal.fire('Sorry, something went wrong!', 'You have selected too many devices (limit is 10 devices).', 'error');
        }
    });
}

//filter
$('#filter').on('click', function (e) {
    e.preventDefault();

    var filter_Product = $('#filter_Product').val();
    var filter_Model = $('#filter_Model').val();
    var filter_Station = $('#filter_Station').val();
    var filter_Group = $('#filter_Group').val();
    var filter_Vendor = $('#filter_Vendor').val();
    var filter_Type = $('#filter_Type').val();
    var filter_Status = $('#filter_Status').val();

    // Xóa bộ lọc trước đó
    tableDeviceInfo.columns().search('').draw();

    // Kiểm tra và áp dụng bộ lọc cho từng cột (nếu giá trị không rỗng)
    if (filter_Product !== "Product" && filter_Product !== null && filter_Product !== undefined) {
        tableDeviceInfo.column(1).search("^" + filter_Product + "$", true, false);
    }
    if (filter_Model !== "Model" && filter_Model !== null && filter_Model !== undefined) {
        tableDeviceInfo.column(2).search("^" + filter_Model + "$", true, false);
    }
    if (filter_Station !== "Station" && filter_Station !== null && filter_Station !== undefined) {
        tableDeviceInfo.column(3).search("^" + filter_Station + "$", true, false);
    }
    if (filter_Group !== "Group" && filter_Group !== null && filter_Group !== undefined) {
        tableDeviceInfo.column(6).search("^" + filter_Group + "$", true, false);
    }
    if (filter_Vendor !== "Vendor" && filter_Vendor !== null && filter_Vendor !== undefined) {
        tableDeviceInfo.column(7).search("^" + filter_Vendor + "$", true, false);
    }
    if (filter_Type !== "Type" && filter_Type !== null && filter_Type !== undefined) {
        tableDeviceInfo.column(10).search("^" + filter_Type + "$", true, false);
    }
    if (filter_Status !== "Status" && filter_Status !== null && filter_Status !== undefined) {
        tableDeviceInfo.column(11).search("^" + filter_Status + "$", true, false);
    }

    // Vẫn cần gọi hàm draw để vẽ lại bảng với bộ lọc mới
    tableDeviceInfo.draw();
});
$('#input_WareHouse').on('change', function (e) {
    e.preventDefault();

    GetWarehouseDevices($(this).val());
});

// Create Borrow Form
$('#CreateBorrowForm').on('click', function (e) {
    e.preventDefault();

    var DeviceForm = $('#form_device-select .input-group')

    var IdDevices = DeviceForm.map(function () {
        return $(this).find('.form-control').data('id');
    }).get();
    var IndexDevices = DeviceForm.map(function () {
        return $(this).find('.form-control').data('index');
    }).get();

    if (IdDevices.length < 1) {
        toastr["error"]('Please select device before create Borrow form.', "ERROR");
        return;
    }

    $('#form_borrow-CardId').val($('#CardID').text());
    $('#form_borrow-Username').val($('#Name').text());

    var borrowDate = moment();
    var dueDate = moment().add(7, 'days');
    $('#form_borrow-BorrowDate').val(borrowDate.format('YYYY-MM-DDTHH:mm:ss'));


    $('#table_borrow-tbody').empty();
    $.each(IndexDevices, function (k, v) {
        var deviceData = tableDeviceInfo.row(v).data();

        var tr = $(`<tr class="align-middle" data-id="${IdDevices[k]}" data-index="${v}"></tr>`);
        tr.append(`<td>${deviceData[4]}</td>`);
        tr.append(`<td>${deviceData[5]}</td>`);
        tr.append(`<td>${deviceData[2]}</td>`);
        tr.append(`<td>${deviceData[3]}</td>`);
        tr.append(`<td style="max-width: 120px;"><input class="form-control" type="number" placeholder="max = ${deviceData[9]}" autocomplete="off"></td>`);

        $('#table_borrow-tbody').append(tr);
    });

    $('#borrow_form-modal').modal('show');
});

// Add User Sign to Process Event
$('#btn_addSign').on('click', function (e) {
    e.preventDefault();

    var container = $('#sign-container');

    var html = $(`<div class="row" sign-row>
                        <div class="col-auto text-center flex-column d-none d-sm-flex">
                            <div class="row h-50">
                                <div class="col border-end">&nbsp;</div>
                                <div class="col">&nbsp;</div>
                            </div>
                            <h5 class="m-2">
                                <span class="badge rounded-pill bg-primary">&nbsp;</span>
                            </h5>
                            <div class="row h-50">
                                <div class="col border-end">&nbsp;</div>
                                <div class="col">&nbsp;</div>
                            </div>
                        </div>
                        <div class="col py-2">
                            <div class="card radius-15 card-sign">
                                <div class="card-body">
                                    <div class="row">
                                        <div class="col-md-4">
                                            <label class="form-label">Role</label>
                                            <select class="form-select form-select" select-role>
                                                <option value="" selected>Role</option>
                                            </select>
                                        </div>
                                        <div class="col-md-7">
                                            <label class="form-label">User</label>
                                            <select type="text" class="form-select form-select" select-user></select>
                                        </div>
                                        <div class="col-1 btn-trash-sign">
                                            <button class="btn btn-sm btn-outline-danger" type="button"><i class="bx bx-trash m-0"></i></button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>`);

    // get select
    var select_role = html.find('[select-role]');
    var select_user = html.find('[select-user]');

    // create select 2
    //select_role.select2({
    //    theme: 'bootstrap4',
    //    dropdownParent: $("#borrow_form-modal"),
    //    minimumResultsForSearch: -1,
    //});
    //select_user.select2({
    //    theme: 'bootstrap4',
    //    dropdownParent: $("#borrow_form-modal"),
    //    minimumResultsForSearch: -1,
    //});

    // fill data
    $.each(roles, function (k, item) {
        var otp = $(`<option value="${item.Id}">${item.RoleName}</option>`);
        select_role.append(otp);
    });
    $.each(users, function (k, item) {
        var opt = CreateUserOption(item);
        select_user.append(opt);
    });

    // select change event
    select_role.on('change', function () {
        select_user.empty();
        var roleId = $(this).val();

        if (roleId != '') {
            $.each(users, function (k, userItem) {
                $.each(userItem.UserRoles, function (k, userRoleItem) {
                    if (userRoleItem.Role.Id == roleId) {
                        var opt = CreateUserOption(userItem);
                        select_user.append(opt);
                    }
                });
            });
        }
        else {
            $.each(users, function (k, userItem) {
                var opt = CreateUserOption(userItem);
                select_user.append(opt);
            });
        }
    });

    // change dot color
    var dotArr = container.find('.badge.rounded-pill');
    $.each(dotArr, function (k, item) {
        $(item).removeClass('bg-primary');
        $(item).addClass('bg-light');
    });

    // add delete event
    html.find('.btn-trash-sign button').on('click', function (e) {
        e.preventDefault();
        html.fadeOut(300);
        setTimeout(() => {
            $(this).closest('[sign-row]').remove();
        }, 300);
    });

    // show card
    html.hide();
    container.prepend(html);
    html.fadeIn(300);
});

// Send Form to SV
$('#button_send').on('click', function (e) {
    e.preventDefault();

    var IdDevices = $('#table_borrow-tbody tr').map(function () {
        return $(this).data('id');
    }).get();
    var IndexDevices = $('#table_borrow-tbody tr').map(function () {
        return $(this).data('index');
    }).get();
    var QtyDevices = $('#table_borrow-tbody tr').map(function () {
        return parseInt($(this).find('.form-control').val());
    }).get();
    var SignProcess = $('#sign-container [select-user]').map(function () {
        return parseInt($(this).val());
    }).get();
    var UserBorrow = $('#CardID').text();
    var BorrowDate = $('#form_borrow-BorrowDate').val();
    var DueDate = $('#form_borrow-DuaDate').val();
    var Model = $('#form_borrow-Model').val();
    var Station = $('#form_borrow-Station').val();
    var Note = $('#form_borrow-Note').val();

    var BorrowData = {
        IdDevices: IdDevices,
        QtyDevices: QtyDevices,
        SignProcess: SignProcess,
        UserBorrow: UserBorrow,
        BorrowDate: BorrowDate,
        DueDate: DueDate,
        IdModel: Model,
        IdStation: Station,
        Note: Note
    }

    if (!ValidateSendFormData(BorrowData)) return;

    $.ajax({
        type: "POST",
        url: "/NVIDIA/BorrowManagement/BorrowDevice",
        data: JSON.stringify(BorrowData),
        dataType: "json",
        contentType: "application/json;charset=utf-8",
        success: function (response) {
            if (response.status) {
                toastr["success"]("Create Borrow Reuqest success.", "SUCCRESS");

                $.each(IndexDevices, function (k, v) {
                    var deviceData = tableDeviceInfo.row(v).data();

                    // Quantity
                    var oldQtyCell = deviceData[9].split('/');

                    var newRealQuantity = parseInt(oldQtyCell[2] - QtyDevices[k]);
                    var newQtyCell = `${oldQtyCell[0]} / ${oldQtyCell[1]} / ${newRealQuantity}`;

                    deviceData[9] = newQtyCell;

                    // Status
                    var bufferString = deviceData[8].replace("%", "");
                    var buffernumber = parseFloat(bufferString) / 100;
                    var quantityNumber = parseInt(oldQtyCell[0]);

                    if (newRealQuantity < (quantityNumber * buffernumber)) {
                        // nếu realQty < giới hạn
                        // lớn hơn 1: báo warning
                        // bằng 0   : báo danger
                        if (newRealQuantity >= 1) {
                            tableDeviceInfo.row(v).nodes().to$().addClass('bg-light-danger');
                            deviceData[11] = '<span class="badge bg-danger">Out Range</span>';

                            tableDeviceInfo.row(v).data(deviceData).draw(false); // cập nhật data của row
                            attachButtonClickEvent(tableDeviceInfo.row(v).node(), deviceData, v); // add lại sự kiện
                        }
                        else {
                            tableDeviceInfo.row(v).nodes().to$().addClass('bg-dark');
                            deviceData[11] = '<span class="badge bg-secondary">Locked</span>';

                            tableDeviceInfo.row(v).data(deviceData).draw(false); // cập nhật data của row
                        }
                    }
                });

                $('#borrow_form-modal').modal('hide');
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

// Other function
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

function ValidateSendFormData(BorrowData) {
    var check = true;

    $.each(BorrowData.QtyDevices, function (index, item) {
        if (item < 0 || isNaN(item)) {
            toastr["error"]('Please check Device Borrow Quantity', "ERROR");
            check = false;
            return false; // Dừng vòng lặp khi gặp lỗi
        }
    });

    $.each(BorrowData.IdDevices, function (index, item) {
        if (item < 0 || isNaN(item)) {
            toastr["error"]('Please check List Device Borrow', "ERROR");
            check = false;
            return false; // Dừng vòng lặp khi gặp lỗi
        }
    });

    $.each(BorrowData.SignProcess, function (index, item) {
        if (item < 0 || isNaN(item)) {
            toastr["error"]('Please check List Device Borrow', "ERROR");
            check = false;
            return false; // Dừng vòng lặp khi gặp lỗi
        }
    });

    if (BorrowData.UserBorrow == undefined || BorrowData.UserBorrow == '') {
        toastr["error"]('Please check your session or Sign In again.', "ERROR");
        check = false;
    }
    if (BorrowData.BorrowDate == undefined || BorrowData.UserBorrow == '') {
        toastr["error"]('Please select Borrow Date', "ERROR");
        check = false;
    }

    return check;
}