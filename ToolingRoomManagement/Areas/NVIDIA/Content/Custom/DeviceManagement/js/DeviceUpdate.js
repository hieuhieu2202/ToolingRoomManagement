// INIT
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

// GET
function GetModalData() {
    var formData = new FormData();
    formData.append('Id', $('#device_edit-DeviceId').val());

    formData.append('DeviceCode', $('#device_edit-DeviceCode').val());
    formData.append('DeviceName', $('#device_edit-DeviceName').val());
    formData.append('Specification', $('#device_edit-Specification').val());

    formData.append('Type', $('#device_edit-Type').val());
    formData.append('DeviceDate', $('#device_edit-DeviceDate').val());
    formData.append('DeliveryTime', $('#device_edit-DeliveryTime1').val() + ' ' + $('#device_edit-DeliveryTime2').val());

    formData.append('IdWareHouse', $('#device_edit-WareHouse').val());
    formData.append('Buffer', parseInt($('#device_edit-Buffer').val()) / 100);
    formData.append('Quantity', $('#device_edit-Quantity').val());
    formData.append('POQty', $('#device_edit-POQty').val());
    formData.append('Unit', $('#device_edit-Unit').val());
    formData.append('MOQ', $('#device_edit-MOQ').val());


    formData.append('Relation', $('#device_edit-Relation').val());
    formData.append('LifeCycle', $('#device_edit-LifeCycle').val());
    formData.append('QtyConfirm', $('#device_edit-QtyConfirm').val());
    formData.append('RealQty', $('#device_edit-RealQty').val());
    formData.append('MinQty', $('#device_edit-MinQty').val() != "" ? $('#device_edit-MinQty').val() : "0");

    formData.append('Product', $('#device_edit-Product').val());
    formData.append('Model', $('#device_edit-Model').val());
    formData.append('Station', $('#device_edit-Station').val());
    formData.append('Group', $('#device_edit-Group').val());
    formData.append('Vendor', $('#device_edit-Vendor').val());

    formData.append('AltPNs', $('#device_edit-AltPNs').val());

    // layout
    $('#layout-container option:selected').map(function () {
        formData.append('Layout', $(this).val());
    });

    return formData;
}
async function DeviceUpdate(elm, e) {
    e.preventDefault();

    var Id = $(elm).data('id');

    var response = await GetDevice(Id, true);

    FillEditDeviceData(response.device);

    $('#device_edit-modal').modal('show');
    $('.selectpicker').selectpicker();

    setTimeout(() => {
        CreateImages_Update(response.images);
    }, 300);
}

