var PRDatatable, SimpleDevices, PurchaseRequests;

$(document).ready(() => {
    InitPRDatatable();
    CreatePRDatatable();
});

/* Datatable */
function InitPRDatatable() {
    var calc = CalcPRDatatable();

    const options = {
        autoWidth: true,
        deferRender: true,
        scrollX: true,
        scrollY: calc.TableHeight,
        lengthMenu: calc.LengthMenu,
        order: [0, 'desc'],
        columnDefs: [
            { targets: 0, visible: false },
            { targets: [7, 8], className: 'text-center' },
            { targets: [1], width: 150 },
            { targets: [2], width: 200 },
            { targets: [3, 4, 6, 7, 8], width: 120 },
            { targets: "_all", orderable: false },
            
        ],     
        dom: "<'row'<'w-auto'B><'col-sm-12 col-md'l><'col-sm-12 col-md'f>>" +
            "<'row'<'col-sm-12'tr>>" +
            "<'row'<'col-sm-12 col-md-7'i><'col-sm-12 col-md-5'p>>",
        buttons: [
            {
                text: '<i class="fa-solid fa-plus"></i> Create Request',
                action: function (e, dt, button, config) {
                    CreatePurchaseRequestOpen();                  
                }
            }
        ],
        language: {
            search: "<i class='fa fa-search'></i>",
        },
        createdRow: function (row, data, dataIndex) {
            $(row).addClass('cursor-pointer');
            $(row).data('id', data[0]);

            //var cells = $(row).children('td');
            //$(cells[0]).attr('title', data[1]);
            //$(cells[1]).attr('title', data[5]);
            //$(cells[2]).attr('title', data[6]);
            //$(cells[3]).attr('title', data[10]);
        },

    };
    PRDatatable = $('#PurchaseRequestDatatable').DataTable(options);
}
async function CreatePRDatatable() {
    try {
        PurchaseRequests = await GetPurchaseRequests();

        let rowDatas = [];
        PurchaseRequests.forEach((purchaseRequest) => {
            const rowData = CreatePRDatatableRow(purchaseRequest);
            rowDatas.push(rowData);
        });

        PRDatatable.rows.add(rowDatas).draw(false);
        PRDatatable.columns.adjust().draw(false);

    } catch (e) {
        console.error(e);
        Swal.fire('Sorry, something went wrong!', `${e}`, 'error');
    }
}
function CreatePRDatatableRow(purchaseRequest) {
    var totalDays = 0;
    purchaseRequest.DevicePRs.forEach((prDevice) => {
        if (prDevice.PR_CreatedDate && prDevice.PO_CreatedDate) {
            const thisDays = moment(prDevice.PO_CreatedDate).diff(moment(prDevice.PR_CreatedDate), 'days');
            if (thisDays > totalDays) totalDays = thisDays;
        }
    });

    return [
        purchaseRequest.Id,
        moment(purchaseRequest.DateRequest).format('YYYYMMDDHHmm_') + purchaseRequest.Id,
        CreateUserName(purchaseRequest.UserRequest),
        moment(purchaseRequest.DateRequest).format('YYYY-MM-DD HH:mm'),
        moment(purchaseRequest.DateRequired).format('YYYY-MM-DD HH:mm'),
        `<p class="text-start text-truncate m-0" style="max-width: 400px;" title="${purchaseRequest.Note}">${purchaseRequest.Note}</p>`,
        totalDays,
        CreatePRDatatableCellStatus(purchaseRequest),
        CreatePRDatatableCellButton(purchaseRequest)
    ];
}
function CreatePRDatatableCellStatus(purchaseRequest) {
    switch (purchaseRequest.Status) {
        case 'Open':
            return `<span class="badge bg-primary">Open</span>`;
        case 'PR Created':
            return `<span class="badge bg-warning">PR Created</span>`;
        case 'PO Created':
            return `<span class="badge bg-secondary">PO Created</span>`;
        case 'Shipping':
            return `<span class="badge bg-info">Shipping</span>`;
        case 'Closed':
            return `<span class="badge bg-success">Closed</span>`;
        case 'Rejected':
            return `<span class="badge bg-danger">Rejected</span>`;
    }
}
function CreatePRDatatableCellButton(purchaseRequest) {
    return `<div class="btn-group">
                <button class="btn btn-sm btn-info"    data-id="${purchaseRequest.Id}" onclick="DetailPurchaseRequestRow(this, event)"><i class="fa-duotone fa-info"></i></button>
                <button class="btn btn-sm btn-warning" data-id="${purchaseRequest.Id}" onclick="UpdatePurchaseRequestRow(this, event)"><i class="fa-duotone fa-pen"></i></button>
                <button class="btn btn-sm btn-danger"  data-id="${purchaseRequest.Id}" onclick="DeletePurchaseRequestRow(this, event)"><i class="fa-duotone fa-trash"></i></button>
            </div>`;
}
function CalcPRDatatable() {
    var windowHeight = $(window).height();

    var calcTable = {
        LengthMenu: [[], []],
        TableHeight: 0
    }

    if (windowHeight < 900) {
        calcTable.TableHeight = 46 * 9;
        calcTable.LengthMenu = [[8, 15, 25, 50, -1], [10, 15, 25, 50, "All"]];
    }
    else if (windowHeight == 900) {
        calcTable.TableHeight = 46 * 11;
        calcTable.LengthMenu = [[10, 15, 25, 50, -1], [10, 15, 25, 50, "All"]]
    }
    else if (windowHeight > 900 && windowHeight < 1080) {
        calcTable.TableHeight = 46 * 13;
        calcTable.LengthMenu = [[12, 15, 25, 50, -1], [12, 15, 25, 50, "All"]]
    }
    else {
        calcTable.TableHeight = 46 * 16;
        calcTable.LengthMenu = [[15, 25, 50, -1], [15, 25, 50, "All"]]
    }

    return calcTable;
}

