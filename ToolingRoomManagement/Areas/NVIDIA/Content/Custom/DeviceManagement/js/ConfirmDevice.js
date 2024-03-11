$(function () {
    //$('#hidden_function').hide();
    //GetSelectData();
});

// Get Device in Warehouse
$('#input_WareHouse').change(function () {
    
    GetDevices($(this).val());
});
function GetDevices(IdWarehouse) {
    $.ajax({
        type: "GET",
        url: "/NVIDIA/DeviceManagement/GetDevicesUnconfirm?IdWarehouse=" + IdWarehouse,
        dataType: "json",
        contentType: "application/json;charset=utf-8",
        success: function (response) {
            if (response.status) {
                CreateTableAddDevice(response.devices)
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
                $('#device_confirm-WareHouse').empty();
                $.each(response.warehouses, function (k, item) {
                    var opt1 = $(`<option value="${item.Id}">${item.WarehouseName}</option>`);
                    var opt2 = $(`<option value="${item.Id}">${item.WarehouseName}</option>`);
                    $('#device_confirm-WareHouse').append(opt1);
                    $('#input_WareHouse').append(opt2);
                });
                $('#input_WareHouse').change();
                // Product
                $('#device_confirm-Product-List').empty();
                $('#filter_Product').html($('<option value="Product" selected>Product (All)</option>'));
                $.each(response.products, function (k, item) {
                    let opt = $(`<option value="${item.ProductName}${item.MTS != null ? ' | ' + item.MTS : ''}"></option>`);
                    $('#device_confirm-Product-List').append(opt);

                    let opt1 = $(`<option value="${item.ProductName}">${item.ProductName}</option>`);
                    $('#filter_Product').append(opt1);
                });
                // Model
                $('#device_confirm-Model-List').empty();
                $('#filter_Model').html($('<option value="Model" selected>Model (All)</option>'));
                $.each(response.models, function (k, item) {
                    let opt = $(`<option value="${item.ModelName}"></option>`);
                    $('#device_confirm-Model-List').append(opt);

                    let opt1 = $(`<option value="${item.ModelName}">${item.ModelName}</option>`);
                    $('#filter_Model').append(opt1);
                });
                // Station
                $('#device_confirm-Station-List').empty();
                $('#filter_Station').html($('<option value="Station" selected>Station (All)</option>'));
                $.each(response.stations, function (k, item) {
                    let opt = $(`<option value="${item.StationName}"></option>`);
                    $('#device_confirm-Station-List').append(opt);

                    let opt1 = $(`<option value="${item.StationName}">${item.StationName}</option>`);
                    $('#filter_Station').append(opt1);
                });
                // Group
                $('#device_confirm-Group-List').empty();
                $('#filter_Group').html($('<option value="Group" selected>Group (All)</option>'));
                $.each(response.groups, function (k, item) {
                    let opt = $(`<option value="${item.GroupName}"></option>`);
                    $('#device_confirm-Group-List').append(opt);

                    let opt1 = $(`<option value="${item.GroupName}">${item.GroupName}</option>`);
                    $('#filter_Group').append(opt1);
                });
                // Vendor
                $('#device_confirm-Vendor-List').empty();
                $('#filter_Vendor').html($('<option value="Vendor" selected>Vendor (All)</option>'));
                $.each(response.vendors, function (k, item) {
                    let opt = $(`<option value="${item.VendorName}"></option>`);
                    $('#device_confirm-Vendor-List').append(opt);

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

// Datatable
var tableDeviceInfo;
async function CreateTableAddDevice(devices) {
    if (tableDeviceInfo) tableDeviceInfo.destroy();

    $('#table_Devices_tbody').html('');
    await $.each(devices, async function (no, item) {
        var row = CreateRowDatatable(item);
        $('#table_Devices_tbody').append(row);
    });

    const options = {
        scrollY: 500,
        scrollX: true,
        order: [],
        autoWidth: false,
        columnDefs: [
            { targets: "_all", orderable: false },
            { targets: [11,12,13,14,15,16], className: "text-center" },
            //{ targets: [15], className: "text-info fw-bold text-center" },
            //{ targets: [11, 12, 13, 14, 15, 16, 17, 18, 19, 20], className: "text-center" },
            //{ targets: [20], className: "text-center", width: '120px' },

            { targets: [0,2,3,4,9,13,14], visible: false },
        ],
        dom: "<'row'<'w-auto'B><'col-sm-12 col-md'l><'col-sm-12 col-md'f>>" +
            "<'row'<'col-sm-12'tr>>" +
            "<'row'<'col-sm-12 col-md-7'i><'col-sm-12 col-md-5'p>>",
        buttons: [
            {
                text: 'Upload Station BOM',
                action: function (e, dt, button, config) {
                    var input = $('<input type="file">');
                    input.on('change', function () {
                        var file = this.files[0];
                        SendStationBOMFile(file);
                    });
                    input.click();
                }
            }
        ],
        "lengthMenu": [[10, 15, 25, 50, -1], [10, 15, 25, 50, "All"]],
    };
    tableDeviceInfo = $('#table_Devices').DataTable(options);
    tableDeviceInfo.columns.adjust();
};
function CreateRowDatatable(item) {
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
        moq: item.MOQ ? item.MOQ : '0',
        unit: item.Unit || '',
        leadtime: /\d/.test(item.DeliveryTime) ? item.DeliveryTime : "NA",
        isconsign: item.isConsign ? "consign" : "normal",
        lifeCycle: item.LifeCycle ? item.LifeCycle : 'NA',
        type: item.Type_BOM == 'S' ? 'Static' : item.Type_BOM == 'D' ? 'Dynamic' : 'NA',
        AltPN: (item.AlternativeDevices != null && item.AlternativeDevices.length == 1) ? item.AlternativeDevices[0].PNs ? item.AlternativeDevices[0].PNs : "" : ""
    };
    

    var row = $(`<tr class="align-middle cursor-pointer" data-id="${deviceData.id}"></tr>`);

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
    // 10 LifeCycle      
    row.append(`<td>${deviceData.lifeCycle}</td>`);
    // 11 Buffer
    row.append(`<td>${deviceData.buffer}</td>`);
    // 12 MOQ
    row.append(`<td title="BOM Quantity">${deviceData.moq}</td>`);
    // 13 Unit
    row.append(`<td>${deviceData.unit}</td>`);
    // 14 Lead Time
    row.append(`<td>${deviceData.leadtime}</td>`);
    // 15 Type
    switch (deviceData.type) {
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
    // 16 Status
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
    // 17 Action
    row.append(`<td class="order-action d-flex text-center justify-content-center">
                        <a href="javascript:;" class="text-warning bg-light-warning border-0" data-id="${deviceData.id}" onclick="Confirm(this, event)"><i class="fa-duotone fa-check"></i></a>
                    </td>`);

    return row;
}
$(".toggle-icon").click(function () {
    setTimeout(() => {
        tableDeviceInfo.columns.adjust();
    }, 310);
});

// SendStationBOMFile
function SendStationBOMFile(file) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('IdWarehouse', $('#input_WareHouse').val());

    Pace.on('progress', function (progress) {
        var cal = progress.toFixed(2);
        $('#process_count').text(`${cal}%`);
        $('#process_bar').css('width', `${cal}%`);
    });
    Pace.track(function () {
        $.ajax({
            url: "/NVIDIA/DeviceManagement/AddDeviceUnconfirm",
            data: formData,
            type: "POST",
            processData: false,
            contentType: false,
            success: function (response) {
                if (response.status) {
                    GetDevices($('#input_WareHouse').val());
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

//Filter
$('#filter').on('click', function (e) {
    e.preventDefault();

    var filter_Product = $('#filter_Product').val();
    var filter_Model = $('#filter_Model').val();
    var filter_Station = $('#filter_Station').val();
    var filter_Group = $('#filter_Group').val();
    var filter_Vendor = $('#filter_Vendor').val();
    var filter_Type = $('#filter_Type').val();

    tableDeviceInfo.columns().search('').draw();

    if (filter_Product !== "Product" && filter_Product !== null && filter_Product !== undefined) {
        tableDeviceInfo.column(2).search("^" + filter_Product + "$", true, false);
    }
    if (filter_Model !== "Model" && filter_Model !== null && filter_Model !== undefined) {
        tableDeviceInfo.column(7).search("^" + filter_Model + "$", true, false);
    }
    if (filter_Station !== "Station" && filter_Station !== null && filter_Station !== undefined) {
        tableDeviceInfo.column(8).search("^" + filter_Station + "$", true, false);
    }
    if (filter_Group !== "Group" && filter_Group !== null && filter_Group !== undefined) {
        tableDeviceInfo.column(5).search("^" + filter_Group + "$", true, false);
    }
    if (filter_Vendor !== "Vendor" && filter_Vendor !== null && filter_Vendor !== undefined) {
        tableDeviceInfo.column(6).search("^" + filter_Vendor + "$", true, false);
    }
    if (filter_Type !== "Type" && filter_Type !== null && filter_Type !== undefined) {
        tableDeviceInfo.column(14).search("^" + filter_Type + "$", true, false);
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

    $('#filter').click();
});

// Confirm event
function Confirm(elm, e) {
    const Id = $(elm).data('id');

    $.ajax({
        type: "GET",
        url: "/NVIDIA/DeviceManagement/GetDeviceUnconfirm?Id=" + Id,
        dataType: "json",
        contentType: "application/json;charset=utf-8",
        success: function (response) {
            if (response.status) {
                CreateConfirmModal(response.device);
                
                $('#device_confirm-modal').modal('show');
                setTimeout(() => {
                    CreateImages_Update(response.images);
                }, 200);
                
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
function CreateConfirmModal(device) {
    $('#device_confirm-DeviceId').val(device.Id);

    $('#device_confirm-DeviceCode').val(device.DeviceCode);
    $('#device_confirm-DeviceName').val(device.DeviceName);
    $('#device_confirm-Specification').val('');

    $('#device_confirm-Type').val('normal_NA').trigger('change');
    $('#device_confirm-CreatedDate').val(moment().format('YYYY-MM-DD HH:mm'));
    $('#device_confirm-DeliveryTime1').val('');

    $('#device_confirm-WareHouse').val(device.IdWareHouse).trigger('change');
    $('#device_confirm-Buffer').val(device.Buffer * 100);
    $('#device_confirm-POQty').val(0);
    $('#device_confirm-MinQty').val(device.MinQty);
    $('#device_confirm-MOQ').val(device.MOQ);

    $('#device_confirm-Relation').val(device.Relation);
    $('#device_confirm-LifeCycle').val(device.LifeCycle);
    $('#device_confirm-QtyConfirm').val(0);
    $('#device_confirm-Unit').val('NA');

    $('#device_confirm-Product').val(device.Product ? device.Product.ProductName : 'NA');
    $('#device_confirm-Model').val(device.Model ? device.Model.ModelName : 'NA');
    $('#device_confirm-Station').val(device.Station ? device.Station.StationName : 'NA');
    $('#device_confirm-Group').val(device.Group ? device.Group.GroupName : 'NA');
    $('#device_confirm-Vendor').val(device.Vendor ? device.Vendor.VendorName : 'NA');

    $('#add-image').data('deviceid', device.Id);
}

// Layout
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
                            <span class="col-2 input-group-text">${i18next.t('device.management.layout')} ${layoutlength + 1} </span>
                        </div>`);
    inputGroup.append(selectLayout);
    inputGroup.append(deleteButton)

    $('#layout-container').append(inputGroup);
});
var WarehouseLayouts;
$('#device_confirm-WareHouse').on('change', function (e) {
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

                LayoutOption(WarehouseLayouts);
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

// Image
var selectedFiles = [];
$('#add-image').click(function () {
    var selectFile = $('<input type="file" accept="image/*" multiple/>');

    selectFile.change(function () {
        selectedFiles = Array.from(selectFile[0].files);
        var deviceid = $('#add-image').data('deviceid');

        UpdateImage(deviceid);
    });

    selectFile.click();
});
function UpdateImage(deviceid) {

    var formData = new FormData();

    formData.append('deviceid', deviceid);
    selectedFiles.forEach(function (file) {
        formData.append('files', file);
    });

    $.ajax({
        type: "POST",
        url: "/NVIDIA/DeviceManagement/DeviceUnconfirm_UpdateImage",
        data: formData,
        dataType: "json",
        processData: false,
        contentType: false,
        success: function (response) {
            if (response.status) {

                CreateImages_Update(response.images);

                toastr["success"](i18next.t('device.management.update_success_message'), "SUCCRESS");
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
function CreateImages_Update(images) {
    $('#images-confirm-container').closest('.card-body').height($('#images-confirm-container').closest('.col-4').prev().find('.card-body').height());

    $('#images-confirm-container .carousel-indicators').empty();
    $('#images-confirm-container .carousel-inner').empty();
    $('#images').empty();

    if (images != null && images.length == 0) {
        $('#images-confirm-container').hide();
        //InitViewer();
        return;
    }

    $.each(images, function (k, file) {
        var src = file.replace(/^.*\\Data/, "/Data");
        // CarouselSlides
        var CarouselSlides = $('#images-confirm-container .carousel-indicators');
        var SlideItem = $(`<li data-bs-target="#carousel" data-bs-slide-to="${k}"></li>`);

        //CarouselItem
        var CarouselItem = $(`<div class="carousel-item"><img class="d-block w-100" src=""></div>`);
        var img = $(`<img class="d-block w-100" src="${src}">`);
        img.click(() => { viewPreview.show(true) });
        CarouselItem.append(img);

        // Carousel First check
        if (CarouselSlides.find('li').length == 0) {
            SlideItem.addClass('active');
            CarouselItem.addClass('active');
        }

        // Append Carousel
        $('#images-confirm-container .carousel-indicators').append(SlideItem);
        $('#images-confirm-container .carousel-inner').append(CarouselItem);

        // Galley
        var GalleyItem = $(`<li><img src="${src}"></li>`);
        $('#images').append(GalleyItem);

    });

    InitViewer();

    $('#images-confirm-container').show();
}
$('a[data-slide="prev"]').click(function () {
    $('.carousel').carousel('prev');
});
$('a[data-slide="next"]').click(function () {
    $('.carousel').carousel('next');
});
function DeleteImage(deletebutton) {
    var elm = $(deletebutton);

    var ViewerContainer = elm.closest('.viewer-container');
    var ViewerImage = ViewerContainer.find('.viewer-canvas img');
    var src = ViewerImage.attr('src');

    $.ajax({
        type: "GET",
        url: "/NVIDIA/DeviceManagement/DeleteImage?src=" + src,
        dataType: "json",
        contentType: "application/json;charset=utf-8",
        success: function (response) {
            if (response.status) {
                CreateImages_Update(response.images);

                toastr["success"]("Delete Image Success.", "SUCCESS");
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

// Confirm Device
$('#device_confirm-btn_save').click(function () {
    var formData = GetModalData();

    $.ajax({
        type: "POST",
        url: "/NVIDIA/DeviceManagement/AddConfirmDevice",
        data: formData,
        dataType: "json",
        processData: false,
        contentType: false,
        success: function (response) {
            if (response.status) {
                $('#device_confirm-modal').modal('hide');

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
function GetModalData() {
    var formData = new FormData();

    // normal data
    formData.append('Id', $('#device_confirm-DeviceId').val());

    formData.append('DeviceCode',    $('#device_confirm-DeviceCode').val());
    formData.append('DeviceName',    $('#device_confirm-DeviceName').val());
    formData.append('Specification', $('#device_confirm-Specification').val());

    formData.append('Type',          $('#device_confirm-Type').val());
    formData.append('CreatedDate',    $('#device_confirm-CreatedDate').val());
    formData.append('DeliveryTime',  $('#device_confirm-DeliveryTime1').val() + ' ' + $('#device_confirm-DeliveryTime2').val());

    formData.append('IdWareHouse',   $('#device_confirm-WareHouse').val());
    formData.append('Buffer',        parseInt($('#device_confirm-Buffer').val()) / 100);
    formData.append('POQty',         $('#device_confirm-POQty').val());
    formData.append('MinQty',        $('#device_confirm-MinQty').val());

    formData.append('Relation',      $('#device_confirm-Relation').val());
    formData.append('LifeCycle',     $('#device_confirm-LifeCycle').val());
    formData.append('QtyConfirm',    $('#device_confirm-QtyConfirm').val());
    formData.append('Unit',          $('#device_confirm-Unit').val());

    formData.append('Product',       $('#device_confirm-Product').val());
    formData.append('Model',         $('#device_confirm-Model').val());
    formData.append('Station',       $('#device_confirm-Station').val());
    formData.append('Group',         $('#device_confirm-Group').val());
    formData.append('Vendor',        $('#device_confirm-Vendor').val());

    // layout
    $('#layout-container option:selected').map(function () {
        formData.append('Layout', $(this).val());
    });

    return formData;
}

// Other

// Dropdown custom event
$(document).ready(function () {
    var dropdownOpen = false;
    $('#dropdown_filter').on('click', function (event) {
        event.stopPropagation();

        dropdownOpen = !dropdownOpen;

        if (dropdownOpen) {
            $(this).addClass('show');
        } else {
            $(this).removeClass('show');
        }
    });

    $(document).on('click', function (event) {
        if (dropdownOpen && !$(event.target).closest('#dropdown_filter').length) {
            $('#dropdown_filter').removeClass('show');
            dropdownOpen = false;
        }
    });
});

// Init Select2
$(document).ready(function () {
    // Datatable Select Warehouse
    $('#input_WareHouse', document).select2({
        theme: 'bootstrap4',
        minimumResultsForSearch: -1,
    });

    // Datatable filter
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
    
    // Confirm modal
    {
        $('#device_confirm-WareHouse', document).select2({
            theme: 'bootstrap4',
            minimumResultsForSearch: -1,
            dropdownParent: $("#device_confirm-modal"),
        });
        $('#device_confirm-Type').select2({
            theme: 'bootstrap4',
            dropdownParent: $("#device_confirm-modal"),
            minimumResultsForSearch: -1,
            width: '66.66%',
        });
    }
});


// BUffer
$('#add-buffer').click(function () {
    var input = $('<input type="file">');
    input.on('change', function () {
        var file = this.files[0];

        updateBuffer(file);
    });
    input.click();
});
function updateBuffer(file) {
    const formData = new FormData();
    formData.append('file', file);

    Pace.on('progress', function (progress) {
        var cal = progress.toFixed(2);
        $('#process_count').text(`${cal}%`);
        $('#process_bar').css('width', `${cal}%`);
    });
    Pace.track(function () {
        $.ajax({
            url: "/NVIDIA/DeviceManagement/UpdateBuffer",
            data: formData,
            type: "POST",
            processData: false,
            contentType: false,
            success: function (response) {
                if (response.status) {
                    toastr["success"]("Update buffer success.", "SUCCESS");
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

// Limit
$('#add-limit').click(function () {
    var input = $('<input type="file">');
    input.on('change', function () {
        var file = this.files[0];

        updateLimit(file);

    });
    input.click();
});
function updateLimit(file) {
    const formData = new FormData();
    formData.append('file', file);

    Pace.on('progress', function (progress) {
        var cal = progress.toFixed(2);
        $('#process_count').text(`${cal}%`);
        $('#process_bar').css('width', `${cal}%`);
    });
    Pace.track(function () {
        $.ajax({
            url: "/NVIDIA/DeviceManagement/UpdateLimit",
            data: formData,
            type: "POST",
            processData: false,
            contentType: false,
            success: function (response) {
                if (response.status) {
                    toastr["success"]("Update limit success.", "SUCCESS");
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

// Comming Devices
$('#add-otw').click(function () {
    var input = $('<input type="file">');
    input.on('change', function () {
        var file = this.files[0];

        updateComing(file);

    });
    input.click();
});
function updateComing(file) {
    const formData = new FormData();
    formData.append('file', file);

    Pace.on('progress', function (progress) {
        var cal = progress.toFixed(2);
        $('#process_count').text(`${cal}%`);
        $('#process_bar').css('width', `${cal}%`);
    });
    Pace.track(function () {
        $.ajax({
            url: "/NVIDIA/DeviceManagement/UpdateComingDevicesss",
            data: formData,
            type: "POST",
            processData: false,
            contentType: false,
            success: function (response) {
                if (response.status) {
                    toastr["success"]("Update Ontheway success.", "SUCCESS");
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

// Type
$('#add-type').click(function () {
    var input = $('<input type="file">');
    input.on('change', function () {
        var file = this.files[0];

        updateType(file);

    });
    input.click();
});
function updateType(file) {
    const formData = new FormData();
    formData.append('file', file);

    Pace.on('progress', function (progress) {
        var cal = progress.toFixed(2);
        $('#process_count').text(`${cal}%`);
        $('#process_bar').css('width', `${cal}%`);
    });
    Pace.track(function () {
        $.ajax({
            url: "/NVIDIA/DeviceManagement/UpdateType",
            data: formData,
            type: "POST",
            processData: false,
            contentType: false,
            success: function (response) {
                if (response.status) {
                    toastr["success"]("Update Type success.", "SUCCESS");
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
// Relation
$('#add-relation').click(function () {
    var input = $('<input type="file">');
    input.on('change', function () {
        var file = this.files[0];

        updateRelation(file);

    });
    input.click();
});
function updateRelation(file) {
    const formData = new FormData();
    formData.append('file', file);

    Pace.on('progress', function (progress) {
        var cal = progress.toFixed(2);
        $('#process_count').text(`${cal}%`);
        $('#process_bar').css('width', `${cal}%`);
    });
    Pace.track(function () {
        $.ajax({
            url: "/NVIDIA/DeviceManagement/UpdateRelation",
            data: formData,
            type: "POST",
            processData: false,
            contentType: false,
            success: function (response) {
                if (response.status) {
                    toastr["success"]("Update Relation success.", "SUCCESS");
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

// Owner
$('#add-owner').click(function () {
    var input = $('<input type="file">');
    input.on('change', function () {
        var file = this.files[0];

        updateOwner(file);

    });
    input.click();
});
function updateOwner(file) {
    const formData = new FormData();
    formData.append('file', file);

    Pace.on('progress', function (progress) {
        var cal = progress.toFixed(2);
        $('#process_count').text(`${cal}%`);
        $('#process_bar').css('width', `${cal}%`);
    });
    Pace.track(function () {
        $.ajax({
            url: "/NVIDIA/DeviceManagement/UpdateOwner",
            data: formData,
            type: "POST",
            processData: false,
            contentType: false,
            success: function (response) {
                if (response.status) {
                    toastr["success"]("Update Owner success.", "SUCCESS");
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
// Product
$('#add-product').click(function () {
    var input = $('<input type="file">');
    input.on('change', function () {
        var file = this.files[0];

        updateProduct(file);

    });
    input.click();
});
function updateProduct(file) {
    const formData = new FormData();
    formData.append('file', file);

    Pace.on('progress', function (progress) {
        var cal = progress.toFixed(2);
        $('#process_count').text(`${cal}%`);
        $('#process_bar').css('width', `${cal}%`);
    });
    Pace.track(function () {
        $.ajax({
            url: "/NVIDIA/DeviceManagement/UpdateProduct",
            data: formData,
            type: "POST",
            processData: false,
            contentType: false,
            success: function (response) {
                if (response.status) {
                    toastr["success"]("Update Product success.", "SUCCESS");
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

// Group & Vendor
$('#add-group_vendor').click(function () {
    var input = $('<input type="file">');
    input.on('change', function () {
        var file = this.files[0];

        updateGroupAndVendor(file);

    });
    input.click();
});
function updateGroupAndVendor(file) {
    const formData = new FormData();
    formData.append('file', file);

    Pace.on('progress', function (progress) {
        var cal = progress.toFixed(2);
        $('#process_count').text(`${cal}%`);
        $('#process_bar').css('width', `${cal}%`);
    });
    Pace.track(function () {
        $.ajax({
            url: "/NVIDIA/DeviceManagement/UpdateGroupAndVendor",
            data: formData,
            type: "POST",
            processData: false,
            contentType: false,
            success: function (response) {
                if (response.status) {
                    toastr["success"]("Update Group And Vendor success.", "SUCCESS");
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

// Description
$('#add-desc').click(function () {
    var input = $('<input type="file">');
    input.on('change', function () {
        var file = this.files[0];

        updateDescription(file);

    });
    input.click();
});
function updateDescription(file) {
    const formData = new FormData();
    formData.append('file', file);

    Pace.on('progress', function (progress) {
        var cal = progress.toFixed(2);
        $('#process_count').text(`${cal}%`);
        $('#process_bar').css('width', `${cal}%`);
    });
    Pace.track(function () {
        $.ajax({
            url: "/NVIDIA/DeviceManagement/UpdateDescription",
            data: formData,
            type: "POST",
            processData: false,
            contentType: false,
            success: function (response) {
                if (response.status) {
                    toastr["success"]("Update Description success.", "SUCCESS");
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

// Min Qty
$('#add-min').click(function () {
    var input = $('<input type="file">');
    input.on('change', function () {
        var file = this.files[0];

        updateMinQty(file);

    });
    input.click();
});
function updateMinQty(file) {
    const formData = new FormData();
    formData.append('file', file);

    Pace.on('progress', function (progress) {
        var cal = progress.toFixed(2);
        $('#process_count').text(`${cal}%`);
        $('#process_bar').css('width', `${cal}%`);
    });
    Pace.track(function () {
        $.ajax({
            url: "/NVIDIA/DeviceManagement/UpdateMinQty",
            data: formData,
            type: "POST",
            processData: false,
            contentType: false,
            success: function (response) {
                if (response.status) {
                    toastr["success"]("Update Min quantity success.", "SUCCESS");
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

// Device Product
$('#add-deviceProduct').click(function () {
    var input = $('<input type="file">');
    input.on('change', function () {
        var file = this.files[0];

        updateDeviceProduct(file);

    });
    input.click();
});
function updateDeviceProduct(file) {
    const formData = new FormData();
    formData.append('file', file);

    Pace.on('progress', function (progress) {
        var cal = progress.toFixed(2);
        $('#process_count').text(`${cal}%`);
        $('#process_bar').css('width', `${cal}%`);
    });
    Pace.track(function () {
        $.ajax({
            url: "/NVIDIA/DeviceManagement/UpdateDeviceProduct",
            data: formData,
            type: "POST",
            processData: false,
            contentType: false,
            success: function (response) {
                if (response.status) {
                    toastr["success"]("Update Device Product success.", "SUCCESS");
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

// Device
$('#add-device').click(function () {
    var input = $('<input type="file">');
    input.on('change', function () {
        var file = this.files[0];

        UpdateDeviceFile(file);

    });
    input.click();
});
function UpdateDeviceFile(file) {
    const formData = new FormData();
    formData.append('file', file);

    Pace.on('progress', function (progress) {
        var cal = progress.toFixed(2);
        $('#process_count').text(`${cal}%`);
        $('#process_bar').css('width', `${cal}%`);
    });
    Pace.track(function () {
        $.ajax({
            url: "/NVIDIA/DeviceManagement/UpdateDeviceFile",
            data: formData,
            type: "POST",
            processData: false,
            contentType: false,
            success: function (response) {
                if (response.status) {
                    toastr["success"]("Update Device success.", "SUCCESS");
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