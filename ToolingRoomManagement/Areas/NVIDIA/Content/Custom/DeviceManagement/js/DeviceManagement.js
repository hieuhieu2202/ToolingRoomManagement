// INIT
$(document).ready(function () {
    InitSelect2();
    SetDatas();
});

var tableDeviceInfo;
function CreateTableAddDevice(devices) {
    if (tableDeviceInfo) tableDeviceInfo.destroy();

    // Add list device to datalist
    var tableBody = $('#table_Devices_tbody');
    var devicedatalist = $('#device_edit-Devices-List');
    tableBody.empty();
    devicedatalist.html('');
    $.each(devices, function (no, item) {
        var deviceData = {
            id: item.Id || "NA",
            mts: (item.Product && item.Product.MTS) ? item.Product.MTS : "NA",
            productname: (item.Product && item.Product.ProductName !== "") ? item.Product.ProductName : "NA",
            model: (item.Model && item.Model.ModelName !== "") ? item.Model.ModelName : "NA",
            station: (item.Station && item.Station.StationName !== "") ? item.Station.StationName : "NA",
            pn: item.DeviceCode !== "null" ? item.DeviceCode : "NA",
            des: item.DeviceName !== "" ? item.DeviceName : "NA",
            group: (item.Group && item.Group.GroupName !== "") ? item.Group.GroupName : "NA",
            vendor: (item.Vendor && item.Vendor.VendorName !== "") ? item.Vendor.VendorName : "NA",
            special: (item.Specification !== "NA") ? item.Specification : "NA",
            buffer: (item.Buffer * 100) + "%",
            qty: item.Quantity || 0,
            poqty: item.POQty || 0,
            cfqty: item.QtyConfirm || 0,
            realqty: item.RealQty || 0,
            unit: item.Unit || '',
            leadtime: /\d/.test(item.DeliveryTime) ? item.DeliveryTime : "NA",
            isconsign: item.isConsign ? "consign" : "normal",
            location: {
                html: '',
                title: ''
            },
            AltPN: (item.AlternativeDevices != null && item.AlternativeDevices.length  == 1) ? item.AlternativeDevices[0].PNs ? item.AlternativeDevices[0].PNs : "" : ""
        };

        $.each(item.DeviceWarehouseLayouts, function (k, sss) {
            var layout = sss.WarehouseLayout;
            var locationLabel = `${layout.Line}${layout.Cell ? ' - ' + layout.Cell : ''}${layout.Floor ? ' - ' + layout.Floor : ''}`;
            deviceData.location.html += `<lable>${locationLabel}</lable>`;
            deviceData.location.title += `[${locationLabel}],`;
        });

        // Datalist
        devicedatalist.append(`<option value="${deviceData.pn}" data-id="${deviceData.id}">${deviceData.des} | ${deviceData.mts}</option>`);

        // Row
        var row = $(`<tr class="align-middle" data-id="${item.Id}"></tr>`);
        {
            // 0 ID
            row.append(`<td>${deviceData.id}</td>`);
            // 1 MTS
            row.append(`<td>${deviceData.mts}</td>`);
            // 2 Product Name
            row.append(`<td>${deviceData.productname}</td>`);
            // 3 Model
            row.append(`<td>${deviceData.model}</td>`);
            // 4 Station
            row.append(`<td>${deviceData.station}</td>`);
            // 5 DeviceCode - PN
            row.append(`<td>${deviceData.pn}</td>`);
            // 6 DeviceName
            row.append(`<td title="${deviceData.des}">${deviceData.des}</td>`);
            // 7 Group
            row.append(`<td>${deviceData.group}</td>`);
            // 8 Vendor
            row.append(`<td>${deviceData.vendor}</td>`);
            // 9 Specification
            row.append(`<td>${deviceData.special}</td>`);
            // 10 Location      
            row.append(`<td title="${deviceData.location.title}">${deviceData.location.html}</td>`);
            // 11 Buffer
            row.append(`<td>${deviceData.buffer}</td>`);
            // 12 BOM Quantity
            row.append(`<td title="BOM Quantity">${deviceData.qty}</td>`);
            // 13 PO Quantity
            row.append(`<td title="PO Quantity">${deviceData.poqty}</td>`);
            // 14 Confirm Quantity
            row.append(`<td title="Confirm Quantity">${deviceData.cfqty}</td>`);
            // 15 Real Quantity
            row.append(`<td title="Real Quantity">${deviceData.realqty}</td>`);
            // 16 Unit
            row.append(`<td>${deviceData.unit}</td>`);
            // 17 Lead Time
            row.append(`<td>${deviceData.leadtime}</td>`);
            // 18 Type
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
            // 19 Status
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
                    row.append(`<td>NA</td>`);
                    break;
                }
            }
            // 20 Action
            row.append(`<td class="order-action d-flex text-center justify-content-center">
                        <a href="javascript:;" class="text-info bg-light-info border-0"       title="${i18next.t('device.management.details')}" data-id="${item.Id}" onclick="Details(this, event)"><i class="fa-regular fa-circle-info"></i></a>
                        <a href="javascript:;" class="text-warning bg-light-warning border-0" title="${i18next.t('device.management.edit')}   " data-id="${item.Id}" onclick="Edit(this, event)   "><i class="fa-duotone fa-pen"></i></a>
                        <a href="javascript:;" class="text-danger  bg-light-danger  border-0" title="${i18next.t('device.management.delete')} " data-id="${item.Id}" onclick="Delete(this, event) "><i class="fa-duotone fa-trash"></i></a>
                    </td>`);
            // 21 isConsign (Hidden)
            row.append(`<td>${deviceData.isconsign}</td>`);
            // 22 AltPN
            row.append(`<td>${deviceData.AltPN}</td>`);
        }


        tableBody.append(row);
    });

    const options = {
        scrollY: 500,
        scrollX: true,
        order: [],
        autoWidth: false,
        deferRender: true,
        columnDefs: [
            { targets: "_all", orderable: false },
            { targets: [14], className: "text-primary fw-bold text-center" },
            { targets: [15], className: "text-info fw-bold text-center" },
            { targets: [11, 12, 13, 14, 15, 16, 17, 18, 19, 20], className: "text-center" },
            { targets: [20], className: "text-center", width: '120px' },

            { targets: [0, 2, 3, 4, 7, 8, 9, 12, 13, 21, 22], visible: false },
        ],
        "lengthMenu": [[10, 15, 25, 50, -1], [10, 15, 25, 50, "All"]],
        dom: "<'row'<'w-auto'B><'col-sm-12 col-md'l><'col-sm-12 col-md'f>>" +
            "<'row'<'col-sm-12'tr>>" +
            "<'row'<'col-sm-12 col-md-7'i><'col-sm-12 col-md-5'p>>",
        buttons: [
            {
                text: i18next.t('device.management.export_excel'),
                extend: 'excel',
                exportOptions: {
                    columns: [1, 2, 5, 6, 11, 14, 15]
                },
                customize: function (xlsx) {
                    $('sheets sheet', xlsx.xl['workbook.xml']).attr('name', 'Devices');
                }
            },
            {
                text: i18next.t('device.management.inventory'),
                action: function (e, dt, button, config) {
                    var input = $('<input type="file">');
                    input.on('change', function () {
                        var file = this.files[0];

                        sendFile(file);

                    });
                    input.click();
                }
            }
        ]

    };
    tableDeviceInfo = $('#table_Devices').DataTable(options);
    tableDeviceInfo.columns.adjust();
};
function InitSelect2() {
    // Warehouse
    $('#input_WareHouse', document).select2({
        theme: 'bootstrap4',
        minimumResultsForSearch: -1,
    });

    // Modal
    {

        $('#device_edit-AccKit').select2({
            theme: 'bootstrap4',
            dropdownParent: $("#device_edit-modal"),
            minimumResultsForSearch: -1,
            width: '50%',
        });
        $('#device_edit-Type').select2({
            theme: 'bootstrap4',
            dropdownParent: $("#device_edit-modal"),
            minimumResultsForSearch: -1,
            width: '50%',
        });
        $('#device_edit-Status').select2({
            theme: 'bootstrap4',
            dropdownParent: $("#device_edit-modal"),
            minimumResultsForSearch: -1,
            width: '50%',
        });
        $('#device_edit-WareHouse').select2({
            theme: 'bootstrap4',
            dropdownParent: $("#device_edit-modal"),
            minimumResultsForSearch: -1,
            width: '50%',
        });
    }

    // Filter
    {
        $('#filter_Product').select2({
            theme: 'bootstrap4',
            width: '75%',
        });
        $('#filter_Model').select2({
            theme: 'bootstrap4',
            width: '75%',
        });
        $('#filter_Vendor').select2({
            theme: 'bootstrap4',
            width: '75%',
        });
        $('#filter_Type').select2({
            theme: 'bootstrap4',
            width: '75%',
            minimumResultsForSearch: -1,
            dropdownParent: $("#dropdown_filter"),
        });

        $('#filter_Station').select2({
            theme: 'bootstrap4',
            width: '75%',
        });
        $('#filter_Group').select2({
            theme: 'bootstrap4',
            width: '75%',
        });
        $('#filter_Status').select2({
            theme: 'bootstrap4',
            width: '75%',
            minimumResultsForSearch: -1,
        });
    }
}

