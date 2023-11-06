$(function () {
    GetSelectData();
    GetDevicesBOM();
});

// Get Select data
function populateSelect(elementId, items, idPropertyName, namePropertyName) {
    const $element = $(`#${elementId}`);
    $element.empty();
    $.each(items, function (index, item) {
        if (item[idPropertyName] != '' && item[idPropertyName] != null) {
            let opt = $(`<option value="${item[idPropertyName]}">${item[namePropertyName] != null ? item[namePropertyName] : ""}</option>`);
            $element.append(opt);
        }
    });
}
function GetSelectData() {
    $.ajax({
        type: "GET",
        url: "/NVIDIA/DeviceManagement/GetSelectData",
        dataType: "json",
        contentType: "application/json;charset=utf-8",
        success: function (response) {
            if (response.status) {
                // WareHouse
                populateSelect("device_add-WareHouse", response.warehouses, "Id", "WarehouseName");

                // Product
                populateSelect("device_add-Product_List", response.products, "ProductName", "MTS");

                // Model
                populateSelect("device_add-Model_List", response.models, "ModelName", "");

                // Station
                populateSelect("device_add-Station_List", response.stations, "StationName", "");

                // Group
                populateSelect("device_add-Group_List", response.groups, "GroupName", "");

                // Vendor
                populateSelect("device_add-Vendor_List", response.vendors, "VendorName", "");

                $('#device_add-WareHouse').change();
            } else {
                toastr["error"](response.message, "ERROR");
            }
        },
        error: function (error) {
            Swal.fire(i18next.t('global.swal_title'), GetAjaxErrorMessage(error), "error");
        }
    });
}

// Sự kiện nhập từ BOM
var deviceBoms;
function GetDevicesBOM() {
    $.ajax({
        type: "GET",
        url: "/NVIDIA/DeviceManagement/GetDevicesBOM",
        dataType: "json",
        contentType: "application/json;charset=utf-8",
        success: function (response) {
            if (response.status) {
                console.log(response.data);

                deviceBoms = response.data;

                $('#device_add-ListDeviceCode').empty();
                $('#device_add-ListDeviceName').empty();
                $.each(response.data, function (k, device) {
                    $('#device_add-ListDeviceCode').append(`<option value="${device.DeviceCode}"></option>`);
                    $('#device_add-ListDeviceName').append(`<option value="${device.DeviceName}"></option>`);
                });

            } else {
                toastr["error"](response.message, "ERROR");
            }
        },
        error: function (error) {
            Swal.fire(i18next.t('global.swal_title'), GetAjaxErrorMessage(error), "error");
        }
    });
}

$('#device_add-DeviceCode').on('keyup', function (e) {
    if ($(this).val() === '') {
        GetSelectData();
    }
});
$('#device_add-DeviceCode').change(function (e) {
    var val = $(this).val();

    $.each(deviceBoms, function (index, item) {
        if (item.DeviceCode == val) {
            $('#device_add-DeviceName').val(item.DeviceName);
            $('#device_add-Group').val(item.Group);
            $('#device_add-Vendor').val(item.Vendor);
            $('#device_add-MinQty').val(item.MinQty);
            $('#device_add-Quantity').val(item.Quantity);
            $('#device_add-DeviceDate').val(moment().format('YYYY-MM-DDTHH:mm:ss'));

            $('#device_add-Product_List').empty();
            if (item.ProductDeviceBOMs.length == 1) {
                $('#device_add-Product').val(item.ProductDeviceBOMs[0].ProductBOM.ProductName);
            }
            else {
                $.each(item.ProductDeviceBOMs, function (i, product) {
                    $('#device_add-Product_List').append(`<option value="${product.ProductBOM.ProductName}"></option>`);
                });
            }
           
        }
    });
});
$('#device_add-DeviceName').change(function (e) {
    var val = $(this).val();

    $.each(deviceBoms, function (index, item) {
        if (item.DeviceName == val) {
            $('#device_add-DeviceCode').val(item.DeviceCode);
            $('#device_add-Group').val(item.Group);
            $('#device_add-Vendor').val(item.Vendor);
            $('#device_add-MinQty').val(item.MinQty);
            $('#device_add-Quantity').val(item.Quantity);
            $('#device_add-DeviceDate').val(moment().format('YYYY-MM-DDTHH:mm:ss'));

            $('#device_add-Product_List').empty();
            if (item.ProductDeviceBOMs.length == 1) {
                $('#device_add-Product').val(item.ProductDeviceBOMs[0].ProductBOM.ProductName);
            }
            else {
                $.each(item.ProductDeviceBOMs, function (i, product) {
                    $('#device_add-Product_List').append(`<option value="${product.ProductBOM.ProductName}"></option>`);
                });
            }
        }
    });
});

// Add Device Manual
$('#AddDeviceManual').on('click', function (e) {
    e.preventDefault();

    const formData = GetFormData();
    formData.append('DeliveryTime', `${$('#device_add-DeliveryTime1').val()} ${$('#device_add-DeliveryTime2').val()}`);

    $.ajax({
        type: "POST",
        url: "/NVIDIA/DeviceManagement/AddDeviceManual",
        data: formData,
        dataType: "json",
        processData: false,
        contentType: false,
        success: function (response) {
            if (response.status) {
                toastr["success"](i18next.t('device.new_device.manual.add_device_success'), "SUCCRESS");
            }
            else {
                toastr["error"](response.message, "ERROR");
            }
        },
        error: function (error) {
            Swal.fire(i18next.t('global.swal_title'), GetAjaxErrorMessage(error), "error");
        }
    });
});

function GetFormData() {
    const formData = new FormData();

    $('.input-group').each(function () {
        const label = $(this).find('span').text().replace(' ', '').trim();
        const inputElement = $(this).find('input, select')[0];
        //const id = inputElement.id;
        const value = $(inputElement).val();

        // Check continue
        var checkContinue = false;
        var continueItems = ['DeliveryTime'];
        continueItems.forEach(function (item) {
            if (item === label) {
                checkContinue = true;
                return false;
            }
        });
        if (checkContinue) return;


        // Get label data
        if (label) {
            if (label.includes('Layout')) {
                formData.append('Layout', value);
            }
            else {
                formData.append(label, value);
            }
        }
    });
    return formData;
}

// Add more layout dynamic
$('#new-layout').on('click', async function (e) {
    e.preventDefault();

    var layoutlength = $('#layout-container [group-layout]').length;

    if (layoutlength > 4) {
        return false;
    }

    var selectLayout = $(`<select class="form-select" id="device_add-WareHouse"></select>`);
    var deleteButton = $(`<span class="input-group-text bg-light-danger text-danger" style="width:40px" delete><i class="fa-solid fa-trash"></i></span>`);
    deleteButton.on('click', function (e) {
        var element = $(this).closest('[group-layout]');
        element.remove();
    });

    selectLayout.append(await LayoutOption());

    var inputGroup = $(`<div class="input-group mb-3" group-layout>
                            <span class="col-4 input-group-text">Layout ${layoutlength + 1} </span>
                        </div>`);
    inputGroup.append(selectLayout);
    inputGroup.append(deleteButton)   

    $('#layout-container').append(inputGroup);
});

var WarehouseLayouts;
$('#device_add-WareHouse').on('change', function (e) {
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