// SET
async function FillEditDeviceData(device) {
    $('#device_edit-DeviceId').val(device.Id);

    // basic
    $('#device_edit-DeviceCode').val(device.DeviceCode != null ? device.DeviceCode : "");
    $('#device_edit-DeviceName').val(device.DeviceName);
    $('#device_edit-Specification').val(device.Specification);
    $('#device_edit-Status').val(device.Status).trigger('change');
    var type = "";
    if (device.Type == "S") device.Type = "Static";
    if (device.Type == "D") device.Type = "Dynamic";
    if (device.Type == "Consign") device.Type = "NA";
    if (device.isConsign == true) {
        type = "consign_" + device.Type;
    }
    else {
        type = "normal_" + device.Type;
    }
    $('#device_edit-Type').val(type).trigger('change');
    $('#device_edit-DeviceDate').val(moment(device.DeviceDate).format('YYYY-MM-DD HH:mm'));
    if (device.DeliveryTime) {
        var temp = device.DeliveryTime.split(' ');
        $('#device_edit-DeliveryTime1').val(temp[0]);

        var selectVal = '';
        for (let i = 1; i < temp.length; i++) {
            selectVal += ' ' + temp[i];
        }
        $('#device_edit-DeliveryTime2').val(selectVal.trim());
    }
    // details
    $('#device_edit-WareHouse').val(device.IdWareHouse).trigger('change');
    $('#device_edit-Buffer').val(device.Buffer * 100);
    $('#device_edit-Quantity').val(device.Quantity);
    $('#device_edit-POQty').val(device.POQty ? device.POQty : 0);
    $('#device_edit-Unit').val(device.Unit);
    $('#device_edit-MOQ').val(device.MOQ ? device.MOQ : 0);

    $('#device_edit-Relation').val(device.Relation);
    $('#device_edit-LifeCycle').val(device.LifeCycle);
    $('#device_edit-QtyConfirm').val(device.QtyConfirm);
    $('#device_edit-RealQty').val(device.RealQty);
    $('#device_edit-MinQty').val(device.MinQty);

    $('#device_edit-Product').val(device.Product ? device.Product.ProductName : '');
    $('#device_edit-Model').val(device.Model ? device.Model.ModelName : '');
    $('#device_edit-Station').val(device.Station ? device.Station.StationName : '');
    $('#device_edit-Group').val(device.Group ? device.Group.GroupName : '');
    $('#device_edit-Vendor').val(device.Vendor ? device.Vendor.VendorName : '');

    $('#device_edit-AltPNs').val(device.AlternativeDevices.length > 0 ? device.AlternativeDevices[0].PNs : '');

    $('#add-image').data('deviceid', device.Id);

    $('#layout-container').empty();
    var DeviceLayouts = device.DeviceWarehouseLayouts;
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
                            <span class="col-2 input-group-text">${i18next.t('device.management.layout')} ${k + 1} </span>
                        </div>`);
        inputGroup.append(selectLayout);
        inputGroup.append(deleteButton)

        $('#layout-container').append(inputGroup);
    });
}
function SetEditData(response) {
    // Product
    $('#device_edit-Product-List').empty();
    $.each(response.products, function (k, item) {
        let opt = $(`<option value="${item.ProductName} | ${item.MTS != null ? item.MTS : ''}"></option>`);
        $('#device_edit-Product-List').append(opt);
    });
    // Model
    $('#device_edit-Model-List').empty();
    $.each(response.models, function (k, item) {
        let opt = $(`<option value="${item.ModelName}"></option>`);
        $('#device_edit-Model-List').append(opt);
    });
    // Station
    $('#device_edit-Station-List').empty();
    $.each(response.stations, function (k, item) {
        let opt = $(`<option value="${item.StationName}"></option>`);
        $('#device_edit-Station-List').append(opt);
    });
    // Group
    $('#device_edit-Group-List').empty();
    $.each(response.groups, function (k, item) {
        let opt = $(`<option value="${item.GroupName}"></option>`);
        $('#device_edit-Group-List').append(opt);
    });
    // Vendor
    $('#device_edit-Vendor-List').empty();
    $.each(response.vendors, function (k, item) {
        let opt = $(`<option value="${item.VendorName}"></option>`);
        $('#device_edit-Vendor-List').append(opt);
    });
}
function DrawRowEditDevice(item) {
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
        qty: item.Quantity || 0,
        poqty: item.POQty || 0,
        cfqty: item.QtyConfirm || 0,
        realqty: item.RealQty || 0,
        unit: item.Unit || '',
        leadtime: /\d/.test(item.DeliveryTime) ? item.DeliveryTime : "NA",
        isconsign: item.isConsign ? "consign" : "normal",
        location: {
            html: '',
            title: ''
        },
        AltPN: (item.AlternativesDevices != null) ? item.AlternativesDevices[0].PNs : ""
    };

    var row = [];
    {
        // 0 ID
        row.push(`<td>${deviceData.id}</td>`);
        // 1 MTS
        row.push(`<td>${deviceData.mts}</td>`);
        // 2 Product Name
        row.push(`<td>${deviceData.productname}</td>`);
        // 3 Model
        row.push(`<td>${deviceData.model}</td>`);
        // 4 Station
        row.push(`<td>${deviceData.station}</td>`);
        // 5 DeviceCode - PN
        row.push(`<td>${deviceData.pn}</td>`);
        // 6 DeviceName
        row.push(`<td title="${deviceData.des}">${deviceData.des}</td>`);
        // 7 Group
        row.push(`<td>${deviceData.group}</td>`);
        // 8 Vendor
        row.push(`<td>${deviceData.vendor}</td>`);
        // 9 Specification
        row.push(`<td>${deviceData.special}</td>`);
        // 10 Location      
        row.push(`<td title="${deviceData.location.title}">${deviceData.location.html}</td>`);
        // 11 Buffer
        row.push(`<td>${deviceData.buffer}</td>`);
        // 12 BOM Quantity
        row.push(`<td title="BOM Quantity">${deviceData.qty}</td>`);
        // 13 PO Quantity
        row.push(`<td title="PO Quantity">${deviceData.poqty}</td>`);
        // 14 Confirm Quantity
        row.push(`<td title="Confirm Quantity">${deviceData.cfqty}</td>`);
        // 15 Real Quantity
        row.push(`<td title="Real Quantity">${deviceData.realqty}</td>`);
        // 16 Unit
        row.push(`<td>${deviceData.unit}</td>`);
        // 17 Lead Time
        row.push(`<td>${deviceData.leadtime}</td>`);
        // 18 Type
        switch (item.Type) {
            case "S":
            case "Static": {
                row.push(`<td class="py-0">
                                <span class="text-success fw-bold">Static</span>
                                </br>
                                <span class="text-${item.isConsign ? "warning" : "primary"} fw-bold" style="font-size: 10px;">${item.isConsign ? "Consign" : "Normal"}</span>
                            </td>`);
                break;
            }
            case "D":
            case "Dynamic": {
                row.push(`<td class="py-0">
                                <span class="text-info fw-bold">Dynamic</span>
                                </br>
                                <span class="text-${item.isConsign ? "warning" : "primary"} fw-bold" style="font-size: 10px;">${item.isConsign ? "Consign" : "Normal"}</span>
                            </td>`);
                break;
            }
            case "Fixture": {
                row.push(`<td class="py-0">
                                <span class="text-primary fw-bold">Fixture</span>
                                </br>
                                <span class="text-${item.isConsign ? "warning" : "primary"} fw-bold" style="font-size: 10px;">${item.isConsign ? "Consign" : "Normal"}</span>
                            </td>`);
                break;
            }
            default: {
                row.push(`<td class="py-0">
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
                row.push(`<td>NA</td>`);
                break;
            }
        }
        // 20 Action
        row.push(`<td class="order-action d-flex text-center justify-content-center">
                        <a href="javascript:;" class="text-info bg-light-info border-0"       title="${i18next.t('device.management.details')}" data-id="${item.Id}" onclick="Details(this, event)"><i class="fa-regular fa-circle-info"></i></a>
                        <a href="javascript:;" class="text-warning bg-light-warning border-0" title="${i18next.t('device.management.edit')}   " data-id="${item.Id}" onclick="Edit(this, event)   "><i class="fa-duotone fa-pen"></i></a>
                        <a href="javascript:;" class="text-danger  bg-light-danger  border-0" title="${i18next.t('device.management.delete')} " data-id="${item.Id}" onclick="Delete(this, event) "><i class="fa-duotone fa-trash"></i></a>
                    </td>`);
        // 21 IsConsign (Hidden)
        row.push(`<td>${deviceData.isconsign}</td>`);
        // 22 AltPN
        row.push(`<td>${deviceData.AltPN}</td>`);
    }
    return row;
}
function CreateImages_Update(images) {
    $('#images-edit-container').closest('.card-body').height($('#images-edit-container').closest('.col-4').prev().find('.card-body').height());

    $('#images-edit-container .carousel-indicators').empty();
    $('#images-edit-container .carousel-inner').empty();
    $('#images').empty();

    if (images.length == 0) {
        $('#images-edit-container').hide();
        InitViewer();
        return;
    }

    $.each(images, function (k, file) {
        var src = file.replace(/^.*\\Data/, "/Data");
        // CarouselSlides
        var CarouselSlides = $('#images-edit-container .carousel-indicators');
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
        $('#images-edit-container .carousel-indicators').append(SlideItem);
        $('#images-edit-container .carousel-inner').append(CarouselItem);

        // Galley
        var GalleyItem = $(`<li><img src="${src}"></li>`);
        $('#images').append(GalleyItem);

    });

    InitViewer();

    $('#images-edit-container').show();
}

