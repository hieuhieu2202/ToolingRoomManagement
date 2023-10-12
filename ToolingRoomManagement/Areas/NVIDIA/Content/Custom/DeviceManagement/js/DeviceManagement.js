$(function () {
    GetSelectData();
});

// table
var tableDeviceInfo;
async function CreateTableAddDevice(devices) {
    if (tableDeviceInfo) tableDeviceInfo.destroy();

    $('#table_Devices_tbody').html('');
    await $.each(devices, async function (no, item) {

        var row = $(`<tr class="align-middle" data-id="${item.Id}" title="Double-click to view device details."></tr>`);

        // 0 MTS
        row.append(`<td>${item.Id}</td>`);
        // 1 Product Name
        row.append(`<td title="${(item.Product) ? item.Product.ProductName : ""}">${(item.Product) ? item.Product.ProductName : ""}</td>`);
        // 2 Model
        row.append(`<td>${(item.Model) ? item.Model.ModelName : ""}</td>`);
        // 3 Station
        row.append(`<td>${(item.Station) ? item.Station.StationName : ""}</td>`);
        // 4 DeviceCode - PN
        row.append(`<td data-id="${item.Id}" data-code="${item.DeviceCode}" title="${item.DeviceCode}">${item.DeviceCode}</td>`);
        // 5 DeviceName
        row.append(`<td title="${item.DeviceName}">${item.DeviceName}</td>`);
        // 6 Group
        row.append(`<td>${(item.Group) ? item.Group.GroupName : ""}</td>`);
        // 7 Vendor
        row.append(`<td title="${(item.Vendor) ? item.Vendor.VendorName : ""}">${(item.Vendor) ? item.Vendor.VendorName : ""}</td>`);
        // 8 Specification
        row.append(`<td title="${item.Specification}">${(item.Specification) ? item.Specification : ""}</td>`);
        // 9 Location 
        var html = ''
        var title = ''
        $.each(item.DeviceWarehouseLayouts, function (k, sss) {
            var layout = sss.WarehouseLayout;
            html += `<lable>${layout.Line}${layout.Cell ? ' - ' + layout.Cell : ''}${layout.Floor ? ' - ' + layout.Floor : ''}</lable>`;
            title += `[${layout.Line}${layout.Cell ? ' - ' + layout.Cell : ''}${layout.Floor ? ' - ' + layout.Floor : ''}],`;
        });
        row.append(`<td title="${title}">${html}</td>`);
        // 10 Buffer
        row.append(`<td title="${item.Buffer}">${item.Buffer * 100}%</td>`);
        // 11 Quantity
        row.append(`<td title="(Quantity / Quantity Confirm / Real Quantity) [Borrowed: ${item.QtyConfirm - item.RealQty}]">${item.Quantity} / ${item.QtyConfirm} / <span class="fw-bold text-info">${item.RealQty}</span></td>`);
        // 12 Unit
        row.append(`<td>${item.Unit ? item.Unit : ''}</td>`);
        // 13 Unit
        row.append(`<td>${item.DeliveryTime ? item.DeliveryTime : ''}</td>`);
        // 14 Type
        switch (item.Type) {
            case "S": {
                row.append(`<td><span class="text-success fw-bold">Static</span></td>`);
                break;
            }
            case "D": {
                row.append(`<td><span class="text-info fw-bold">Dynamic</span></td>`);
                break;
            }
            case "Consign": {
                row.append(`<td><span class="text-warning fw-bold">Consign</span></td>`);
                break;
            }
            case "Fixture": {
                row.append(`<td><span class="text-primary fw-bold">Fixture</span></td>`);
                break;
            }
            default: {
                row.append(`<td><span class="text-secondary fw-bold">N/A</span></td>`);
                break;
            }
        }
        // 15 Status
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
                row.append(`<td>N/A</td>`);
                break;
            }
        }
        // 16 Action
        row.append(`<td class="order-action d-flex text-center justify-content-center">
                        <a href="javascript:;" class="text-info bg-light-info border-0" title="Details" data-id="${item.Id}" onclick="Details(this, event)"><i class="fa-regular fa-circle-info"></i></a>
                        <a href="javascript:;" class="text-warning bg-light-warning border-0" title="Edit   " data-id="${item.Id}" onclick="Edit(this, event)   "><i class="fa-duotone fa-pen"></i></a>
                        <a href="javascript:;" class="text-danger  bg-light-danger  border-0" title="Delete " data-id="${item.Id}" onclick="Delete(this, event) "><i class="fa-duotone fa-trash"></i></a>
                    </td>`);

        $('#table_Devices_tbody').append(row);
    });

    const options = {
        scrollY: 500,
        scrollX: true,
        order: [],
        autoWidth: false,
        columnDefs: [
            { targets: [4, 14], orderable: true },
            { targets: "_all", orderable: false },
            { targets: [9, 10, 11, 15, 16], className: "text-center" },
            { targets: [15], className: "text-center", width: '120px' },
            { targets: [0, 1, 2, 3, 6, 7], visible: false },
        ],
        "lengthMenu": [[10, 15, 25, 50, -1], [10, 15, 25, 50, "All"]],
        dom: "<'row'<'col-sm-12 col-md-1'B><'col-sm-12 col-md-2'l><'col-sm-12 col-md-9'f>>" +
            "<'row'<'col-sm-12'tr>>" +
            "<'row'<'col-sm-12 col-md-7'i><'col-sm-12 col-md-5'p>>",
        buttons: [{
            extend: 'excelHtml5',
        }]
    };
    tableDeviceInfo = $('#table_Devices').DataTable(options);
    tableDeviceInfo.columns.adjust();
};

