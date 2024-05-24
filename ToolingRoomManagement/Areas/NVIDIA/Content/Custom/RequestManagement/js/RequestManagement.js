$(document).ready(function () {
    InitDatatable();
    CreateRequestTable();
});

var datatable;
var requests;
function InitDatatable() {
    const options = {
        scrollY: 480,
        scrollX: true,
        order: [2, 'desc'],
        autoWidth: false,
        columnDefs: [
            { targets: "_all", orderable: false },
            { targets: [6, 7], className: "text-center" },
            { targets: [8], className: "row-action order-action d-flex text-center justify-content-center"},           
            { targets: [9], visible: false },

        ],
        "lengthMenu": [[10, 15, 25, 50, -1], [10, 15, 25, 50, "All"]],
        dom: "<'row'<'w-auto'B><'col-sm-12 col-md'l><'col-sm-12 col-md'f>>" +
            "<'row'<'col-sm-12'tr>>" +
            "<'row'<'col-sm-12 col-md-7'i><'col-sm-12 col-md-5'p>>",
        buttons: [
            {
                text: "Borrow History",
                action: function () {
                    ExportBorrowHistory();
                }
            },
            {
                text: "Return History",
                action: function () {
                    ExportReturnHistory();
                }
            },
            {
                text: "Shipping History",
                action: function () {
                    ExportShippingHistory();
                }
            }
        ],
        createdRow: function (row, data, dataIndex) {
            $(row).addClass('cursor-pointer align-middle');
            $(row).data('code', data[0]);
            var cells = $(row).children('td');
            $(cells[5]).attr('title', data[5]);
        },
    };
    datatable = $('#datatable').DataTable(options);
}
async function CreateRequestTable() {
    try {
        requests = await GetRequests();

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
    var createdDate = moment(request.CreatedDate).format('YYYY-MM-DD HH:mm');
    var duadate = request == "Borrow" ? moment(request.DuaDate).format('YYYY-MM-DD HH:mm') : '';
    var datereturn = request == "Return" ? moment(request.CreatedDate).format('YYYY-MM-DD HH:mm') : '';

    return row = [
        `${type[0]}-${moment(request.CreatedDate).format('YYYYMMDDHHmm')}-${request.Id}`,
        CreateUserName(request.UserCreated),
        moment(request.CreatedDate).format('YYYY-MM-DD HH:mm:ss'),
        `${duadate}`,
        `${datereturn}`,
        request.Note,
        GetRequestType(request),
        GetRequestStatus(request),
        GetRequestAction(request, type),
        request.DeviceName.join(','),
    ]
}

$('#datatable tbody').on('dblclick', 'tr', function (event) {
    var IdData = $(this).data('code').split('-');

    var IdRequest = IdData[2];
    var Type = IdData[0];

    switch (Type) {
        case 'B': {
            RequestDetails(IdRequest);
            break;
        }
        case 'R': {
            ReturnDetails(IdRequest);
            break;
        }
        case 'E': {
            ExportDetails(IdRequest);
            break;
        }
    }
});


// Export
function ExportBorrowHistory() {
    $.ajax({
        url: '/NVIDIA/ReuqestManagement/ExportBorrowHistory',
        type: 'GET',
        success: function (data) {
            if (data.status) {
                var downloadLink = document.createElement('a');
                downloadLink.href = data.url;
                downloadLink.download = data.filename;
                downloadLink.click();
            }
            else {
                toastr["error"]("Export error.", "ERROR");
            }
        },
        error: function (error) {
            Swal.fire("Something went wrong!", GetAjaxErrorMessage(error), "error");
        }
    });
}
function ExportReturnHistory() {
    $.ajax({
        url: '/NVIDIA/RequestManagement/ExportReturnHistory',
        type: 'GET',
        success: function (data) {
            if (data.status) {
                var downloadLink = document.createElement('a');
                downloadLink.href = data.url;
                downloadLink.download = data.filename;
                downloadLink.click();
            }
            else {
                toastr["error"]("Export error.", "ERROR");
            }
        },
        error: function (error) {
            Swal.fire("Something went wrong!", GetAjaxErrorMessage(error), "error");
        }
    });
}
function ExportShippingHistory() {
    $.ajax({
        url: '/NVIDIA/RequestManagement/ExportShippingHistory',
        type: 'GET',
        success: function (data) {
            if (data.status) {
                var downloadLink = document.createElement('a');
                downloadLink.href = data.url;
                downloadLink.download = data.filename;
                downloadLink.click();
            }
            else {
                toastr["error"]("Export error.", "ERROR");
            }
        },
        error: function (error) {
            Swal.fire("Something went wrong!", GetAjaxErrorMessage(error), "error");
        }
    });
}