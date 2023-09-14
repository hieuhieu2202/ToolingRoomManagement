$(function () {
    GetSelectData();
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
            } else {
                toastr["error"](response.message, "ERROR");
            }
        },
        error: function (error) {
            Swal.fire("Something went wrong!", GetAjaxErrorMessage(error), "error");
        }
    });
}

// Add Device Manual
$('#AddDeviceManual').on('click', function (e) {
    e.preventDefault();

    const formData = GetFormData();

    $.ajax({
        type: "POST",
        url: "/NVIDIA/DeviceManagement/AddDeviceManual",
        data: formData,
        dataType: "json",
        processData: false,
        contentType: false,
        success: function (response) {
            if (response.status) {
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

function GetFormData() {
    const formData = new FormData();

    $('.input-group').each(function () {
        const label = $(this).find('span').text().replace(' ', '').trim();
        const inputElement = $(this).find('input, select')[0];
        //const id = inputElement.id;
        const value = $(inputElement).val();

        if (label) {
            formData.append(label, value);
        }
    });
    return formData;
}