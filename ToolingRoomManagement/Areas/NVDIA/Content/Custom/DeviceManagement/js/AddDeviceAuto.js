$(function () {
    SendFileToServer();
});

// Send BOM file function
$('#fileInput').on('change', function (e) {
    e.preventDefault();

    let count = 0;
    progressMove(count);
    SendFileToServer();
    //const processInterval = setInterval(() => {
    //	count += 1;
    //	progressMove(count);
    //	$('.uploaded-file__info-process').css('width', `${count}%`);
    //	if (count == 100 || count == '100') {
    //		clearInterval(processInterval);
    //	}
    //},50)

});
function SendFileToServer() {
    const fileInput = document.querySelector('#fileInput');
    const file = fileInput.files[0];

    const formData = new FormData();
    formData.append('file', file);

    const IdWareHouse = 1;
    formData.append('IdWareHouse', IdWareHouse);

    $.ajax({
        url: "/NVDIA/DeviceManagement/AddDeviceAuto",
        data: formData,
        type: "POST",
        processData: false,
        contentType: false,
        success: function (response) {
            if (response.status) {
                var devices = response.devices;

                CreateTableAddDevice(devices);
                CreateBomFileInfo(response);
            }
            else {
                Swal.fire('Sorry, something went wrong!', response.message, 'error');
            }
        },
        error: function (error) {
            Swal.fire('Sorry, something went wrong!', GetAjaxErrorMessage(error), 'error');
        }
    });
}

