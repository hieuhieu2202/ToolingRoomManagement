/* GLOBAL */

// 1. Return Device
async function GetExports() {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: "/NVIDIA/ExportManagement/GetExports",
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
            url: "/NVIDIA/ExportManagement/GetExport?Id=" + Id,
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
function CreateDatatableRow(_export, exportDevice) {
    var row = [
        _export.Id,
        exportDevice.Device.Product != null ? exportDevice.Device.Product.MTS : '',
        exportDevice.Device.DeviceCode != null ? exportDevice.Device.DeviceCode : '',
        exportDevice.Device.DeviceName != null ? exportDevice.Device.DeviceName : '',
        GetDeviceLocation(exportDevice.Device),
        exportDevice.ExportQuantity,
        exportDevice.Device.Unit != null ? exportDevice.Device.Unit : 'NA',
        `${_export.User.Username} - ${_export.User.CnName}`,
        moment(_export.CreatedDate).format("YYYY-MM-DD HH:mm:ss"),
        GetExportType(_export),
        GetExportStatus(_export),
        GetExportAction(_export.Id)
    ]

    return row;
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
function GetExportType(_export) {
    switch (_export.Type) {
        case "Export": {
            return (`<span class="text-success fw-bold">Export</span>`);
            break;
        }
        case "Return NG": {
            return (`<span class="text-danger fw-bold">NG</span>`);
            break;
        }
        default: {
            return (`<span class="text-secondary fw-bold">NA</span>`);
            break;
        }
    }
}
function GetExportStatus(_export) {
    switch (_export.Status) {
        case "Pending": {
            return (`<td><span class="badge bg-warning"><i class="fa-solid fa-timer"></i> Pending</span></td>`);
            break;
        }
        case "Approved": {
            return (`<td><span class="badge bg-success"><i class="fa-solid fa-check"></i> Approved</span></td>`);
            break;
        }
        case "Rejected": {
            return (`<td><span class="badge bg-danger"><i class="fa-solid fa-xmark"></i> Rejected</span></td>`);
            break;
        }
        default: {
            return (`<td><span class="badge bg-secondary">N/A</span></td>`);
            break;
        }
    }
}
function GetExportAction(Id) {
    return (`<a href="javascript:;" class="text-info bg-light-info border-0" onclick="ExportDetails(${Id})"><i class="fa-light fa-circle-info"></i></a>`);
}