$(function () {
    GetSelectData(); 

    $('.carousel').carousel();
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

async function GetWarehouseDevice(IdWarehouse) {
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
$('#device_add-WareHouse').change(async function (e) {
    e.preventDefault();
    var IdWarehouse = $(this).val();

    try {
        const warehouseDevices = await GetWarehouseDevice(IdWarehouse);

        var listDevices = $('#device_add-Device_List');
        listDevices.empty();
        warehouseDevices.forEach(function (device) {
            var deviceData = {
                mts: (device.Product && device.Product.MTS) ? device.Product.MTS : "NA",
                pn: device.DeviceCode !== "null" ? device.DeviceCode : "NA",
                des: device.DeviceName !== "" ? device.DeviceName : "NA",
            };

            listDevices.append(`<option value="${deviceData.pn}" data-id="${deviceData.id}">${deviceData.des} | ${deviceData.mts}</option>`);
        });

    } catch (error) {
        Swal.fire(i18next.t('global.swal_title'), error, 'error');
    }
});

// Add Device Manual
$('#AddDeviceManual').on('click', function (e) {
    e.preventDefault();

    const formData = GetFormData();   

    selectedFiles.forEach(function (file) {
        formData.append('files', file);
    });

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

    formData.append('DeliveryTime', `${$('#device_add-DeliveryTime1').val()} ${$('#device_add-DeliveryTime2').val()}`);

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

// Image
$('a[data-slide="prev"]').click(function () {
    $('.carousel').carousel('prev');
});
$('a[data-slide="next"]').click(function () {
    $('.carousel').carousel('next');
});

var selectedFiles = [];
$('#btn-new-image').click(function (e) {
    var selectFile = $('<input type="file" accept="image/*" multiple/>');
    selectFile.change(function () {
        var newFiles = Array.from(selectFile[0].files);
        selectedFiles = newFiles;    

        InsertCarousel();
    });

    selectFile.click();
});
$('#btn-delete-image').click(function (e) {
    selectedFiles = [];

    $('.carousel-indicators').empty();
    $('.carousel-inner').empty();
    $('#images').empty();

    $('#image-container').fadeOut(300);
    $('#btn-delete-image').fadeOut(300);
});

function InsertCarousel() {
    $('.carousel-indicators').empty();
    $('.carousel-inner').empty();
    $('#images').empty();

    $.each(selectedFiles, function (k, file) {
         // CarouselSlides
        var CarouselSlides = $('.carousel-indicators');
        var SlideItem = $(`<li data-bs-target="#carousel" data-bs-slide-to="${k}"></li>`);

        //CarouselItem
        var CarouselItem = $(`<div class="carousel-item"><img class="d-block w-100" src=""></div>`);
        var img = $(`<img class="d-block w-100" src="${URL.createObjectURL(file)}">`);
        img.click(() => { viewPreview.show() });
        CarouselItem.append(img);
        
        // Carousel First check
        if (CarouselSlides.find('li').length == 0) {
            SlideItem.addClass('active');
            CarouselItem.addClass('active');
        }    

        // Append Carousel
        $('.carousel-indicators').append(SlideItem);
        $('.carousel-inner').append(CarouselItem);  

        // Galley
        var GalleyItem = $(`<li><img src="${URL.createObjectURL(file)}"><li>`);
        $('#images').append(GalleyItem);

    });

    InitViewer();
    $('#image-container').fadeIn(300);
    $('#btn-delete-image').fadeIn(300);
}

var viewPreview;
function InitViewer() {
    if (viewPreview) viewPreview.destroy();

    viewPreview = new Viewer(document.getElementById('images'), {
        backdrop: true,
        button: true,
        focus: true,
        fullscreen: true,
        loading: true,
        loop: true,
        keyboard: true,
        movable: true,
        navbar: true,
        rotatable: true,
        scalable: true,
        slideOnTouch: true,
        title: true,
        toggleOnDbclick: true,
        toolbar: true,
        tooltip: true,
        transition: true,
        zoomable: true,
        zoomOnTouch: true,
        zoomOnWheel: true
    });
}

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