var users, roles, warehouses;
$(document).ready(async function () {
    CreateDatatable();
    var response = await GetUsers();
    users = response.users;
    roles = response.roles;
    warehouses = await GetWarehouses();

    $.each(warehouses, function (k, wh) {
        $('#select-WareHouse').append(`<option value="${wh.Id}">${wh.WarehouseName}</option>`);
    });

});

/* DATATABLE */
var datatable;
function InitTable() {
    const options = {
        scrollY: 500,
        scrollX: true,
        order: [0, 'desc'],
        autoWidth: false,
        deferRender: true,
        columnDefs: [
            { targets: "_all", orderable: false },
            { targets: [0, 12], visible: false },
        ],
        "lengthMenu": [[10, 15, 25, 50, -1], [10, 15, 25, 50, "All"]],
        dom: "<'row'<'w-auto'B><'col-sm-12 col-md'l><'col-sm-12 col-md'f>>" +
            "<'row'<'col-sm-12'tr>>" +
            "<'row'<'col-sm-12 col-md-7'i><'col-sm-12 col-md-5'p>>",
        buttons: [
            {
                text: 'Return NG',
                action: function (e, dt, button, config) {
                    OpenCreateExportDeviceModal();
                }
            }
        ],
        createdRow: function (row, data, dataIndex) {
            $(row).addClass('cursor-pointer');
            $(row).data('id', data[0]);         
            //$(row).data('id', data[0]);
        },

    };
    datatable = $('#datatable').DataTable(options);
    //datatable.columns.adjust();
}
async function CreateDatatable() {
    try {
        var returndevices = await GetExportDevices();
        InitTable();


    } catch (error) {
        Swal.fire('Sorry, something went wrong!', `${error}`, 'error');
    }
}

/* ADD RETURN DEVICE MODAL */
var devices;
var datatable_add;
$('#select-WareHouse').change(async function () {
    devices = await GetWarehouseDevices($(this).val());
});
function OpenCreateExportDeviceModal() {
    try {
        
        $('#modal-AddExportDevice').modal('show');      
        setTimeout(function () {
            CreateAddTable();
        }, 200);
    } catch (error) {
        Swal.fire('Sorry, something went wrong!', `${error}`, 'error');
    }
}
$('#modal-AddExportDevice').on('shown.bs.modal', function (e) {
    $('.modal-backdrop').last().css('z-index', 1039);
});

function InitAddTable() {
    if (datatable_add == null) {
        var windowHeight = $(window).height();
        lengthMenu = [[], []];
        if (windowHeight < 900) {
            lengthMenu = [[10, 15, 25, 50, -1], [10, 15, 25, 50, "All"]];
        }
        else if (windowHeight >= 900 && windowHeight < 1080) {
            lengthMenu = [[12, 15, 25, 50, -1], [12, 15, 25, 50, "All"]]
        }
        else {
            lengthMenu = [[15, 25, 50, -1], [15, 25, 50, "All"]]
        }
        console.log(windowHeight);

        const options = {
            scrollY: $('#modal-AddExportDevice .modal-body').height() - 120,
            scrollX: true,
            order: [1, 'desc'],
            autoWidth: false,
            select: true,
            columnDefs: [
                { targets: "_all", orderable: false },
                { targets: [1, 14, 15], visible: false },

                { targets: [0],  className: "select-checkbox checkbox-custom" },
                { targets: [6],  className: "text-center" },
                { targets: [7],  className: "text-primary fw-bold text-center" },
                { targets: [8],  className: "text-info fw-bold text-center" },
                { targets: [9],  className: "text-center" },
                { targets: [10], className: "text-center" },
                { targets: [11], className: "row-type text-center" },
                { targets: [12], className: "row-status text-center" },
                { targets: [13], className: "row-action order-action d-flex text-center justify-content-center" },
            ],
            lengthMenu: lengthMenu,
            createdRow: function (row, data, dataIndex) {
                $(row).addClass('align-middle cursor-pointer');
                $(row).data('id', data[1]);

                var cells = $(row).children('td');
                $(cells[3]).attr('title', data[4]);
                $(cells[4]).attr('title', data[5]);
            },
            select: {
                style: 'multi',
                selector: 'td:not(:last-child)'
            },
        };
        datatable_add = $('#datatable_add').DataTable(options);
    }
    else {
        datatable_add.clear().draw();
    }
}
async function CreateAddTable() {
    try {
        Pace.track(async function () {
            if (devices == null || devices.length == 0) {
                devices = await GetWarehouseDevices($('#select-WareHouse').val());
            }
            InitAddTable();

            var rowsToAdd = [];
            $.each(devices, function (k, device) {
                var tablerow = CreateDeviceTableRow(device);
                rowsToAdd.push(tablerow);
            });
            datatable_add.rows.add(rowsToAdd).draw(true);
            datatable_add.columns.adjust().draw();
        });
    } catch (error) {
        Swal.fire('Sorry, something went wrong!', `${error}`, 'error');
    }
}
function DeviceDetails(elm, e) {
    var dataId = $(elm).data('id');
    GetDeviceDetails(dataId);
}
$('#datatable_add tbody').on('click', 'tr', function (e) {
    if (!$(this).is('.selected')) {
        e.preventDefault();

        var selectedRows = datatable_add.rows('.selected').nodes();
        if (selectedRows.count() > 9) {
            toastr["error"]("Max selected row.", "ERROR");
            return false;
        }
    }
    
});
$('#btn-AddExportDevice').click(function (e) {
    var selectedRows = datatable_add.rows('.selected').data();

    if (selectedRows.count() > 0) {
        $('#modal-ExportDevice').modal('hide');
        setTimeout(function () {
            CreateExportDeviceModal(selectedRows);

        }, 200);
    }
    else {
        toastr["warning"]("Please select device.", "WARNING");
    }
});

