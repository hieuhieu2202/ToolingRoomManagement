function DeviceUpdate(elm, e) {
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

                setTimeout(() => {
                    CreateImages_Update(response.images);
                }, 300);
                
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
async function FillEditDeviceData(data) {
    $('#device_edit-DeviceId').val(data.device.Id);

    // basic
    $('#device_edit-DeviceCode').val(data.device.DeviceCode != null ? data.device.DeviceCode : "");
    $('#device_edit-DeviceName').val(data.device.DeviceName);
    $('#device_edit-Specification').val(data.device.Specification);
    $('#device_edit-Status').val(data.device.Status).trigger('change');
    var type = "";
    if (data.device.Type == "S") data.device.Type = "Static";
    if (data.device.Type == "D") data.device.Type = "Dynamic";
    if (data.device.Type == "Consign") data.device.Type = "NA";
    if (data.device.isConsign == true) {
        type = "consign_" + data.device.Type;
    }
    else {
        type = "normal_" + data.device.Type;
    }
    $('#device_edit-Type').val(type).trigger('change');
    $('#device_edit-DeviceDate').val(moment(data.device.DeviceDate).format('YYYY-MM-DD HH:mm'));
    if (data.device.DeliveryTime) {
        var temp = data.device.DeliveryTime.split(' ');
        $('#device_edit-DeliveryTime1').val(temp[0]);

        var selectVal = '';
        for (let i = 1; i < temp.length; i++) {
            selectVal += ' ' + temp[i];
        }
        $('#device_edit-DeliveryTime2').val(selectVal.trim());
    }
    // details
    $('#device_edit-WareHouse').val(data.device.IdWareHouse).trigger('change');
    $('#device_edit-Buffer').val(data.device.Buffer * 100);
    $('#device_edit-Quantity').val(data.device.Quantity);
    $('#device_edit-POQty').val(data.device.POQty ? data.device.POQty : 0);
    $('#device_edit-Unit').val(data.device.Unit);

    $('#device_edit-Relation').val(data.device.Relation);
    $('#device_edit-LifeCycle').val(data.device.LifeCycle);
    $('#device_edit-QtyConfirm').val(data.device.QtyConfirm);
    $('#device_edit-RealQty').val(data.device.RealQty);
    $('#device_edit-MinQty').val(data.device.MinQty);

    $('#device_edit-Product').val(data.device.Product ? data.device.Product.ProductName : '');
    $('#device_edit-Model').val(data.device.Model ? data.device.Model.ModelName : '');
    $('#device_edit-Station').val(data.device.Station ? data.device.Station.StationName : '');
    $('#device_edit-Group').val(data.device.Group ? data.device.Group.GroupName : '');
    $('#device_edit-Vendor').val(data.device.Vendor ? data.device.Vendor.VendorName : '');

    $('#add-image').data('deviceid', data.device.Id);

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
                            <span class="col-2 input-group-text">${i18next.t('device.management.layout')} ${k + 1} </span>
                        </div>`);
        inputGroup.append(selectLayout);
        inputGroup.append(deleteButton)

        $('#layout-container').append(inputGroup);
    });
}
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

    formData.append('Relation', $('#device_edit-Relation').val());
    formData.append('LifeCycle', $('#device_edit-LifeCycle').val());
    formData.append('QtyConfirm', $('#device_edit-QtyConfirm').val());
    formData.append('RealQty', $('#device_edit-RealQty').val());
    formData.append('MinQty', $('#device_edit-MinQty').val());
    

    formData.append('Product', $('#device_edit-Product').val());
    formData.append('Model', $('#device_edit-Model').val());
    formData.append('Station', $('#device_edit-Station').val());
    formData.append('Group', $('#device_edit-Group').val());
    formData.append('Vendor', $('#device_edit-Vendor').val());

    // layout
    $('#layout-container option:selected').map(function () {
        formData.append('Layout', $(this).val());
    });

    return formData;
}


function DrawRowEditDevice(item) {
    var row = [];
    // 0 ID
    row.push(`<td>${item.Id}</td>`);
    // 1 MTS
    row.push(`<td>${(item.Product) ? item.Product.MTS ? item.Product.MTS : "NA" : "NA"}</td>`);
    // 2 Product Name
    row.push(`<td title="${(item.Product) ? item.Product.ProductName : ""}">${(item.Product) ? item.Product.ProductName : ""}</td>`);
    // 3 Model
    row.push(`<td>${(item.Model) ? item.Model.ModelName : ""}</td>`);
    // 4 Station
    row.push(`<td>${(item.Station) ? item.Station.StationName : ""}</td>`);
    // 5 DeviceCode - PN
    row.push(`<td>${item.DeviceCode != "null" ? item.DeviceCode : "NA"}</td>`);
    // 6 DeviceName
    row.push(`<td title="${item.DeviceName}">${item.DeviceName}</td>`);
    // 7 Group
    row.push(`<td>${(item.Group) ? item.Group.GroupName : ""}</td>`);
    // 8 Vendor
    row.push(`<td title="${(item.Vendor) ? item.Vendor.VendorName : ""}">${(item.Vendor) ? item.Vendor.VendorName : ""}</td>`);
    // 9 Specification
    row.push(`<td title="${item.Specification}">${(item.Specification) ? item.Specification : ""}</td>`);
    // 10 Location 
    var html = ''
    var title = ''
    $.each(item.DeviceWarehouseLayouts, function (k, sss) {
        var layout = sss.WarehouseLayout;
        html += `<lable>${layout.Line}${layout.Cell ? ' - ' + layout.Cell : ''}${layout.Floor ? ' - ' + layout.Floor : ''}</lable>`;
        title += `[${layout.Line}${layout.Cell ? ' - ' + layout.Cell : ''}${layout.Floor ? ' - ' + layout.Floor : ''}],`;
    });
    row.push(`<td title="${title}">${html == '' ? 'NA' : html}</td>`);
    // 11 Buffer
    row.push(`<td title="${item.Buffer}">${item.Buffer * 100}%</td>`);
    // 12 BOM Quantity
    row.push(`<td title="BOM Quantity">${item.Quantity ? item.Quantity : 0}</td>`);
    // 13 PO Quantity
    row.push(`<td title="PO Quantity">${item.POQty ? item.POQty : 0}</td>`);
    // 14 Confirm Quantity
    row.push(`<td title="Confirm Quantity">${item.QtyConfirm ? item.QtyConfirm : 0}</td>`);
    // 15 Real Quantity
    row.push(`<td title="Real Quantity">${item.RealQty ? item.RealQty : 0}</td>`);
    // 16 Unit
    row.push(`<td>${item.Unit ? item.Unit : ''}</td>`);
    // 17 Lead Time
    var LeadTime = (item.DeliveryTime.charAt(0) == ' ' || item.DeliveryTime.charAt(0) == '0') ? 'NA' : item.DeliveryTime;
    if (item.Type == 'Consign') LeadTime = 'NA';
    row.push(`<td>${LeadTime}</td>`);
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
                        <a href="javascript:;" class="text-warning bg-light-warning border-0" title="${i18next.t('device.management.edit')}" data-id="${item.Id}" onclick="Edit(this, event)   "><i class="fa-duotone fa-pen"></i></a>
                        <a href="javascript:;" class="text-danger  bg-light-danger  border-0" title="${i18next.t('device.management.delete')}" data-id="${item.Id}" onclick="Delete(this, event) "><i class="fa-duotone fa-trash"></i></a>
                    </td>`);
    // 21 isConsign (Hidden)
    row.push(`<td>${item.isConsign ? "consign" : "normal"} </td>`);
    return row;
}

// Image
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