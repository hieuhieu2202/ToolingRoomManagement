﻿$(function () {
    GetSelectData();
});

// table
var tableDeviceInfo;
async function CreateTableAddDevice(devices) {
    if (tableDeviceInfo) tableDeviceInfo.destroy();

    $('#table_Devices_tbody').html('');
    await $.each(devices, async function (no, item) {
        var row = $(`<tr class="align-middle" data-id="${item.Id}" title="Double-click to view device details."></tr>`);

        // MTS 0
        row.append(`<td>${(item.Product) ? item.Product.MTS : ""}</td>`);
        // Product Name 1
        row.append(`<td title="${(item.Product) ? item.Product.ProductName : ""}">${(item.Product) ? item.Product.ProductName : ""}</td>`);
        // Model 2
        row.append(`<td>${(item.Model) ? item.Model.ModelName : ""}</td>`);
        // Station 3
        row.append(`<td>${(item.Station) ? item.Station.StationName : ""}</td>`);
        // DeviceCode - PN 4
        row.append(`<td data-id="${item.Id}" data-code="${item.DeviceCode}" title="${item.DeviceCode}">${item.DeviceCode}</td>`);
        // DeviceName 5
        row.append(`<td title="${item.DeviceName}">${item.DeviceName}</td>`);
        // Group 6
        row.append(`<td>${(item.Group) ? item.Group.GroupName : ""}</td>`);
        // Vendor 7
        row.append(`<td title="${(item.Vendor) ? item.Vendor.VendorName : ""}">${(item.Vendor) ? item.Vendor.VendorName : ""}</td>`);
        // Location 8
        var html = ''
        var title = ''
        $.each(item.DeviceWarehouseLayouts, function (k, sss) {
            var layout = sss.WarehouseLayout;
            if (k == 0) {
                if (item.DeviceWarehouseLayouts > 0) {
                    html += `<lable>${layout.Line}${layout.Floor ? ' - ' + layout.Floor : ''}${layout.Cell ? ' - ' + layout.Cell : ''}lable>`;
                }
                else {
                    html += `<lable>${layout.Line}${layout.Floor ? ' - ' + layout.Floor : ''}${layout.Cell ? ' - ' + layout.Cell : ''} ...</lable>`;
                }                
            }
            else {
                html += `<lable class="d-none">${layout.Line}${layout.Floor ? ' - ' + layout.Floor : ''}${layout.Cell ? ' - ' + layout.Cell : ''}</lable>`;
            }
            title += `[${layout.Line}${layout.Floor ? ' - ' + layout.Floor : ''}${layout.Cell ? ' - ' + layout.Cell : ''}], `;
        });
        row.append(`<td title="${title}">${html}</td>`);
        // Buffer 9
        row.append(`<td title="${item.Buffer}">${item.Buffer * 100}%</td>`);
        // Quantity 10 
        row.append(`<td title="(Quantity) / (Quantity Confirm) / (Real Quantity)">${item.Quantity} / ${(item.QtyConfirm != null) ? item.QtyConfirm : 0} / ${(item.RealQty != null) ? item.RealQty : 0}</td>`);
        // Type 11
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
        // Status 12
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
        // Action 13
        row.append(`<td class="order-action d-flex text-center justify-content-center">
                        <a href="javascript:;" class="text-info bg-light-info border-0" title="Details" data-id="${item.Id}" onclick="Details(this, event)"><i class="fa-regular fa-circle-info"></i></a>
                        <a href="javascript:;" class="text-warning bg-light-warning border-0" title="Edit   " data-id="${item.Id}" onclick="Edit(this, event)   "><i class="fa-duotone fa-pen"></i></a>
                        <a href="javascript:;" class="text-danger  bg-light-danger  border-0" title="Delete " data-id="${item.Id}" onclick="Delete(this, event) "><i class="fa-duotone fa-trash"></i></a>
                    </td>`);

        $('#table_Devices_tbody').append(row);
    });

    const options = {
        scrollY: 500,
        scrollX: true,
        order: [],
        autoWidth: false,
        columnDefs: [
            { targets: [0, 4, 10, 11, 12], orderable: true },
            { targets: "_all", orderable: false },
            { targets: [9, 10, 11, 12], className: "text-center" },
            { targets: [13], className: "text-center", width: '120px' },
            { targets: [0, 1, 2, 3], visible: false },
        ],
        "lengthMenu": [[10, 15, 25, 50, -1], [10, 15, 25, 50, "All"]],

    };
    tableDeviceInfo = $('#table_Devices').DataTable(options);
    tableDeviceInfo.columns.adjust();
}

