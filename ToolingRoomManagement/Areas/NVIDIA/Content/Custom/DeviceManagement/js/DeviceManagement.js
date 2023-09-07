$(function () {
    GetSelectData();

    GetWarehouseDevices();
});


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
                    var devices = response.warehouse.Devices;

                    console.log(devices);

                    CreateTableAddDevice(devices);
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

var tableDeviceInfo;
async function CreateTableAddDevice(devices) {
    if (tableDeviceInfo) tableDeviceInfo.destroy();

    $('#table_addDevice_tbody').html('');
    await $.each(devices, function (no, item) {
        var row = $(`<tr class="align-middle" data-id="${item.Id}"></tr>`);

        // MTS
        row.append(`<td>${item.Product.MTS}</td>`);
        // Product Name
        row.append(`<td title="${item.Product.ProductName}">${item.Product.ProductName}</td>`);
        // Model
        row.append(`<td>${item.Model.ModelName}</td>`);
        // Station
        row.append(`<td>${item.Station.StationName}</td>`);
        // DeviceCode - PN
        row.append(`<td data-id="${item.Id}" data-code="${item.DeviceCode}">${item.DeviceCode}</td>`);
        // DeviceName
        row.append(`<td title="${item.DeviceName}">${item.DeviceName}</td>`);
        // Group
        row.append(`<td>${item.Group.GroupName}</td>`);
        // Vendor
        row.append(`<td title="${item.Vendor.VendorName}">${item.Vendor.VendorName}</td>`);
        // Buffer
        row.append(`<td>${item.Buffer * 100}%</td>`);
        // Quantity
        row.append(`<td>${item.Quantity}</td>`);
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
            { targets: [0], width: '50px' },
            { targets: [0, 4, 9, 10, 11], orderable: true },
            { targets: "_all", orderable: false },
            { targets: [8, 9, 10, 11], className: "text-center" },
            { targets: [12], className: "text-end" },
        ],
    };
    tableDeviceInfo = $('#table_addDevice').DataTable(options);
    tableDeviceInfo.columns.adjust();
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
function GetAjaxErrorMessage(error) {

    var regex = new RegExp(`<title>(.*?)<\/title>`);
    var match = regex.exec(error.responseText);

    if (match && match.length >= 2) {
        var extractedContent = match[1];
        return extractedContent;
    } else {
        return "Lỗi không xác định.";
    }
}