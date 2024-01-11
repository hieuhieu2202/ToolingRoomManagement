var users, roles, warehouses;
$(document).ready(async function () {
    CreateDatatable();
    var response = await GetUsers();
    users = response.users;
    roles = response.roles;
    warehouses = await GetWarehouses();

    $.each(warehouses, function (k, wh) {
        $('#select-WareHouse').append(`<option value="${wh.Id}">${wh.WarehouseName}</option>`);
    });

});

/* DATATABLE */
var datatable;
function InitTable() {
    const options = {
        scrollY: $('#modal-AddExportDevice .modal-body').height() - 120,
        scrollX: true,
        order: [0, 'desc'],
        autoWidth: false,
        deferRender: true,
        columnDefs: [
            { targets: "_all", orderable: false },
            { targets: [0], visible: false },
            { targets: [5, 6, 9, 10], className: "text-center" },
            { targets: [11], className: "row-action order-action d-flex text-center justify-content-center"}
        ],
        "lengthMenu": [[10, 15, 25, 50, -1], [10, 15, 25, 50, "All"]],
        dom: "<'row'<'w-auto'B><'col-sm-12 col-md'l><'col-sm-12 col-md'f>>" +
            "<'row'<'col-sm-12'tr>>" +
            "<'row'<'col-sm-12 col-md-7'i><'col-sm-12 col-md-5'p>>",
        buttons: [
            {
                text: 'Export',
                action: function (e, dt, button, config) {
                    OpenCreateExportDeviceModal('Export');
                }
            },
            {
                text: 'Return NG',
                action: function (e, dt, button, config) {
                    OpenCreateExportDeviceModal('Return NG');
                }
            }
        ],
        createdRow: function (row, data, dataIndex) {
            $(row).addClass('cursor-pointer');
            $(row).data('id', data[0]);         
        },

    };
    datatable = $('#datatable').DataTable(options);
    //datatable.columns.adjust();
}
async function CreateDatatable() {
    try {

        var _export = await GetExports();
        InitTable();

        var rowsToAdd = [];
        $.each(_export, function (k, iExport) {
            $.each(iExport.ExportDevices, function (i, device) {
                var tablerow = CreateDatatableRow(iExport, device);
                rowsToAdd.push(tablerow);
            });
           
        });

        datatable.rows.add(rowsToAdd).draw(true);
        datatable.columns.adjust().draw();

    } catch (error) {
        Swal.fire('Sorry, something went wrong!', `${error}`, 'error');
    }
}
$('#datatable tbody').on('dblclick', 'tr', function (e) {
    var IdExport = $(this).data('id');
   
    ExportDetails(IdExport);
});