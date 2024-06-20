$(document).ready(function () {
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
                var exports = response.exports;
                var warehouses = response.warehouses;

                FillDetailsDeviceData(device);
                CreateTableLayout(device, warehouses);

                $('#device_details-modal').modal('show');

                setTimeout(() => {
                    InitHistoryTable();
                    CreateTableHistory(Id, borrows, returns, exports);

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
    $('#device_details-RealQty').val(data.SysQuantity);
    $('#device_details-POQty').val(data.POQty ? data.POQty : 0);
    $('#device_details-MOQ').val(data.MOQ ? data.MOQ : 0);

    $('#device_details-NG_Qty').val(data.NG_Qty ? data.NG_Qty : 0);


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

    $('#device_details-Owner').val(data.DeviceOwner ? data.DeviceOwner : '');

    $('#device_details-MinQty').val(data.MinQty ? data.MinQty : '');

}
function CreateTableLayout(device, warehouses) {
    $('#device_details-layout-tbody').empty();

    if (device.DeviceWarehouseLayouts.length > 0) {
        $('#device-details-layout').show();
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
    else {
        $('#device-details-layout').hide();
    }    
}

var device_history;
function InitHistoryTable() {
    if (device_history == null) {
        const options = {
            scrollY: 400,
            scrollX: true,
            order: [3, 'desc'],
            autoWidth: false,
            deferRender: true,
            columnDefs: [
                { targets: "_all", orderable: false },              
                { targets: [2, 5, 6, 8, 9], className: 'text-center' },
                { targets: [0], visible: false },
            ],
            createdRow: function (row, data, dataIndex) {
                if (window.location.pathname.includes('DeviceManagement')) {
                    $(row).addClass('cursor-pointer align-middle');
                    $(row).data('code', data[1]);
                }    
            },
        };
        device_history = $('#device_details-history').DataTable(options);
    }
    else {
        device_history.clear();
    }
    
}
function CreateTableHistory(IdDevice, borrows, returns, exports) {
    device_history.clear();

    var RowDatas = [];
    $('#device-details-history').show();

    $.each(borrows, function (k, request) {
        if (request.Status == 'Rejected') return;
        RowDatas.push(CreateHistoryTableRow(IdDevice, request, "Borrow"));  
    });
    $.each(returns, function (k, request) {
        if (request.Status == 'Rejected') return;
        RowDatas.push(CreateHistoryTableRow(IdDevice, request, "Return"));
    });
    $.each(exports, function (k, request) {
        if (request.Status == 'Rejected') return;
        RowDatas.push(CreateHistoryTableRow(IdDevice, request, "Export"));
    });

    if (RowDatas.length > 0) {
        device_history.rows.add(RowDatas);
        device_history.columns.adjust().draw();
    }
    else {
        $('#device-details-history').hide();
    }
    
}
function CreateHistoryTableRow(IdDevice, request, type) {
    switch (type) {
        case "Borrow": {
            return row = [
                request.Id,
                `B-${moment(request.DateBorrow).format('YYYYMMDDHHmm')}-${request.Id}`,
                GetDeviceRequestType(request),
                moment(request.DateBorrow).format('YYYY-MM-DD HH:mm'),
                CreateUserName(request.User),
                GetQuantityDeviceInBorrow(IdDevice, request.BorrowDevices),
                GetDeviceRequestStatus(request),
                request.Note ? request.Note : '',
                '',
                ''
            ]           
        }
        case "Return": {
            return row = [
                request.Id,
                `R-${moment(request.DateReturn).format('YYYYMMDDHHmm')}-${request.Id}`,
                GetDeviceRequestType(request),
                moment(request.DateReturn).format('YYYY-MM-DD HH:mm'),
                CreateUserName(request.User),
                GetQuantityDeviceInReturn(IdDevice, request.ReturnDevices),
                GetDeviceRequestStatus(request),
                request.Note ? request.Note : '',
                request.IsNG ? '<i class="fa-duotone fa-check text-success"></i>' : '<i class="fa-solid fa-xmark text-danger"></i>',
                request.IsSwap ? '<i class="fa-duotone fa-check text-success"></i>' : '<i class="fa-solid fa-xmark text-danger"></i>'
            ]
        }
        case "Export": {
            return row = [
                request.Id,
                `E-${moment(request.CreatedDate).format('YYYYMMDDHHmm')}-${request.Id}`,
                GetDeviceRequestType(request),
                moment(request.CreatedDate).format('YYYY-MM-DD HH:mm'),
                CreateUserName(request.User),
                GetQuantityDeviceInExport(IdDevice, request.ExportDevices),
                GetDeviceRequestStatus(request),
                request.Note ? request.Note : '',
                '',
                '',
            ]
            break;
        }
    }
}
$('#device_details-history tbody').on('dblclick', 'tr', function (event) {
    var IdData = $(this).data('code').split('-');

    var IdRequest = IdData[2];
    var Type = IdData[0];

    switch (Type) {
        case 'B': {
            RequestDetails(IdRequest);
            break;
        }
        case 'R': {
            ReturnDetails(IdRequest);
            break;
        }
        case 'E': {
            ExportDetails(IdRequest);
            break;
        }
    }
});



function GetDeviceRequestType(request) {
    switch (request.Type) {
        case "Borrow": {
            return (`<span class="badge bg-primary"><i class="fa-solid fa-arrow-up-from-square"></i> Borrow</span>`);
        }
        case "Take": {
            return (`<span class="badge bg-secondary"><i class="fa-solid fa-arrow-up-from-square"></i> Take</span>`);
        }
        case "Return": {
            return (`<span class="badge bg-info"><i class="fa-solid fa-arrow-down-to-square"></i> Return</span>`);
        }
        case "Return NG": {
            return (`<span class="badge bg-danger"><i class="fa-solid fa-arrows-turn-to-dots"></i> Return NG</span>`);
        }
        case "Shipping": {
            return (`<span class="badge bg-success"><i class="fa-solid fa-arrow-up-right-dots"></i> Shipping</span>`);
        }
        default: {
            return (`<span class="fw-bold">NA</span></td>`);
        }
    }
}
function GetDeviceRequestStatus(request) {
    switch (request.Status) {
        case "Pending": {
            return (`<td><span class="badge bg-warning"><i class="fa-solid fa-timer"></i> Pending</span></td>`);
        }
        case "Approved": {
            return (`<td><span class="badge bg-success"><i class="fa-solid fa-check"></i> Approved</span></td>`);
        }
    }
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
function GetQuantityDeviceInExport(IdDevice, ExportDevices) {
    var quantity = 0;
    $.each(ExportDevices, function (k, item) {
        if (item.IdDevice == IdDevice) {
            quantity = item.ExportQuantity;
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
        var src = file.replace(/^.*\\Data/, "/Data").replace(/^.*\\\\server\\Storage/, "/Data");
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