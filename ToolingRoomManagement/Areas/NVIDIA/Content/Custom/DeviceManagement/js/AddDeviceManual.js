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

                $('#device_add-WareHouse').change();
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

    //console.log(...formData);
    //console.log(formData.getAll('Layout'));
    //return;

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