// get data device
function GetWarehouseDevices(IdWarehouse = 0) {
    Pace.track(function () {
        $.ajax({
            url: "/NVIDIA/DeviceManagement/GetWarehouseDevices",
            data: JSON.stringify({ IdWarehouse: IdWarehouse }),
            type: "POST",
            dataType: "json",
            contentType: "application/json;charset=utf-8",
            success: function (response) {
                if (response.status) {
                    var devices = response.warehouse.Devices.reverse();

                    CreateTableAddDevice(devices);
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
    $('#device_details-DeviceDate').val(moment(data.DeviceDate).format('YYYY-MM-DD HH:mm'));
    $('#device_details-Relation').val(data.Relation);
    $('#device_details-Buffer').val(data.Buffer);
    $('#device_details-LifeCycle').val(data.LifeCycle);
    $('#device_details-Forcast').val(data.Forcast);
    $('#device_details-Quantity').val(data.Quantity);
    $('#device_details-QtyConfirm').val(data.QtyConfirm);
    $('#device_details-RealQty').val(data.RealQty);
    $('#device_details-AccKit').val(data.ACC_KIT);
    $('#device_details-Type').val(data.Type == 'S' ? 'Static' : data.Type == 'D' ? 'Dynamic' : 'N/A');
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
                $('#device_edit-Product').empty();
                $('#filter_Product').html($('<option value="Product" selected>Product</option>'));
                $.each(response.products, function (k, item) {
                    let opt = $(`<option value="${item.Id}">${item.ProductName} | ${item.MTS != null ? item.MTS : ''}</option>`);
                    $('#device_edit-Product').append(opt);

                    let opt1 = $(`<option value="${item.ProductName}">${item.ProductName}</option>`);
                    $('#filter_Product').append(opt1);
                });
                // Model
                $('#device_edit-Model').empty();
                $('#filter_Model').html($('<option value="Model" selected>Model</option>'));
                $.each(response.models, function (k, item) {
                    let opt = $(`<option value="${item.Id}">${item.ModelName}</option>`);
                    $('#device_edit-Model').append(opt);

                    let opt1 = $(`<option value="${item.ModelName}">${item.ModelName}</option>`);
                    $('#filter_Model').append(opt1);
                });
                // Station
                $('#device_edit-Station').empty();
                $('#filter_Station').html($('<option value="Station" selected>Station</option>'));
                $.each(response.stations, function (k, item) {
                    let opt = $(`<option value="${item.Id}">${item.StationName}</option>`);
                    $('#device_edit-Station').append(opt);

                    let opt1 = $(`<option value="${item.StationName}">${item.StationName}</option>`);
                    $('#filter_Station').append(opt1);
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

// Other function
function DrawRowEditDevice(item) {
    var row = [];
    {
        // MTS
        row.push(`<td>${(item.Product) ? item.Product.MTS : ""}</td>`);
        // Product Name
        row.push(`<td title="${(item.Product) ? item.Product.ProductName : ""}">${(item.Product) ? item.Product.ProductName : ""}</td>`);
        // Model
        row.push(`<td>${(item.Model) ? item.Model.ModelName : ""}</td>`);
        // Station
        row.push(`<td>${(item.Station) ? item.Station.StationName : ""}</td>`);
        // DeviceCode - PN
        row.push(`<td data-id="${item.Id}" data-code="${item.DeviceCode}">${item.DeviceCode}</td>`);
        // DeviceName
        row.push(`<td title="${item.DeviceName}">${item.DeviceName}</td>`);
        // Group
        row.push(`<td>${(item.Group) ? item.Group.GroupName : ""}</td>`);
        // Vendor
        row.push(`<td>${(item.Vendor) ? item.Vendor.VendorName : ""}</td>`);

        // Location 8
        var html = ''
        var title = ''
        $.each(item.DeviceWarehouseLayouts, function (k, sss) {
            var layout = sss.WarehouseLayout;
            if (k == 0) {
                if (item.DeviceWarehouseLayouts > 0) {
                    html += `<lable>${layout.Line}${layout.Floor ? ' - ' + layout.Floor : ''}${layout.Cell ? ' - ' + layout.Cell : ''}lable>`;
                }
                else {
                    html += `<lable>${layout.Line}${layout.Floor ? ' - ' + layout.Floor : ''}${layout.Cell ? ' - ' + layout.Cell : ''} ...</lable>`;
                }
            }
            else {
                html += `<lable class="d-none">${layout.Line}${layout.Floor ? ' - ' + layout.Floor : ''}${layout.Cell ? ' - ' + layout.Cell : ''}</lable>`;
            }
            title += `[${layout.Line}${layout.Floor ? ' - ' + layout.Floor : ''}${layout.Cell ? ' - ' + layout.Cell : ''}], `;
        });
        row.push(`<td title="${title}">${html}</td>`);

        // Buffer
        row.push(`<td title="${item.Buffer}">${item.Buffer * 100}%</td>`);
        // Quantity
        row.push(`<td title="(Quantity) / (Quantity Confirm) / (Real Quantity)">${item.Quantity} / ${(item.QtyConfirm != null) ? item.QtyConfirm : 0} / ${(item.RealQty != null) ? item.RealQty : 0}</td>`);
        // Type
        switch (item.Type) {
            case "S": {
                row.push(`<td><span class="text-success fw-bold">Static</span></td>`);
                break;
            }
            case "D": {
                row.push(`<td><span class="text-info fw-bold">Dynamic</span></td>`);
                break;
            }
            default: {
                row.push(`<td><span class="text-secondary fw-bold">N/A</span></td>`);
                break;
            }
        }
        // Status
        switch (item.Status) {
            case "Unconfirmed": {
                row.push(`<td><span class="badge bg-primary">Unconfirmed</span></td>`);
                break;
            }
            case "Part Confirmed": {
                row.push(`<td><span class="badge bg-warning">Part Confirmed</span></td>`);
                break;
            }
            case "Confirmed": {
                row.push(`<td><span class="badge bg-success">Confirmed</span></td>`);
                break;
            }
            case "Locked": {
                row.push(`<td><span class="badge bg-secondary">Locked</span></td>`);
                break;
            }
            case "Out Range": {
                row.push(`<td><span class="badge bg-danger">Out Range</span></td>`);
                break;
            }
            default: {
                row.push(`<td>N/A</td>`);
                break;
            }
        }
        // Action
        row.push(`<td class="order-action d-flex text-center justify-content-center">
                        <a href="javascript:;" class="text-info bg-light-info border-0" title="Details" data-id="${item.Id}" onclick="Details(this, event)"><i class="fa-regular fa-circle-info"></i></a>
                        <a href="javascript:;" class="text-warning bg-light-warning border-0" title="Edit   " data-id="${item.Id}" onclick="Edit(this, event)   "><i class="fa-duotone fa-pen"></i></a>
                        <a href="javascript:;" class="text-danger  bg-light-danger  border-0" title="Delete " data-id="${item.Id}" onclick="Delete(this, event) "><i class="fa-duotone fa-trash"></i></a>
                    </td>`);
    }

    return row;
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
                    title: `<strong style="font-size: 25px;">Do you want Confirm this device?</strong>`,
                    html: `<table class="table table-striped table-bordered table-message">
                               <tbody>
                                   <tr>
                                       <td>Device Name</td>
                                       <td>${device.DeviceName}</td>
                                   </tr>
                                   <tr>
                                       <td>Quantity</td>
                                       <td>${device.Quantity}</td>
                                   </tr>
                                   <tr>
                                       <td>Buffer</td>
                                       <td>${device.Buffer}</td>
                                   </tr>
                               </tbody>
                           </table>
                           <div class="input-group mb-3">
                                <span class="input-group-text" style="min-width: 180px;">Quantity Confirm</span>
                                <input class="form-control" type="number" id="device_confirm-QtyConfirm" placeholder="${device.QtyConfirm} + input">
                           </div>
                           `,
                    icon: 'question',
                    iconColor: '#ffc107',
                    reverseButtons: false,
                    confirmButtonText: 'Confirm',
                    showCancelButton: true,
                    cancelButtonText: 'Cancel',
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
                                Swal.fire("Something went wrong!", GetAjaxErrorMessage(error), "error");
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
            Swal.fire("Something went wrong!", GetAjaxErrorMessage(error), "error");
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
                    title: `<strong style="font-size: 25px;">Do you want Delete this device?</strong>`,
                    html: `<table class="table table-striped table-bordered table-message">
                               <tbody>
                                    <tr>
                                       <td>Device Code</td>
                                       <td>${device.DeviceCode}</td>
                                   </tr>
                                   <tr>
                                       <td>Device Name</td>
                                       <td>${device.DeviceName}</td>
                                   </tr>
                                   <tr>
                                       <td>Quantity</td>
                                       <td>${device.Quantity}</td>
                                   </tr>
                               </tbody>
                           </table>
                           `,
                    icon: 'question',
                    iconColor: '#dc3545',
                    reverseButtons: false,
                    confirmButtonText: 'Delete',
                    showCancelButton: true,
                    cancelButtonText: 'Cancel',
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
                                Swal.fire("Something went wrong!", GetAjaxErrorMessage(error), "error");
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
            Swal.fire("Something went wrong!", GetAjaxErrorMessage(error), "error");
        }
    });
}

// Edit function
function Edit(elm, e) {
    e.preventDefault();

    var Id = $(elm).data('id');

    $.ajax({
        type: "POST",
        url: "/NVIDIA/DeviceManagement/GetDevice",
        data: JSON.stringify({ Id: Id }),
        dataType: "json",
        contentType: "application/json;charset=utf-8",
        success: function (response) {
            if (response.status) {
                FillEditDeviceData(response);
                $('#device_edit-modal').modal('show');
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
async function FillEditDeviceData(data) {
    $('#device_edit-DeviceId').val(data.device.Id);
    $('#device_edit-DeviceCode').val(data.device.DeviceCode);
    $('#device_edit-DeviceName').val(data.device.DeviceName);
    $('#device_edit-DeviceDate').val(moment(data.device.DeviceDate).format('YYYY-MM-DD HH:mm'));
    $('#device_edit-Relation').val(data.device.Relation);
    $('#device_edit-Buffer').val(data.device.Buffer);
    $('#device_edit-LifeCycle').val(data.device.LifeCycle);
    $('#device_edit-Forcast').val(data.device.Forcast);
    $('#device_edit-Quantity').val(data.device.Quantity);
    $('#device_edit-QtyConfirm').val(data.device.QtyConfirm);
    $('#device_edit-RealQty').val(data.device.RealQty);

    $('#device_edit-AccKit').val(data.device.ACC_KIT).trigger('change');
    $('#device_edit-Type').val(data.device.Type).trigger('change');
    $('#device_edit-Status').val(data.device.Status).trigger('change');
    $('#device_edit-Product').val(data.device.IdProduct).trigger('change');
    $('#device_edit-Model').val(data.device.IdModel).trigger('change');
    $('#device_edit-Station').val(data.device.IdStation).trigger('change');
    $('#device_edit-WareHouse').val(data.device.IdWareHouse).trigger('change');
    $('#device_edit-Group').val(data.device.IdGroup).trigger('change');
    $('#device_edit-Vendor').val(data.device.IdVendor).trigger('change');

    $('#layout-container').empty();
    var DeviceLayouts = data.device.DeviceWarehouseLayouts;
    $.each(DeviceLayouts, function (k, item) {
        var layout = item.WarehouseLayout;

        var selectLayout = $(`<select class="form-select">
                                  <option value="${layout.Id}">${layout.Line}${layout.Floor ? ' - ' + layout.Floor : ''}${layout.Cell ? ' - ' + layout.Cell : ''}</option>
                              </select>`);
        var deleteButton = $(`<span class="input-group-text bg-light-danger text-danger" style="width:40px" delete><i class="fa-solid fa-trash"></i></span>`);

        deleteButton.on('click', function (e) {
            var element = $(this).closest('[group-layout]');
            element.remove();
        });

        var inputGroup = $(`<div class="input-group mb-3" group-layout>
                            <span class="col-2 input-group-text">Layout ${k + 1} </span>
                        </div>`);
        inputGroup.append(selectLayout);
        inputGroup.append(deleteButton)   

        $('#layout-container').append(inputGroup);
    });
}
$('#button-save_modal').on('click', function (e) {
    e.preventDefault();

    var device = GetModalData();
    var Index = tableDeviceInfo.row(`[data-id="${device.Id}"]`).index();

    var IdLayouts = $('#layout-container option:selected').map(function () {
        return $(this).val();
    }).get();

    $.ajax({
        type: "POST",
        url: "/NVIDIA/DeviceManagement/UpdateDevice",
        data: JSON.stringify({ device: device, IdLayouts: IdLayouts }),
        dataType: "json",
        contentType: "application/json;charset=utf-8",
        success: function (response) {
            if (response.status) {              
                var row = DrawRowEditDevice(response.device);
                tableDeviceInfo.row(Index).data(row).draw();

                $('#device_edit-modal').modal('hide');

                toastr["success"]("Edit device success.", "SUCCRESS");
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
function GetModalData() {
    return data = {
        Id: $('#device_edit-DeviceId').val(),
        DeviceCode: $('#device_edit-DeviceCode').val(),
        DeviceName: $('#device_edit-DeviceName').val(),
        DeviceDate: $('#device_edit-DeviceDate').val(),
        Relation: $('#device_edit-Relation').val(),
        Buffer: $('#device_edit-Buffer').val(),
        LifeCycle: $('#device_edit-LifeCycle').val(),
        Forcast: $('#device_edit-Forcast').val(),
        Quantity: $('#device_edit-Quantity').val(),
        QtyConfirm: $('#device_edit-QtyConfirm').val(),
        RealQty: $('#device_edit-RealQty').val(),

        ACC_KIT: $('#device_edit-AccKit').val(),
        Type: $('#device_edit-Type').val(),
        Status: $('#device_edit-Status').val(),
        IdWareHouse: $('#device_edit-WareHouse').val(),
        IdProduct: $('#device_edit-Product').val(),
        IdModel: $('#device_edit-Model').val(),
        IdStation: $('#device_edit-Station').val(),
        IdGroup: $('#device_edit-Group').val(),
        IdVendor: $('#device_edit-Vendor').val(),
    }
}

// Add more layout dynamic
$('#new-layout').on('click', async function (e) {
    e.preventDefault();

    var layoutlength = $('#layout-container [group-layout]').length;

    if (layoutlength > 4) {
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
                            <span class="col-2 input-group-text">Layout ${layoutlength + 1} </span>
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
                Swal.fire("Something went wrong!", response.message, "error");
            }
        },
        error: function (error) {
            Swal.fire("Something went wrong!", GetAjaxErrorMessage(error), "error");
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