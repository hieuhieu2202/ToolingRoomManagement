$(document).ready(function () {
$(document).ready(function () {
    InitDatatable();
    CreateSignRequestsTable();
});

var datatable;
var requests;
function InitDatatable(){
    const options = {
        scrollY: 480,
        scrollX: true,
        order: [2, 'desc'],
        autoWidth: false,
        columnDefs: [
            { targets: "_all", orderable: false },
            { targets: [4, 5, 6], className: "text-center" },
            { targets: [7], className: "row-action order-action d-flex text-center justify-content-center" },
            { targets: [8], visible: false },

        ],
        "lengthMenu": [[10, 15, 25, 50, -1], [10, 15, 25, 50, "All"]],
        createdRow: function (row, data, dataIndex) {
            $(row).addClass('cursor-pointer align-middle');
            $(row).data('code', data[0]);
            var cells = $(row).children('td');
            $(cells[3]).attr('title', data[3]);

            if (data[6].includes("Pending"))
                $(row).addClass('hl-pending');
            else
                $(row).removeClass('hl-pending');
        },
    };
    datatable = $('#datatable').DataTable(options);
}
async function CreateSignRequestsTable() {
    try {
        requests = await GetUserRequests();

        $('#info-request').text(requests.cTotal);
        $('#info-pending').text(requests.cPending);
        $('#info-approved').text(requests.cApproved);
        $('#info-rejected').text(requests.cRejected);

        var RowDatas = [];
        $.each(requests.borrows, function (k, request) {
            var rowdata = CreateRequestTableRow(request, "Borrow");
            RowDatas.push(rowdata);
        });
        $.each(requests.returns, function (k, request) {
            var rowdata = CreateRequestTableRow(request, "Return");
            RowDatas.push(rowdata);
        });
        $.each(requests.exports, function (k, request) {
            var rowdata = CreateRequestTableRow(request, "Export");
            RowDatas.push(rowdata);
        });

        datatable.rows.add(RowDatas);
        datatable.columns.adjust().draw(true);

    } catch (error) {
        Swal.fire('Sorry, something went wrong!', `${error}`, 'error');
    }
}
function CreateRequestTableRow(request, type) {
    var signStatus = GetSignStatus(request);
    return row = [
        `${type[0]}-${moment(request.CreatedDate).format('YYYYMMDDHHmm')}-${request.Id}`,
        CreateUserName(request.User),
        moment(request.CreatedDate).format('YYYY-MM-DD HH:mm:ss'),
        request.Note,
        GetRequestType(request),
        GetRequestStatus(request),
        signStatus,
        GetSignAction(request, type),
        request.DeviceName.join(','),
    ]
}
$('#datatable tbody').on('dblclick', 'tr', function (event) {
    var IdData = $(this).data('code').split('-');

    var IdRequest = IdData[2];
    var Type = IdData[0];
    var btns = $(this).find(`a[data-id="${IdRequest}"]`);

    switch (Type) {
        case 'B': {

            if (btns.length == 3) {
                RequestDetails(IdRequest, $(btns[1]).data('idsign'), 'Borrow', btns[1]);
            } else {
                RequestDetails(IdRequest);
            }
            break;
        }
        case 'R': {
            if (btns.length == 3) {
                ReturnDetails(IdRequest, $(btns[1]).data('idsign'), 'Return', btns[1]);
            }
            else {
                ReturnDetails(IdRequest);
            }
            break;
        }
        case 'E': {
            if (btns.length == 3) {
                ExportDetails(IdRequest, $(btns[1]).data('idsign'), 'Export', btns[1]);
            }
            else {
                ExportDetails(IdRequest);
            }
            break;
        }
    }
});


/* SIGN */

function CreateApprovedAlert(IdRequest, IdSign, Type, elm) {
    indexRow = datatable.row($(elm).closest('tr')).index();

    var rowData = datatable.row(indexRow).data();

    var content = `
        <p class="text-white">Created User: <b>${rowData[1]}</b></p>
        <p class="text-white">Created Date: <b>${rowData[2]}</b></p>
        <p class="text-white">Request Type: <b>${rowData[4]}</b></p>
        `;

    Swal.fire({
        title: `<strong style="font-size: 25px;">Do you want Approve this request?</strong>`,
        html: content,
        icon: 'question',
        reverseButtons: false,
        confirmButtonText: 'Approve',
        showCancelButton: true,
        cancelButtonText: 'Cancel',
        buttonsStyling: false,
        reverseButtons: true,
        customClass: {
            cancelButton: 'btn btn-outline-secondary fw-bold me-3',
            confirmButton: 'btn btn-success fw-bold'
        },
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                var request = await Approved(IdRequest, IdSign, Type);

                var rowData = CreateRequestTableRow(request, Type);
                datatable.row(indexRow).data(rowData).draw(false);

                $('#borrow_modal').modal('hide');
                $('#return_modal').modal('hide');
                $('#modal-ExportDetails').modal('hide');
            } catch (error) {
                Swal.fire('Sorry, something went wrong!', `${error}`, 'error');
            }

        }
    });
}
function CreateRejectedAlert(IdRequest, IdSign, Type, elm) {
    indexRow = datatable.row($(elm).closest('tr')).index();
    var rowData = datatable.row(indexRow).data();
    var content = `
        <p class="text-white">Created User: <b>${rowData[1]}</b></p>
        <p class="text-white">Created Date: <b>${rowData[2]}</b></p>
        <p class="text-white">Request Type: <b>${rowData[4]}</b></p>
        <div class="text-start">
            <label class="form-label">Note</label>
            <textarea class="form-control" rows="3" style="resize: none" id="reject-Note"></textarea>
        </div>
        `;


    Swal.fire({
        title: `<strong style="font-size: 25px;">Do you want Reject this request?</strong>`,
        html: content,
        icon: 'question',
        reverseButtons: false,
        confirmButtonText: 'Reject',
        showCancelButton: true,
        cancelButtonText: 'Cancel',
        buttonsStyling: false,
        reverseButtons: true,
        customClass: {
            cancelButton: 'btn btn-outline-secondary fw-bold me-3',
            confirmButton: 'btn btn-danger fw-bold'
        },
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                var Note = $('#reject-Note').val();

                var request = await Rejected(IdRequest, IdSign, Type, Note);

                var rowData = CreateRequestTableRow(request, Type);
                datatable.row(indexRow).data(rowData).draw(false);


                $('#borrow_modal').modal('hide');
                $('#return_modal').modal('hide');
                $('#modal-ExportDetails').modal('hide');
            } catch (error) {
                Swal.fire('Sorry, something went wrong!', `${error}`, 'error');
            }

        }
    });
}

