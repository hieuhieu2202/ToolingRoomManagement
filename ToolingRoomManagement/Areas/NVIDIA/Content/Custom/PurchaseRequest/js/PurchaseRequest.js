var PRDatatable, SimpleDevices, PurchaseRequests, SessionUser, SessionUsername;

$(document).ready(async () => {
    InitPRDatatable();
    CreatePRDatatable();

    await GetSessionUser();

    if (!SessionUser.UserRoles.some((role) => { return role.IdRole === 3 })) {
        $('#NV_BuyButton').remove();
    }
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
            { targets: [6, 7, 8, 9], className: 'text-center' },
            { targets: [1], width: 150 },
            { targets: [2], width: 200 },
            { targets: [3, 4, 6], width: 120 },
            { targets: [7, 8], width: 60 },
            { targets: [9], width: 90 },
            { targets: "_all", orderable: false },
            
        ],     
        dom: "<'row'<'w-auto'B><'col-sm-12 col-md'l><'col-sm-12 col-md'f>>" +
            "<'row'<'col-sm-12'tr>>" +
            "<'row'<'col-sm-12 col-md-7'i><'col-sm-12 col-md-5'p>>",
        buttons: [
            {
                text: '<i class="fa-solid fa-plus"></i> FXN BUY',
                attr: {
                    title: 'Foxconn buy request (TE)',
                    id: 'FXN_BuyButton'
                },
                action: function (e, dt, button, config) {
                    CreatePurchaseRequestOpen();                  
                }
            },
            {
                text: '<i class="fa-solid fa-plus"></i> NV Buy',
                attr: {
                    title: 'Nvidia buy (ToolRoom)',
                    id: 'NV_BuyButton'
                },
                action: function (e, dt, button, config) {
                    CreateNvidiaBuyOpen();
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
        CreatePRDatatableCellType(purchaseRequest),
        CreatePRDatatableCellButton(purchaseRequest)
    ];
}
function CreatePRDatatableCellType(purchaseRequest) {
    switch (purchaseRequest.Type) {
        case 'NV':
            return `<span class="badge bg-success">Nvidia</span>`;
        case 'FXN':
            return `<span class="badge bg-info">Foxconn</span>`;
        default:
            return '';
    }
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
                <!--<button class="btn btn-sm btn-info"    data-id="${purchaseRequest.Id}" onclick="DetailPurchaseRequestRow(this, event)"><i class="fa-duotone fa-info"></i></button>-->
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

/* Datatable event */
$(document).on('dblclick', '#PurchaseRequestDatatable td', (e) => {
    $(e.target).closest('tr').find('button[onclick="UpdatePurchaseRequestRow(this, event)"]').click();;
});

/* Other */
async function GetSessionUser() {
    if (!SessionUser) {
        if (!$('#CardID').text()) {
            window.location.href = '/NVIDIA/Authentication/SignIn';
        }
        SessionUser = await GetUserByUsername($('#CardID').text());
        SessionUsername = `${SessionUser.Username} - ${SessionUser.VnName ? SessionUser.VnName : SessionUser.CnName ? SessionUser.CnName : SessionUser.EnName ? SessionUser.EnName : ''}`;
    }
}