// get data device
var ListDevices;
function GetWarehouseDevices(IdWarehouse = 0) {
    Pace.track(function () {
        $.ajax({
            url: "/NVIDIA/DeviceManagement/GetWarehouseDevices",
            data: JSON.stringify({ IdWarehouse, PageNum: 1 }),
            type: "POST",
            dataType: "json",
            contentType: "application/json;charset=utf-8",
            success: async function (response) {
                if (response.status) {
                    var devices = response.warehouse.Devices;

                    if (devices.length == 1000) {
                        var PageNum = 1;

                        var devicesMore = {};
                        while (devicesMore.length != 0) {
                            PageNum++;
                            devicesMore = await _GetWarehouseDevices(IdWarehouse, PageNum);
                            devices.push(...devicesMore);
                        }
                    }
                    ListDevices = devices;
                    CreateTableAddDevice(ListDevices);

                }
                else {
                    Swal.fire('Sorry, something went wrong!', response.message, 'error');
                }
            },
            error: function (error) {
                Swal.fire('Sorry, something went wrong!', GetAjaxErrorMessage(error), 'error');
            },
            complete: function () {
                Pace.stop();
            }
        });
    });
}
function _GetWarehouseDevices(IdWarehouse, PageNum) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: "/NVIDIA/DeviceManagement/GetWarehouseDevices",
            data: JSON.stringify({ IdWarehouse, PageNum }),
            type: "POST",
            dataType: "json",
            contentType: "application/json;charset=utf-8",
            success: function (response) {
                if (response.status) {
                    // Giải quyết Promise với danh sách devices
                    resolve(response.warehouse.Devices);
                } else {
                    // Reject Promise nếu có lỗi
                    reject(response.message);
                }
            },
            error: function (error) {
                // Reject Promise nếu có lỗi
                reject(GetAjaxErrorMessage(error));
            },
            complete: function () {
                // Dừng Pace.js sau khi AJAX request hoàn thành
                Pace.stop();
            }
        });
    });
}

$('#input_WareHouse').on('change', function (e) {
    e.preventDefault();
    GetWarehouseDevices($(this).val());
});


// Show Details
function Details(elm, e) {
    e.preventDefault();
    var Id = $(elm).data('id');
    GetDeviceDetails(Id);
}
$('#table_Devices tbody').on('dblclick', 'tr', function (event) {

    var dataId = $(this).data('id');

    GetDeviceDetails(dataId)
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
async function FillDetailsDeviceData(data) {
    $('#device_details-DeviceId').val(data.Id);
    $('#device_details-DeviceCode').val(data.DeviceCode);
    $('#device_details-DeviceName').val(data.DeviceName);
    $('#device_details-Specification').val(data.Specification);

    $('#device_details-DeviceDate').val(moment(data.DeviceDate).format('YYYY-MM-DD HH:mm'));
    $('#device_details-Relation').val(data.Relation);
    $('#device_details-Buffer').val(data.Buffer);
    $('#device_details-LifeCycle').val(data.LifeCycle);
    $('#device_details-Forcast').val(data.Forcast);
    $('#device_details-Quantity').val(data.Quantity);
    $('#device_details-QtyConfirm').val(data.QtyConfirm);
    $('#device_details-RealQty').val(data.RealQty);
    $('#device_details-AccKit').val(data.ACC_KIT);
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
            BorrowDetails($(this).data('id'));
        });
    });
}


