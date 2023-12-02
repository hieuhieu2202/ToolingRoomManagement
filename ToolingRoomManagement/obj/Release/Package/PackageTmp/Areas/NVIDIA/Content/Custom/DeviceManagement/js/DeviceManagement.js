$(function () {
    GetSelectData();
});

// table
var tableDeviceInfo;
async function CreateTableAddDevice(devices) {
    if (tableDeviceInfo) tableDeviceInfo.destroy();

    $('#table_Devices_tbody').html('');
    await $.each(devices, async function (no, item) {

        var row = $(`<tr class="align-middle" data-id="${item.Id}"></tr>`);

        // 0 ID
        row.append(`<td>${item.Id}</td>`);
        // 1 ID
        row.append(`<td>${(item.Product) ? item.Product.MTS ? item.Product.MTS : "NA" : "NA"}</td>`);
        // 2 Product Name
        row.append(`<td>${(item.Product) ? (item.Product.ProductName != "" ? item.Product.ProductName : "NA") : "NA"}</td>`);
        // 3 Model
        row.append(`<td>${(item.Model) ? (item.Model.ModelName != "" ? item.Model.ModelName : "NA") : "NA"}</td>`);
        // 4 Station
        row.append(`<td>${(item.Station) ? (item.Station.StationName != "" ? item.Station.StationName : "NA") : "NA"}</td>`);
        // 5 DeviceCode - PN
        row.append(`<td>${item.DeviceCode != "null" ? item.DeviceCode : "NA"}</td>`);
        // 6 DeviceName
        row.append(`<td title="${item.DeviceName}">${item.DeviceName != "" ? item.DeviceName : "NA"}</td>`);
        // 7 Group
        row.append(`<td>${(item.Group) ? (item.Group.GroupName != "" ? item.Group.GroupName : "NA") : "NA"}</td>`);
        // 8 Vendor
        row.append(`<td>${(item.Vendor) ? (item.Vendor.VendorName != "" ? item.Vendor.VendorName : "NA") : "NA"}</td>`);
        // 9 Specification
        row.append(`<td>${(item.Specification) ? (item.Specification != "NA" ? item.Specification : "NA") : "NA"}</td>`);
        // 10 Location 
        var html = ''
        var title = ''
        $.each(item.DeviceWarehouseLayouts, function (k, sss) {
            var layout = sss.WarehouseLayout;
            html += `<lable>${layout.Line}${layout.Cell ? ' - ' + layout.Cell : ''}${layout.Floor ? ' - ' + layout.Floor : ''}</lable>`;
            title += `[${layout.Line}${layout.Cell ? ' - ' + layout.Cell : ''}${layout.Floor ? ' - ' + layout.Floor : ''}],`;
        });
        row.append(`<td title="${title}">${html != "" ? html : "NA"}</td>`);
        // 11 Buffer
        row.append(`<td title="${item.Buffer}">${item.Buffer * 100}%</td>`);
        // 12 BOM Quantity
        row.append(`<td title="BOM Quantity">${item.Quantity ? item.Quantity : 0}</td>`);
        // 13 PO Quantity
        row.append(`<td title="PO Quantity">${item.POQty ? item.POQty : 0}</td>`);
        // 14 Confirm Quantity
        row.append(`<td title="Confirm Quantity">${item.QtyConfirm ? item.QtyConfirm : 0}</td>`);
        // 15 Real Quantity
        row.append(`<td title="Real Quantity">${item.RealQty ? item.RealQty : 0}</td>`);
        // 16 Unit
        row.append(`<td>${item.Unit ? item.Unit : ''}</td>`);
        // 17 Lead Time
        var hasNumber = /\d/.test(item.DeliveryTime);
        row.append(`<td>${hasNumber ? item.DeliveryTime : "NA"}</td>`);
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
                        <a href="javascript:;" class="text-warning bg-light-warning border-0" title="${i18next.t('device.management.edit')   }   " data-id="${item.Id}" onclick="Edit(this, event)   "><i class="fa-duotone fa-pen"></i></a>
                        <a href="javascript:;" class="text-danger  bg-light-danger  border-0" title="${i18next.t('device.management.delete') } " data-id="${item.Id}" onclick="Delete(this, event) "><i class="fa-duotone fa-trash"></i></a>
                    </td>`);
        // 21 isConsign (Hidden)
        row.append(`<td>${item.isConsign ? "consign" : "normal"} </td>`);

        $('#table_Devices_tbody').append(row);
    });

    const options = {
        scrollY: 500,
        scrollX: true,
        order: [],
        autoWidth: false,
        columnDefs: [
            { targets: "_all", orderable: false },
            { targets: [14], className: "text-primary fw-bold text-center" },
            { targets: [15], className: "text-info fw-bold text-center" },
            { targets: [11, 12, 13, 14, 15, 16, 17, 18, 19, 20], className: "text-center" },
            { targets: [20], className: "text-center", width: '120px' },
            
            { targets: [0, 2, 3, 4, 7, 8, 9,12,13, 21], visible: false },
        ],
        "lengthMenu": [[10, 15, 25, 50, -1], [10, 15, 25, 50, "All"]],
        dom: "<'row'<'w-auto'B><'col-sm-12 col-md'l><'col-sm-12 col-md'f>>" +
            "<'row'<'col-sm-12'tr>>" +
            "<'row'<'col-sm-12 col-md-7'i><'col-sm-12 col-md-5'p>>",
        buttons: [{
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
        }]

    };
    tableDeviceInfo = $('#table_Devices').DataTable(options);
    tableDeviceInfo.columns.adjust();
};
$(".toggle-icon").click(function () {
    setTimeout(() => {
        tableDeviceInfo.columns.adjust();
    }, 310);

});

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

// export excel
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

// get data device
var ListDevices;
function GetWarehouseDevices(IdWarehouse = 0) {
    Pace.track(function () {
        $.ajax({
            url: "/NVIDIA/DeviceManagement/GetWarehouseDevices",
            data: JSON.stringify({ IdWarehouse, PageNum: 1 }),
            type: "POST",
            dataType: "json",
            contentType: "application/json;charset=utf-8",
            success: async function (response) {
                if (response.status) {
                    var devices = response.warehouse.Devices;
                    //if (devices.length == 1000) {
                    //    var PageNum = 1;

                    //    var devicesMore = {};
                    //    while (devicesMore.length != 0) {
                    //        PageNum++;
                    //        devicesMore = await _GetWarehouseDevices(IdWarehouse, PageNum);
                    //        devices.push(...devicesMore);
                    //    }
                    //}
                    //ListDevices = devices;
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
function _GetWarehouseDevices(IdWarehouse, PageNum) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: "/NVIDIA/DeviceManagement/GetWarehouseDevices",
            data: JSON.stringify({ IdWarehouse, PageNum }),
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
$('#input_WareHouse').on('change', function (e) {
    e.preventDefault();
    GetWarehouseDevices($(this).val());
});

// Show Details
function Details(elm, e) {
    e.preventDefault();
    var Id = $(elm).data('id');
    GetDeviceDetails(Id);
}
$('#table_Devices tbody').on('dblclick', 'tr', function (event) {

    var dataId = $(this).data('id');

    GetDeviceDetails(dataId)
});

// borrow details
function BorrowDetails(Id) {
    RequestDetails(Id, false);
}

// Get Select data
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
                $('#device_edit-Product-List').empty();
                $('#filter_Product').html($('<option value="Product" selected>Product (All)</option>'));
                $.each(response.products, function (k, item) {
                    let opt = $(`<option value="${item.ProductName} | ${item.MTS != null ? item.MTS : ''}"></option>`);
                    $('#device_edit-Product-List').append(opt);

                    let opt1 = $(`<option value="${item.ProductName}">${item.ProductName}</option>`);
                    $('#filter_Product').append(opt1);
                });
                // Model
                $('#device_edit-Model-List').empty();
                $('#filter_Model').html($('<option value="Model" selected>Model (All)</option>'));
                $.each(response.models, function (k, item) {
                    let opt = $(`<option value="${item.ModelName}"></option>`);
                    $('#device_edit-Model-List').append(opt);

                    let opt1 = $(`<option value="${item.ModelName}">${item.ModelName}</option>`);
                    $('#filter_Model').append(opt1);
                });
                // Station
                $('#device_edit-Station-List').empty();
                $('#filter_Station').html($('<option value="Station" selected>Station (All)</option>'));
                $.each(response.stations, function (k, item) {
                    let opt = $(`<option value="${item.StationName}"></option>`);
                    $('#device_edit-Station-List').append(opt);

                    let opt1 = $(`<option value="${item.StationName}">${item.StationName}</option>`);
                    $('#filter_Station').append(opt1);
                });
                // Group
                $('#device_edit-Group-List').empty();
                $('#filter_Group').html($('<option value="Group" selected>Group (All)</option>'));
                $.each(response.groups, function (k, item) {
                    let opt = $(`<option value="${item.GroupName}"></option>`);
                    $('#device_edit-Group-List').append(opt);

                    let opt1 = $(`<option value="${item.GroupName}">${item.GroupName}</option>`);
                    $('#filter_Group').append(opt1);
                });
                // Vendor
                $('#device_edit-Vendor-List').empty();
                $('#filter_Vendor').html($('<option value="Vendor" selected>Vendor (All)</option>'));
                $.each(response.vendors, function (k, item) {
                    let opt = $(`<option value="${item.VendorName}"></option>`);
                    $('#device_edit-Vendor-List').append(opt);

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


// confirm function
function Confirm(elm, e) {
    e.preventDefault();

    var Id = $(elm).data('id');
    var Index = tableDeviceInfo.row(`[data-id="${Id}"]`).index();

    $.ajax({
        type: "POST",
        url: "/NVIDIA/DeviceManagement/GetDevice",
        data: JSON.stringify({ Id: Id }),
        dataType: "json",
        contentType: "application/json;charset=utf-8",
        success: function (response) {
            if (response.status) {
                var device = response.device;
                // message box
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
            else {
                toastr["error"](response.message, "ERROR");
            }
        },
        error: function (error) {
            Swal.fire(i18next.t('global.swal_title'), GetAjaxErrorMessage(error), "error");
        }
    });
}

// Delete function
function Delete(elm, e) {
    e.preventDefault();

    var Id = $(elm).data('id');
    var Index = tableDeviceInfo.row(`[data-id="${Id}"]`).index();

    $.ajax({
        type: "POST",
        url: "/NVIDIA/DeviceManagement/GetDevice",
        data: JSON.stringify({ Id: Id }),
        dataType: "json",
        contentType: "application/json;charset=utf-8",
        success: function (response) {
            if (response.status) {
                var device = response.device;
                // message box
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
            else {
                toastr["error"](response.message, "ERROR");
            }
        },
        error: function (error) {
            Swal.fire(i18next.t('global.swal_title'), GetAjaxErrorMessage(error), "error");
        }
    });
}

// Edit function
function Edit(elm, e) {
    e.preventDefault();

    DeviceUpdate(elm, e);
}

// Add more layout dynamic
$('#new-layout').on('click', async function (e) {
    e.preventDefault();

    var layoutlength = $('#layout-container [group-layout]').length;

    if (layoutlength > 10) {
        return false;
    }

    var selectLayout = $(`<select class="form-select"></select>`);
    var deleteButton = $(`<span class="input-group-text bg-light-danger text-danger" style="width:40px" delete><i class="fa-solid fa-trash"></i></span>`);
    deleteButton.on('click', function (e) {
        var element = $(this).closest('[group-layout]');
        element.remove();
    });

    selectLayout.append(await LayoutOption());

    var inputGroup = $(`<div class="input-group mb-3" group-layout>
                            <span class="col-2 input-group-text">${i18next.t('device.management.layout')} ${layoutlength + 1} </span>
                        </div>`);
    inputGroup.append(selectLayout);
    inputGroup.append(deleteButton)

    $('#layout-container').append(inputGroup);
});
var WarehouseLayouts;
$('#device_edit-WareHouse').on('change', function (e) {
    e.preventDefault();
    GetWarehouseLayouts($(this).val());
})
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
async function LayoutOption() {
    var html = '';
    await $.each(WarehouseLayouts, function (k, item) {
        var option = `<option value="${item.Id}">${item.Line}${item.Floor ? ' - ' + item.Floor : ''}${item.Cell ? ' - ' + item.Cell : ''}</option>`;
        html += option;
    });
    return html;
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
        tableDeviceInfo.column(2).search("^" + filter_Product + "$", true, false);
    }
    if (filter_Model !== "Model" && filter_Model !== null && filter_Model !== undefined) {
        tableDeviceInfo.column(3).search("^" + filter_Model + "$", true, false);
    }
    if (filter_Station !== "Station" && filter_Station !== null && filter_Station !== undefined) {
        tableDeviceInfo.column(4).search("^" + filter_Station + "$", true, false);
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
$('#filter-refresh').click(function (e) {
    e.preventDefault();

    $('#filter_Product').val("Product").trigger('change');
    $('#filter_Model').val("Model").trigger('change');
    $('#filter_Station').val("Station").trigger('change');
    $('#filter_Group').val("Group").trigger('change');
    $('#filter_Vendor').val("Vendor").trigger('change');
    $('#filter_Type').val("Type").trigger('change');
    $('#filter_Status').val("Status").trigger('change');

    $('#filter').click();
});

// Dropdown filter event
var isDropdownShow = false;
$('#filter_dropdown_btn').click(function () {
    if (!isDropdownShow) {
        isDropdownShow = true;
    }
    else {
        isDropdownShow = false;
    }
    $(this).dropdown('toggle');


    $('.select2-results__options strong').each(function (k, item) {
    });
});
$("body").on('click', '.select2-results__group', function () {
    $(this).siblings().toggle();
});
$('#filter_Type').on('select2:open', function () {
    setTimeout(() => {
        $('.select2-results__options strong').each(function (k, strong) {
            var elm = $(strong);
            elm.removeClass('text-primary text-info');

            if (elm.text() == "Normal") {
                elm.addClass('text-primary');
            }
            else if(elm.text() == "Consign") {
                elm.addClass('text-info');
            }
        });


    }, 100);
    
    //$('.select2-results__options strong').each(function (k, item) {
    //    console.log(item);
    //});
})

$(document).ready(function () {
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
});