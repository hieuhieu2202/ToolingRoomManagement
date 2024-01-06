$(document).ready(function () {
    CreateDatatable();
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
                    OpenCreateReturnDeviceModal();
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
        var returndevices = await GetReturnDevices();
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
function OpenCreateReturnDeviceModal() {
    try {
        
        $('#modal-AddReturnDevice').modal('show');      
        setTimeout(function () {
            CreateAddTable();
        }, 200);
    } catch (error) {
        Swal.fire('Sorry, something went wrong!', `${error}`, 'error');
    }
}
$('#modal-AddReturnDevice').on('shown.bs.modal', function (e) {
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
            scrollY: $('#modal-AddReturnDevice .modal-body').height() - 120,
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
                selector: ':not(:last-child)'
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
        if (devices == null || devices.length == 0) {
            devices = await GetWarehouseDevices(1);
        }
        InitAddTable();

        var rowsToAdd = [];
        $.each(devices, function (k, device) {
            var tablerow = CreateDeviceTableRow(device);
            rowsToAdd.push(tablerow);
        });
        datatable_add.rows.add(rowsToAdd).draw(true);
        datatable_add.columns.adjust().draw();

    } catch (error) {
        Swal.fire('Sorry, something went wrong!', `${error}`, 'error');
    }
}
function DeviceDetails(elm, e) {
    var dataId = $(elm).data('id');
    GetDeviceDetails(dataId);
}
$('#btn-AddReturnDevice').click(function (e) {
    var selectedRows = datatable_add.rows('.selected').nodes();

    console.log(selectedRows);

    $('#modal-AddReturnDevice').modal('hide');
    setTimeout(function () {
        $('#modal-ReturnDevice').modal('show');
    }, 200);
});

/* RETURN DEVICE MODAL */



/* GLOBAL */

// 1. Return Device
async function GetReturnDevices() {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: "/NVIDIA/ReturnDevice/GetReturnDevices",
            type: "GET",
            contentType: "application/json;charset=utf-8",
            dataType: "json",
            success: function (res) {
                if (res.status) {
                    resolve(res.ReturnDevices);
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
async function GetReturnDevices() {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: "/NVIDIA/ReturnDevice/GetReturnDevices",
            type: "GET",
            contentType: "application/json;charset=utf-8",
            dataType: "json",
            success: function (res) {
                if (res.status) {
                    resolve(res.ReturnDevices);
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
async function GetReturnDevice(Id) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: "/NVIDIA/ReturnDevice/GetReturnDevice?Id" + Id,
            type: "GET",
            contentType: "application/json;charset=utf-8",
            dataType: "json",
            success: function (res) {
                if (res.status) {
                    resolve(res.ReturnDevice);
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
            url: "/NVIDIA/ReturnDevice/GetDevice?Id=" + Id,
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