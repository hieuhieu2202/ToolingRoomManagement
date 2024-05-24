$(function () {
    GetUserAndRole();
    Filter();
    CreateDataListModelAndStation();
    //GetWarehouseDevices();
});

// Get Select data
var users, roles;


async function CreateDataListModelAndStation() {
    try {
        var result = await GetModelAndStations();

        var modelDatalist = $('#form_borrow-ListModel');
        $.each(result.models, function (k, model) {
            var otp = $(`<option value="${model.ModelName}"></option>`);
            modelDatalist.append(otp);
        });
        var stationDatalist = $('#form_borrow-ListStation');
        $.each(result.stations, function (k, station) {
            var otp = $(`<option value="${station.StationName}"></option>`);
            stationDatalist.append(otp);
        })

    } catch (error) {
        Swal.fire('Sorry, something went wrong!', `${error}`, 'error');
    }
}
function GetDatas() {
    return new Promise((resolve, reject) => {
        $.ajax({
            type: "GET",
            url: "/NVIDIA/DeviceManagement/GetSelectData",
            dataType: "json",
            contentType: "application/json;charset=utf-8",
            success: function (response) {
                if (response.status) {
                    resolve(response);
                }
                else {
                    reject(response.message);
                }
            },
            error: function (error) {
                reject(GetAjaxErrorMessage(error));
            }
        });
    });
}
function GetUserAndRole() {
    $.ajax({
        type: "GET",
        url: "/NVIDIA/RequestManagement/GetUserAndRole",
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
$('#input_WareHouse').change(function () {
    var id = $(this).val();
    GetWarehouseDevices(id);
})
// Device table
var tableDeviceInfo;
function GetWarehouseDevices(IdWarehouse = 0) {
    Pace.track(function () {
        $.ajax({
            url: "/NVIDIA/RequestManagement/GetWarehouseDevices",
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
                    if (warehouse.UserManager != null) {
                        var opt = CreateWarehouseUserOption(warehouse.UserManager);
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
        if (item.Status === "Deleted") return true;

        var row = $(`<tr class="align-middle" data-id="${item.Id}"></tr>`);

        // 0 ID
        row.append(`<td>${item.Id}</td>`);
        // 1 MTS
        row.append(`<td title="${(item.Product) ? item.Product.MTS ? item.Product.MTS : "NA" : "NA"}">${(item.Product) ? item.Product.MTS ? item.Product.MTS : "NA" : "NA"}</td>`);
        // 2 Model
        row.append(`<td>${(item.Model) ? item.Model.ModelName : ""}</td>`);
        // 3 Station
        row.append(`<td>${(item.Station) ? item.Station.StationName : ""}</td>`);
        // 4 DeviceCode - PN
        row.append(`<td data-id="${item.Id}" data-code="${item.DeviceCode}" title="${item.DeviceCode}">${item.DeviceCode ? item.DeviceCode != 'null' ? item.DeviceCode : 'NA' : "NA"}</td>`);
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
        // 11 Unit
        row.append(`<td class="text-center">${item.Unit ? item.Unit : ''}</td>`);
        // 12 Type
        switch (item.Type) {
            case "S":
            case "Static": {
                row.append(`<td class="py-0">
                                <span class="text-success fw-bold">Static</span>
                                </br>
                                <span class="text-${item.isConsign ? "warning" : "primary"} fw-bold" style="font-size: 10px;">${item.isConsign ? "Consign" : "Normal"}</span>
                            </td>`);
                break;
            }
            case "D":
            case "Dynamic": {
                row.append(`<td class="py-0">
                                <span class="text-info fw-bold">Dynamic</span>
                                </br>
                                <span class="text-${item.isConsign ? "warning" : "primary"} fw-bold" style="font-size: 10px;">${item.isConsign ? "Consign" : "Normal"}</span>
                            </td>`);
                break;
            }
            case "Fixture": {
                row.append(`<td class="py-0">
                                <span class="text-primary fw-bold">Fixture</span>
                                </br>
                                <span class="text-${item.isConsign ? "warning" : "primary"} fw-bold" style="font-size: 10px;">${item.isConsign ? "Consign" : "Normal"}</span>
                            </td>`);
                break;
            }
            default: {
                row.append(`<td class="py-0">
                                <span class="text-secondary fw-bold">NA</span>
                                </br>
                                <span class="text-${item.isConsign ? "warning" : "primary"} fw-bold" style="font-size: 10px;">${item.isConsign ? "Consign" : "Normal"}</span>
                            </td>`);
                break;
            }
        }
        // 13 Status
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
        // 14 Action
        row.append(`<td class="order-action d-flex text-center justify-content-center">
                        <a href="javascript:;" class="text-primary bg-light-primary border-0" title="Select This Device"><i class="fa-regular fa-circle-check"></i></a> 
                    </td>`);
        // 15 Location 
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
        // 16 SysQuantity
        row.append(`<td>${item.SysQuantity}</td>`);
        // 17 IsConsign
        row.append(`<td>${item.isConsign ? "Consign" : "Normal"}</td>`);
        // 18 ProductName
        row.append(`<td>${(item.Product) ? item.Product.ProductName ? item.Product.ProductName : "NA" : "NA"}</td>`);

        $('#table_Devices_tbody').append(row);
    });

    $('#form_device-select').empty();

    const options = {
        scrollY: 500,
        scrollX: true,
        order: [0, 'asc'],
        autoWidth: false,
        columnDefs: [
            { targets: "_all", orderable: false },
            { targets: [9, 10, 11, 12, 13, 14], className: "text-center" },
            { targets: [0, 2, 3, 6, 7, 8, 9, 15, 16, 17, 18], visible: false },
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
    var check = $('td', row).eq(7).find('a');

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


//filter
$('#filter').on('click', function (e) {
    e.preventDefault();

    var filter_Product = $('#filter_Product').val();
    var filter_Group = $('#filter_Group').val();
    var filter_Vendor = $('#filter_Vendor').val();
    var filter_Type = $('#filter_Type').val();

    tableDeviceInfo.columns().search('').draw();

    if (filter_Product !== "Product" && filter_Product !== null && filter_Product !== undefined) {
        tableDeviceInfo.column(18).search("^" + filter_Product + "$", true, false);
    }
    if (filter_Group !== "Group" && filter_Group !== null && filter_Group !== undefined) {
        tableDeviceInfo.column(6).search("^" + filter_Group + "$", true, false);
    }
    if (filter_Vendor !== "Vendor" && filter_Vendor !== null && filter_Vendor !== undefined) {
        tableDeviceInfo.column(7).search("^" + filter_Vendor + "$", true, false);
    }
    if (filter_Type !== "Type" && filter_Type !== null && filter_Type !== undefined) {
        var types = filter_Type.split('_');
        tableDeviceInfo.column(12).search(types[1], true, false);
        tableDeviceInfo.column(17).search("^" + types[0] + "$", true, false);
    }
    //if (filter_Status !== "Status" && filter_Status !== null && filter_Status !== undefined) {
    //    tableDeviceInfo.column(13).search("^" + filter_Status + "$", true, false);
    //}

    tableDeviceInfo.draw();
});
async function Filter() {
    var response = await GetDatas();

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


    SetFilterData(response);
}

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
        tr.append(`<td class="text-center">${deviceData[11]}</td>`);
        tr.append(`<td style="max-width: 120px;"><input class="form-control" type="number" placeholder="max = ${deviceData[16]}" autocomplete="off"></td>`);

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
    //html.hide();

    if (container.children().length > 1) {
        container.children().last().before(html);
    }
    else {
        container.prepend(html);
    }
    
    html.fadeIn(300);
});

// Send Form to SV
$('#button_send').on('click', function (e) {
    e.preventDefault();

    // Get Data
    var IndexDevices = $('#table_borrow-tbody tr').map(function () {
        return $(this).data('index');
    }).get();

    var BorrowData = {
        IdDevices: $('#table_borrow-tbody tr').map(function () {return $(this).data('id');}).get(),
        QtyDevices: $('#table_borrow-tbody tr').map(function () {return parseInt($(this).find('.form-control').val());}).get(),
        SignProcess: $('#sign-container [select-user]').map(function () {return parseInt($(this).val()); }).get(),
        UserBorrow: $('#CardID').text(),
        BorrowDate: $('#form_borrow-BorrowDate').val(),
        Model: $('#form_borrow-Model').val(),
        Station: $('#form_borrow-Station').val(),
        Note: $('#form_borrow-Note').val()
    }

    // Validate
    if (!ValidateSendFormData(BorrowData)) return;

    // Tạo đơn lĩnh
    $.ajax({
        type: "POST",
        url: "/NVIDIA/RequestManagement/TakeDevice",
        data: JSON.stringify(BorrowData),
        dataType: "json",
        contentType: "application/json;charset=utf-8",
        success: function (response) {
            if (response.status) {
                toastr["success"]("Create Borrow Reuqest success.", "SUCCRESS");

                $.each(IndexDevices, function (k, v) {
                    var deviceData = tableDeviceInfo.row(v).data();

                    // Quantity
                    var oldQuantity = parseInt(deviceData[16]);
                    deviceData[16] = parseInt(deviceData[16] - BorrowData.QtyDevices[k]);

                    // Status
                    var bufferString = deviceData[9].replace("%", "");
                    var buffernumber = parseFloat(bufferString) / 100;
                    var quantityNumber = parseInt(deviceData[16]);

                    if (quantityNumber <= (oldQuantity * buffernumber)) {
                        // nếu realQty < giới hạn
                        // lớn hơn 1: báo warning
                        // bằng 0   : báo danger
                        if (quantityNumber > 0) {
                            tableDeviceInfo.row(v).nodes().to$().addClass('bg-light-danger');
                            deviceData[13] = '<span class="badge bg-danger">Out Range</span>';

                            tableDeviceInfo.row(v).data(deviceData).draw(false); // cập nhật data của row
                            attachButtonClickEvent(tableDeviceInfo.row(v).node(), deviceData, v); // add lại sự kiện
                        }
                        else {
                            tableDeviceInfo.row(v).nodes().to$().addClass('bg-dark');
                            deviceData[13] = '<span class="badge bg-secondary">Locked</span>';

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

    if ($('#form_borrow-Model').val() == "") { toastr["warning"]('Please enter the Use For Model', "WARNING"); return false; };
    if ($('#form_borrow-Station').val() == "") { toastr["warning"]('Please enter the Use For Station', "WARNING"); return false; };

    $.each(BorrowData.QtyDevices, function (index, item) {
        if (item == 0 || isNaN(item)) {
            toastr["warning"]('Please check Device Borrow Quantity', "WARNING");
            check = false;
            return false;
        }
    });

    $.each(BorrowData.IdDevices, function (index, item) {
        if (item == 0 || isNaN(item)) {
            toastr["warning"]('Please check List Device Borrow', "WARNING");
            check = false;
            return false;
        }
    });

    $.each(BorrowData.SignProcess, function (index, item) {
        if (item == 0 || isNaN(item)) {
            toastr["warning"]('Please check Sign Process', "WARNING");
            check = false;
            return false;
        }
    });

    if (BorrowData.UserBorrow == undefined || BorrowData.UserBorrow == '') {
        toastr["warning"]('Please check your session or Sign In again.', "WARNING");
        check = false;
    }
    if (BorrowData.BorrowDate == undefined || BorrowData.UserBorrow == '') {
        toastr["warning"]('Please enter Borrow Date', "WARNING");
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