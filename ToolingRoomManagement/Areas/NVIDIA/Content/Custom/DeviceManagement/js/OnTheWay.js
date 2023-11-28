$(document).ready(async function () {
    var devices = await GetOnTheWayDevices();
    CreateTable(devices);

});

// GET
function GetOnTheWayDevices() {
    return new Promise((resolve, reject) => {
        $.ajax({
            type: "GET",
            url: "/NVIDIA/DeviceManagement/GetOnTheWayDevices",
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
function GetOnTheWayDevice(Id) {
    return new Promise((resolve, reject) => {
        $.ajax({
            type: "GET",
            url: "/NVIDIA/DeviceManagement/GetOnTheWayDevice?Id=" + Id,
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

// Datatable
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

    };
    tableDeviceInfo = $('#table_Devices').DataTable(options);
    tableDeviceInfo.columns.adjust();
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