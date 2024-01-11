$(document).ready(function () {
    InitDatatable();
    setTimeout(() => {
        InitSelect2();
        SetDatas();
    }, 100);
    
});

/* Init Page */
function InitSelect2() {
    // Warehouse
    $('#input_WareHouse', document).select2({
        theme: 'bootstrap4',
        minimumResultsForSearch: -1,
    });

    // Modal
    {

        $('#device_edit-AccKit').select2({
            theme: 'bootstrap4',
            dropdownParent: $("#device_edit-modal"),
            minimumResultsForSearch: -1,
            width: '50%',
        });
        $('#device_edit-Type').select2({
            theme: 'bootstrap4',
            dropdownParent: $("#device_edit-modal"),
            minimumResultsForSearch: -1,
            width: '50%',
        });
        $('#device_edit-Status').select2({
            theme: 'bootstrap4',
            dropdownParent: $("#device_edit-modal"),
            minimumResultsForSearch: -1,
            width: '50%',
        });
        $('#device_edit-WareHouse').select2({
            theme: 'bootstrap4',
            dropdownParent: $("#device_edit-modal"),
            minimumResultsForSearch: -1,
            width: '50%',
        });
    }

    // Filter
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
            dropdownParent: $("#dropdown_filter"),
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
}
async function SetDatas() {
    var response = await GetDatas();

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

    SetEditData(response);
    SetFilterData(response);
}
$('#input_WareHouse').on('change', function (e) {
    e.preventDefault();
    GetWarehouseDevices($(this).val());
});


