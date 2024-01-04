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
                var borrows = response.borrows;
                var returns = response.returns;
                var warehouses = response.warehouses;

                FillDetailsDeviceData(device);
                CreateTableLayout(device, warehouses);
                CreateTableHistory(Id, borrows, returns);
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

    $('#device_details-CreatedDate').val(moment(data.CreatedDate).format('YYYY-MM-DD HH:mm'));
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
    $('#device_details-WareHouse').val(data.Warehouse.WarehouseName);
    $('#device_details-Group').val(data.Group ? data.Group.GroupName : '');
    $('#device_details-Vendor').val(data.Vendor ? data.Vendor.VendorName : '');

    $('#device_details-Unit').val(data.Unit ? data.Unit : '');
    $('#device_details-DeliveryTime').val(data.DeliveryTime ? data.DeliveryTime : '');

    $('#device_details-AltPN').val(data.AlternativeDevices.length > 0 ? data.AlternativeDevices[0].PNs : '');

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
function CreateTableHistory(IdDevice, borrows, returns) {
    $('#device_details-history-tbody').empty();
    $.each(borrows, function (k, item) {
        if (item.Status == 'Rejected') return;

        var tr = $(`<tr class="align-middle hover-tr text-center" data-id="${item.Id}" IsBorrow style="cursor: pointer;"></tr>`);
        tr.append($(`<td class="text-start">B-${moment(item.DateBorrow).format('YYYYMMDDHHmm')}-${item.Id}</td>`));

        switch (item.Type) {
            case "Borrow": {
                tr.append(`<td><span class="badge bg-primary"><i class="fa-solid fa-left-to-line"></i> Borrow</span></td>`);
                break;
            }
            case "Take": {
                tr.append(`<td><span class="badge bg-secondary"><i class="fa-regular fa-inbox-full"></i> Take</span></td>`);
                break;
            }
            case "Return": {
                tr.append(`<td><span class="badge bg-info"><i class="fa-regular fa-rotate-left"></i> Return</span></td>`);
                break;
            }
        }

        tr.append($(`<td>${moment(item.DateBorrow).format('YYYY-MM-DD HH:mm')}</td>`));

        tr.append($(`<td>${CreateUserName(item.User)}</td>`));

        tr.append($(`<td>${GetQuantityDeviceInBorrow(IdDevice, item.BorrowDevices)}</td>`));

        switch (item.Status) {
            case "Pending": {
                tr.append(`<td><span class="badge bg-warning"><i class="fa-solid fa-timer"></i> Pending</span></td>`);
                break;
            }
            case "Approved": {
                tr.append(`<td><span class="badge bg-success"><i class="fa-solid fa-check"></i> Approved</span></td>`);
                break;
            }
        }


        tr.append($(`<td class="text-start">${item.Note ? item.Note : ''}</td>`));

        tr.append($(`<td></td>`));
        tr.append($(`<td></td>`));

        $('#device_details-history-tbody').append(tr);

        //tr.dblclick(function (e) {
        //    try {
        //        BorrowDetails($(this).data('id'));
        //    } catch { console.log("Sự kiện show chi tiết đơn không được hiển thị ở đây.") }
            
        //});
    });

    $.each(returns, function (k, item) {
        if (item.Status == 'Rejected') return;

        var tr = $(`<tr class="align-middle hover-tr text-center" data-id="${item.Id}" IsReturn style="cursor: pointer;"></tr>`);
        tr.append($(`<td class="text-start">R-${moment(item.DateReturn).format('YYYYMMDDHHmm')}-${item.Id}</td>`));

       
        tr.append($(`<td><span class="badge bg-info"><i class="fa-solid fa-right-to-line"></i> Return</span></td>`));
        tr.append($(`<td>${moment(item.DateReturn).format('YYYY-MM-DD HH:mm')}</td>`));

        tr.append($(`<td>${CreateUserName(item.User)}</td>`));

        tr.append($(`<td>${GetQuantityDeviceInReturn(IdDevice, item.ReturnDevices)}</td>`));

        switch (item.Status) {
            case "Pending": {
                tr.append(`<td><span class="badge bg-warning"><i class="fa-solid fa-timer"></i> Pending</span></td>`);
                break;
            }
            case "Approved": {
                tr.append(`<td><span class="badge bg-success"><i class="fa-solid fa-check"></i> Approved</span></td>`);
                break;
            }
        }

        tr.append($(`<td class="text-start">${item.Note ? item.Note : ''}</td>`));

        tr.append($(`<td>${item.IsNG ? '<i class="fa-duotone fa-check text-success"></i>' : '<i class="fa-solid fa-xmark text-danger"></i>'}</td>`));
        tr.append($(`<td>${item.IsSwap ? '<i class="fa-duotone fa-check text-success"></i>' : '<i class="fa-solid fa-xmark text-danger"></i>'}</td>`));

        $('#device_details-history-tbody').append(tr);

        //tr.dblclick(function (e) {
        //    try {
        //        ReturnDetails($(this).data('id'));
        //    } catch { console.log("Sự kiện show chi tiết đơn không được hiển thị ở đây.") }

        //});
    });

    var rows = $('#device_details-history-tbody tr').toArray();

    // Sắp xếp mảng dựa trên giá trị của cột "Date Borrow/Return"
    rows.sort(function (a, b) {
        var dateA = new Date($(a).find('td:eq(2)').text());
        var dateB = new Date($(b).find('td:eq(2)').text());
        return dateB - dateA;
    });

    // Xóa tất cả các dòng trong tbody
    $('#device_details-history-tbody').empty();

    // Thêm lại các dòng đã sắp xếp vào tbody
    $.each(rows, function (index, row) {
        $(row).dblclick(function (e) {
            if ($(row).is('[IsBorrow]')) {
                RequestDetails($(this).data('id'), false);
            }
            else {
                ReturnDetails($(this).data('id'), false);
            }
        });
        $('#device_details-history-tbody').append($(row));
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
function GetQuantityDeviceInReturn(IdDevice, ReturnDevices) {
    var quantity = 0;
    $.each(ReturnDevices, function (k, item) {
        if (item.IdDevice == IdDevice) {
            quantity = item.ReturnQuantity;
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