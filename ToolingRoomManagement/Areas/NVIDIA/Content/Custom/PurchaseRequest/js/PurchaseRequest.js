var PRDatatable, SimpleDevices;

$(document).ready(() => {
    InitPRDatatable();
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
function CreatePRDatatable() {

}
function CreatePRDatatableRow(purchaseRequest) {

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


        let sessionUser = await GetUserByUsername($('#CardID').text());
        let username = sessionUser.VnName ? sessionUser.VnName : sessionUser.CnName ? sessionUser.CnName : sessionUser.EnName ? sessionUser.EnName : '';

        $('#CreatePurchaseRequestModal-UserRequest').data('id', sessionUser.Id);
        $('#CreatePurchaseRequestModal-UserRequest').val(`${sessionUser.Username} - ${username}`);

        $('#CreatePurchaseRequestModal-DateRequest').val(moment().format('YYYY-MM-DDTHH:mm'));

        $('#CreatePurchaseRequestModal').modal('show');
    } catch (e) {
        console.error(e);
    }
}
function CreatePurchaseRequestSave() {
    try {
        var data = {
            IdUserRequest: $('#CreatePurchaseRequestModal-UserRequest').data('id'),
            DateRequest: $('#CreatePurchaseRequestModal-DateRequest').val(),
            DateRequired: $('#CreatePurchaseRequestModal-DateRequired').val(),
            Note: $('#CreatePurchaseRequestModal-Note').val(),
            Status: 'Request',
            DevicePRs: $('#CreatePurchaseRequestModal-TableDevice tbody tr:not(:has(td[colspan]))').map(function (tr) {
                return {
                    IdDevice: $(this).find('select').val(),
                    Quantity: $(this).find('input').val()
                }
            }).get()
        };

        console.log(data);
    } catch (e) {
        console.error(e);
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
    }
    
}
