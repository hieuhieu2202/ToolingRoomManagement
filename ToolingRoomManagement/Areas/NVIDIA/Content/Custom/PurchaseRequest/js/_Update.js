/* Event Update */
var UpdatePurchaseRequestDatatable;
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
function UpdatePurchaseRequestOpen(PurchaseRequest, Id, RowIndex) {
    const username = PurchaseRequest.UserRequest.VnName ?
        PurchaseRequest.UserRequest.VnName : PurchaseRequest.UserRequest.CnName ?
            PurchaseRequest.UserRequest.CnName : PurchaseRequest.UserRequest.EnName ?
                PurchaseRequest.UserRequest.EnName : 'Unknown';

    // Info
    $('#UpdatePurchaseRequestModal-Id').val(Id);
    $('#UpdatePurchaseRequestModal-RowIndex').val(RowIndex);
    $('#UpdatePurchaseRequestModal-Status').val(PurchaseRequest.Status);
    $('#UpdatePurchaseRequestModal-Type').val(PurchaseRequest.Type);

    $('#UpdatePurchaseRequestModal-UserRequest').val(username);
    $('#UpdatePurchaseRequestModal-UserRequest').data('id', PurchaseRequest.IdUserRequest);

    $('#UpdatePurchaseRequestModal-DateRequest').val(moment(PurchaseRequest.DateRequest).format('YYYY-MM-DDTHH:mm'));
    $('#UpdatePurchaseRequestModal-DateRequired').val(moment(PurchaseRequest.DateRequired).format('YYYY-MM-DDTHH:mm'));
    $('#UpdatePurchaseRequestModal-Note').val(PurchaseRequest.Note);

    InitUpdatePurchaseRequestDatatable();

    UpdatePurchaseRequestDatatable.clear();
    let rowDatas = [];
    let checkSame = {
        IdDevice: '',
        Quantity: 0,
        Count: 1,
    }
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
        const RowIndex = $('#UpdatePurchaseRequestModal-RowIndex').val();

        var data = {
            Id: $('#UpdatePurchaseRequestModal-Id').val(),
            IdUserRequest: $('#UpdatePurchaseRequestModal-UserRequest').data('id'),
            DateRequest: $('#UpdatePurchaseRequestModal-DateRequest').val(),
            DateRequired: $('#UpdatePurchaseRequestModal-DateRequired').val(),
            Note: $('#UpdatePurchaseRequestModal-Note').val(),
            Status: $('#UpdatePurchaseRequestModal-Status').val(),
            Type: $('#UpdatePurchaseRequestModal-Type').val(),
        };

        data.DevicePRs = $('#UpdatePurchaseRequestModal-TableDevice tbody tr').map(function (tr) {
            const rowCount = $(this).find('[PR_No]').length;
            var datas = [];
            for (let i = 0; i < rowCount; i++) {
                datas.push({
                    Id: $(this).find('[PR_No]').eq(i).data('id'),
                    IdPurchaseRequest: $('#UpdatePurchaseRequestModal-Id').val(),
                    IdDevice: $(this).find('[Device]').data('id'),
                    IdUserCreated: SessionUser.Id,
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