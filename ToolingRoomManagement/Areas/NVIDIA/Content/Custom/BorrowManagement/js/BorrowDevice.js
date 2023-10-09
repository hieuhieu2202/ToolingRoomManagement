﻿$(function () {
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
                    var warehouse = JSON.parse(response.warehouse);
                    var devices = warehouse.Devices;

                    CreateTableAddDevice(devices);

                    $('#sign-WarehouseManagerUser').empty();
                    if (warehouse.User != null) {
                        var opt = CreateWarehouseUserOption(warehouse.User);
                        $('#sign-WarehouseManagerUser').append(opt);
                    }

                    if (warehouse.UserDeputy1 != null) {
                        var opt = CreateWarehouseUserOption(warehouse.UserDeputy1);
                        $('#sign-WarehouseManagerUser').append(opt);
                    }
                    if (warehouse.UserDeputy2 != null) {
                        var opt = CreateWarehouseUserOption(warehouse.UserDeputy2);
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

        // 0 MTS
        row.append(`<td>${item.Id}</td>`);
        // 1 Product Name
        row.append(`<td title="${(item.Product) ? item.Product.ProductName : ""}">${(item.Product) ? item.Product.ProductName : ""}</td>`);
        // 2 Model
        row.append(`<td>${(item.Model) ? item.Model.ModelName : ""}</td>`);
        // 3 Station
        row.append(`<td>${(item.Station) ? item.Station.StationName : ""}</td>`);
        // 4 DeviceCode - PN
        row.append(`<td data-id="${item.Id}" data-code="${item.DeviceCode}" title="${item.DeviceCode}">${item.DeviceCode}</td>`);
        // 5 DeviceName
        row.append(`<td title="${item.DeviceName}">${item.DeviceName}</td>`);
        // 6 Group
        row.append(`<td>${(item.Group) ? item.Group.GroupName : ""}</td>`);
        // 7 Vendor
        row.append(`<td title="${(item.Vendor) ? item.Vendor.VendorName : ""}">${(item.Vendor) ? item.Vendor.VendorName : ""}</td>`);
        // 8 Specification
        row.append(`<td title="${item.Specification}">${(item.Specification) ? item.Specification : ""}</td>`);
        // 9 Buffer
        row.append(`<td title="${item.Buffer}">${item.Buffer * 100}%</td>`);
        // 10 Quantity
        row.append(`<td title="Real Quantity">${(item.RealQty != null) ? item.RealQty : 0}</td>`);
        // 11 Type
        switch (item.Type) {
            case "S": {
                row.append(`<td><span class="text-success fw-bold">Static</span></td>`);
                break;
            }
            case "D": {
                row.append(`<td><span class="text-info fw-bold">Dynamic</span></td>`);
                break;
            }
            case "Consign": {
                row.append(`<td><span class="text-warning fw-bold">Consign</span></td>`);
                break;
            }
            case "Fixture": {
                row.append(`<td><span class="text-primary fw-bold">Fixture</span></td>`);
                break;
            }
            default: {
                row.append(`<td><span class="text-secondary fw-bold">N/A</span></td>`);
                break;
            }
        }
        // 12 Status
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
        // 13 Action
        row.append(`<td class="order-action d-flex text-center justify-content-center">
                        <a href="javascript:;" class="text-primary bg-light-primary border-0" title="Select This Device"><i class="fa-regular fa-circle-check"></i></a> 
                    </td>`);
        // 14 Location 
        var html = ''
        var title = ''
        $.each(item.DeviceWarehouseLayouts, function (k, sss) {
            var layout = sss.WarehouseLayout;
            if (k == 0) {
                html += `<lable>${layout.Line}${layout.Floor ? ' - ' + layout.Floor : ''}${layout.Cell ? ' - ' + layout.Cell : ''}</lable>`;
            }
            else {
                html += `<lable class="d-none">${layout.Line}${layout.Floor ? ' - ' + layout.Floor : ''}${layout.Cell ? ' - ' + layout.Cell : ''}</lable>`;
            }
            title += `[${layout.Line}${layout.Floor ? ' - ' + layout.Floor : ''}${layout.Cell ? ' - ' + layout.Cell : ''}], `;
        });
        row.append(`<td title="${title}">${html}</td>`);

        $('#table_Devices_tbody').append(row);
    });

    $('#form_device-select').empty();

    const options = {
        scrollY: 500,
        scrollX: true,
        order: [0],
        autoWidth: false,
        columnDefs: [
            { targets: "_all", orderable: false },
            { targets: [9, 10, 11, 12, 13], className: "text-center" },
            { targets: [0, 1, 2, 3, 6, 7, 9, 14], visible: false },
        ],
        "lengthMenu": [[10, 15, 25, 50, -1], [10, 15, 25, 50, "All"]],
        createdRow: function (row, data, dataIndex) {
            attachButtonClickEvent(row, data, dataIndex);
        },
    };
    tableDeviceInfo = $('#table_Devices').DataTable(options);
    tableDeviceInfo.columns.adjust();
}
function attachButtonClickEvent(row, data, dataIndex) {
    var check = $('td', row).eq(6).find('a');

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

// Details
$('#table_Devices tbody').on('dblclick', 'tr', function (event) {

    var dataId = $(this).data('id');

    GetDeviceDetails(dataId);
});
function GetDeviceDetails(Id) {
    $.ajax({
        type: "POST",
        url: "/NVIDIA/DeviceManagement/GetDevice",
        data: JSON.stringify({ Id: Id }),
        dataType: "json",
        contentType: "application/json;charset=utf-8",
        success: function (response) {
            if (response.status) {
                var device = response.device;
                var borrows = JSON.parse(response.borrows);
                var warehouses = response.warehouses;

                FillDetailsDeviceData(device);
                CreateTableLayout(device, warehouses);
                CreateTableHistory(Id, borrows);
                $('#device_details-modal').modal('show');
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
async function FillDetailsDeviceData(data) {
    $('#device_details-DeviceId').val(data.Id);
    $('#device_details-DeviceCode').val(data.DeviceCode);
    $('#device_details-DeviceName').val(data.DeviceName);
    $('#device_details-Specification').val(data.Specification);

    $('#device_details-DeviceDate').val(moment(data.DeviceDate).format('YYYY-MM-DD HH:mm'));
    $('#device_details-Relation').val(data.Relation);
    $('#device_details-Buffer').val(data.Buffer);
    $('#device_details-LifeCycle').val(data.LifeCycle);
    $('#device_details-Forcast').val(data.Forcast);
    $('#device_details-Quantity').val(data.Quantity);
    $('#device_details-QtyConfirm').val(data.QtyConfirm);
    $('#device_details-RealQty').val(data.RealQty);
    $('#device_details-AccKit').val(data.ACC_KIT);
    $('#device_details-Type').val(data.Type == 'S' ? 'Static' : data.Type == 'D' ? 'Dynamic' : data.Type);
    $('#device_details-Status').val(data.Status);
    $('#device_details-Product').val(data.Product ? data.Product.ProductName : '');
    $('#device_details-Model').val(data.Model ? data.Model.ModelName : '');
    $('#device_details-Station').val(data.Station ? data.Station.StationName : '');
    $('#device_details-WareHouse').val($('#input_WareHouse option:selected').text());
    $('#device_details-Group').val(data.Group ? data.Group.GroupName : '');
    $('#device_details-Vendor').val(data.Vendor ? data.Vendor.VendorName : '');
}
function CreateTableLayout(device, warehouses) {
    $('#device_details-layout-tbody').empty();
    $.each(device.DeviceWarehouseLayouts, function (k, item) {
        var warehouse = warehouses[k];
        var layout = item.WarehouseLayout;

        var tr = $('<tr></tr>');
        tr.append($(`<td>${warehouse.Factory ? warehouse.Factory : ""}</td>`));
        tr.append($(`<td>${warehouse.Floor ? warehouse.Floor : ""}</td>`));
        tr.append($(`<td>${CreateUserName(warehouse.User)}</td>`));
        tr.append($(`<td>${warehouse.WarehouseName ? warehouse.WarehouseName : ""}</td>`));
        tr.append($(`<td>${layout.Line ? layout.Line : ""}</td>`));
        tr.append($(`<td>${layout.Floor ? layout.Floor : ""}</td>`));
        tr.append($(`<td>${layout.Cell ? layout.Cell : ""}</td>`));

        $('#device_details-layout-tbody').append(tr);
    });
}
function CreateTableHistory(IdDevice, borrows) {
    $('#device_details-history-tbody').empty();
    $.each(borrows, function (k, item) {
        if (item.Status == 'Rejected') return;

        var tr = $('<tr class="align-middle"></tr>');
        tr.append($(`<td>${item.Type}</td>`));
        tr.append($(`<td>${moment(item.DateBorrow).format('YYYY-MM-DD HH:mm')}</td>`));

        var dateReturn = moment(item.DateReturn).format('YYYY-MM-DD HH:mm');
        tr.append($(`<td>${dateReturn != 'Invalid date' ? dateReturn : ""}</td>`));

        tr.append($(`<td>${CreateUserName(item.User)}</td>`));
        tr.append($(`<td>${item.Model ? item.Model.ModelName ? item.Model.ModelName : '' : ''}</td>`));
        tr.append($(`<td>${item.Station ? item.Station.StationName ? item.Station.StationName : '' : ''}</td>`));

        tr.append($(`<td>${GetQuantityDeviceInBorrow(IdDevice, item.BorrowDevices)}</td>`));

        tr.append($(`<td style="max-width: 200px;">${item.Note}</td>`));

        $('#device_details-history-tbody').append(tr);
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

    tableDeviceInfo.columns().search('').draw();

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
        tableDeviceInfo.column(11).search("^" + filter_Type + "$", true, false);
    }
    if (filter_Status !== "Status" && filter_Status !== null && filter_Status !== undefined) {
        tableDeviceInfo.column(12).search("^" + filter_Status + "$", true, false);
    }

    tableDeviceInfo.draw();
});
$('#filter-refresh').click(function (e) {
    e.preventDefault();

    $('#filter_Product').val("Product");
    $('#filter_Model').val("Model");
    $('#filter_Station').val("Station");
    $('#filter_Group').val("Group");
    $('#filter_Vendor').val("Vendor");
    $('#filter_Type').val("Type");
    $('#filter_Status').val("Status");

    $('#filter').click();
});

$('#input_WareHouse').on('change', function (e) {
    e.preventDefault();

    GetWarehouseDevices($(this).val());
});

// Create Borrow Form
$('#CreateBorrowForm').on('click', function (e) {
    e.preventDefault();

    var DeviceForm = $('#form_device-select .input-group');

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
        tr.append(`<td>${deviceData[8]}</td>`);
        tr.append(`<td>${deviceData[2]}</td>`);
        tr.append(`<td>${deviceData[3]}</td>`);
        tr.append(`<td style="max-width: 120px;"><input class="form-control" type="number" placeholder="max = ${deviceData[10]}" autocomplete="off"></td>`);

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
function GetQuantityDeviceInBorrow(IdDevice, BorrowDevices) {
    var quantity = 0;
    $.each(BorrowDevices, function (k, item) {
        if (item.IdDevice == IdDevice) {
            quantity = item.BorrowQuantity;
            return false;
        }
    });
    return quantity;
}
function CreateWarehouseUserOption(user) {
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
    return opt;
}