/* RETURN DEVICE MODAL */
function CreateExportDeviceModal(rows) {
    $('#ExportDevice-cardid').val($('#CardID').text());
    $('#ExportDevice-username').val($('#Name').text());
    $('#ExportDevice-createddate').val(moment().format("YYYY-MM-DDTHH:mm:ss"));
    $('#ExportDevice-note').val('');

    var tbody = $('#table_export-tbody');
    tbody.empty();
    $.each(rows, function (k, row) {
        var tr = $(`<tr class="align-middle" data-id="${row[1]}" data-index="${k}"></tr>`);
        tr.append(`<td class="text-center">${k + 1}</td>`);
        tr.append(`<td>${row[2] ? row[2] : ''}</td>`);
        tr.append(`<td>${row[3]}</td>`);
        tr.append(`<td>${row[4]}</td>`);
        tr.append(`<td class="text-center">${row[9]}</td>`);
        tr.append(`<td><input class="form-control" type="number" max="${row[7]}" placeholder="MAX: ${row[7]}" autocomplete="off"></td>`);

        tbody.append(tr);

    });

    $('#modal-ExportDevice').modal('show');
}
$('#modal-ExportDevice-btnAddSign').on('click', function (e) {
    e.preventDefault();

    var container = $('#modal-ExportDevice-signcontainer');

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

$('#modal-ExportDevice-btncreate').click(async function (e) {
    try {
        e.preventDefault();

        var exportdata = GetExportData();
        var _export = await CreateExport(exportdata);

        console.log(_export);
    } catch (error) {
        Swal.fire('Sorry, something went wrong!', `${error}`, 'error');
    }
})
function GetExportData(type = "ReturnNG") {
    var exportdata = {
        CreatedDate: $('#ExportDevice-createddate').val(),
        IdUser: '',
        Note: $('#ExportDevice-note').val(),
        Status: '',
        Type: type,
        UserExportSigns: [],
        ExportDevices: [],
        User: {
            Username: $('#ExportDevice-cardid').val()
        }
    };

    $.each($('#table_export-tbody tr'), function (k, row) {
        var tds = $(row).find('td');
        var exportDevice = {
            IdDevice: $(row).data('id'),
            ExportQuantity: $(tds[5]).find('input').val()
        }

        exportdata.ExportDevices.push(exportDevice);
    });

    $.each($('#modal-ExportDevice-signcontainer [select-user]'), function (k, selectuser) {
        var userExportSign = {
            IdUser: $(selectuser).val(),
            SignOrder: k + 1,
            Status: (k == 0) ? 'Pending' : 'Waitting'
        }
        exportdata.UserExportSigns.push(userExportSign);
    });

    return exportdata;
}









/* GLOBAL */

// 1. Return Device
async function GetExportDevices() {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: "/NVIDIA/ExportManagement/GetExports?type=ReturnNG",
            type: "GET",
            contentType: "application/json;charset=utf-8",
            dataType: "json",
            success: function (res) {
                if (res.status) {
                    resolve(res.exports);
                }
                else {
                    reject(res.message);
                }
            },
            error: function (error) {
                reject(GetAjaxErrorMessage(error));
            }
        });
    });
}
async function GetExport(Id) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: "/NVIDIA/ExportManagement/GetExport?Id" + Id,
            type: "GET",
            contentType: "application/json;charset=utf-8",
            dataType: "json",
            success: function (res) {
                if (res.status) {
                    resolve(res.export);
                }
                else {
                    reject(res.message);
                }
            },
            error: function (error) {
                reject(GetAjaxErrorMessage(error));
            }
        });
    });
}