// GET
var ListDevices;
function GetWarehouseDevices(IdWarehouse = 0) {
    Pace.track(function () {
        $.ajax({
            url: "/NVIDIA/DeviceManagement/GetWarehouseDevices",
            data: JSON.stringify({ IdWarehouse }),
            type: "POST",
            dataType: "json",
            contentType: "application/json;charset=utf-8",
            success: async function (response) {
                if (response.status) {

                    var devices = response.warehouse.Devices;
                    CreateTableAddDevice(devices);

                }
                else {
                    Swal.fire(i18next.t('global.swal_title'), response.message, 'error');
                }
            },
            error: function (error) {
                Swal.fire(i18next.t('global.swal_title'), GetAjaxErrorMessage(error), 'error');
            },
            complete: function () {
                Pace.stop();
            }
        });
    });
}
function _GetWarehouseDevices(IdWarehouse) {
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
            complete: function () {
                // Dừng Pace.js sau khi AJAX request hoàn thành
                Pace.stop();
            }
        });
    });
}
function ExportExcel() {
    $.ajax({
        url: '/NVIDIA/DeviceManagement/ExportExcel',
        method: 'POST',
        contentType: 'application/json',
        xhrFields: { responseType: 'blob' },
        success: function (response, status, xhr) {

        },
        error: function (error) {
            Swal.fire(i18next.t('global.swal_title'), GetAjaxErrorMessage(error), "error");
        }
    });
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
function GetDevice(Id, GetResponse = false) {
    return new Promise((resolve, reject) => {
        $.ajax({
            type: "POST",
            url: "/NVIDIA/DeviceManagement/GetDevice",
            data: JSON.stringify({ Id: Id }),
            dataType: "json",
            contentType: "application/json;charset=utf-8",
            success: function (response) {
                if (response.status) {
                    if (GetResponse) {
                        resolve(response);
                    }
                    else {
                        resolve(response.device);
                    }
                    
                }
                else {
                    toastr["error"](response.message, "ERROR");
                    reject(response.message);
                }
            },
            error: function (error) {
                Swal.fire(i18next.t('global.swal_title'), GetAjaxErrorMessage(error), "error");
                reject(GetAjaxErrorMessage(error));
            }
        });
    });
}

var WarehouseLayouts;
function GetWarehouseLayouts(IdWarehouse) {
    $.ajax({
        type: "GET",
        url: "/NVIDIA/DeviceManagement/GetWarehouseLayouts?IdWarehouse=" + IdWarehouse,
        dataType: "json",
        contentType: "application/json;charset=utf-8",
        success: function (response) {
            if (response.status) {
                WarehouseLayouts = response.layouts;
            }
            else {
                Swal.fire(i18next.t('global.swal_title'), response.message, "error");
            }
        },
        error: function (error) {
            Swal.fire(i18next.t('global.swal_title'), GetAjaxErrorMessage(error), "error");
        }
    });
}

// SET
function Details(elm, e) {
    e.preventDefault();
    var Id = $(elm).data('id');
    GetDeviceDetails(Id);
}
function BorrowDetails(Id) {
    RequestDetails(Id, false);
}
async function SetDatas() {
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

    SetEditData(response);
    SetFilterData(response);
}
function Edit(elm, e) {
    e.preventDefault();

    DeviceUpdate(elm, e);
}

// POST
function sendFile(file) {
    const formData = new FormData();
    formData.append('file', file);

    Pace.on('progress', function (progress) {
        var cal = progress.toFixed(2);
        $('#process_count').text(`${cal}%`);
        $('#process_bar').css('width', `${cal}%`);
    });
    Pace.track(function () {
        $.ajax({
            url: "/NVIDIA/DeviceManagement/UploadFile",
            data: formData,
            type: "POST",
            processData: false,
            contentType: false,
            success: function (response) {
                if (response.status) {
                    window.location.href = response.url;
                }
                else {
                    Swal.fire(i18next.t('global.swal_title'), response.message, 'error');
                }
            },
            error: function (error) {
                Swal.fire(i18next.t('global.swal_title'), GetAjaxErrorMessage(error), 'error');
            },
            complete: function () {
                // Dừng Pace.js sau khi AJAX request hoàn thành
                Pace.stop();
            }
        });
    });
}
async function Confirm(elm, e) {
    e.preventDefault();

    var Id = $(elm).data('id');
    var Index = tableDeviceInfo.row(`[data-id="${Id}"]`).index();

    var device = await GetDevice(Id);

    Swal.fire({
        title: `<strong style="font-size: 25px;">${i18next.t('device.management.confirm_title')}</strong>`,
        html: `<table class="table table-striped table-bordered table-message">
                               <tbody>
                                   <tr>
                                       <td>${i18next.t('device.management.pn')}</td>
                                       <td>${device.DeviceName}</td>
                                   </tr>
                                   <tr>
                                       <td>${i18next.t('device.management.real_qty')}</td>
                                       <td>${device.RealQty}</td>
                                   </tr>
                                   <tr>
                                       <td>${i18next.t('device.management.buffer')}</td>
                                       <td>${device.Buffer}</td>
                                   </tr>
                               </tbody>
                           </table>
                           <div class="input-group mb-3">
                                <span class="input-group-text" style="min-width: 180px;">${i18next.t('device.management.qty_confirm')}</span>
                                <input class="form-control" type="number" id="device_confirm-QtyConfirm" placeholder="${device.QtyConfirm} + input">
                           </div>
                           `,
        icon: 'question',
        iconColor: '#ffc107',
        reverseButtons: false,
        confirmButtonText: i18next.t('global.confirm'),
        showCancelButton: true,
        cancelButtonText: i18next.t('global.cancel'),
        buttonsStyling: false,
        reverseButtons: true,
        customClass: {
            cancelButton: 'btn btn-outline-secondary fw-bold me-3',
            confirmButton: 'btn btn-success fw-bold'
        },
    }).then((result) => {
        if (result.isConfirmed) {
            var QtyConfirm = $('#device_confirm-QtyConfirm').val();

            $.ajax({
                type: "POST",
                url: "/NVIDIA/DeviceManagement/ConfirmDevice",
                data: JSON.stringify({ Id: Id, QtyConfirm: QtyConfirm }),
                dataType: "json",
                contentType: "application/json;charset=utf-8",
                success: function (response) {
                    if (response.status) {
                        var row = DrawRowEditDevice(response.device);
                        tableDeviceInfo.row(Index).data(row).draw(false);

                        toastr["success"]("Confirm device success.", "SUCCRESS");
                    }
                    else {
                        toastr["error"](response.message, "ERROR");
                    }
                },
                error: function (error) {
                    Swal.fire(i18next.t('global.swal_title'), GetAjaxErrorMessage(error), "error");
                }
            });
        }
    });
}

// EVENT
$('#input_WareHouse').on('change', function (e) {
    e.preventDefault();
    GetWarehouseDevices($(this).val());
}); // Get Warehouse devices
$(".toggle-icon").click(function () {
    setTimeout(() => {
        tableDeviceInfo.columns.adjust();
    }, 310);

}); // Fit Table header
$('#table_Devices tbody').on('dblclick', 'tr', function (event) {

    var dataId = $(this).data('id');

    GetDeviceDetails(dataId)
});
async function Delete(elm, e) {
    e.preventDefault();

    var Id = $(elm).data('id');
    var Index = tableDeviceInfo.row(`[data-id="${Id}"]`).index();

    var device = await GetDevice(Id);

    Swal.fire({
        title: `<strong style="font-size: 25px;">${i18next.t('device.management.delete_title')}</strong>`,
        html: `<table class="table table-striped table-bordered table-message">
                               <tbody>
                                    <tr>
                                       <td>${i18next.t('device.management.pn')}</td>
                                       <td>${device.DeviceCode}</td>
                                   </tr>
                                   <tr>
                                       <td>${i18next.t('device.management.description')}</td>
                                       <td>${device.DeviceName}</td>
                                   </tr>
                                   <tr>
                                       <td>${i18next.t('device.management.real_qty')}</td>
                                       <td>${device.RealQty}</td>
                                   </tr>
                               </tbody>
                           </table>
                           `,
        icon: 'question',
        iconColor: '#dc3545',
        reverseButtons: false,
        confirmButtonText: i18next.t('global.delete'),
        showCancelButton: true,
        cancelButtonText: i18next.t('global.cancel'),
        buttonsStyling: false,
        reverseButtons: true,
        customClass: {
            cancelButton: 'btn btn-outline-secondary fw-bold me-3',
            confirmButton: 'btn btn-danger fw-bold'
        },
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                type: "POST",
                url: "/NVIDIA/DeviceManagement/DeleteDevice",
                data: JSON.stringify({ Id: Id }),
                dataType: "json",
                contentType: "application/json;charset=utf-8",
                success: function (response) {
                    if (response.status) {
                        tableDeviceInfo.row(Index).remove().draw(false);

                        toastr["success"]("Delete device success.", "SUCCRESS");
                    }
                    else {
                        toastr["error"](response.message, "ERROR");
                    }
                },
                error: function (error) {
                    Swal.fire(i18next.t('global.swal_title'), GetAjaxErrorMessage(error), "error");
                }
            });
        }
    });
}
$('#filter').on('click', function (e) {
    e.preventDefault();

    var filter_Product = $('#filter_Product').val();
    var filter_Group = $('#filter_Group').val();
    var filter_Vendor = $('#filter_Vendor').val();
    var filter_Type = $('#filter_Type').val();
    var filter_Status = $('#filter_Status').val();

    tableDeviceInfo.columns().search('').draw();

    if (filter_Product !== "Product" && filter_Product !== null && filter_Product !== undefined) {
        tableDeviceInfo.column(2).search("^" + filter_Product + "$", true, false);
    }
    if (filter_Group !== "Group" && filter_Group !== null && filter_Group !== undefined) {
        tableDeviceInfo.column(5).search("^" + filter_Group + "$", true, false);
    }
    if (filter_Vendor !== "Vendor" && filter_Vendor !== null && filter_Vendor !== undefined) {
        tableDeviceInfo.column(6).search("^" + filter_Vendor + "$", true, false);
    }
    if (filter_Type !== "Type" && filter_Type !== null && filter_Type !== undefined) {
        var types = filter_Type.split('_');
        tableDeviceInfo.column(18).search(types[1], true, false);
        tableDeviceInfo.column(21).search("^" + types[0] + "$", true, false);
    }
    if (filter_Status !== "Status" && filter_Status !== null && filter_Status !== undefined) {
        tableDeviceInfo.column(19).search("^" + filter_Status + "$", true, false);
    }

    tableDeviceInfo.draw();
});



