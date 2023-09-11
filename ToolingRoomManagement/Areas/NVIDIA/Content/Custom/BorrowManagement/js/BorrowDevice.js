$(function () {
    GetSelectData();

    GetWarehouseDevices();

    $('#borrow_form-modal').modal('show');
});

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
                $('#filter_Product').html($('<option value="Product" selected>Product</option>'));
                $.each(response.products, function (k, item) {
                    let opt = $(`<option value="${item.Id}">${item.ProductName} | ${item.MTS}</option>`);
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

// Device table
var tableDeviceInfo;
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
async function CreateTableAddDevice(devices) {
    if (tableDeviceInfo) tableDeviceInfo.destroy();

    $('#table_Devices_tbody').html('');
    await $.each(devices, function (no, item) {
        var row = $(`<tr class="align-middle" data-id="${item.Id}"></tr>`);

        // Id Device
        row.append(`<td>${item.Id}</td>`);
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
        row.append(`<td><button class="btn btn-outline-success button_dot" type="button" title="Select Device">
                                <i class="bx bx-check"></i>
                            </button></td>`);

        $('#table_Devices_tbody').append(row);
    });


    var height = window.innerHeight / 2 + (window.innerHeight * 0.05);

    $('#form_device-select').empty();

    const options = {
        scrollY: height,
        scrollX: true,
        paging: false,
        scrollCollapse: true,
        order: [],
        autoWidth: false,
        columnDefs: [
            { targets: "_all", orderable: false },
            { targets: [9, 10, 11, 12], className: "text-center" },
            { targets: [0,1,2,3,6,7,8], visible: false },
        ],
        createdRow: function (row, data, dataIndex) {
            var check = $('td', row).eq(5).find('button[type="button"]');

            check.on('click', function () {
                if ($('#form_device-select .input-group').length < 10) {
                    let inputGroup = $('<div class="input-group input-group-sm mb-3"></div>');
                    let formControl = $(`<div class="form-control" data-id="${data[0]}" data-index="${dataIndex}"></div>`);
                    let deviceName = $(`<p class="m-0 overflow-hidden text-nowrap text-truncate" title="${data[4]}">${data[5]}</p>`);
                    let deleteBtn = $(`<button class="btn btn-sm btn-outline-danger" type="button" id="button-addon2"><i class="bx bx-trash m-0"></i></button>`);

                    deleteBtn.on('click', function (e) {
                        inputGroup.remove();
                    });
                    formControl.append(deviceName);

                    inputGroup.append(formControl);
                    inputGroup.append(deleteBtn);

                    let bodyInputGroups = $('#form_device-select .input-group');
                    let check = false;
                    $.each(bodyInputGroups, function (k, v) {                        
                        if ($(v).html() === $(inputGroup[0]).html()) {
                            check = true;
                            return false;
                        }
                    });
                    if (!check) {
                        $('#form_device-select').append(inputGroup);
                    }
                    else {
                        toastr["error"]('This device has been selected.', "ERROR");
                    }                  
                }
                else {
                    Swal.fire('Sorry, something went wrong!', 'You have selected too many devices (limit is 10 devices).', 'error');
                }
            });
        },   
    };
    tableDeviceInfo = $('#table_Devices').DataTable(options);
    tableDeviceInfo.columns.adjust();
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
$('#input_WareHouse').on('change', function (e) {
    e.preventDefault();

    GetWarehouseDevices($(this).val());
});

// Create Borrow Form
$('#CreateBorrowForm').on('click', function (e) {
    e.preventDefault();

    var DeviceForm = $('#form_device-select .input-group')

    var IdDevices = DeviceForm.map(function () {
        return $(this).find('.form-control').data('id');
    }).get();
    var IndexDevices = DeviceForm.map(function () {
        return $(this).find('.form-control').data('index');
    }).get();

    if (IdDevices.length < 1) {
        toastr["error"]('Please select device before create Borrow form.', "ERROR");
        return;
    }

    $('#borrow_form-modal').modal('show');

    console.log(IdDevices, IndexDevices);
})

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