// 2. Return Device Datatable
function CreateDatatableRow(return_ng) {
    var row = [
        return_ng.Id,
        return_ng.Device.Product != null ? return_ng.Device.Product.MTS : '',
        return_ng.Device.DeviceCode != null ? return_ng.Device.DeviceCode : '',
        return_ng.Device.DeviceName != null ? return_ng.Device.DeviceName : '',
        GetDeviceLocation(return_ng.Device),
        return_ng.Device.Buffer != null ? `${return_ng.Device.Buffer * 100}%` : '0%',
        return_ng.Quantity,
        return_ng.Device.Unit != null ? return_ng.Device.Unit : 'NA',
        /\d/.test(return_ng.Device.DeliveryTime) ? return_ng.Device.DeliveryTime : "NA",
        GetDeviceType(return_ng.Device),
        GetDeviceStatus(return_ng.Device),
        GetDeviceAction(return_ng.Id)
    ]
}


// 3. Device
function GetWarehouseDevices(IdWarehouse = 1) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: "/NVIDIA/DeviceManagement/GetWarehouseDevices",
            data: JSON.stringify({ IdWarehouse }),
            type: "POST",
            dataType: "json",
            contentType: "application/json;charset=utf-8",
            success: function (response) {
                if (response.status) {
                    resolve(response.warehouse.Devices);
                } else {
                    reject(response.message);
                }
            },
            error: function (error) {
                reject(GetAjaxErrorMessage(error));
            },
        });
    });
}
function GetDevice(Id) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: "/NVIDIA/ExportManagement/GetDevice?Id=" + Id,
            type: "GET",
            dataType: "json",
            contentType: "application/json;charset=utf-8",
            success: function (response) {
                if (response.status) {
                    resolve(response.device);
                } else {
                    reject(response.message);
                }
            },
            error: function (error) {
                reject(GetAjaxErrorMessage(error));
            },
        });
    });
}

// 4. Device Datatable
function CreateDeviceTableRow(device) {
    var row = [
        /* 0 */'',
        /* 1  */device.Id,
        /* 2  */device.Product != null ? device.Product.MTS : '',
        /* 3  */device.DeviceCode != null ? device.DeviceCode : '',
        /* 4  */device.DeviceName != null ? device.DeviceName : '',
        /* 5  */GetDeviceLocation(device),
        /* 6  */device.Buffer != null ? `${device.Buffer * 100}%` : '0%',
        /* 7  */device.QtyConfirm,
        /* 8  */device.RealQty,
        /* 9  */device.Unit != null ? device.Unit : 'NA',
        /* 10  *//\d/.test(device.DeliveryTime) ? device.DeliveryTime : "NA",
        /* 11 */GetDeviceType(device),
        /* 12 */GetDeviceStatus(device),
        /* 13 */GetDeviceAction(device.Id),
        /* 14 */device.isConsign ? "consign" : "normal",
        /* 15 */GetAlternativePN(device),
    ];
    return row;
}