/* Event Create */
async function CreatePurchaseRequestOpen() {
    try {
        $('#CreatePurchaseRequestModal-UserRequest').val('');
        $('#CreatePurchaseRequestModal-DateRequest').val('');
        $('#CreatePurchaseRequestModal-DateRequired').val('');
        $('#CreatePurchaseRequestModal-Note').val('');

        $('#CreatePurchaseRequestModal-TableDevice tbody').html(`<tr><td colspan="5">No devices.</td></tr>`);

        const sessionUsername = $('#CardID').text();
        if (!sessionUsername) {
            window.location.href = '/NVIDIA/Authentication/SignIn';
        }
        const sessionUser = await GetUserByUsername(sessionUsername);
        const username = sessionUser.VnName ? sessionUser.VnName : sessionUser.CnName ? sessionUser.CnName : sessionUser.EnName ? sessionUser.EnName : '';

        $('#CreatePurchaseRequestModal-UserRequest').data('id', sessionUser.Id);
        $('#CreatePurchaseRequestModal-UserRequest').val(`${sessionUser.Username} - ${username}`);

        $('#CreatePurchaseRequestModal-DateRequest').val(moment().format('YYYY-MM-DDTHH:mm'));

        $('#CreatePurchaseRequestModal').modal('show');
    } catch (e) {
        console.error(e);
        Swal.fire('Sorry, something went wrong!', `${e}`, 'error');
    }
}
async function CreatePurchaseRequestSave() {
    try {
        const data = {
            IdUserRequest: $('#CreatePurchaseRequestModal-UserRequest').data('id'),
            DateRequest: $('#CreatePurchaseRequestModal-DateRequest').val(),
            DateRequired: $('#CreatePurchaseRequestModal-DateRequired').val(),
            Note: $('#CreatePurchaseRequestModal-Note').val(),
            Status: 'Open',
            DevicePRs: $('#CreatePurchaseRequestModal-TableDevice tbody tr:not(:has(td[colspan]))').map(function (tr) {
                return {
                    IdDevice: $(this).find('select').val(),
                    Quantity: $(this).find('input').val()
                }
            }).get()
        };

        const validateResult = CreatePurchaseRequestValidate(data);
        if (validateResult) {
            toastr["warning"](validateResult, "WARNING");
            return false;
        }

        const responseResult = await CreatePurchaseRequest(data);
        if (responseResult) {
            const rowData = CreatePRDatatableRow(responseResult);

            PRDatatable.row.add(rowData);
            PRDatatable.columns.adjust().draw(false);

            $('#CreatePurchaseRequestModal').modal('hide');

            toastr["success"]('Create request success.', "SUCCRESS");
        }

    } catch (e) {
        console.error(e);
        Swal.fire('Sorry, something went wrong!', `${e}`, 'error');
    }
}
async function CreatePurchaseRequestDevice() {   
    try {
        let totalRow = $('#CreatePurchaseRequestModal-TableDevice tbody tr:not(:has(td[colspan]))').length;

        // remove row "no devices"
        if (totalRow === 0) $('#CreatePurchaseRequestModal-TableDevice tbody tr').remove();

        // Init
        let deviceTableTbody = $('#CreatePurchaseRequestModal-TableDevice tbody');
        if (!SimpleDevices) SimpleDevices = await GetSimpleDevices();

        // select + event
        let select = $(`<select class="form-select form-select-sm"></select>`);
        SimpleDevices.forEach(function (device) {
            select.append(`<option value="${device.Id}">${device.DeviceCode}</option>`);
        });
        select.change(function () {
            let deviceId = $(this).val();
            let device = SimpleDevices.find(function (d) { return d.Id == deviceId; });
            $(this).closest('tr').find('td:eq(2)').html($(`<p class="text-start text-truncate m-0" title="${device.DeviceName}">${device.DeviceName}</p>`));
        });

        // delete button + event
        let delButton = $(`<button type="button" class="btn btn-sm btn-danger"><i class="fa-duotone fa-trash"></i>`);
        delButton.click(function () {
            $(this).closest('tr').remove();
            if (deviceTableTbody.find('tr').length === 0) {
                deviceTableTbody.append(`<tr><td colspan="5">No devices.</td></tr>`);
            }
        });

        // create row
        let row = $(`<tr></tr>`)
            .append($(`<td style="min-width: 50px; width: 50px;">${++totalRow}</td>`))
            .append($(`<td style="min-width: 250px; width: 250px;"></td>`).append(select))
            .append($(`<td class="text-truncate" style="max-width: ${deviceTableTbody.width() - 550}px;"></td>`))
            .append($(`<td style="min-width: 100px; width: 100px;"></td>`).append($(`<input type="number" min="0" value="0" class="form-control" />`)))
            .append($(`<td style="min-width: 50px; width: 50px;"></td>`).append(delButton));

        deviceTableTbody.append(row);

        select.change();

        select.select2({
            theme: 'bootstrap4',
            dropdownParent: $("#CreatePurchaseRequestModal"),
        });
    } catch (e) {
        console.error(e);
        Swal.fire('Sorry, something went wrong!', `${e}`, 'error');
    }
    
}
function CreatePurchaseRequestValidate(PurchaseRequest) {
    if (!PurchaseRequest.IdUserRequest && PurchaseRequest.IdUserRequest == undefined) {
        return 'Your session has expired. Please log in again.'
    }
    if (isNaN(parseInt(PurchaseRequest.IdUserRequest))) {
        return 'Your session has expired. Please log in again.';
    }
    if (!PurchaseRequest.DateRequest) {
        $('#CreatePurchaseRequestModal-DateRequest').focus();

        return 'Please provide the date of your purchase request.';
    }
    if (!PurchaseRequest.DateRequired) {
        $('#CreatePurchaseRequestModal-DateRequired').focus();

        return 'Please chosse the required date for your purchase.';
    }
    if (!PurchaseRequest.Note) {
        $('#CreatePurchaseRequestModal-Note').focus();

        return 'Please provide a note for your purchase request.';
    }
    if (PurchaseRequest.DevicePRs.length === 0) {
        return 'You have not added any devices to your purchase request.';
    }

    $(PurchaseRequest.DevicePRs).each((index, device) => {
        if (device.Quantity == 0) {
            const thisRow = $('#CreatePurchaseRequestModal-TableDevice tbody tr').eq(index);
            thisRow.find('input').focus();

            return 'Quantity of at least one device is invalid. Please provide a valid quantity for each device.';
        }
    });
    
    return '';
}

