/* Event FXN Create */
async function CreatePurchaseRequestOpen() {
    try {
        $('#CreatePurchaseRequestModal-UserRequest').val('');
        $('#CreatePurchaseRequestModal-DateRequest').val('');
        $('#CreatePurchaseRequestModal-DateRequired').val('');
        $('#CreatePurchaseRequestModal-Note').val('');

        $('#CreatePurchaseRequestModal-TableDevice tbody').html(`<tr><td colspan="5">No devices.</td></tr>`);

        $('#CreatePurchaseRequestModal-UserRequest').data('id', SessionUser.Id);
        $('#CreatePurchaseRequestModal-UserRequest').val(`${SessionUsername}`);

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
            Type: 'FXN',
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