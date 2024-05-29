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
                                       <td>${CreateUserName(PurchaseRequest.UserRequest)}</td>
                                   </tr>
                                   <tr>
                                       <td>REQUIRED DATE</td>
                                       <td>${moment(PurchaseRequest.DateRequest).format('YYYY-MM-DD HH:mm')}</td>
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