/* Event Update */
async function UpdatePurchaseRequestRow(elm, e) {
    try {
        const Id = $(elm).data('id');
        const RowIndex = PRDatatable.row($(elm).closest('tr')).index()

        const responsePurchaseRequest = await GetPurchaseRequest(Id);

        if (responsePurchaseRequest) {
            UpdatePurchaseRequestOpen(responsePurchaseRequest, Id, RowIndex);
        }

    } catch (e) {
        console.error(e);
        Swal.fire('Sorry, something went wrong!', `${e}`, 'error');
    }
}

var UpdatePurchaseRequestDatatable;
function UpdatePurchaseRequestOpen(PurchaseRequest, Id, RowIndex) {
    const username = PurchaseRequest.UserRequest.VnName ?
        PurchaseRequest.UserRequest.VnName : PurchaseRequest.UserRequest.CnName ?
            PurchaseRequest.UserRequest.CnName : PurchaseRequest.UserRequest.EnName ?
                PurchaseRequest.UserRequest.EnName : 'Unknown';

    // Info
    $('#UpdatePurchaseRequestModal-Id').val(Id);
    $('#UpdatePurchaseRequestModal-RowIndex').val(RowIndex);
    $('#UpdatePurchaseRequestModal-Status').val(PurchaseRequest.Status);

    $('#UpdatePurchaseRequestModal-UserRequest').val(username);
    $('#UpdatePurchaseRequestModal-UserRequest').data('id', PurchaseRequest.IdUserRequest);

    $('#UpdatePurchaseRequestModal-DateRequest').val(moment(PurchaseRequest.DateRequest).format('YYYY-MM-DDTHH:mm'));
    $('#UpdatePurchaseRequestModal-DateRequired').val(moment(PurchaseRequest.DateRequired).format('YYYY-MM-DDTHH:mm'));
    $('#UpdatePurchaseRequestModal-Note').val(PurchaseRequest.Note);

    InitUpdatePurchaseRequestDatatable();

    UpdatePurchaseRequestDatatable.clear();
    let rowDatas = [];
    $(PurchaseRequest.DevicePRs).each((index, devicePR) => {
        let col_0 = devicePR.Id;
        let col_1 = index + 1;
        let col_2 = `<label title="${devicePR.Device.DeviceName}" data-id="${devicePR.Device.Id}" Device>${devicePR.Device.DeviceCode}</label>`;
        let col_3 = `<label Quantity>${devicePR.Quantity}</label>`;
        let col_4 = `<input type="text" class="form-control form-control-sm" PR_No data-id="${devicePR.Id}" value="${devicePR.PR_No ? devicePR.PR_No : ''}" />`;
        let col_5 = `<input type="number" class="form-control form-control-sm" min="0" PR_Quantity value="${devicePR.PR_Quantity ? devicePR.PR_Quantity : ''}" />`;
        let col_6 = `<input type="datetime-local" class="form-control form-control-sm" style="width: 170px;" PR_CreatedDate value="${devicePR.PR_CreatedDate ? moment(devicePR.PR_CreatedDate).format('YYYY-MM-DDTHH:mm') : ''}" />`;
        let col_7 = `<input type="text" class="form-control form-control-sm" PO_No value="${devicePR.PO_No ? devicePR.PO_No : ''}"/>`;
        let col_8 = `<input type="datetime-local" class="form-control form-control-sm" style="width: 170px;" PO_CreatedDate value="${devicePR.PO_CreatedDate ? moment(devicePR.PO_CreatedDate).format('YYYY-MM-DDTHH:mm') : ''}" />`;
        let col_9 = `<input type="datetime-local" class="form-control form-control-sm" style="width: 170px;" ETD_Date value="${devicePR.ETD_Date ? moment(devicePR.ETD_Date).format('YYYY-MM-DDTHH:mm') : ''}"/>`;
        let col_10 = `<input type="datetime-local" class="form-control form-control-sm" style="width: 170px;" ETA_Date value="${devicePR.ETA_Date ? moment(devicePR.ETA_Date).format('YYYY-MM-DDTHH:mm') : ''}"/>`;
        let col_11 = `<button class="btn btn-sm btn-outline-primary" onclick="UpdatePurchaseRequestDatatableRow(this, event)"><i class="fa-solid fa-plus"></i></button>`;

        const rowData = [col_0, col_1, col_2, col_3, col_4, col_5, col_6, col_7, col_8, col_9, col_10, col_11];
       
        rowDatas.push(rowData);

    });

    UpdatePurchaseRequestDatatable.rows.add(rowDatas).draw(false);

    $('#UpdatePurchaseRequestModal').modal('show');

}
function UpdatePurchaseRequestDatatableRow(elm, e) {
    try {
        let thisRow = $(elm).closest('tr');

        let col_4 = thisRow.find('[PR_No]').closest('td');
        col_4.append($(`<input type="text" class="form-control form-control-sm mt-2" PR_No />`));

        let col_5 = thisRow.find('[PR_Quantity]').closest('td');
        col_5.append($(`<input type="number" class="form-control form-control-sm mt-2" min="0" PR_Quantity />`));

        let col_6 = thisRow.find('[PR_CreatedDate]').closest('td');
        col_6.append($(`<input type="datetime-local" class="form-control form-control-sm mt-2" style="width: 170px;" PR_CreatedDate />`));

        let col_7 = thisRow.find('[PO_No]').closest('td');
        col_7.append($(`<input type="text" class="form-control form-control-sm mt-2" PO_No />`));

        let col_8 = thisRow.find('[PO_CreatedDate]').closest('td');
        col_8.append($(`<input type="datetime-local" class="form-control form-control-sm mt-2" style="width: 170px;" PO_CreatedDate />`));

        let col_9 = thisRow.find('[ETD_Date]').closest('td');
        col_9.append($(`<input type="datetime-local" class="form-control form-control-sm mt-2" style="width: 170px;" ETD_Date />`));

        let col_10 = thisRow.find('[ETA_Date]').closest('td');
        col_10.append($(`<input type="datetime-local" class="form-control form-control-sm mt-2" style="width: 170px;" ETA_Date />`));


    } catch (e) {
        console.error(e);
        Swal.fire('Sorry, something went wrong!', `${e}`, 'error');
    }
}
function InitUpdatePurchaseRequestDatatable() {
    if (!UpdatePurchaseRequestDatatable) {
        const options = {
            autoWidth: true,
            deferRender: true,
            scrollX: true,
            searching: false,
            paging: false,
            info: false,
            searching: false,
            order: [0, 'asc'],           
            columnDefs: [
                { targets: 0, visible: false },
                { targets: [1, 3], className: 'text-center' },
                { targets: [2], width: 200 },
                { targets: [4, 7], width: 250 },
                { targets: [5], width: 120 },
                
                { targets: "_all", orderable: false },

            ],
            createdRow: function (row, data, dataIndex) {
                $(row).addClass('cursor-pointer');
                $(row).data('id', data[0]);
            },
        };
        UpdatePurchaseRequestDatatable = $('#UpdatePurchaseRequestModal-TableDevice').DataTable(options);
    }
   
}
$('#UpdatePurchaseRequestModal').on('shown.bs.modal', function (e) {
    UpdatePurchaseRequestDatatable.columns.adjust().draw(false);
});
async function UpdatePurchaseRequestSave() {
    try {
        const sessionUsername = $('#CardID').text();
        if (!sessionUsername) {
            window.location.href = '/NVIDIA/Authentication/SignIn';
        }
        const sessionUser = await GetUserByUsername(sessionUsername);

        const RowIndex = $('#UpdatePurchaseRequestModal-RowIndex').val();

        var data = {
            Id: $('#UpdatePurchaseRequestModal-Id').val(),
            IdUserRequest: $('#UpdatePurchaseRequestModal-UserRequest').data('id'),
            DateRequest: $('#UpdatePurchaseRequestModal-DateRequest').val(),
            DateRequired: $('#UpdatePurchaseRequestModal-DateRequired').val(),
            Note: $('#UpdatePurchaseRequestModal-Note').val(),
            Status: $('#UpdatePurchaseRequestModal-Status').val(),        
        };

        data.DevicePRs = $('#UpdatePurchaseRequestModal-TableDevice tbody tr').map(function (tr) {
            const rowCount = $(this).find('[PR_No]').length;
            var datas = [];
            for (let i = 0; i < rowCount; i++) {
                datas.push({
                    Id: $(this).find('[PR_No]').eq(i).data('id'),
                    IdPurchaseRequest: $('#UpdatePurchaseRequestModal-Id').val(),
                    IdDevice: $(this).find('[Device]').data('id'),
                    IdUserCreated: sessionUser.Id,
                    Quantity: $(this).find('[Quantity]').text(),
                    PR_No: $(this).find('[PR_No]').eq(i).val(),
                    PR_Quantity: $(this).find('[PR_Quantity]').eq(i).val(),
                    PR_CreatedDate: $(this).find('[PR_CreatedDate]').eq(i).val(),
                    PO_No: $(this).find('[PO_No]').eq(i).val(),
                    PO_CreatedDate: $(this).find('[PO_CreatedDate]').eq(i).val(),
                    ETD_Date: $(this).find('[ETD_Date]').eq(i).val(),
                    ETA_Date: $(this).find('[ETA_Date]').eq(i).val(),
                });
            }
            return datas
        }).get()

        const responseResult = await UpdatePurchaseRequest(data);
        if (responseResult) {
            const rowData = CreatePRDatatableRow(responseResult);

            PRDatatable.row(RowIndex).data(rowData);
            PRDatatable.columns.adjust().draw(false);

            $('#UpdatePurchaseRequestModal').modal('hide');

            toastr["success"]('Update request success.', "SUCCRESS");
        }

    } catch (e) {
        console.error(e);
        Swal.fire('Sorry, something went wrong!', `${e}`, 'error');
    }
}