// Affter send BOM file function
var tableDeviceInfo;
async function CreateTableAddDevice(devices) {
    if (tableDeviceInfo) tableDeviceInfo.destroy();

    await $.each(devices, function (no, item) {
        var row = $('<tr class="align-middle"></tr>');

        // DeviceCode
        row.append(`<td data-id="${item.Id}" data-code="${item.DeviceCode}">${item.DeviceCode}</td>`);
        // DeviceName
        row.append(`<td>${item.DeviceName}</td>`);
        // Group
        try {
            row.append(`<td>${item.Group.GroupName}</td>`);
        }
        catch {
            row.append(`<td>N/A</td>`);
        }       
        // Vendor
        try {
            row.append(`<td>${item.Vendor.VendorName}</td>`);
        }
        catch {
            row.append(`<td>N/A</td>`);
        }       
        // Buffer
        row.append(`<td>${item.Buffer * 100}%</td>`);
        // Quantity
        row.append(`<td>${item.Quantity}</td>`);
        // Type
        switch (item.Type) {
            case "S": {
                row.append(`<td><span class="text-success fw-bold">Static</span></td>`);
                break;
            }
            case "D": {
                row.append(`<td><span class="text-info fw-bold">Dynamic</span></td>`);
                break;
            }
            default: {
                row.append(`<td><span class="text-secondary fw-bold">N/A</span></td>`);
                break;
            }
        }
        // Status
        switch (item.Status) {
            case "New": {
                row.append(`<td><span class="badge bg-info">New</span></td>`);
                break;
            }
            case "Update": {
                row.append(`<td><span class="badge bg-primary">Update</span></td>`);
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
            case "Depleted": {
                row.append(`<td><span class="badge bg-danger">Depleted</span></td>`);
                break;
            }
            default: {
                row.append(`<td>N/A</td>`);
                break;
            }
        }
        // Action
        row.append(`<td><div class="d-flex order-actions">                            
                            <a href="javascript:;" class="text-warning bg-light-warning border-0     " data-id="${item.Id}" onclick="Edit(this, event)"  ><i class="bx bxs-edit"></i></a>
                            <a href="javascript:;" class="text-danger  bg-light-danger  border-0 ms-2" data-id="${item.Id}" onclick="Delete(this, event)"><i class="bx bxs-trash"></i></a>
						</div></td>`);

        $('#table_addDevice_tbody').append(row);
    });

    $('#card-device-details').fadeIn(300); 
    
    const options = {
        scrollY: 530,
        scrollX: true,
        order: [],
        columnDefs: [
            { targets: [0, 1, 5, 7], orderable: true },
            { targets: "_all", orderable: false },
            { targets: [ 6, 7 ,8], className: "text-center" },
        ],
        checkboxes: {
            selectRow: true,
            selectAllPages: false
        },
        createdRow: function (row, data, dataIndex) {
            //var checkbox = $('td', row).eq(0).find('input[type="checkbox"]');

            //checkbox.on('click', function () {
            //    ShowGroup(CountChecked());
            //});
        },        
    };
    tableDeviceInfo = $('#table_addDevice').DataTable(options);
    tableDeviceInfo.columns.adjust();
}
async function CreateBomFileInfo(data) {
    const models = data.models.length;
    const groups = data.groups.length;
    const stations = data.stations.length;
    const vendors = data.vendors.length;
    const devices = data.devices.length;
    let quantity = 0;

    await $.each(data.devices, function (k, item) {
        quantity += item.Quantity;
    });

    $('#info_models').val(models);
    $('#info_groups').val(groups);
    $('#info_stations').val(stations);
    $('#info_vendors').val(vendors);
    $('#info_devices').val(devices);
    $('#info_quantity').val(quantity);

    $('#bom-info').fadeIn(300);
}

// Delete function
function Delete(elm, e) {
    e.preventDefault();

    var Id = $(elm).data('id');
    var Index = $(elm).closest('tr').index();

    // message box
    Swal.fire({
        title: `<strong>Do you want delete this device?</strong>`,
        html: `<label class="text-danger">You won't be able to revert this!</label>`,
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
                url: "/NVDIA/DeviceManagement/DeleteDevice",
                data: JSON.stringify({ Id: Id }),
                dataType: "json",
                contentType: "application/json;charset=utf-8",
                success: function (response) {
                    if (response.status) {
                        tableDeviceInfo.row(Index).remove().draw();

                        toastr["success"]("Delete device success", "SUCCRESS");
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

// Edit function
function Edit(elm, e) {
    e.preventDefault();

    var Id = $(elm).data('id');
    var Index = $(elm).closest('tr').index();

    $.ajax({
        type: "POST",
        url: "/NVDIA/DeviceManagement/GetDevice",
        data: JSON.stringify({ Id: Id }),
        dataType: "json",
        contentType: "application/json;charset=utf-8",
        success: function (response) {
            if (response.status) {
                FillEditDeviceData(response);

                $('#button-save_modal').data('id', Id);
                $('#button-save_modal').data('index', Index);

                $('#device-edit_modal').modal('show');
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

    // warehouse
    $('#device-edit_WareHouse').html('');
    await $.each(data.warehouses, function (k, item) {
        let opt = $(`<option value="${item.Id}">${item.WarehouseName}</option>`);
        $('#device-edit_WareHouse').append(opt);
    });
    // group
    $('#device-edit_Group').html('');
    await $.each(data.groups, function (k, item) {
        let opt = $(`<option value="${item.Id}">${item.GroupName}</option>`);
        $('#device-edit_Group').append(opt);
    });
    // vendor
    $('#device-edit_Vendor').html('');
    await $.each(data.vendors, function (k, item) {
        let opt = $(`<option value="${item.Id}">${item.VendorName}</option>`);
        $('#device-edit_Vendor').append(opt);
    });

    $('#device-edit_DeviceId').val(data.device.Id);
    $('#device-edit_DeviceCode').val(data.device.DeviceCode);
    $('#device-edit_DeviceName').val(data.device.DeviceName);
    $('#device-edit_DeviceDate').val(moment(data.device.DeviceDate).format('YYYY-MM-DD HH:mm'));
    $('#device-edit_Buffer').val(data.device.Buffer);
    $('#device-edit_Quantity').val(data.device.Quantity);
    $('#device-edit_Type').val(data.device.Type);
    $('#device-edit_Status').val(data.device.Status);
    $('#device-edit_WareHouse').val(data.device.IdWareHouse).trigger('change');;
    $('#device-edit_Group').val(data.device.IdGroup).trigger('change');;
    $('#device-edit_Vendor').val(data.device.IdVendor).trigger('change');;
}
$('#button-save_modal').on('click', function (e) {
    e.preventDefault();
    
    var device = GetModalData();
    var rowData = tableDeviceInfo.rows({ page: 'all' }).data();
    var Index = rowData.toArray().findIndex(function (data) {
        return data[0] === device.DeviceCode;
    });   

    $.ajax({
        type: "POST",
        url: "/NVDIA/DeviceManagement/UpdateDevice",
        data: JSON.stringify(device),
        dataType: "json",
        contentType: "application/json;charset=utf-8",
        success: function (response) {
            if (response.status) {
                var row = [];
                {
                    // DeviceCode
                    row.push(response.device.DeviceCode);
                    // DeviceName
                    row.push(response.device.DeviceName);
                    // Group
                    try {
                        row.push(response.device.Group.GroupName);
                    }
                    catch {
                        row.push(`N/A`);
                    }
                    // Vendor
                    try {
                        row.push(response.device.Vendor.VendorName);
                    }
                    catch {
                        row.push(`N/A`);
                    }
                    // Buffer
                    row.push(response.device.Buffer * 100);
                    // Quantity
                    row.push(response.device.Quantity);
                    // Type
                    switch (response.device.Type) {
                        case "S": {
                            row.push(`<span class="text-success fw-bold">Static</span>`);
                            break;
                        }
                        case "D": {
                            row.push(`<span class="text-info fw-bold">Dynamic</span>`);
                            break;
                        }
                        default: {
                            row.push(`<span class="text-secondary fw-bold">N/A</span>`);
                            break;
                        }
                    }
                    // Status
                    switch (response.device.Status) {
                        case "New": {
                            row.push(`<span class="badge bg-info">New</span>`);
                            break;
                        }
                        case "Update": {
                            row.push(`<span class="badge bg-primary">Update</span>`);
                            break;
                        }
                        case "Confirmed": {
                            row.push(`<span class="badge bg-success">Confirmed</span>`);
                            break;
                        }
                        case "Locked": {
                            row.push(`<span class="badge bg-secondary">Locked</span>`);
                            break;
                        }
                        case "Depleted": {
                            row.push(`<span class="badge bg-danger">Depleted</span>`);
                            break;
                        }
                        default: {
                            row.push(`<td>N/A</td>`);
                            break;
                        }
                    }
                    // Action
                    row.push(`<div class="d-flex order-actions">                            
                                <a href="javascript:;" class="text-warning bg-light-warning border-0     " data-id="${response.device.Id}" onclick="Edit(this, event)"  ><i class="bx bxs-edit"></i></a>
                                <a href="javascript:;" class="text-danger  bg-light-danger  border-0 ms-2" data-id="${response.device.Id}" onclick="Delete(this, event)"><i class="bx bxs-trash"></i></a>
						      </div>`);
                }
                tableDeviceInfo.row(Index).data(row).draw(false);

                $('#device-edit_modal').modal('hide');

                Swal.fire("Update data success!", "", "success");
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
        Id: $('#device-edit_DeviceId').val(),
        DeviceCode: $('#device-edit_DeviceCode').val(),
        DeviceName: $('#device-edit_DeviceName').val(),
        DeviceDate: $('#device-edit_DeviceDate').val(),
        Buffer: $('#device-edit_Buffer').val(),
        Quantity: $('#device-edit_Quantity').val(),
        Type: $('#device-edit_Type').val(),
        Status: $('#device-edit_Status').val(),
        IdWareHouse: $('#device-edit_WareHouse').val(),
        IdGroup: $('#device-edit_Group').val(),
        IdVendor: $('#device-edit_Vendor').val(),
    }
}

// confirm function
$('#confirm').on('click', function (e) {
    e.preventDefault();

    var Ids = [];
    tableDeviceInfo.rows({ page: 'all' }).every(function () {
        var firstCellData = this.cell(this.index(), 0).node();
        Ids.push($(firstCellData).data('id'));
    });
    console.log(Ids);
});
// Other function
function GetAjaxErrorMessage(error) {

    var regex = new RegExp(`<title>(.*?)<\/title>`);
    var match = regex.exec(error.responseText);

    if (match && match.length >= 2) {
        var extractedContent = match[1];
        return extractedContent;
    } else {
        return "Lỗi không xác định.";
    }
}