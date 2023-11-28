$(document).ready(async function () {
    var devices = await GetComingDevices();
    CreateTable(devices);

    GetSelectData();

});

// GET
function GetComingDevices() {
    return new Promise((resolve, reject) => {
        $.ajax({
            type: "GET",
            url: "/NVIDIA/DeviceManagement/GetComingDevices",
            dataType: "json",
            contentType: "application/json;charset=utf-8",
            success: function (response) {
                if (response.status) {
                    resolve(response.devices);
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
function GetComingDevice(Id) {
    return new Promise((resolve, reject) => {
        $.ajax({
            type: "GET",
            url: "/NVIDIA/DeviceManagement/GetComingDevice?Id=" + Id,
            dataType: "json",
            contentType: "application/json;charset=utf-8",
            success: function (response) {
                if (response.status) {
                    resolve(response.device);
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
function GetDevice(Id, Type) {
    return new Promise((resolve, reject) => {
        $.ajax({
            type: "GET",
            url: `/NVIDIA/DeviceManagement/GetDevice?Id=${Id}&Type=${Type}`,
            dataType: "json",
            contentType: "application/json;charset=utf-8",
            success: function (response) {
                if (response.status) {
                    resolve(response.device);
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
function GetWarehouseDevices_Coming(Id) {
    return new Promise((resolve, reject) => {
        $.ajax({
            type: "GET",
            url: "/NVIDIA/DeviceManagement/GetWarehouseDevices_Coming?Id=" + Id,
            dataType: "json",
            contentType: "application/json;charset=utf-8",
            success: function (response) {
                if (response.status) {

                    var devices = {
                        DeviceConfirms: response.devices,
                        DeviceUnconfirms: response.deviceUnconfirms
                    }

                    resolve(devices);
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
function GetSelectData() {
    $.ajax({
        type: "GET",
        url: "/NVIDIA/DeviceManagement/GetSelectData",
        dataType: "json",
        contentType: "application/json;charset=utf-8",
        success: async function (response) {
            if (response.status) {
                // WareHouse
                $('#select_warehouse').empty();
                await $.each(response.warehouses, function (k, item) {
                    var opt1 = $(`<option value="${item.Id}">${item.WarehouseName}</option>`);
                    $('#select_warehouse').append(opt1);
                });        

                $('#select_warehouse').change(async function () {
                    var devices = await GetWarehouseDevices_Coming($(this).val());

                    CreateTableComing(devices);
                });

                $('#select_warehouse').change();

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

// Datatable coming device
var tableDeviceInfo;
async function CreateTable(devices) {
    if (tableDeviceInfo) tableDeviceInfo.destroy();

    $('#table_Devices_tbody').html('');

    await $.each(devices, async function (no, item) {
        var row = CreateRowDatatable(item);
        $('#table_Devices_tbody').append(row);
    });

    const options = {
        scrollY: 500,
        scrollX: true,
        order: [],
        autoWidth: false,
        columnDefs: [
            { targets: "_all", orderable: false },
            { targets: [0, 5, 6], visible: false },
            { targets: [1, 3, 7, 8, 9, 10, 11, 12, 13, 14, 15], className: "text-center" },
        ],
        "lengthMenu": [[10, 15, 25, 50, -1], [10, 15, 25, 50, "All"]],
        dom: "<'row'<'w-auto'B><'col-sm-12 col-md'l><'col-sm-12 col-md'f>>" +
            "<'row'<'col-sm-12'tr>>" +
            "<'row'<'col-sm-12 col-md-7'i><'col-sm-12 col-md-5'p>>",
        buttons: [{
            text: "Add Device",
            action: function () {
                AddComingDevice();
            }
        }]

    };
    tableDeviceInfo = $('#table_Devices').DataTable(options);
    TableAdjust('#table_Devices_wrapper');
};
function CreateRowDatatable(otwDevice) {

    var device;
    if (otwDevice.Device != null) {
        device = otwDevice.Device;
    }
    else {
        device = otwDevice.DeviceUnconfirm;
    }

    var row = $(`<tr class="align-middle cursor-pointer" data-id="${device.Id}"></tr>`);

    // 0 ID
    row.append(`<td>${device.Id}</td>`);
    // 1 MTS
    row.append(`<td>${(device.Product) ? device.Product.MTS ? device.Product.MTS : "NA" : "NA"}</td>`);
    // 2 Product Name
    row.append(`<td>${(device.Product) ? (device.Product.ProductName != "" ? device.Product.ProductName : "NA") : "NA"}</td>`);
    // 3 DeviceCode - PN
    row.append(`<td>${device.DeviceCode ? device.DeviceCode : "NA"}</td>`);
    // 4 DeviceName
    row.append(`<td title="${device.DeviceName}">${device.DeviceName != "" ? device.DeviceName : "NA"}</td>`);
    // 5 Group
    row.append(`<td>${(device.Group) ? (device.Group.GroupName != "" ? device.Group.GroupName : "NA") : "NA"}</td>`);
    // 6 Vendor
    row.append(`<td>${(device.Vendor) ? (device.Vendor.VendorName != "" ? device.Vendor.VendorName : "NA") : "NA"}</td>`);
    // 7 Model
    row.append(`<td>${(device.Model) ? (device.Model.ModelName != "" ? device.Model.ModelName : "NA") : "NA"}</td>`);
    // 8 Station
    row.append(`<td>${(device.Station) ? (device.Station.StationName != "" ? device.Station.StationName : "NA") : "NA"}</td>`);
    // 9 Life Cycle
    row.append(`<td>${device.LifeCycle ? device.LifeCycle : "NA"}</td>`);
    // 10 Buffer
    row.append(`<td>${device.Buffer * 100}%</td>`);
    // 11 Quantity
    row.append(`<td>${device.Quantity ? device.Quantity : 0}</td>`);
    // 12 Min Quantity
    row.append(`<td>${device.MinQty ? device.MinQty : 0}</td>`);
    // 13 MOQ
    row.append(`<td>${device.MOQ ? device.MOQ : 0}</td>`);
    // 14 Type
    row.append(`<td >${device.Type_BOM ? (device.Type_BOM == "S" ? '<span class="badge bg-success">Static</span>' : '<span class="badge bg-info">Dynamic</span>') : "NA"}</td>`);
    // 15 Action
    row.append(`<td class="order-action d-flex text-center justify-content-center">
                        <a href="javascript:;" class="text-warning bg-light-warning border-0" data-id="${device.Id}" onclick="Confirm(this, event)"><i class="fa-duotone fa-check"></i></a>
                    </td>`);

    return row;
}
$(".toggle-icon").click(function () {
    setTimeout(() => {
        tableDeviceInfo.columns.adjust();
    }, 300);
});



// Datatable add coming device
var table_DeviceComing;
async function CreateTableComing(devices) {
    if (table_DeviceComing) table_DeviceComing.destroy();

    $('#table_DeviceComing-tbody').html('');

    if (devices.DeviceConfirms.length > 0) {
        await $.each(devices.DeviceConfirms, async function (no, device) {
            var row = $(`<tr class="align-middle cursor-pointer" data-id="${device.Id}" data-type="confirm"></tr>`);

            row.append(`<td>${device.Id}</td>`);
            row.append(`<td>${(device.Product) ? device.Product.MTS ? device.Product.MTS : "NA" : "NA"}</td>`);
            row.append(`<td>${device.DeviceCode ? device.DeviceCode : "NA"}</td>`);
            row.append(`<td>${device.DeviceName != "" ? device.DeviceName : "NA"}</td>`);
            row.append(`<td>${(device.Group) ? (device.Group.GroupName != "" ? device.Group.GroupName : "NA") : "NA"}</td>`);
            row.append(`<td>${(device.Vendor) ? (device.Vendor.VendorName != "" ? device.Vendor.VendorName : "NA") : "NA"}</td>`);
            row.append(`<td class="order-action d-flex text-center justify-content-center text-center">
                            <a href="javascript:;" class="text-info bg-light-info border-0 custom" onclick="AddDevice('${device.Id}', 'confirm')"><i class="fa-regular fa-plus"></i> New</a>
                        </td>`);

            $('#table_DeviceComing-tbody').append(row);
        });
    }
    if (devices.DeviceUnconfirms.length > 0) {
        await $.each(devices.DeviceUnconfirms, async function (no, device) {
            var row = $(`<tr class="align-middle cursor-pointer" data-id="${device.Id}" data-type="unconfirm"></tr>`);

            row.append(`<td>${device.Id}</td>`);
            row.append(`<td>${(device.Product) ? device.Product.MTS ? device.Product.MTS : "NA" : "NA"}</td>`);
            row.append(`<td>${device.DeviceCode ? device.DeviceCode : "NA"}</td>`);
            row.append(`<td>${device.DeviceName != "" ? device.DeviceName : "NA"}</td>`);
            row.append(`<td>${(device.Group) ? (device.Group.GroupName != "" ? device.Group.GroupName : "NA") : "NA"}</td>`);
            row.append(`<td>${(device.Vendor) ? (device.Vendor.VendorName != "" ? device.Vendor.VendorName : "NA") : "NA"}</td>`);
            row.append(`<td class="order-action d-flex text-center justify-content-center text-center">
                            <a href="javascript:;" class="text-info bg-light-info border-0 custom" onclick="AddDevice('${device.Id}', 'unconfirm')"><i class="fa-regular fa-plus"></i> New</a>
                        </td>`);

            $('#table_DeviceComing-tbody').append(row);
        });
    }
    

    const options = {
        scrollY: 480,
        scrollX: true,
        order: [0, 'desc'],
        autoWidth: false,
        columnDefs: [
            { targets: [0], visible: false },
            { targets: "_all", orderable: false },
        ],
        "lengthMenu": [[10, 15, 25, 50, -1], [10, 15, 25, 50, "All"]],
    };
    table_DeviceComing = $('#table_DeviceComing').DataTable(options);
    table_DeviceComing.columns.adjust();
};
$('#table_DeviceComing tbody').on('dblclick', 'tr', async function (event) {
    var dataId = $(this).data('id');
    var dataType = $(this).data('type');

    var modal_footer = $('#details_modal-footer');
    if (modal_footer.find('#btn-add_devicecoming').length > 0) {
        var btn_add = modal_footer.find('#btn-add_devicecoming');
        btn_add.data('id', dataId);
        btn_add.data('type', dataType);
    }
    else {
        var btn_add = $(`<button class="btn btn-primary" id="btn-add_devicecoming" data-id="${dataId}" data-type="${dataType}">Add Coming Device</button>`);

        btn_add.click(function () {
            var Id = $(this).data('id');
            var Type = $(this).data('type');

            AddDevice(Id, Type);
        })

        modal_footer.append(btn_add);
    }

    var device = await GetDevice(dataId, dataType);
    await FillDetailsDeviceData(device);
    $('#device_details-modal').modal('show');
});

// Add
async function AddComingDevice() {
    $('#device_comming-modal').modal('show');
    TableAdjust(table_DeviceComing, '#table_DeviceComing_wrapper');
    $('#borrow_modal-name').hide()
    $('#details-location').hide();
    $('#device_details-layout').hide();
    $('#details-history').hide();
    $('#device_details-history').hide();
}
async function AddDevice(Id, Type) {
    $('#device_details-modal').modal('hide');
    var device = await GetDevice(Id, Type);

    console.log(device);

    $('#device_comming_add-modal').modal('show');
}