// borrow details
function BorrowDetails(Id) {
    //var Id = $(elm).data('id');

    $.ajax({
        type: "GET",
        url: "/NVIDIA/BorrowManagement/GetBorrow?Id=" + Id,
        dataType: "json",
        contentType: "application/json;charset=utf-8",
        success: function (response) {
            if (response.status) {
                var borrow = JSON.parse(response.borrow);

                CreateModal(borrow);

                $('#borrow_modal').modal('show');
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
function CreateModal(borrow) {
    $('#borrow_modal-CardId').val(borrow.User.Username);
    $('#borrow_modal-Username').val(CreateUserName(borrow.User));

    $('#borrow_modal-Model').val(borrow.Model ? borrow.Model.ModelName ? borrow.Model.ModelName : '' : '');
    $('#borrow_modal-Station').val(borrow.Station ? borrow.Station.StationName ? borrow.Station.StationName : '' : '');

    $('#borrow_modal-BorrowDate').val(moment(borrow.DateBorrow).format('YYYY-MM-DDTHH:mm:ss'));
    $('#borrow_modal-DuaDate').val(moment(borrow.DateDue).format('YYYY-MM-DDTHH:mm:ss'));
    $('#borrow_modal-ReturnDate').val(moment(borrow.DateReturn).format('YYYY-MM-DDTHH:mm:ss'));

    $('#borrow_modal-Note').html(`<p>${borrow.Note}</p>`);

    $('div[checkType]').show();
    $('label[typeName]').html('Date Borrow');
    if (borrow.Type == 'Return') {
        $('#borrow_modal-title').text('Return Request Details');
        $('#borrow_modal-name').text('RETURN REQUEST');
    }
    else if (borrow.Type == 'Take') {
        $('#borrow_modal-title').text('Take Device Request Details');
        $('#borrow_modal-name').text('TAKE DEVICE REQUEST');
        $('div[checkType]').hide();
        $('label[typeName]').html('Date');
    }
    else {
        $('#borrow_modal-title').text('Borrow Request Details');
        $('#borrow_modal-name').text('BORROW REQUEST');
    }

    $('#borrow_modal-table-tbody').empty();
    $.each(borrow.BorrowDevices, function (k, item) {
        var borrowQty = item.BorrowQuantity ? item.BorrowQuantity : '';
        var deviceCode = item.Device.DeviceCode ? item.Device.DeviceCode : '';
        var deviceName = item.Device.DeviceName ? item.Device.DeviceName : '';
        var deviceModel = item.Device.Model ? item.Device.Model.ModelName : '';
        var deviceStation = item.Device.Station ? item.Device.Station.StationName : '';
        var deviceSpecification = item.Device.Specification ? item.Device.Specification : '';
        var deviceUnit = item.Device.deviceUnit ? item.Device.deviceUnit : '';

        var row = $('<tr></tr>');
        row.append(`<td>${deviceCode}</td>`);
        row.append(`<td>${deviceName}</td>`);
        row.append(`<td>${deviceSpecification}</td>`);
        row.append(`<td>${deviceModel}</td>`);
        row.append(`<td>${deviceStation}</td>`);
        row.append(`<td class="text-center">${deviceUnit}</td>`);
        row.append(`<td class="text-center">${borrowQty}</td>`);

        $('#borrow_modal-table-tbody').append(row);
    });

    $('#sign-container').empty();
    $('#sign-container').append(`<h4 class="font-weight-light text-center text-white py-3">SIGN PROCESS</h4>`);
    $.each(borrow.UserBorrowSigns, function (k, bs) { //bs == borrow sign
        var username = CreateUserName(bs.User);
        var date = moment(bs.DateSign).format('YYYY-MM-DD | h:mm A');

        var title = {
            Approved: { color: 'success', text: 'Approved', icon: 'check' },
            Rejected: { color: 'danger', text: 'Rejected', icon: 'xmark' },
            Pending: { color: 'warning', text: 'Pending', icon: 'timer' },
            Waitting: { color: 'secondary', text: 'Waitting', icon: 'circle-pause' },
        }[bs.Status] || { color: 'secondary', text: 'Closed' };

        var line = {
            top: k === 0 ? '' : 'border-end',
            bot: (k === 0 && borrow.UserBorrowSigns.length === 1) ? '' : 'border-end'
        };

        var span = '';
        switch (bs.Type) {
            case "Borrow": {
                span = `<span class="badge bg-primary"><i class="fa-solid fa-left-to-line"></i> Borrow</span>`;
                break;
            }
            case "Take": {
                span = `<span class="badge bg-secondary"><i class="fa-regular fa-inbox-full"></i> Take</span>`;
                break;
            }
            case "Return": {
                span = `<span class="badge bg-info"><i class="fa-solid fa-right-to-line"></i> Return</span>`;
                break;
            }
            default: {
                span = `<td><span class="badge bg-secondary">N/A</span></td>`;
                break;
            }
        }

        var lineDot = `<div class="col-sm-1 text-center flex-column d-none d-sm-flex">
                           <div class="row h-50">
                               <div class="col ${line.top}">&nbsp;</div>
                               <div class="col">&nbsp;</div>
                           </div>
                           <h5 class="m-2 red-dot">
                               <span class="badge rounded-pill bg-${title.color}">&nbsp;</span>
                           </h5>
                           <div class="row h-50">
                               <div class="col ${line.bot}">&nbsp;</div>
                               <div class="col">&nbsp;</div>
                           </div>
                       </div>`;
        var signCard = `<div class="row">
                        ${k % 2 === 0 ? '' : '<div class="col-sm"></div>'}
                        ${k % 2 === 0 ? '' : lineDot}
                        <div class="col-sm py-2">
                            <div class="card border-primary shadow radius-15 card-sign">
                                <div class="card-body">
                                    <div class="float-end">${date === 'Invalid date' ? '' : date}</div>
                                    <label class="mb-3"><span class="badge bg-${title.color}"><i class="fa-solid fa-${title.icon}"></i> ${title.text}</span></label>
                                    <label class="mb-3">${span}</label>
                                    <p class="card-text mb-1">${username}</p>
                                    <p class="card-text mb-1">${bs.User.Email || ''}</p>
                                    <button class="btn btn-sm btn-outline-secondary collapsed ${title.text == null ? 'd-none' : title.text != 'Rejected' ? 'd-none' : ''}" type="button" data-bs-target="#details_${k}" data-bs-toggle="collapse" aria-expanded="false">Show Details ▼</button>
                                    <div class="border collapse" id="details_${k}" style="">
                                        <div class="p-2 text-monospace">
                                            <div>${bs.Note}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        ${k % 2 === 0 ? lineDot : ''}
                        ${k % 2 === 0 ? '<div class="col-sm"></div>' : ''}
                    </div>`;

        $('#sign-container').append(signCard);
    });
}

// Get Select data
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
                $('#device_edit-WareHouse').empty();
                $.each(response.warehouses, function (k, item) {
                    var opt1 = $(`<option value="${item.Id}">${item.WarehouseName}</option>`);
                    var opt2 = $(`<option value="${item.Id}">${item.WarehouseName}</option>`);
                    $('#device_edit-WareHouse').append(opt1);
                    $('#input_WareHouse').append(opt2);
                });
                $('#input_WareHouse').change();
                // Product
                $('#device_edit-Product').empty();
                $('#filter_Product').html($('<option value="Product" selected>Product (All)</option>'));
                $.each(response.products, function (k, item) {
                    let opt = $(`<option value="${item.Id}">${item.ProductName} | ${item.MTS != null ? item.MTS : ''}</option>`);
                    $('#device_edit-Product').append(opt);

                    let opt1 = $(`<option value="${item.ProductName}">${item.ProductName}</option>`);
                    $('#filter_Product').append(opt1);
                });
                // Model
                $('#device_edit-Model').empty();
                $('#filter_Model').html($('<option value="Model" selected>Model (All)</option>'));
                $.each(response.models, function (k, item) {
                    let opt = $(`<option value="${item.Id}">${item.ModelName}</option>`);
                    $('#device_edit-Model').append(opt);

                    let opt1 = $(`<option value="${item.ModelName}">${item.ModelName}</option>`);
                    $('#filter_Model').append(opt1);
                });
                // Station
                $('#device_edit-Station').empty();
                $('#filter_Station').html($('<option value="Station" selected>Station (All)</option>'));
                $.each(response.stations, function (k, item) {
                    let opt = $(`<option value="${item.Id}">${item.StationName}</option>`);
                    $('#device_edit-Station').append(opt);

                    let opt1 = $(`<option value="${item.StationName}">${item.StationName}</option>`);
                    $('#filter_Station').append(opt1);
                });
                // Group
                $('#device_edit-Group').empty();
                $('#filter_Group').html($('<option value="Group" selected>Group (All)</option>'));
                $.each(response.groups, function (k, item) {
                    let opt = $(`<option value="${item.Id}">${item.GroupName}</option>`);
                    $('#device_edit-Group').append(opt);

                    let opt1 = $(`<option value="${item.GroupName}">${item.GroupName}</option>`);
                    $('#filter_Group').append(opt1);
                });
                // Vendor
                $('#device_edit-Vendor').empty();
                $('#filter_Vendor').html($('<option value="Vendor" selected>Vendor (All)</option>'));
                $.each(response.vendors, function (k, item) {
                    let opt = $(`<option value="${item.Id}">${item.VendorName}</option>`);
                    $('#device_edit-Vendor').append(opt);

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

// Other function
function DrawRowEditDevice(item) {
    var row = [];
    {
        // 0 MTS
        row.push(`<td>${(item.Product) ? item.Product.MTS : ""}</td>`);
        // 1 Product Name
        row.push(`<td title="${(item.Product) ? item.Product.ProductName : ""}">${(item.Product) ? item.Product.ProductName : ""}</td>`);
        // 2 Model
        row.push(`<td>${(item.Model) ? item.Model.ModelName : ""}</td>`);
        // 3 Station
        row.push(`<td>${(item.Station) ? item.Station.StationName : ""}</td>`);
        // 4 DeviceCode - PN
        row.push(`<td data-id="${item.Id}" data-code="${item.DeviceCode}">${item.DeviceCode}</td>`);
        // 5 DeviceName
        row.push(`<td title="${item.DeviceName}">${item.DeviceName}</td>`);
        // 6 Group
        row.push(`<td>${(item.Group) ? item.Group.GroupName : ""}</td>`);
        // 7 Vendor
        row.push(`<td title="${(item.Vendor) ? item.Vendor.VendorName : ""}">${(item.Vendor) ? item.Vendor.VendorName : ""}</td>`);
        // 8 Specification
        row.push(`<td>${(item.Specification) ? item.Specification : ""}</td>`);
        // 9 Location
        var html = ''
        var title = ''
        $.each(item.DeviceWarehouseLayouts, function (k, sss) {
            var layout = sss.WarehouseLayout;
            html += `<lable>${layout.Line}${layout.Cell ? ' - ' + layout.Cell : ''}${layout.Floor ? ' - ' + layout.Floor : ''}</lable>`;
            title += `[${layout.Line}${layout.Cell ? ' - ' + layout.Cell : ''}${layout.Floor ? ' - ' + layout.Floor : ''}], `;
        });
        row.push(`<td title="${title}">${html}</td>`);

        // 10 Buffer
        row.push(`<td title="${item.Buffer}">${item.Buffer * 100}%</td>`);
        // 11 Quantity
        row.push(`<td title="(Quantity / Quantity Confirm / Real Quantity) [Borrowed: ${item.QtyConfirm - item.RealQty}]">${item.Quantity} / ${item.QtyConfirm} / <span class="fw-bold text-info">${item.RealQty}</span></td>`);
        // 12 Unit
        row.push(`<td>${item.Unit ? item.Unit : ''}</td>`);
        // 13 Unit
        row.push(`<td>${item.DeliveryTime ? item.DeliveryTime : ''}</td>`);
        // 14 Type
        switch (item.Type) {
            case "S": {
                row.push(`<td><span class="text-success fw-bold">Static</span></td>`);
                break;
            }
            case "D": {
                row.push(`<td><span class="text-info fw-bold">Dynamic</span></td>`);
                break;
            }
            case "Consign": {
                row.push(`<td><span class="text-warning fw-bold">Consign</span></td>`);
                break;
            }
            case "Fixture": {
                row.push(`<td><span class="text-primary fw-bold">Fixture</span></td>`);
                break;
            }
            default: {
                row.push(`<td><span class="text-secondary fw-bold">N/A</span></td>`);
                break;
            }
        }
        // 15 Status
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
                row.push(`<td>N/A</td>`);
                break;
            }
        }
        // 16 Action
        row.push(`<td class="order-action d-flex text-center justify-content-center">
                        <a href="javascript:;" class="text-info bg-light-info border-0" title="Details" data-id="${item.Id}" onclick="Details(this, event)"><i class="fa-regular fa-circle-info"></i></a>
                        <a href="javascript:;" class="text-warning bg-light-warning border-0" title="Edit   " data-id="${item.Id}" onclick="Edit(this, event)   "><i class="fa-duotone fa-pen"></i></a>
                        <a href="javascript:;" class="text-danger  bg-light-danger  border-0" title="Delete " data-id="${item.Id}" onclick="Delete(this, event) "><i class="fa-duotone fa-trash"></i></a>
                    </td>`);
    }
    return row;
}

// confirm function
function Confirm(elm, e) {
    e.preventDefault();

    var Id = $(elm).data('id');
    var Index = tableDeviceInfo.row(`[data-id="${Id}"]`).index();

    $.ajax({
        type: "POST",
        url: "/NVIDIA/DeviceManagement/GetDevice",
        data: JSON.stringify({ Id: Id }),
        dataType: "json",
        contentType: "application/json;charset=utf-8",
        success: function (response) {
            if (response.status) {
                var device = response.device;
                // message box
                Swal.fire({
                    title: `<strong style="font-size: 25px;">Do you want Confirm this device?</strong>`,
                    html: `<table class="table table-striped table-bordered table-message">
                               <tbody>
                                   <tr>
                                       <td>Device Name</td>
                                       <td>${device.DeviceName}</td>
                                   </tr>
                                   <tr>
                                       <td>Quantity</td>
                                       <td>${device.Quantity}</td>
                                   </tr>
                                   <tr>
                                       <td>Buffer</td>
                                       <td>${device.Buffer}</td>
                                   </tr>
                               </tbody>
                           </table>
                           <div class="input-group mb-3">
                                <span class="input-group-text" style="min-width: 180px;">Quantity Confirm</span>
                                <input class="form-control" type="number" id="device_confirm-QtyConfirm" placeholder="${device.QtyConfirm} + input">
                           </div>
                           `,
                    icon: 'question',
                    iconColor: '#ffc107',
                    reverseButtons: false,
                    confirmButtonText: 'Confirm',
                    showCancelButton: true,
                    cancelButtonText: 'Cancel',
                    buttonsStyling: false,
                    reverseButtons: true,
                    customClass: {
                        cancelButton: 'btn btn-outline-secondary fw-bold me-3',
                        confirmButton: 'btn btn-success fw-bold'
                    },
                }).then((result) => {
                    if (result.isConfirmed) {
                        var QtyConfirm = $('#device_confirm-QtyConfirm').val();

                        $.ajax({
                            type: "POST",
                            url: "/NVIDIA/DeviceManagement/ConfirmDevice",
                            data: JSON.stringify({ Id: Id, QtyConfirm: QtyConfirm }),
                            dataType: "json",
                            contentType: "application/json;charset=utf-8",
                            success: function (response) {
                                if (response.status) {
                                    var row = DrawRowEditDevice(response.device);
                                    tableDeviceInfo.row(Index).data(row).draw(false);

                                    toastr["success"]("Confirm device success.", "SUCCRESS");
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

// Delete function
function Delete(elm, e) {
    e.preventDefault();

    var Id = $(elm).data('id');
    var Index = tableDeviceInfo.row(`[data-id="${Id}"]`).index();

    $.ajax({
        type: "POST",
        url: "/NVIDIA/DeviceManagement/GetDevice",
        data: JSON.stringify({ Id: Id }),
        dataType: "json",
        contentType: "application/json;charset=utf-8",
        success: function (response) {
            if (response.status) {
                var device = response.device;
                // message box
                Swal.fire({
                    title: `<strong style="font-size: 25px;">Do you want Delete this device?</strong>`,
                    html: `<table class="table table-striped table-bordered table-message">
                               <tbody>
                                    <tr>
                                       <td>Device Code</td>
                                       <td>${device.DeviceCode}</td>
                                   </tr>
                                   <tr>
                                       <td>Device Name</td>
                                       <td>${device.DeviceName}</td>
                                   </tr>
                                   <tr>
                                       <td>Quantity</td>
                                       <td>${device.Quantity}</td>
                                   </tr>
                               </tbody>
                           </table>
                           `,
                    icon: 'question',
                    iconColor: '#dc3545',
                    reverseButtons: false,
                    confirmButtonText: 'Delete',
                    showCancelButton: true,
                    cancelButtonText: 'Cancel',
                    buttonsStyling: false,
                    reverseButtons: true,
                    customClass: {
                        cancelButton: 'btn btn-outline-secondary fw-bold me-3',
                        confirmButton: 'btn btn-danger fw-bold'
                    },
                }).then((result) => {
                    if (result.isConfirmed) {
                        $.ajax({
                            type: "POST",
                            url: "/NVIDIA/DeviceManagement/DeleteDevice",
                            data: JSON.stringify({ Id: Id }),
                            dataType: "json",
                            contentType: "application/json;charset=utf-8",
                            success: function (response) {
                                if (response.status) {
                                    tableDeviceInfo.row(Index).remove().draw(false);

                                    toastr["success"]("Delete device success.", "SUCCRESS");
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

// Edit function
function Edit(elm, e) {
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
async function FillEditDeviceData(data) {
    $('#device_edit-DeviceId').val(data.device.Id);
    $('#device_edit-DeviceCode').val(data.device.DeviceCode);
    $('#device_edit-DeviceName').val(data.device.DeviceName);
    $('#device_edit-Specification').val(data.device.Specification);
    $('#device_edit-DeviceDate').val(moment(data.device.DeviceDate).format('YYYY-MM-DD HH:mm'));
    $('#device_edit-Relation').val(data.device.Relation);
    $('#device_edit-Buffer').val(data.device.Buffer);
    $('#device_edit-LifeCycle').val(data.device.LifeCycle);
    $('#device_edit-Forcast').val(data.device.Forcast);
    $('#device_edit-Quantity').val(data.device.Quantity);
    $('#device_edit-QtyConfirm').val(data.device.QtyConfirm);
    $('#device_edit-RealQty').val(data.device.RealQty);

    $('#device_edit-AccKit').val(data.device.ACC_KIT).trigger('change');
    $('#device_edit-Type').val(data.device.Type).trigger('change');
    $('#device_edit-Status').val(data.device.Status).trigger('change');
    $('#device_edit-Product').val(data.device.IdProduct).trigger('change');
    $('#device_edit-Model').val(data.device.IdModel).trigger('change');
    $('#device_edit-Station').val(data.device.IdStation).trigger('change');
    $('#device_edit-WareHouse').val(data.device.IdWareHouse).trigger('change');
    $('#device_edit-Group').val(data.device.IdGroup).trigger('change');
    $('#device_edit-Vendor').val(data.device.IdVendor).trigger('change');
    $('#device_edit-Unit').val(data.device.Unit);

    $('#device_edit-MinQty').val(data.device.MinQty);

    if (data.device.DeliveryTime) {
        var temp = data.device.DeliveryTime.split(' ');
        $('#device_edit-DeliveryTime1').val(temp[0]);

        var selectVal = '';
        for (let i = 1; i < temp.length; i++) {
            selectVal += ' ' + temp[i];
        }
        $('#device_edit-DeliveryTime2').val(selectVal.trim());
    }



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
                            <span class="col-2 input-group-text">Layout ${k + 1} </span>
                        </div>`);
        inputGroup.append(selectLayout);
        inputGroup.append(deleteButton)

        $('#layout-container').append(inputGroup);
    });
}
$('#button-save_modal').on('click', function (e) {
    e.preventDefault();

    var device = GetModalData();
    var Index = tableDeviceInfo.row(`[data-id="${device.Id}"]`).index();

    var IdLayouts = $('#layout-container option:selected').map(function () {
        return $(this).val();
    }).get();

    $.ajax({
        type: "POST",
        url: "/NVIDIA/DeviceManagement/UpdateDevice",
        data: JSON.stringify({ device: device, IdLayouts: IdLayouts }),
        dataType: "json",
        contentType: "application/json;charset=utf-8",
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
            Swal.fire("Something went wrong!", GetAjaxErrorMessage(error), "error");
        }
    });
});
function GetModalData() {
    return data = {
        Id: $('#device_edit-DeviceId').val(),
        DeviceCode: $('#device_edit-DeviceCode').val(),
        DeviceName: $('#device_edit-DeviceName').val(),
        Specification: $('#device_edit-Specification').val(),
        Unit: $('#device_edit-Unit').val(),

        DeviceDate: $('#device_edit-DeviceDate').val(),
        Relation: $('#device_edit-Relation').val(),
        Buffer: $('#device_edit-Buffer').val(),
        LifeCycle: $('#device_edit-LifeCycle').val(),
        Forcast: $('#device_edit-Forcast').val(),
        Quantity: $('#device_edit-Quantity').val(),
        QtyConfirm: $('#device_edit-QtyConfirm').val(),
        RealQty: $('#device_edit-RealQty').val(),

        ACC_KIT: $('#device_edit-AccKit').val(),
        Type: $('#device_edit-Type').val(),
        Status: $('#device_edit-Status').val(),
        IdWareHouse: $('#device_edit-WareHouse').val(),
        IdProduct: $('#device_edit-Product').val(),
        IdModel: $('#device_edit-Model').val(),
        IdStation: $('#device_edit-Station').val(),
        IdGroup: $('#device_edit-Group').val(),
        IdVendor: $('#device_edit-Vendor').val(),

        MinQty: $('#device_edit-MinQty').val(),

        DeliveryTime: $('#device_edit-DeliveryTime1').val() + ' ' + $('#device_edit-DeliveryTime2').val(),
    }
}

// Add more layout dynamic
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
                            <span class="col-2 input-group-text">Layout ${layoutlength + 1} </span>
                        </div>`);
    inputGroup.append(selectLayout);
    inputGroup.append(deleteButton)

    $('#layout-container').append(inputGroup);
});
var WarehouseLayouts;
$('#device_edit-WareHouse').on('change', function (e) {
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

//filter
$('#filter').on('click', function (e) {
    e.preventDefault();

    var filter_Product = $('#filter_Product').val();
    var filter_Model = $('#filter_Model').val();
    var filter_Station = $('#filter_Station').val();
    var filter_Group = $('#filter_Group').val();
    var filter_Vendor = $('#filter_Vendor').val();
    var filter_Type = $('#filter_Type').val();
    var filter_Status = $('#filter_Status').val();

    tableDeviceInfo.columns().search('').draw();

    if (filter_Product !== "Product" && filter_Product !== null && filter_Product !== undefined) {
        tableDeviceInfo.column(1).search("^" + filter_Product + "$", true, false);
    }
    if (filter_Model !== "Model" && filter_Model !== null && filter_Model !== undefined) {
        tableDeviceInfo.column(2).search("^" + filter_Model + "$", true, false);
    }
    if (filter_Station !== "Station" && filter_Station !== null && filter_Station !== undefined) {
        tableDeviceInfo.column(3).search("^" + filter_Station + "$", true, false);
    }
    if (filter_Group !== "Group" && filter_Group !== null && filter_Group !== undefined) {
        tableDeviceInfo.column(6).search("^" + filter_Group + "$", true, false);
    }
    if (filter_Vendor !== "Vendor" && filter_Vendor !== null && filter_Vendor !== undefined) {
        tableDeviceInfo.column(7).search("^" + filter_Vendor + "$", true, false);
    }
    if (filter_Type !== "Type" && filter_Type !== null && filter_Type !== undefined) {
        tableDeviceInfo.column(14).search("^" + filter_Type + "$", true, false);
    }
    if (filter_Status !== "Status" && filter_Status !== null && filter_Status !== undefined) {
        tableDeviceInfo.column(15).search("^" + filter_Status + "$", true, false);
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
    $('#filter_Status').val("Status").trigger('change');

    $('#filter').click();
});


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