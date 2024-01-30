/* ADD EXPORT DEVICE MODAL */
var devices;
var datatable_add;
$('#select-WareHouse').change(async function () {
    devices = await GetWarehouseDevices($(this).val());
});
function OpenCreateExportDeviceModal(type) {
    try {
        $('#modal-AddExportDevice .modal-title').text(type);
        $('#modal-AddExportDevice #btn-AddExportDevice').text(`${type} Devices`);
        $('#modal-AddExportDevice #btn-AddExportDevice').data('type', type);

        $('#modal-AddExportDevice').modal('show');
        setTimeout(function () {
            CreateAddTable();
        }, 200);
    } catch (error) {
        Swal.fire('Sorry, something went wrong!', `${error}`, 'error');
    }
}
$('#modal-AddExportDevice').on('shown.bs.modal', function (e) {
    $('.modal-backdrop').last().css('z-index', 1039);
});

function InitAddTable() {
    if (datatable_add == null) {
        var windowHeight = $(window).height();
        lengthMenu = [[], []];
        if (windowHeight < 900) {
            lengthMenu = [[10, 15, 25, 50, -1], [10, 15, 25, 50, "All"]];
        }
        else if (windowHeight >= 900 && windowHeight < 1080) {
            lengthMenu = [[12, 15, 25, 50, -1], [12, 15, 25, 50, "All"]]
        }
        else {
            lengthMenu = [[15, 25, 50, -1], [15, 25, 50, "All"]]
        }

        const options = {
            scrollY: $('#modal-AddExportDevice .modal-body').height() - 120,
            scrollX: true,
            order: [1, 'desc'],
            autoWidth: false,
            select: true,
            columnDefs: [
                { targets: "_all", orderable: false },
                { targets: [0, 1, 14, 15], visible: false },

                { targets: [0], className: "select-checkbox checkbox-custom" },
                { targets: [6], className: "text-center" },
                { targets: [7], className: "text-primary fw-bold text-center" },
                { targets: [8], className: "text-info fw-bold text-center" },
                { targets: [9], className: "text-center" },
                { targets: [10], className: "text-center" },
                { targets: [11], className: "row-type text-center" },
                { targets: [12], className: "row-status text-center" },
                { targets: [13], className: "row-action order-action d-flex text-center justify-content-center" },
            ],
            lengthMenu: lengthMenu,
            createdRow: function (row, data, dataIndex) {
                $(row).addClass('align-middle cursor-pointer');
                $(row).data('id', data[1]);

                var cells = $(row).children('td');
                $(cells[3]).attr('title', data[4]);
                $(cells[4]).attr('title', data[5]);
            },
            select: {
                style: 'multi',
                selector: 'td:not(:last-child)'
            },
        };
        datatable_add = $('#datatable_add').DataTable(options);
    }
    else {
        datatable_add.clear().draw();
    }
}
async function CreateAddTable() {
    try {
        Pace.track(async function () {
            if (devices == null || devices.length == 0) {
                devices = await GetWarehouseDevices($('#select-WareHouse').val());
            }
            InitAddTable();

            var rowsToAdd = [];
            $.each(devices, function (k, device) {
                var tablerow = CreateDeviceTableRow(device);
                rowsToAdd.push(tablerow);
            });
            datatable_add.rows.add(rowsToAdd).draw(true);
            datatable_add.columns.adjust().draw();
        });
    } catch (error) {
        Swal.fire('Sorry, something went wrong!', `${error}`, 'error');
    }
}
function DeviceDetails(elm, e) {
    var dataId = $(elm).data('id');
    GetDeviceDetails(dataId);
}
$('#datatable_add tbody').on('click', 'tr', function (e) {
    if (!$(this).is('.selected')) {
        e.preventDefault();

        var selectedRows = datatable_add.rows('.selected').nodes();
        if (selectedRows.count() > 9) {
            toastr["error"]("Max selected row.", "ERROR");
            return false;
        }
    }

});
$('#btn-AddExportDevice').click(function (e) {
    var selectedRows = datatable_add.rows('.selected').data();
    var type = $('#modal-AddExportDevice #btn-AddExportDevice').data('type');

    if (selectedRows.count() > 0) {
        $('#modal-ExportDevice').modal('hide');
        setTimeout(function () {
            CreateExportDeviceModal(selectedRows, type);
        }, 200);
    }
    else {
        toastr["warning"]("Please select device.", "WARNING");
    }
});