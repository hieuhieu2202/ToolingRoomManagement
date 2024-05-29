/* Event NV Create */
var CretaeNvidiaBuyDatatable, rowsCount = 1;
function InitCreateNvidiaBuyDatatable() {
    if (!CretaeNvidiaBuyDatatable) {
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
        CretaeNvidiaBuyDatatable = $('#CreateNvidiaBuyModal-TableDevice').DataTable(options);
    }

}
async function CreateNvidiaBuyOpen() {
    try {
        $('#CreateNvidiaBuyModal-UserRequest').data('id', SessionUser.Id);
        $('#CreateNvidiaBuyModal-UserRequest').val(`${SessionUsername}`);

        InitCreateNvidiaBuyDatatable();
        CretaeNvidiaBuyDatatable.clear();
        if (!SimpleDevices) SimpleDevices = await GetSimpleDevices();

        // select + event
        let select = $(`<select class="form-select form-select-sm" Device></select>`);
        SimpleDevices.forEach(function (device) {
            select.append(`<option value="${device.Id}" title="${device.DeviceName}">${device.DeviceCode}</option>`);
        });

        let col_0 = '';
        let col_1 = '1';
        let col_2 = select.prop('outerHTML');
        let col_3 = `<input type="number" class="form-control form-control-sm" min="0" Quantity />`;
        let col_4 = `<input type="text" class="form-control form-control-sm" PR_No  />`;
        let col_5 = `<input type="number" class="form-control form-control-sm" min="0" PR_Quantity />`;
        let col_6 = `<input type="datetime-local" class="form-control form-control-sm" style="width: 170px;" PR_CreatedDate />`;
        let col_7 = `<input type="text" class="form-control form-control-sm" PO_No />`;
        let col_8 = `<input type="datetime-local" class="form-control form-control-sm" style="width: 170px;" PO_CreatedDate />`;
        let col_9 = `<input type="datetime-local" class="form-control form-control-sm" style="width: 170px;" ETD_Date />`;
        let col_10 = `<input type="datetime-local" class="form-control form-control-sm" style="width: 170px;" ETA_Date />`;

        const rowData = [col_0, col_1, col_2, col_3, col_4, col_5, col_6, col_7, col_8, col_9, col_10];

        CretaeNvidiaBuyDatatable.row.add(rowData).draw(false);

        $('#CreateNvidiaBuyModal-TableDevice select').select2({
            theme: 'bootstrap4',
            dropdownParent: $("#CreateNvidiaBuyModal"),
        });
        $('#CreateNvidiaBuyModal-TableDevice select').on('change', () => {
            CretaeNvidiaBuyDatatable.columns.adjust().draw(false);
        });

        $('#CreateNvidiaBuyModal').modal('show');
    } catch (e) {
        console.error(e);
        Swal.fire('Sorry, something went wrong!', `${e}`, 'error');
    }

}
function CreateNvidiaBuyAddDevice() {
    // select + event
    let select = $(`<select class="form-select form-select-sm" Device></select>`);
    SimpleDevices.forEach(function (device) {
        select.append(`<option value="${device.Id}" title="${device.DeviceName}">${device.DeviceCode}</option>`);
    });

    let col_0 = '';
    let col_1 = ++rowsCount;
    let col_2 = select.prop('outerHTML');
    let col_3 = `<input type="number" class="form-control form-control-sm" min="0" Quantity />`;
    let col_4 = `<input type="text" class="form-control form-control-sm" PR_No  />`;
    let col_5 = `<input type="number" class="form-control form-control-sm" min="0" PR_Quantity />`;
    let col_6 = `<input type="datetime-local" class="form-control form-control-sm" style="width: 170px;" PR_CreatedDate />`;
    let col_7 = `<input type="text" class="form-control form-control-sm" PO_No />`;
    let col_8 = `<input type="datetime-local" class="form-control form-control-sm" style="width: 170px;" PO_CreatedDate />`;
    let col_9 = `<input type="datetime-local" class="form-control form-control-sm" style="width: 170px;" ETD_Date />`;
    let col_10 = `<input type="datetime-local" class="form-control form-control-sm" style="width: 170px;" ETA_Date />`;

    const rowData = [col_0, col_1, col_2, col_3, col_4, col_5, col_6, col_7, col_8, col_9, col_10];
    CretaeNvidiaBuyDatatable.row.add(rowData).draw(false);

    $('#CreateNvidiaBuyModal-TableDevice select').select2({
        theme: 'bootstrap4',
        dropdownParent: $("#CreateNvidiaBuyModal"),
    });
    $('#CreateNvidiaBuyModal-TableDevice select').on('change', () => {
        CretaeNvidiaBuyDatatable.columns.adjust().draw(false);
    });
}
async function CreateNvidiaBuySave() {
    try {
        const data = {
            IdUserRequest: $('#CreateNvidiaBuyModal-UserRequest').data('id'),
            DateRequest: $('#CreateNvidiaBuyModal-DateRequest').val(),
            DateRequired: $('#CreateNvidiaBuyModal-DateRequired').val(),
            Note: $('#CreateNvidiaBuyModal-Note').val(),
            Status: 'Open',
            Type: 'NV',
        };

        data.DevicePRs = $('#CreateNvidiaBuyModal-TableDevice tbody tr').map(function (tr) {
            const rowCount = $(this).find('[Device]').length;
            var datas = [];
            for (let i = 0; i < rowCount; i++) {
                datas.push({
                    IdDevice: $(this).find('[Device]').val(),
                    IdUserCreated: SessionUser.Id,
                    Quantity: $(this).find('[Quantity]').val(),
                    PR_No: $(this).find('[PR_No]').eq(i).val(),
                    PR_Quantity: $(this).find('[PR_Quantity]').eq(i).val(),
                    PR_CreatedDate: $(this).find('[PR_CreatedDate]').eq(i).val(),
                    PO_No: $(this).find('[PO_No]').eq(i).val(),
                    PO_CreatedDate: $(this).find('[PO_CreatedDate]').eq(i).val(),
                    ETD_Date: $(this).find('[ETD_Date]').eq(i).val(),
                    ETA_Date: $(this).find('[ETA_Date]').eq(i).val(),
                });
            }
            return datas;
        }).get();

        const validateResult = CreateNvidiaBuyValidate(data);
        if (validateResult) {
            toastr["warning"](validateResult, "WARNING");
            return false;
        }

        const responseResult = await CreatePurchaseRequest(data);
        if (responseResult) {
            const rowData = CreatePRDatatableRow(responseResult);

            PRDatatable.row.add(rowData);
            PRDatatable.columns.adjust().draw(false);

            $('#CreateNvidiaBuyModal').modal('hide');

            toastr["success"]('Create request success.', "SUCCRESS");
        }

    } catch (e) {
        console.error(e);
        Swal.fire('Sorry, something went wrong!', `${e}`, 'error');
    }
}
function CreateNvidiaBuyValidate(PurchaseRequest) {
    if (!PurchaseRequest.IdUserRequest && PurchaseRequest.IdUserRequest == undefined) {
        return 'Your session has expired. Please log in again.'
    }
    if (isNaN(parseInt(PurchaseRequest.IdUserRequest))) {
        return 'Your session has expired. Please log in again.';
    }
    if (!PurchaseRequest.DateRequest) {
        $('#CreateNvidiaBuyModal-DateRequest').focus();

        return 'Please provide the date of your purchase request.';
    }
    if (!PurchaseRequest.DateRequired) {
        $('#CreateNvidiaBuyModal-DateRequired').focus();

        return 'Please chosse the required date for your purchase.';
    }
    if (!PurchaseRequest.Note) {
        $('#CreateNvidiaBuyModal-Note').focus();

        return 'Please provide a note for your purchase request.';
    }
    if (PurchaseRequest.DevicePRs.length === 0) {
        return 'You have not added any devices to your purchase request.';
    }

    let valiResult = '';
    $(PurchaseRequest.DevicePRs).each((index, device) => {
        if (device.Quantity == 0) {
            const thisRow = $('#CreateNvidiaBuyModal-TableDevice tbody tr').eq(index);
            thisRow.find('input').eq(0).focus();

            valiResult = 'Quantity of at least one device is invalid. Please provide a valid quantity for each device.';
            return false;
        }
    });

    if (valiResult) return valiResult;
    else return '';
}
$('#CreateNvidiaBuyModal').on('shown.bs.modal', function (e) {
    CretaeNvidiaBuyDatatable.columns.adjust().draw(false);
});
$(document).on('dblclick', '#CreateNvidiaBuyModal-TableDevice td', (e) => {
    let row = $(e.target).closest('tr');
    CretaeNvidiaBuyDatatable.row(row).remove().draw(false);
});