/* Datatable */
var device_history, ListDevices;
function InitDatatable() {
    var windowHeight = $(window).height();
    var lengthMenu = [[], []];
    var tableHeight = 0;
    if (windowHeight < 900) {
        tableHeight = 46 * 9;
        lengthMenu = [[8, 15, 25, 50, -1], [10, 15, 25, 50, "All"]];
    }
    else if (windowHeight == 900) {
        tableHeight = 46 * 11;
        lengthMenu = [[10, 15, 25, 50, -1], [10, 15, 25, 50, "All"]]
    }
    else if (windowHeight > 900 && windowHeight < 1080) {
        tableHeight = 46 * 13;
        lengthMenu = [[12, 15, 25, 50, -1], [12, 15, 25, 50, "All"]]
    }
    else {
        tableHeight = 46 * 16;
        lengthMenu = [[15, 25, 50, -1], [15, 25, 50, "All"]]
    }

    const options = {
        scrollY: tableHeight,
        scrollX: true,
        order: [],
        autoWidth: false,
        deferRender: true,
        columnDefs: [
            { targets: "_all", orderable: false },
            { targets: [14], className: "text-center text-primary fw-bold" },   
            { targets: [15], className: "text-center text-info fw-bold" },
            { targets: [16], className: "text-center text-danger fw-bold" },
            { targets: [11, 12, 13, 17, 18, 20], className: "text-center" },
            { targets: [19], className: "text-center td-py-0" },
            { targets: [21], className: "row-action order-action d-flex text-center justify-content-center"},
            { targets: [0, 2, 3, 4, 7, 8, 9, 12, 13, 22, 23], visible: false },
        ],
        lengthMenu: lengthMenu,
        dom: "<'row'<'w-auto'B><'col-sm-12 col-md'l><'col-sm-12 col-md'f>>" +
            "<'row'<'col-sm-12'tr>>" +
            "<'row'<'col-sm-12 col-md-7'i><'col-sm-12 col-md-5'p>>",
        buttons: [
            {
                text: i18next.t('device.management.export_excel'),
                extend: 'excel',
                exportOptions: {
                    columns: [1, 2, 5, 6, 11, 14, 15]
                },
                customize: function (xlsx) {
                    $('sheets sheet', xlsx.xl['workbook.xml']).attr('name', 'Devices');
                }
            },
            {
                text: 'Inventory',
                action: function (e, dt, button, config) {
                    var input = $('<input type="file">');
                    input.on('change', function () {
                        var file = this.files[0];

                        sendFile(file);

                    });
                    input.click();
                }
            }
        ],
        createdRow: function (row, data, dataIndex) {
            $(row).addClass('cursor-pointer');
            $(row).data('id', data[0]);

            var cells = $(row).children('td');
            $(cells[0]).attr('title', data[1]);
            $(cells[1]).attr('title', data[5]);
            $(cells[2]).attr('title', data[6]);
            $(cells[3]).attr('title', data[10]);
        },

    };
    tableDeviceInfo = $('#table_Devices').DataTable(options);
}
function GetWarehouseDevices(IdWarehouse = 0) {
    Pace.track(function () {
        $.ajax({
            url: "/NVIDIA/DeviceManagement/GetWarehouseDevices",
            data: JSON.stringify({ IdWarehouse }),
            type: "POST",
            dataType: "json",
            contentType: "application/json;charset=utf-8",
            success: async function (response) {
                if (response.status) {

                    var devices = response.warehouse.Devices;
                    //CreateTableAddDevice(devices);

                    var rowsToAdd = [];
                    $.each(devices, function (k, device) {
                        var tablerow = CreateDatatableRow(device);
                        rowsToAdd.push(tablerow);
                    });

                    tableDeviceInfo.rows.add(rowsToAdd);
                    tableDeviceInfo.columns.adjust().draw();

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

function CreateDatatableRow(device) {
    var row = [
        device.Id,
        (device.Product && device.Product.MTS) ? device.Product.MTS : "NA",
        (device.Product && device.Product.ProductName !== "") ? device.Product.ProductName : "NA",
        (device.Model && device.Model.ModelName !== "") ? device.Model.ModelName : "NA",
        (device.Station && device.Station.StationName !== "") ? device.Station.StationName : "NA",
        device.DeviceCode !== "null" ? device.DeviceCode : "NA",
        device.DeviceName !== "" ? device.DeviceName : "NA",
        (device.Group && device.Group.GroupName !== "") ? device.Group.GroupName : "NA",
        (device.Vendor && device.Vendor.VendorName !== "") ? device.Vendor.VendorName : "NA",
        (device.Specification !== "NA") ? device.Specification : "NA",
        GetDeviceLocation(device),
        (device.Buffer * 100) + "%",
        device.Quantity || 0,
        device.POQty || 0,
        device.QtyConfirm || 0,
        device.RealQty || 0,
        device.NG_Qty || 0,
        device.Unit || '',
        /\d/.test(device.DeliveryTime) ? device.DeliveryTime : "NA",
        GetDeviceType(device),
        GetDeviceStatus(device),
        GetDeviceAction(device.Id),
        device.isConsign ? "consign" : "normal",
        (device.AlternativeDevices != null && device.AlternativeDevices.length == 1) ? device.AlternativeDevices[0].PNs ? device.AlternativeDevices[0].PNs : "" : ""
    ]
    return row;
}
function GetDeviceLocation(device) {
    var location = [];
    $.each(device.DeviceWarehouseLayouts, function (k, deviceLocation) {
        var layout = deviceLocation.WarehouseLayout;
        location.push(`${layout.Line}${layout.Cell ? ' - ' + layout.Cell : ''}${layout.Floor ? ' - ' + layout.Floor : ''}`);
    });
    return location.join(', ');
}
function GetDeviceType(device) {
    switch (device.Type) {
        case "S":
        case "Static": {
            return (`<span class="text-success fw-bold">Static</span>
                     </br>
                     <span class="text-${device.isConsign ? "warning" : "primary"} fw-bold" style="font-size: 10px;">${device.isConsign ? "Consign" : "Normal"}</span>`);
            break;
        }
        case "D":
        case "Dynamic": {
            return (`<span class="text-info fw-bold">Dynamic</span>
                        </br>
                        <span class="text-${device.isConsign ? "warning" : "primary"} fw-bold" style="font-size: 10px;">${device.isConsign ? "Consign" : "Normal"}</span>`);
            break;
        }
        case "Fixture": {
            return (`<td class="py-0">
                                <span class="text-primary fw-bold">Fixture</span>
                                </br>
                                <span class="text-${device.isConsign ? "warning" : "primary"} fw-bold" style="font-size: 10px;">${device.isConsign ? "Consign" : "Normal"}</span>
                            </td>`);
            break;
        }
        default: {
            return (`<span class="text-secondary fw-bold">NA</span>
                     </br>
                     <span class="text-${device.isConsign ? "warning" : "primary"} fw-bold" style="font-size: 10px;">${device.isConsign ? "Consign" : "Normal"}</span>`);
            break;
        }
    }
}
function GetDeviceStatus(device) {
    switch (device.Status) {
        case "Unconfirmed": {
            return (`<span class="badge bg-primary">Unconfirmed</span>`);
            break;
        }
        case "Part Confirmed": {
            return (`<span class="badge bg-warning">Part Confirmed</span>`);
            break;
        }
        case "Confirmed": {
            return (`<span class="badge bg-success">Confirmed</span>`);
            break;
        }
        case "Locked": {
            return (`<span class="badge bg-secondary">Locked</span>`);
            break;
        }
        case "Out Range": {
            return (`<span class="badge bg-danger">Out Range</span>`);
            break;
        }
        default: {
            return (`NA`);
            break;
        }
    }
}
function GetDeviceAction(Id) {
    return (`<a href="javascript:;" class="text-info bg-light-info border-0"       title="${i18next.t('device.management.details')}" data-id="${Id}" onclick="Details(this, event)"><i class="fa-regular fa-circle-info"></i></a>
             <a href="javascript:;" class="text-warning bg-light-warning border-0" title="${i18next.t('device.management.edit')}   " data-id="${Id}" onclick="Edit(this, event)   "><i class="fa-duotone fa-pen"></i></a>
             <a href="javascript:;" class="text-danger  bg-light-danger  border-0" title="${i18next.t('device.management.delete')} " data-id="${Id}" onclick="Delete(this, event) "><i class="fa-duotone fa-trash"></i></a>`);
}


// GET
function _GetWarehouseDevices(IdWarehouse) {
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
                } else {
                    reject(response.message);
                }
            },
            error: function (error) {
                reject(GetAjaxErrorMessage(error));
            },
            complete: function () {
                // Dừng Pace.js sau khi AJAX request hoàn thành
                Pace.stop();
            }
        });
    });
}
function ExportExcel() {
    $.ajax({
        url: '/NVIDIA/DeviceManagement/ExportExcel',
        method: 'POST',
        contentType: 'application/json',
        xhrFields: { responseType: 'blob' },
        success: function (response, status, xhr) {

        },
        error: function (error) {
            Swal.fire(i18next.t('global.swal_title'), GetAjaxErrorMessage(error), "error");
        }
    });
}
function GetDatas() {
    return new Promise((resolve, reject) => {
        $.ajax({
            type: "GET",
            url: "/NVIDIA/DeviceManagement/GetSelectData",
            dataType: "json",
            contentType: "application/json;charset=utf-8",
            success: function (response) {
                if (response.status) {
                    resolve(response);
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
function GetDevice(Id, GetResponse = false) {
    return new Promise((resolve, reject) => {
        $.ajax({
            type: "POST",
            url: "/NVIDIA/DeviceManagement/GetDevice",
            data: JSON.stringify({ Id: Id }),
            dataType: "json",
            contentType: "application/json;charset=utf-8",
            success: function (response) {
                if (response.status) {
                    if (GetResponse) {
                        resolve(response);
                    }
                    else {
                        resolve(response.device);
                    }
                    
                }
                else {
                    toastr["error"](response.message, "ERROR");
                    reject(response.message);
                }
            },
            error: function (error) {
                Swal.fire(i18next.t('global.swal_title'), GetAjaxErrorMessage(error), "error");
                reject(GetAjaxErrorMessage(error));
            }
        });
    });
}

var WarehouseLayouts;
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

// SET
function Details(elm, e) {
    e.preventDefault();
    var Id = $(elm).data('id');
    GetDeviceDetails(Id);
}
function BorrowDetails(Id) {
    RequestDetails(Id, false);
}

function Edit(elm, e) {
    e.preventDefault();

    DeviceUpdate(elm, e);
}

// POST
function sendFile(file) {
    const formData = new FormData();
    formData.append('file', file);

    Pace.on('progress', function (progress) {
        var cal = progress.toFixed(2);
        $('#process_count').text(`${cal}%`);
        $('#process_bar').css('width', `${cal}%`);
    });
    Pace.track(function () {
        $.ajax({
            url: "/NVIDIA/DeviceManagement/UploadFile",
            data: formData,
            type: "POST",
            processData: false,
            contentType: false,
            success: function (response) {
                if (response.status) {
                    window.location.href = response.url;
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
async function Confirm(elm, e) {
    e.preventDefault();

    var Id = $(elm).data('id');
    var Index = tableDeviceInfo.row(`[data-id="${Id}"]`).index();

    var device = await GetDevice(Id);

    Swal.fire({
        title: `<strong style="font-size: 25px;">${i18next.t('device.management.confirm_title')}</strong>`,
        html: `<table class="table table-striped table-bordered table-message">
                               <tbody>
                                   <tr>
                                       <td>${i18next.t('device.management.pn')}</td>
                                       <td>${device.DeviceName}</td>
                                   </tr>
                                   <tr>
                                       <td>${i18next.t('device.management.real_qty')}</td>
                                       <td>${device.RealQty}</td>
                                   </tr>
                                   <tr>
                                       <td>${i18next.t('device.management.buffer')}</td>
                                       <td>${device.Buffer}</td>
                                   </tr>
                               </tbody>
                           </table>
                           <div class="input-group mb-3">
                                <span class="input-group-text" style="min-width: 180px;">${i18next.t('device.management.qty_confirm')}</span>
                                <input class="form-control" type="number" id="device_confirm-QtyConfirm" placeholder="${device.QtyConfirm} + input">
                           </div>
                           `,
        icon: 'question',
        iconColor: '#ffc107',
        reverseButtons: false,
        confirmButtonText: i18next.t('global.confirm'),
        showCancelButton: true,
        cancelButtonText: i18next.t('global.cancel'),
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
                    Swal.fire(i18next.t('global.swal_title'), GetAjaxErrorMessage(error), "error");
                }
            });
        }
    });
}

// EVENT
$(".toggle-icon").click(function () {
    setTimeout(() => {
        tableDeviceInfo.columns.adjust();
    }, 310);

});
$('#table_Devices tbody').on('dblclick', 'tr', function (event) {

    var dataId = $(this).data('id');

    GetDeviceDetails(dataId)
});
async function Delete(elm, e) {
    e.preventDefault();

    var Id = $(elm).data('id');
    var tableRow = $(elm).closest('tr')
    var IndexRow = tableDeviceInfo.row(tableRow).index();

    var device = await GetDevice(Id);

    Swal.fire({
        title: `<strong style="font-size: 25px;">${i18next.t('device.management.delete_title')}</strong>`,
        html: `<table class="table table-striped table-bordered table-message">
                               <tbody>
                                    <tr>
                                       <td>${i18next.t('device.management.pn')}</td>
                                       <td>${device.DeviceCode}</td>
                                   </tr>
                                   <tr>
                                       <td>${i18next.t('device.management.description')}</td>
                                       <td>${device.DeviceName}</td>
                                   </tr>
                                   <tr>
                                       <td>${i18next.t('device.management.real_qty')}</td>
                                       <td>${device.RealQty}</td>
                                   </tr>
                               </tbody>
                           </table>
                           `,
        icon: 'question',
        iconColor: '#dc3545',
        reverseButtons: false,
        confirmButtonText: i18next.t('global.delete'),
        showCancelButton: true,
        cancelButtonText: i18next.t('global.cancel'),
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
                        tableDeviceInfo.row(IndexRow).remove().draw();

                        toastr["success"]("Delete device success.", "SUCCRESS");
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
    });
}
$('#filter').on('click', function (e) {
    e.preventDefault();

    var filter_Product = $('#filter_Product').val();
    var filter_Group = $('#filter_Group').val();
    var filter_Vendor = $('#filter_Vendor').val();
    var filter_Type = $('#filter_Type').val();
    var filter_Status = $('#filter_Status').val();

    tableDeviceInfo.columns().search('').draw();

    if (filter_Product !== "Product" && filter_Product !== null && filter_Product !== undefined) {
        tableDeviceInfo.column(2).search("^" + filter_Product + "$", true, false);
    }
    if (filter_Group !== "Group" && filter_Group !== null && filter_Group !== undefined) {
        tableDeviceInfo.column(5).search("^" + filter_Group + "$", true, false);
    }
    if (filter_Vendor !== "Vendor" && filter_Vendor !== null && filter_Vendor !== undefined) {
        tableDeviceInfo.column(6).search("^" + filter_Vendor + "$", true, false);
    }
    if (filter_Type !== "Type" && filter_Type !== null && filter_Type !== undefined) {
        var types = filter_Type.split('_');
        tableDeviceInfo.column(19).search(types[1], true, false);
        tableDeviceInfo.column(22).search("^" + types[0] + "$", true, false);
    }
    if (filter_Status !== "Status" && filter_Status !== null && filter_Status !== undefined) {
        tableDeviceInfo.column(20).search("^" + filter_Status + "$", true, false);
    }

    tableDeviceInfo.draw();
});