/* Event Delete */
async function DeletePurchaseRequestRow(elm, e) {
    try {


        const Id = $(elm).data('id');
        const RowIndex = PRDatatable.row($(elm).closest('tr')).index()

        const responsePurchaseRequest = await GetPurchaseRequest(Id);

        if (responsePurchaseRequest) {
            DeletePurchaseRequestOpen(responsePurchaseRequest, RowIndex);
        }

    } catch (e) {
        console.error(e);
        Swal.fire('Sorry, something went wrong!', `${e}`, 'error');
    }
}
function DeletePurchaseRequestOpen(PurchaseRequest, RowIndex) {
    Swal.fire({
        title: `<strong style="font-size: 25px;">Do you want Delete this request?</strong>`,
        html: `<table class="table table-striped table-bordered table-message">
                               <tbody>
                                    <tr>
                                       <td>CODE</td>
                                       <td>${moment(PurchaseRequest.DateRequest).format('YYYYMMDDHHmm_') + PurchaseRequest.Id}</td>
                                   </tr>
                                    <tr>
                                       <td>USER REQUEST</td>
                                       <td>${CreateUserName(PurchaseRequest.UserRequest) }</td>
                                   </tr>
                                   <tr>
                                       <td>REQUIRED DATE</td>
                                       <td>${moment(PurchaseRequest.DateRequest).format('YYYY-MM-DD HH:mm') }</td>
                                   </tr>
                                   <tr>
                                       <td>NOTE</td>
                                       <td>${PurchaseRequest.Note}</td>
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
    }).then(async (result) => {
        if (result.isConfirmed) {
            await DeletePurchaseRequestSave(PurchaseRequest.Id, RowIndex);
        }
    });
}
async function DeletePurchaseRequestSave(IdPurchaseRequest, RowIndex) {
    try {
        var responseDelete = await DeletePurchaseRequest(IdPurchaseRequest);

        if (responseDelete) {
            PRDatatable.row(RowIndex).remove().draw(false);

            toastr["success"]('Delete request success.', "SUCCRESS");
        }

    } catch (e) {
        console.error(e);
        Swal.fire('Sorry, something went wrong!', `${e}`, 'error');
    }
}