// 5. Users
async function GetUsers() {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: "/NVIDIA/ExportManagement/GetUsers",
            type: "GET",
            contentType: "application/json;charset=utf-8",
            dataType: "json",
            success: function (res) {
                if (res.status) {
                    resolve(res);
                }
                else {
                    reject(res.message);
                }
            },
            error: function (error) {
                reject(GetAjaxErrorMessage(error));
            }
        });
    });
}

// 6. Warehouses
async function GetWarehouses() {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: "/NVIDIA/ExportManagement/GetWarehouses",
            type: "GET",
            contentType: "application/json;charset=utf-8",
            dataType: "json",
            success: function (res) {
                if (res.status) {
                    resolve(res.warehouses);
                }
                else {
                    reject(res.message);
                }
            },
            error: function (error) {
                reject(GetAjaxErrorMessage(error));
            }
        });
    });
}

// 7. Create Export
async function CreateExport(exportdata) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: "/NVIDIA/ExportManagement/NewExport",
            type: "POST",
            data: JSON.stringify({ exportdata }),
            contentType: "application/json;charset=utf-8",
            dataType: "json",
            success: function (res) {
                if (res.status) {
                    resolve(JSON.parse(res.export));
                }
                else {
                    reject(res.message);
                }
            },
            error: function (error) {
                reject(GetAjaxErrorMessage(error));
            }
        });
    });
}

// *. Common
function GetDeviceLocation(device) {
    var location = [];
    $.each(device.DeviceWarehouseLayouts, function (k, deviceLocation) {
        var layout = deviceLocation.WarehouseLayout;
        location.push(`${layout.Line}${layout.Cell ? ' - ' + layout.Cell : ''}${layout.Floor ? ' - ' + layout.Floor : ''}`);
    });
    return location.join(', ');
}
function GetDeviceType(device) {
    switch (device.Type) {
        case "S":
        case "Static": {
            return (`<span class="text-success fw-bold">Static</span>
                     </br>
                     <span class="text-${device.isConsign ? "warning" : "primary"} fw-bold" style="font-size: 10px;">${device.isConsign ? "Consign" : "Normal"}</span>`);
            break;
        }
        case "D":
        case "Dynamic": {
            return (`<span class="text-info fw-bold">Dynamic</span>
                        </br>
                        <span class="text-${device.isConsign ? "warning" : "primary"} fw-bold" style="font-size: 10px;">${device.isConsign ? "Consign" : "Normal"}</span>`);
            break;
        }
        case "Fixture": {
            return (`<td class="py-0">
                                <span class="text-primary fw-bold">Fixture</span>
                                </br>
                                <span class="text-${device.isConsign ? "warning" : "primary"} fw-bold" style="font-size: 10px;">${device.isConsign ? "Consign" : "Normal"}</span>
                            </td>`);
            break;
        }
        default: {
            return (`<span class="text-secondary fw-bold">NA</span>
                     </br>
                     <span class="text-${device.isConsign ? "warning" : "primary"} fw-bold" style="font-size: 10px;">${device.isConsign ? "Consign" : "Normal"}</span>`);
            break;
        }
    }
}
function GetDeviceStatus(device) {
    switch (device.Status) {
        case "Unconfirmed": {
            return (`<span class="badge bg-primary">Unconfirmed</span>`);
            break;
        }
        case "Part Confirmed": {
            return (`<span class="badge bg-warning">Part Confirmed</span>`);
            break;
        }
        case "Confirmed": {
            return (`<span class="badge bg-success">Confirmed</span>`);
            break;
        }
        case "Locked": {
            return (`<span class="badge bg-secondary">Locked</span>`);
            break;
        }
        case "Out Range": {
            return (`<span class="badge bg-danger">Out Range</span>`);
            break;
        }
        default: {
            return (`NA`);
            break;
        }
    }
}
function GetDeviceAction(Id) {
    return (`<a href="javascript:;" class="text-info bg-light-info border-0"       data-id="${Id}" onclick="DeviceDetails(this, event)"><i class="fa-light fa-circle-info"></i></a>`);
}
function GetAlternativePN(device) {
    return (device.AlternativeDevices != null && device.AlternativeDevices.length == 1) ? device.AlternativeDevices[0].PNs ? device.AlternativeDevices[0].PNs : "" : "";
}
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
    return opt;
}