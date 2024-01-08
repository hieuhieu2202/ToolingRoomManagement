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
        buttons: [{
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
        }],
        createdRow: function (row, data, dataIndex) {
            $(row).addClass('cursor-pointer align-middle');
            $(row).data('id', data[0]);
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
        CreateUserName(request.User),
        `${(type != "Return") ? moment(request.CreatedDate).format('YYYY-MM-DD HH:mm') : `<span class="hide">${createdDate}</span>`}`,
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
    var IdData = $(this).data('id').split('-');

    var IdRequest = IdData[2];
    var Type = IdData[0];

    console.log(IdRequest, Type);

    //if (type == "Borrow") RequestDetails(dataId);
    //else if (type == "Return") ReturnDetails(dataId);
});

function GetUserBorrows() {
    $.ajax({
        type: "GET",
        url: "/NVIDIA/BorrowManagement/GetUserBorrows",
        dataType: "json",
        contentType: "application/json;charset=utf-8",
        success: function (response) {
            if (response.status) {
                var borrows = response.borrows;
                var returns = response.returns;

                var counts = {
                    totalRequest: borrows.length + returns.length,
                    totalPending: 0,
                    totalApproved: 0,
                    totalRejected: 0
                };

                $.each(borrows, function (index, borrow) {
                    counts["total" + borrow.Status]++;                   
                });
                $.each(returns, function (index, returnRQ) {
                    counts["total" + returnRQ.Status]++;
                });

                $('#info-request').text(counts.totalRequest);
                $('#info-pending').text(counts.totalPending);
                $('#info-approved').text(counts.totalApproved);
                $('#info-rejected').text(counts.totalRejected);

                CreateTableBorrow(borrows, returns);
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

// table

async function CreateTableBorrow(borrows, returns) {
    if (table_Borrow) table_Borrow.destroy(); 

    $('#table_Borrows-tbody').html('');

    // Borrow
    await $.each(borrows, function (no, item) {
        var row = $(`<tr class="align-middle" data-id="${item.Id}" title="Double-click to view device details." IsBorrow></tr>`);

        // ID
        row.append(`<td>B-${moment(item.DateBorrow).format('YYYYMMDDHHmm')}-${item.Id}</td>`);
        // Created By
        row.append(CreateTableCellUser(item.User));
        // Created Date
        row.append(`<td>${moment(item.DateBorrow).format('YYYY-MM-DD HH:mm:ss')}</td>`);
        // Due Date
        row.append(`<td>${item.DateDue ? moment(item.DateDue).format('YYYY-MM-DD HH:mm:ss') : ''}</td>`);
        // Return Date
        row.append(`<td>${item.DateReturn ? moment(item.DateReturn).format('YYYY-MM-DD HH:mm:ss') : ''}</td>`);
        // Note
        row.append(`<td title="${item.Note ? item.Note : ''}s">${item.Note ? item.Note : ''}</td>`);
        // Type
        switch (item.Type) {
            case "Borrow": {
                row.append(`<td><span class="badge bg-primary"><i class="fa-solid fa-left-to-line"></i> Borrow</span></td>`);
                break;
            }
            case "Take": {
                row.append(`<td><span class="badge bg-secondary"><i class="fa-regular fa-inbox-full"></i> Take</span></td>`);
                break;
            }
            case "Return": {
                row.append(`<td><span class="badge bg-info"><i class="fa-solid fa-right-to-line"></i> Return</span></td>`);
                break;
            }
            default: {
                row.append(`<td><span class="badge bg-secondary">N/A</span></td>`);
                break;
            }
        }
        // Status
        switch (item.Status) {
            case "Pending": {
                row.append(`<td><span class="badge bg-warning"><i class="fa-solid fa-timer"></i> Pending</span></td>`);
                row.addClass('hl-pending');
                break;
            }
            case "Approved": {
                row.append(`<td><span class="badge bg-success"><i class="fa-solid fa-check"></i> Approved</span></td>`);
                break;
            }
            case "Rejected": {
                row.append(`<td><span class="badge bg-danger"><i class="fa-solid fa-xmark"></i> Rejected</span></td>`);
                //row.addClass('hl-danger');
                break;
            }
            default: {
                row.append(`<td><span class="badge bg-secondary">N/A</span></td>`);
                break;
            }
        }
        // Action
        row.append(`<td class="order-action d-flex text-center justify-content-center">
                         <a href="javascript:;" class="text-info bg-light-info border-0" title="Details" data-id="${item.Id}" onclick="RequestDetails(${item.Id})"><i class="fa-regular fa-circle-info"></i></a>
                    </td>`);


        row.append(`<td>${item.DevicesName}</td>`);

        $('#table_Borrows-tbody').append(row);
    });

    // Return
    await $.each(returns, function (no, item) {
        var row = $(`<tr class="align-middle" data-id="${item.Id}" title="Double-click to view device details." IsReturn></tr>`);
        // ID
        row.append(`<td>R-${moment(item.DateReturn).format('YYYYMMDDHHmm')}-${item.Id}</td>`);
        // Created By
        row.append(CreateTableCellUser(item.User));
        // Created Date
        row.append(`<td>${moment(item.DateReturn).format('YYYY-MM-DD HH:mm:ss')}</td>`);
        // Due Date
        row.append(`<td>${item.DateDue ? moment(item.DateDue).format('YYYY-MM-DD HH:mm:ss') : ''}</td>`);
        // Return Date
        var LastSignDate = $(item.UserReturnSigns).last()[0].DateSign;
        row.append(`<td>${LastSignDate ? moment(item.DateReturn).format('YYYY-MM-DD HH:mm:ss') : ''}</td>`);
        // Note
        row.append(`<td title="${item.Note ? item.Note : ''}s">${item.Note ? item.Note : ''}</td>`);
        // Type
        switch (item.Type) {
            case "Borrow": {
                row.append(`<td><span class="badge bg-primary"><i class="fa-solid fa-left-to-line"></i> Borrow</span></td>`);
                break;
            }
            case "Take": {
                row.append(`<td><span class="badge bg-secondary"><i class="fa-regular fa-inbox-full"></i> Take</span></td>`);
                break;
            }
            case "Return": {
                row.append(`<td><span class="badge bg-info"><i class="fa-solid fa-right-to-line"></i> Return</span></td>`);
                break;
            }
            default: {
                row.append(`<td><span class="badge bg-secondary">N/A</span></td>`);
                break;
            }
        }
        // Status
        switch (item.Status) {
            case "Pending": {
                row.append(`<td><span class="badge bg-warning"><i class="fa-solid fa-timer"></i> Pending</span></td>`);
                row.addClass('hl-pending');
                break;
            }
            case "Approved": {
                row.append(`<td><span class="badge bg-success"><i class="fa-solid fa-check"></i> Approved</span></td>`);
                break;
            }
            case "Rejected": {
                row.append(`<td><span class="badge bg-danger"><i class="fa-solid fa-xmark"></i> Rejected</span></td>`);
                //row.addClass('hl-danger');
                break;
            }
            default: {
                row.append(`<td><span class="badge bg-secondary">N/A</span></td>`);
                break;
            }
        }
        // Action
        row.append(`<td class="order-action d-flex text-center justify-content-center">
                         <a href="javascript:;" class="text-info bg-light-info border-0" title="Details" data-id="${item.Id}" onclick="ReturnDetails(${item.Id})"><i class="fa-regular fa-circle-info"></i></a>
                    </td>`);

        row.append(`<td>${item.DevicesName}</td>`);

        $('#table_Borrows-tbody').append(row);
    });

    const options = {
        scrollY: 480,
        scrollX: true,
        order: [2, 'desc'],
        autoWidth: false,
        columnDefs: [            
            { targets: [6, 7], className: "text-center" },
            { targets: [8], className: "text-center", orderable: false, width: '20px;' },
            { targets: "_all", orderable: false },
            { targets: [9], visible: false },
        ],
        "lengthMenu": [[10, 15, 25, 50, -1], [10, 15, 25, 50, "All"]],
        dom: "<'row'<'w-auto'B><'col-sm-12 col-md'l><'col-sm-12 col-md'f>>" +
            "<'row'<'col-sm-12'tr>>" +
            "<'row'<'col-sm-12 col-md-7'i><'col-sm-12 col-md-5'p>>",
        buttons: [{
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
        }]
    };
    table_Borrow = $('#table_Borrows').DataTable(options);
    table_Borrow.columns.adjust();
}

$('#table_Borrows tbody').on('dblclick', 'tr', function (event) {
    var dataId = $(this).data('id');
    var type = $(this).is('[IsBorrow]') ? "Borrow" : "Return";

    if (type == "Borrow") RequestDetails(dataId);
    else if (type == "Return") ReturnDetails(dataId);
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

// other
function CreateTableCellUser(user) {
    var opt = $(`<td></td>`);

    if (user.VnName && user.VnName != '') {
        opt.text(`${user.Username} - ${user.VnName}`);
    }
    else if (user.CnName && user.CnName != '') {
        opt.text(`${user.Username} - ${user.CnName}`);
    }

    if (user.EnName != null && user.EnName != '') {
        var addUserEnName = opt.text();
        addUserEnName += ` (${user.EnName})`;
        opt.text(addUserEnName);
    }
    return opt;
}