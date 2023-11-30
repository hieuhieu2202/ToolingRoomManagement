$(document).ready(async function () {
    InitSelect2();
    var devices = await GetComingDevices();
    CreateTable(devices);
    GetSelectData();
});

// GET
function GetComingDevices() {
    return new Promise((resolve, reject) => {
        $.ajax({
            type: "GET",
            url: "/NVIDIA/DeviceManagement/GetComingDevices",
            dataType: "json",
            contentType: "application/json;charset=utf-8",
            success: function (response) {
                if (response.status) {
                    resolve(response.ComingDevices);
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
function GetComingDevice(Id) {
    return new Promise((resolve, reject) => {
        $.ajax({
            type: "GET",
            url: "/NVIDIA/DeviceManagement/GetComingDevice?Id=" + Id,
            dataType: "json",
            contentType: "application/json;charset=utf-8",
            success: function (response) {
                if (response.status) {
                    resolve(response.ComingDevice);
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
function GetDevice(Id, Type) {
    return new Promise((resolve, reject) => {
        $.ajax({
            type: "GET",
            url: `/NVIDIA/DeviceManagement/GetDevice?Id=${Id}&Type=${Type}`,
            dataType: "json",
            contentType: "application/json;charset=utf-8",
            success: function (response) {
                if (response.status) {
                    resolve(response.device);
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
function GetWarehouseDevices_Coming(Id) {
    return new Promise((resolve, reject) => {
        $.ajax({
            type: "GET",
            url: "/NVIDIA/DeviceManagement/GetWarehouseDevices_Coming?Id=" + Id,
            dataType: "json",
            contentType: "application/json;charset=utf-8",
            success: function (response) {
                if (response.status) {

                    var devices = {
                        DeviceConfirms: response.devices,
                        DeviceUnconfirms: response.deviceUnconfirms
                    }

                    resolve(devices);
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
function GetSelectData() {
    $.ajax({
        type: "GET",
        url: "/NVIDIA/DeviceManagement/GetSelectData",
        dataType: "json",
        contentType: "application/json;charset=utf-8",
        success: async function (response) {
            if (response.status) {
                // WareHouse
                $('#select_warehouse').empty();
                await $.each(response.warehouses, function (k, item) {
                    var opt1 = $(`<option value="${item.Id}">${item.WarehouseName}</option>`);
                    $('#select_warehouse').append(opt1);
                });        

                $('#select_warehouse').change(async function () {
                    var devices = await GetWarehouseDevices_Coming($(this).val());

                    CreateTableComing(devices);
                });

                $('#select_warehouse').change();

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


// Datatable coming device
var tableDeviceInfo;
async function CreateTable(devices) {
    if (tableDeviceInfo) tableDeviceInfo.destroy();

    $('#table_Devices_tbody').html('');

    await $.each(devices, async function (no, item) {
        var row = CreateRowDatatable(item);
        $('#table_Devices_tbody').append(row);
    });

    const options = {
        scrollY: 500,
        scrollX: true,
        order: [10, 'desc'],
        autoWidth: false,
        columnDefs: [           
            { targets: [0, 10], visible: false },
            { targets: "_all", orderable: false },
            { targets: [6, 7, 8, 9], className: "text-center" },
            //{ targets: [1, 3, 7, 8, 9, 10, 11, 12, 13, 14, 15], className: "text-center" },
        ],
        "lengthMenu": [[10, 15, 25, 50, -1], [10, 15, 25, 50, "All"]],
        dom: "<'row'<'w-auto'B><'col-sm-12 col-md'l><'col-sm-12 col-md'f>>" +
            "<'row'<'col-sm-12'tr>>" +
            "<'row'<'col-sm-12 col-md-7'i><'col-sm-12 col-md-5'p>>",
        buttons: [{
            text: "Add Device",
            action: function () {
                AddComingDevice();
            }
        }]

    };
    tableDeviceInfo = $('#table_Devices').DataTable(options);
    TableAdjust('#table_Devices_wrapper');
};
function CreateRowDatatable(otwDevice, update = false) {

    var device;
    if (otwDevice.Device != null) {
        device = otwDevice.Device;
    }
    else {
        device = otwDevice.DeviceUnconfirm;
    }

    var row = [];
    {
        // 0 ID Device
        row.push(`<td>${device.Id}</td>`);
        // 1 MTS
        row.push(`<td>${(device.Product) ? device.Product.MTS ? device.Product.MTS : "NA" : "NA"}</td>`);
        // 2 PN
        row.push(`<td>${device.DeviceCode ? device.DeviceCode : "NA"}</td>`);
        // 3 DeviceName
        row.push(`<td title="${device.DeviceName}">${device.DeviceName != "" ? device.DeviceName : "NA"}</td>`);
        // 4 Group
        var groupname = (device.Group) ? (device.Group.GroupName != "" ? device.Group.GroupName : "NA") : "NA";
        row.push(`<td title="${groupname}">${groupname}</td>`);
        // 5 Vendor
        var vendorname = (device.Vendor) ? (device.Vendor.VendorName != "" ? device.Vendor.VendorName : "NA") : "NA";
        row.push(`<td title="${vendorname}">${vendorname}</td>`);
        // 6 Coming Quantity
        row.push(`<td class="fw-bold text-info">${otwDevice.ComingQty ? otwDevice.ComingQty : 0}</td>`);
        // 7 Expected Date
        row.push(`<td>${moment(otwDevice.ExpectedDate).format('YYYY-MM-DD')}</td>`);
        // 8 Type
        switch (otwDevice.Type) {
            case "S":
            case "Static": {
                row.push(`<td class="py-0">
                                <span class="text-success fw-bold">Static</span>
                                </br>
                                <span class="text-${otwDevice.IsConsign ? "warning" : "primary"} fw-bold" style="font-size: 10px;">${otwDevice.IsConsign ? "Consign" : "Normal"}</span>
                            </td>`);
                break;
            }
            case "D":
            case "Dynamic": {
                row.push(`<td class="py-0">
                                <span class="text-info fw-bold">Dynamic</span>
                                </br>
                                <span class="text-${otwDevice.IsConsign ? "warning" : "primary"} fw-bold" style="font-size: 10px;">${otwDevice.IsConsign ? "Consign" : "Normal"}</span>
                            </td>`);
                break;
            }
            case "Fixture": {
                row.push(`<td class="py-0">
                                <span class="text-primary fw-bold">Fixture</span>
                                </br>
                                <span class="text-${otwDevice.IsConsign ? "warning" : "primary"} fw-bold" style="font-size: 10px;">${otwDevice.IsConsign ? "Consign" : "Normal"}</span>
                            </td>`);
                break;
            }
            default: {
                row.push(`<td class="py-0">
                                <span class="text-secondary fw-bold">NA</span>
                                </br>
                                <span class="text-${otwDevice.IsConsign ? "warning" : "primary"} fw-bold" style="font-size: 10px;">${otwDevice.IsConsign ? "Consign" : "Normal"}</span>
                            </td>`);
                break;
            }
        }
        // 9 Action
        row.push(`<td class="order-action d-flex text-center justify-content-center">
                    <a href="javascript:;" class="text-success bg-light-success border-0" title="Confirm" data-id="${otwDevice.Id}" onclick="Confirm(this, event)"><i class="fa-sharp fa-regular fa-circle-check"></i></a>
                    <a href="javascript:;" class="text-warning bg-light-warning border-0" title="Edit"    data-id="${otwDevice.Id}" onclick="Edit(this, event)"><i class="fa-duotone fa-pen"></i></a>
                    <a href="javascript:;" class="text-danger  bg-light-danger border-0"  title="Delete"  data-id="${otwDevice.Id}" onclick="Delete(this, event)"><i class="fa-duotone fa-trash"></i></a>
                </td>`);
        // 10 ID
        row.push(`<td>${otwDevice.Id}</td>`);
                
    }

    if (update) {
        return row;
    }
    else {
        var rows = $(`<tr class="align-middle cursor-pointer" data-id="${otwDevice.Id}"></tr>`);
        $.each(row, function (i, cell) {
            rows.append(cell);
        });
        return rows;
    }

    
}
$(".toggle-icon").click(function () {
    setTimeout(() => {
        tableDeviceInfo.columns.adjust();
    }, 300);
});


// Datatable add coming device
var table_DeviceComing;
async function CreateTableComing(devices) {
    if (table_DeviceComing) table_DeviceComing.destroy();

    $('#table_DeviceComing-tbody').html('');

    if (devices.DeviceConfirms.length > 0) {
        await $.each(devices.DeviceConfirms, async function (no, device) {
            var row = $(`<tr class="align-middle cursor-pointer" data-id="${device.Id}" data-type="confirm"></tr>`);

            row.append(`<td>${device.Id}</td>`);
            row.append(`<td>${(device.Product) ? device.Product.MTS ? device.Product.MTS : "NA" : "NA"}</td>`);
            row.append(`<td>${device.DeviceCode ? device.DeviceCode : "NA"}</td>`);
            row.append(`<td>${device.DeviceName != "" ? device.DeviceName : "NA"}</td>`);
            row.append(`<td>${(device.Group) ? (device.Group.GroupName != "" ? device.Group.GroupName : "NA") : "NA"}</td>`);
            row.append(`<td>${(device.Vendor) ? (device.Vendor.VendorName != "" ? device.Vendor.VendorName : "NA") : "NA"}</td>`);
            row.append(`<td class="order-action d-flex text-center justify-content-center text-center">
                            <a href="javascript:;" class="text-info bg-light-info border-0 custom" onclick="AddDevice('${device.Id}', 'confirm')"><i class="fa-regular fa-plus"></i></a>
                        </td>`);

            $('#table_DeviceComing-tbody').append(row);
        });
    }
    if (devices.DeviceUnconfirms.length > 0) {
        await $.each(devices.DeviceUnconfirms, async function (no, device) {
            var row = $(`<tr class="align-middle cursor-pointer" data-id="${device.Id}" data-type="unconfirm"></tr>`);

            row.append(`<td>${device.Id}</td>`);
            row.append(`<td>${(device.Product) ? device.Product.MTS ? device.Product.MTS : "NA" : "NA"}</td>`);
            row.append(`<td>${device.DeviceCode ? device.DeviceCode : "NA"}</td>`);
            row.append(`<td>${device.DeviceName != "" ? device.DeviceName : "NA"}</td>`);
            row.append(`<td>${(device.Group) ? (device.Group.GroupName != "" ? device.Group.GroupName : "NA") : "NA"}</td>`);
            row.append(`<td>${(device.Vendor) ? (device.Vendor.VendorName != "" ? device.Vendor.VendorName : "NA") : "NA"}</td>`);
            row.append(`<td class="order-action d-flex text-center justify-content-center text-center">
                            <a href="javascript:;" class="text-info bg-light-info border-0 custom" onclick="AddDevice('${device.Id}', 'unconfirm')"><i class="fa-regular fa-plus"></i></a>
                        </td>`);

            $('#table_DeviceComing-tbody').append(row);
        });
    }
    

    const options = {
        scrollY: 480,
        scrollX: true,
        order: [0, 'desc'],
        autoWidth: false,
        columnDefs: [
            { targets: [0], visible: false },
            { targets: "_all", orderable: false },
        ],
        "lengthMenu": [[10, 15, 25, 50, -1], [10, 15, 25, 50, "All"]],
    };
    table_DeviceComing = $('#table_DeviceComing').DataTable(options);
    table_DeviceComing.columns.adjust();
};
$('#table_DeviceComing tbody').on('dblclick', 'tr', async function (event) {
    var dataId = $(this).data('id');
    var dataType = $(this).data('type');

    var modal_footer = $('#details_modal-footer');
    if (modal_footer.find('#btn-add_devicecoming').length > 0) {
        var btn_add = modal_footer.find('#btn-add_devicecoming');
        btn_add.data('id', dataId);
        btn_add.data('type', dataType);
    }
    else {
        var btn_add = $(`<button class="btn btn-primary" id="btn-add_devicecoming" data-id="${dataId}" data-type="${dataType}">Add Coming Device</button>`);

        btn_add.click(function () {
            var Id = $(this).data('id');
            var Type = $(this).data('type');

            AddDevice(Id, Type);
        })

        modal_footer.append(btn_add);
    }

    var device = await GetDevice(dataId, dataType);
    await FillDetailsDeviceData(device);
    $('#device_details-modal').modal('show');
});

// Add
async function AddComingDevice() {
    $('#device_comming-modal').modal('show');
    TableAdjust(table_DeviceComing, '#table_DeviceComing_wrapper');
    $('#borrow_modal-name').hide()
    $('#details-location').hide();
    $('#device_details-layout').hide();
    $('#details-history').hide();
    $('#device_details-history').hide();
}
async function AddDevice(Id, Type) {
    $('#device_details-modal').modal('hide');
    $('#device_comming-modal').modal('hide');

    var device = await GetDevice(Id, Type);

    $('#coming_device_add-MTS').val(device.Product ? device.Product.MTS : 'NA');
    $('#coming_device_add-DeviceCode').val(device.DeviceCode ? device.DeviceCode : 'NA');
    $('#coming_device_add-Description').val(device.Description ? device.Description : 'NA');
    $('#coming_device_add-Description').attr('title', device.Description ? device.Description : 'NA');

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
    $('#coming_device_add-Type').val(type).trigger('change');
    $('#coming_device_add-Quantity').val(0);
    $('#coming_device_add-ExpectedDate').val(moment().format('YYYY-MM-DD'));

    $('#btn-add_device_coming').data('id', Id);
    $('#btn-add_device_coming').data('type', Type);

    $('#device_comming_add-modal').modal('show');
}
$('#btn-close_device_coming').click(function () {
    $('#device_comming-modal').modal('show');
    $('#device_comming_add-modal').modal('hide');
})
$('#btn-add_device_coming').click(function () {
    var IdDevice = $(this).data('id');
    var Type = $(this).data('type');

    var DeviceType = $('#coming_device_add-Type').val().split('_');

    var ComingDevice = {
        ExpectedDate: $('#coming_device_add-ExpectedDate').val(),
        Type: DeviceType[1],
        IsConsign: DeviceType[0] == 'consign' ? true : false,
        IdDevice: Type == 'confirm' ? IdDevice : null,
        IdDeviceUnconfirm: Type == 'unconfirm' ? IdDevice : null,
        ComingQty: parseInt($('#coming_device_add-Quantity').val())
    }

    if (ComingDevice <= 0) toastr["error"]('Coming quantity < 0, please double check.', "ERROR");

    $.ajax({
        type: "POST",
        url: `/NVIDIA/DeviceManagement/AddComingDevice`,
        data: JSON.stringify(ComingDevice),
        dataType: "json",
        contentType: "application/json;charset=utf-8",
        success: function (response) {
            if (response.status) {
                var device = response.ComingDevice;

                var row = CreateRowDatatable(device);
                tableDeviceInfo.row.add(row).draw(false);

                $('#device_comming_add-modal').modal('hide');
                $('#device_comming-modal').modal('show');

                toastr["success"]("Add device success.", "SUCCESS");
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

// Delete
async function Delete(elm, e) {
    e.preventDefault();

    var Id = $(elm).data('id');
    var Index = tableDeviceInfo.row(`[data-id="${Id}"]`).index();

    var device = await GetComingDevice(Id);
    // message box
    Swal.fire({
        title: `<strong style="font-size: 25px;">${i18next.t('device.management.delete_title')}</strong>`,
        html: `<table class="table table-striped table-bordered table-message">
                               <tbody>
                                    <tr>
                                       <td style="width: 150px">${i18next.t('device.management.pn')}</td>
                                       <td>${device.Device ? device.Device.DeviceCode : device.DeviceUnconfirm.DeviceCode}</td>
                                   </tr>
                                   <tr>
                                       <td style="width: 150px">${i18next.t('device.management.description')}</td>
                                       <td>${device.Device ? device.Device.DeviceName : device.DeviceUnconfirm.DeviceName}</td>
                                   </tr>
                                   <tr>
                                       <td style="width: 150px">Coming Quantity</td>
                                       <td>${device.ComingQty}</td>
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
                url: `/NVIDIA/DeviceManagement/DeleteComingDevice`,
                data: JSON.stringify({ Id }),
                dataType: "json",
                contentType: "application/json;charset=utf-8",
                success: function (response) {
                    if (response.status) {
                        tableDeviceInfo.row(Index).remove().draw(false);
                        toastr["success"]("Delete device success.", "SUCCESS");
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
// Update
async function Edit(elm, e) {
    e.preventDefault();

    var Id = $(elm).data('id');
    var Index = tableDeviceInfo.row(`[data-id="${Id}"]`).index();
    $('#btn-update_device_coming').data('id', Id);
    $('#btn-update_device_coming').data('index', Index);

    var ComingDevice = await GetComingDevice(Id);
    var device;

    if (ComingDevice.Device != null) {
        device = ComingDevice.Device
    }
    else {
        device = ComingDevice.DeviceUnconfirm;
    }

    $('#device_comming_edit-MTS').val(device.Product ? device.Product.MTS : 'NA');
    $('#device_comming_edit-DeviceCode').val(device.DeviceCode ? device.DeviceCode : 'NA');
    $('#device_comming_edit-Description').val(device.Description ? device.Description : 'NA');
    $('#device_comming_edit-Description').attr('title', device.Description ? device.Description : 'NA');

    var type = "";
    if (ComingDevice.Type == "S") ComingDevice.Type = "Static";
    if (ComingDevice.Type == "D") ComingDevice.Type = "Dynamic";
    if (ComingDevice.Type == "Consign") ComingDevice.Type = "NA";
    if (ComingDevice.IsConsign == true) {
        type = "consign_" + ComingDevice.Type;
    }
    else {
        type = "normal_" + ComingDevice.Type;
    }
    $('#device_comming_edit-Type').val(type).trigger('change');


    $('#device_comming_edit-Quantity').val(ComingDevice.ComingQty);
    $('#device_comming_edit-ExpectedDate').val(moment(ComingDevice.ExpectedDate).format('YYYY-MM-DD'));

    $('#device_comming_edit-modal').modal('show');
}
$('#btn-update_device_coming').click(function (e) {
    e.preventDefault();
    var IdDevice = $(this).data('id');
    var Index = tableDeviceInfo.row(`[data-id="${IdDevice}"]`).index();
    var DeviceType = $('#device_comming_edit-Type').val().split('_');

    var ComingDevice = {
        Id: IdDevice,
        ExpectedDate: $('#device_comming_edit-ExpectedDate').val(),
        Type: DeviceType[1],
        IsConsign: DeviceType[0] == 'consign' ? true : false,
        ComingQty: parseInt($('#device_comming_edit-Quantity').val())
    }

    if (ComingDevice <= 0) toastr["error"]('Coming quantity < 0, please double check.', "ERROR");

    $.ajax({
        type: "POST",
        url: `/NVIDIA/DeviceManagement/UpdateComingDevice`,
        data: JSON.stringify(ComingDevice),
        dataType: "json",
        contentType: "application/json;charset=utf-8",
        success: function (response) {
            if (response.status) {
                var row = CreateRowDatatable(response.ComingDevice, true);
                tableDeviceInfo.row(Index).data(row).draw(false);

                $('#device_comming_edit-modal').modal('hide');

                toastr["success"]("Update device success.", "SUCCESS");
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
// Details
$('#table_Devices tbody').on('dblclick', 'tr', async function (event) {
    event.preventDefault();
    $('#borrow_modal-name').hide()
    $('#details-location').hide();
    $('#device_details-layout').hide();
    $('#details-history').hide();
    $('#device_details-history').hide();

    var Id = $(this).data('id');

    $('#details_modal-footer').find('#btn-add_devicecoming').remove();


    var device = await GetComingDevice(Id);

    if (device.Device != null) {
        await FillDetailsDeviceData(device.Device);
    }
    else {
        await FillDetailsDeviceData(device.DeviceUnconfirm);
    }

    $('#device_details-modal').modal('show');
}); 
// Confirm
async function Confirm(elm, e) {
    e.preventDefault();

    var Id = $(elm).data('id');
    var Index = tableDeviceInfo.row(`[data-id="${Id}"]`).index();

    var device = await GetComingDevice(Id);
    // message box
    Swal.fire({
        title: `<strong style="font-size: 25px;">${i18next.t('device.management.confirm_title')}</strong>`,
        html: `<table class="table table-striped table-bordered table-message">
                   <tbody class="align-middle">
                        <tr>
                           <td style="width: 150px">${i18next.t('device.management.pn')}</td>
                           <td class="text-start">${device.Device ? device.Device.DeviceCode : device.DeviceUnconfirm.DeviceCode}</td>
                       </tr>
                       <tr>
                           <td style="width: 150px">${i18next.t('device.management.description')}</td>
                           <td class="text-start">${device.Device ? device.Device.DeviceName : device.DeviceUnconfirm.DeviceName}</td>
                       </tr>  
                       <tr>
                           <td style="width: 150px">Confirm Quantity</td>
                           <td class="text-start"><input type="number" min="0" max="${device.ComingQty}" class="form-control" id="_ConfirmQty" value="${device.ComingQty}"></td>
                       </tr>
                   </tbody>
               </table>`,
        icon: 'info',
        iconColor: '#15ca20',
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
            $.ajax({
                type: "POST",
                url: `/NVIDIA/DeviceManagement/ConfirmComingDevice`,
                data: JSON.stringify({ cDeviceId: Id, ConfirmQty: $('#_ConfirmQty').val() }),
                dataType: "json",
                contentType: "application/json;charset=utf-8",
                success: function (response) {
                    if (response.status) {
                        if (response.ComingDevice == true) {
                            tableDeviceInfo.row(Index).remove().draw(false);
                        }
                        else {
                            var row = CreateRowDatatable(response.ComingDevice, true);
                            tableDeviceInfo.row(Index).data(row).draw(false);
                        }                      
                        toastr["success"]("Confirm device success.", "SUCCESS");
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

    $('[aria-labelledby="swal2-title"]').width(800);
}

// Init Select2
function InitSelect2() {
    $('#select_warehouse', document).select2({
        theme: 'bootstrap4',
        dropdownParent: $("#device_comming-modal"),
        minimumResultsForSearch: -1,
    });
    $('#coming_device_add-Type').select2({
        theme: 'bootstrap4',
        minimumResultsForSearch: -1,
        dropdownParent: $("#device_comming_add-modal"),
        templateSelection: Selection
    });
    $('#device_comming_edit-Type').select2({
        theme: 'bootstrap4',
        minimumResultsForSearch: -1,
        dropdownParent: $("#device_comming_edit-modal"),
        templateSelection: Selection
    });
}
function Selection(item) {
    opt = $(item.element);
    og = opt.closest('optgroup').attr('label');
    return item.text + ' | ' + og;
};
