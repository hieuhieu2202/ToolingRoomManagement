$(function () {
    $('.carousel').carousel();
});

function GetDeviceDetails(Id) {
    $.ajax({
        type: "POST",
        url: "/NVIDIA/DeviceManagement/GetDevice",
        data: JSON.stringify({ Id: Id }),
        dataType: "json",
        contentType: "application/json;charset=utf-8",
        success: function (response) {
            if (response.status) {
                var device = response.device;
                var borrows = JSON.parse(response.borrows);
                var warehouses = response.warehouses;

                FillDetailsDeviceData(device);
                CreateTableLayout(device, warehouses);
                CreateTableHistory(Id, borrows);
                $('#device_details-modal').modal('show');

                setTimeout(() => {
                    CreateImages(response.images);
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
async function FillDetailsDeviceData(data) {
    $('#device_details-DeviceCode').val(data.DeviceCode != "null" ? data.DeviceCode : "NA");
    $('#device_details-DeviceName').val(data.DeviceName);
    $('#device_details-Specification').val(data.Specification);

    $('#device_details-DeviceDate').val(moment(data.DeviceDate).format('YYYY-MM-DD HH:mm'));
    $('#device_details-Relation').val(data.Relation);
    $('#device_details-Buffer').val((data.Buffer * 100));
    $('#device_details-LifeCycle').val(data.LifeCycle);
    $('#device_details-Forcast').val(data.Forcast);
    $('#device_details-Quantity').val(data.Quantity);
    $('#device_details-QtyConfirm').val(data.QtyConfirm);
    $('#device_details-RealQty').val(data.RealQty);
    $('#device_details-POQty').val(data.POQty ? data.POQty : 0);
    $('#device_details-MOQ').val(data.MOQ ? data.MOQ : 0);


    $('#device_details-Type').val(data.Type == 'S' ? 'Static' : data.Type == 'D' ? 'Dynamic' : data.Type);
    $('#device_details-Status').val(data.Status);
    $('#device_details-Product').val(data.Product ? data.Product.ProductName : '');
    $('#device_details-Model').val(data.Model ? data.Model.ModelName : '');
    $('#device_details-Station').val(data.Station ? data.Station.StationName : '');
    $('#device_details-WareHouse').val($('#input_WareHouse option:selected').text());
    $('#device_details-Group').val(data.Group ? data.Group.GroupName : '');
    $('#device_details-Vendor').val(data.Vendor ? data.Vendor.VendorName : '');

    $('#device_details-Unit').val(data.Unit ? data.Unit : '');
    $('#device_details-DeliveryTime').val(data.DeliveryTime ? data.DeliveryTime : '');

    $('#device_details-MinQty').val(data.MinQty ? data.MinQty : '');

}
function CreateTableLayout(device, warehouses) {
    $('#device_details-layout-tbody').empty();
    $.each(device.DeviceWarehouseLayouts, function (k, item) {
        var warehouse = warehouses[k];
        var layout = item.WarehouseLayout;

        var tr = $('<tr></tr>');
        tr.append($(`<td>${warehouse.Factory ? warehouse.Factory : ""}</td>`));
        tr.append($(`<td>${warehouse.Floors ? warehouse.Floors : ""}</td>`));
        tr.append($(`<td>${CreateUserName(warehouse.UserManager)}</td>`));
        tr.append($(`<td>${warehouse.WarehouseName ? warehouse.WarehouseName : ""}</td>`));
        tr.append($(`<td>${layout.Line ? layout.Line : ""}</td>`));
        tr.append($(`<td>${layout.Cell ? layout.Cell : ""}</td>`));
        tr.append($(`<td>${layout.Floor ? layout.Floor : ""}</td>`));

        $('#device_details-layout-tbody').append(tr);
    });
}
function CreateTableHistory(IdDevice, borrows) {
    $('#device_details-history-tbody').empty();
    $.each(borrows, function (k, item) {
        if (item.Status == 'Rejected') return;

        var tr = $(`<tr class="align-middle hover-tr" data-id="${item.Id}" style="cursor: pointer;"></tr>`);
        tr.append($(`<td>${moment(item.DateBorrow).format('YYYYMMDDHHmm')}-${item.Id}</td>`));
        tr.append($(`<td>${item.Type}</td>`));
        tr.append($(`<td>${moment(item.DateBorrow).format('YYYY-MM-DD HH:mm')}</td>`));

        var dateReturn = moment(item.DateReturn).format('YYYY-MM-DD HH:mm');
        tr.append($(`<td>${dateReturn != 'Invalid date' ? dateReturn : ""}</td>`));

        tr.append($(`<td>${CreateUserName(item.User)}</td>`));
        tr.append($(`<td>${item.Model ? item.Model.ModelName ? item.Model.ModelName : '' : ''}</td>`));
        tr.append($(`<td>${item.Station ? item.Station.StationName ? item.Station.StationName : '' : ''}</td>`));

        tr.append($(`<td>${GetQuantityDeviceInBorrow(IdDevice, item.BorrowDevices)}</td>`));

        tr.append($(`<td>${item.Status}</td>`));
        tr.append($(`<td style="max-width: 200px;">${item.Note}</td>`));

        $('#device_details-history-tbody').append(tr);

        tr.dblclick(function (e) {
            try {
                BorrowDetails($(this).data('id'));
            } catch { console.log("Sự kiện show chi tiết đơn không được hiển thị ở đây.") }
            
        });
    });
}
function GetQuantityDeviceInBorrow(IdDevice, BorrowDevices) {
    var quantity = 0;
    $.each(BorrowDevices, function (k, item) {
        if (item.IdDevice == IdDevice) {
            quantity = item.BorrowQuantity;
            return false;
        }
    });
    return quantity;
}

// Image
function CreateImages(images) {
    $('#images-details-container').closest('.card-body').height($('#images-details-container').closest('.col-4').prev().find('.card-body').height());

    $('#images-details-container .carousel-indicators').empty();
    $('#images-details-container .carousel-inner').empty();
    $('#images').empty();

    if (images.length == 0) {
        $('#images-details-container').hide();
        return;
    }

    $.each(images, function (k, file) {
        var src = file.replace(/^.*\\Data/, "/Data");
        // CarouselSlides
        var CarouselSlides = $('#images-details-container .carousel-indicators');
        var SlideItem = $(`<li data-bs-target="#carousel" data-bs-slide-to="${k}"></li>`);

        //CarouselItem
        var CarouselItem = $(`<div class="carousel-item"><img class="d-block w-100" src=""></div>`);
        var img = $(`<img class="d-block w-100" src="${src}">`);
        img.click(() => { viewPreview.show() });
        CarouselItem.append(img);

        // Carousel First check
        if (CarouselSlides.find('li').length == 0) {
            SlideItem.addClass('active');
            CarouselItem.addClass('active');
        }

        // Append Carousel
        $('#images-details-container .carousel-indicators').append(SlideItem);
        $('#images-details-container .carousel-inner').append(CarouselItem);

        // Galley
        var GalleyItem = $(`<li><img src="${src}"></li>`);
        $('#images').append(GalleyItem);

    });

    InitViewer();

    $('#images-details-container').show();
}
$('a[data-slide="prev"]').click(function () {
    $('.carousel').carousel('prev');
});
$('a[data-slide="next"]').click(function () {
    $('.carousel').carousel('next');
});

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