// POST
function UpdateImage(deviceid) {

    var formData = new FormData();

    formData.append('deviceid', deviceid);
    selectedFiles.forEach(function (file) {
        formData.append('files', file);
    });

    $.ajax({
        type: "POST",
        url: "/NVIDIA/DeviceManagement/UpdateImage",
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

// EVENT
$('#button-save_modal').on('click', function (e) {
    e.preventDefault();

    var formData = GetModalData();
    var Index = tableDeviceInfo.row(`[data-id="${$('#device_edit-DeviceId').val()}"]`).index();

    $.ajax({
        type: "POST",
        url: "/NVIDIA/DeviceManagement/UpdateDevice",
        data: formData,
        dataType: "json",
        processData: false,
        contentType: false,
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
            Swal.fire(i18next.t('global.swal_title'), GetAjaxErrorMessage(error), "error");
        }
    });
});
$('#add-image').click(function () {
    var selectFile = $('<input type="file" accept="image/*" multiple/>');

    selectFile.change(function () {
        selectedFiles = Array.from(selectFile[0].files);
        var deviceid = $('#add-image').data('deviceid');

        UpdateImage(deviceid);
    });

    selectFile.click();
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
var selectedFiles = [];
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
$('#device_edit-WareHouse').on('change', function (e) {
    e.preventDefault();
    GetWarehouseLayouts($(this).val());
})

async function LayoutOption() {
    var html = '';
    await $.each(WarehouseLayouts, function (k, item) {
        var option = `<option value="${item.Id}">${item.Line}${item.Floor ? ' - ' + item.Floor : ''}${item.Cell ? ' - ' + item.Cell : ''}</option>`;
        html += option;
    });
    return html;
}

