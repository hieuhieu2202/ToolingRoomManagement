$(function () {
    GetSelectData();
    //SendFileToServer();

    //$('#device_edit-modal').modal('show');
});

// Send BOM file function
$('#fileInput').on('change', function (e) {
    e.preventDefault();

    let count = 0;
    progressMove(count);
    SendFileToServer();

    $('#bom-info').fadeOut(300);
    $('#card-device-details').fadeOut(300);
});
function SendFileToServer() {
    const fileInput = document.querySelector('#fileInput');
    const file = fileInput.files[0];

    const formData = new FormData();
    formData.append('file', file);

    //formData.append('IdWareHouse', 1);

    Pace.on('progress', function (progress) {
        var cal = progress.toFixed(2);
        $('#process_count').text(`${cal}%`);
        $('#process_bar').css('width', `${cal}%`);
    });
    Pace.track(function () {
        $.ajax({
            url: "/NVIDIA/DeviceManagement/AddDeviceAuto",
            data: formData,
            type: "POST",
            processData: false,
            contentType: false,
            success: function (response) {
                if (response.status) {
                    var data = response.data;

                    console.log(data);

                    //CreateTableAddDevice(devices);
                    //CreateBomFileInfo(response);
                    //GetSelectData();
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

// Affter send BOM file function
var tableDeviceInfo;
async function CreateTableAddDevice(devices) {
    if (tableDeviceInfo) tableDeviceInfo.destroy();

    $('#table_addDevice_tbody').html('');
    await $.each(devices, function (no, item) {
        var row = $(`<tr class="align-middle" data-id="${item.Id}"></tr>`);

        // MTS
        row.append(`<td>${(item.Product) ? item.Product.MTS : ""}</td>`);
        // Product Name
        row.append(`<td title="${(item.Product) ? item.Product.ProductName : ""}">${(item.Product) ? item.Product.ProductName : ""}</td>`);
        // Model
        row.append(`<td>${(item.Model) ? item.Model.ModelName : ""}</td>`);
        // Station
        row.append(`<td>${(item.Station) ? item.Station.StationName : ""}</td>`);
        // DeviceCode - PN
        row.append(`<td data-id="${item.Id}" data-code="${item.DeviceCode}">${item.DeviceCode}</td>`);
        // DeviceName
        row.append(`<td title="${item.DeviceName}">${item.DeviceName}</td>`);
        // Group
        row.append(`<td>${(item.Group) ? item.Group.GroupName : ""}</td>`);
        // Vendor
        row.append(`<td title="${(item.Vendor) ? item.Vendor.VendorName : ""}">${(item.Vendor) ? item.Vendor.VendorName : ""}</td>`);
        // Buffer
        row.append(`<td title="${item.Buffer}">${item.Buffer * 100}%</td>`);
        // Quantity
        row.append(`<td title="(Quantity) / (Quantity Confirm) / (Real Quantity)">${item.Quantity} / ${(item.QtyConfirm != null) ? item.QtyConfirm : 0} / ${(item.RealQty != null) ? item.RealQty : 0}</td>`);
        // Type
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
        // Status
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
        // Action
        row.append(`<td><div class="dropdown">
					    	<button class="btn btn-outline-secondary button_dot" type="button" data-bs-toggle="dropdown" title="Action">
                                <i class="bx bx-dots-vertical-rounded"></i>
                            </button>
                            <div class="dropdown-menu order-actions">
                                <a href="javascript:;" class="text-success bg-light-success border-0 mb-2" title="Confirm" data-id="${item.Id}" onclick="Confirm(this, event)"><i class="bx bx-check"></i></a>
                                <a href="javascript:;" class="text-warning bg-light-warning border-0 mb-2" title="Edit   " data-id="${item.Id}" onclick="Edit(this, event)   "><i class="bx bxs-edit"></i></a>
                                <a href="javascript:;" class="text-danger  bg-light-danger  border-0     " title="Delete " data-id="${item.Id}" onclick="Delete(this, event) "><i class="bx bxs-trash"></i></a>
						    </div>
					</div></td>`);

        $('#table_addDevice_tbody').append(row);
    });

    $('#card-device-details').fadeIn(300);

    const options = {
        scrollY: 500,
        scrollX: true,
        order: [],
        autoWidth: false,
        columnDefs: [
            { targets: [0], visible: false },
            { targets: [0, 4, 9, 10, 11], orderable: true },
            { targets: "_all", orderable: false },
            { targets: [ 8, 9, 10, 11], className: "text-center" },
            { targets: [12], className: "text-end" },
        ],
    };
    tableDeviceInfo = $('#table_addDevice').DataTable(options);
    tableDeviceInfo.columns.adjust();
}
async function CreateBomFileInfo(data) {
    const products = data.products.length;
    const models = data.models.length;
    const groups = data.groups.length;
    const stations = data.stations.length;
    const vendors = data.vendors.length;
    const devices = data.devices.length;

    let quantity = 0;
    await $.each(data.devices, function (k, item) {
        quantity += item.Quantity;
    });

    $('#info_products').val(products);
    $('#info_models').val(models);
    $('#info_groups').val(groups);
    $('#info_stations').val(stations);
    $('#info_vendors').val(vendors);
    $('#info_devices').val(devices);
    $('#info_quantity').val(quantity);

    $('#bom-info').fadeIn(300);
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
                                       <td>Confirm Qty</td>
                                       <td>${device.QtyConfirm}</td>
                                   </tr>
                                   <tr>
                                       <td>Buffer</td>
                                       <td>${device.Buffer}</td>
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
}
$('#button-save_modal').on('click', function (e) {
    e.preventDefault();

    var device = GetModalData();
    var Index = tableDeviceInfo.row(`[data-id="${device.Id}"]`).index();

    $.ajax({
        type: "POST",
        url: "/NVIDIA/DeviceManagement/UpdateDevice",
        data: JSON.stringify(device),
        dataType: "json",
        contentType: "application/json;charset=utf-8",
        success: function (response) {
            if (response.status) {
                var row = DrawRowEditDevice(response.device);

                tableDeviceInfo.row(Index).data(row).draw(false);

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
                var warehouseSelected = $('#input_WareHouse').val();
                $('#input_WareHouse').empty();
                $('#device_edit-WareHouse').empty();
                $.each(response.warehouses, function (k, item) {
                    var opt1 = $(`<option value="${item.Id}">${item.WarehouseName}</option>`);

                    var opt2 = "";
                    if (warehouseSelected == item.Id) {
                        opt2 = $(`<option value="${item.Id}" selected="true">${item.WarehouseName}</option>`);
                    }
                    else {
                        opt2 = $(`<option value="${item.Id}">${item.WarehouseName}</option>`);
                    }
                    $('#device_edit-WareHouse').append(opt1);
                    $('#input_WareHouse').append(opt2);
                });
                // Product
                $('#device_edit-Product').empty();
                $.each(response.products, function (k, item) {
                    let opt = $(`<option value="${item.Id}">${item.ProductName} | ${item.MTS}</option>`);
                    $('#device_edit-Product').append(opt);
                });
                // Model
                $('#device_edit-Model').empty();
                $.each(response.models, function (k, item) {
                    let opt = $(`<option value="${item.Id}">${item.ModelName}</option>`);
                    $('#device_edit-Model').append(opt);
                });
                // Station
                $('#device_edit-Station').empty();
                $.each(response.stations, function (k, item) {
                    let opt = $(`<option value="${item.Id}">${item.StationName}</option>`);
                    $('#device_edit-Station').append(opt);
                });
                // Group
                $('#device_edit-Group').empty();
                $.each(response.groups, function (k, item) {
                    let opt = $(`<option value="${item.Id}">${item.GroupName}</option>`);
                    $('#device_edit-Group').append(opt);
                });
                // Vendor
                $('#device_edit-Vendor').empty();
                $.each(response.vendors, function (k, item) {
                    let opt = $(`<option value="${item.Id}">${item.VendorName}</option>`);
                    $('#device_edit-Vendor').append(opt);
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
        row.push(`<td><div class="dropdown">
					            	<button class="btn btn-outline-secondary button_dot" type="button" data-bs-toggle="dropdown" title="Action">
                                        <i class="bx bx-dots-vertical-rounded"></i>
                                    </button>
                                    <div class="dropdown-menu order-actions">
                                        <a href="javascript:;" class="text-success bg-light-success border-0 mb-2" title="Confirm" data-id="${item.Id}" onclick="Confirm(this, event)"><i class="bx bx-check"></i></a>
                                        <a href="javascript:;" class="text-warning bg-light-warning border-0 mb-2" title="Edit   " data-id="${item.Id}" onclick="Edit(this, event)   "><i class="bx bxs-edit"></i></a>
                                        <a href="javascript:;" class="text-danger  bg-light-danger  border-0     " title="Delete " data-id="${item.Id}" onclick="Delete(this, event) "><i class="bx bxs-trash"></i></a>
					         	    </div>
					         </div></td>`);
    }

    return row;
}