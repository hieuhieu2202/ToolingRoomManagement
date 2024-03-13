$(document).ready(function () {
    InitRoleDatatable();
    CreateRoleDatatable();

    InitUserDatatable();
    //CreateUserDatatable();
});

/* ROLE DATATABLE */
var roledatatable;
function InitRoleDatatable() {
    const options = {
        scrollY: 480,
        scrollX: true,
        order: [0, 'desc'],
        autoWidth: false,
        columnDefs: [
            { targets: "_all", orderable: false },
            { targets: [2], className: "row-action order-action d-flex text-center justify-content-center" },
            { targets: [0], visible: false },

        ],
        "lengthMenu": [[10, 15, 25, 50, -1], [10, 15, 25, 50, "All"]],
        createdRow: function (row, data, dataIndex) {
            $(row).addClass('cursor-pointer align-middle');
            $(row).data('id', data[0]);
        },
    };
    roledatatable = $('#roledatatable').DataTable(options);

    $('#roledatatable_filter').hide();
    $('#roledatatable_info').hide();
};
async function CreateRoleDatatable() {
    try {
        roles = await GetRoles();

        var RowDatas = [];
        $.each(roles, function (k, role) {
            var rowdata = CreateRoleDatatableRow(role);
            RowDatas.push(rowdata);
        });

        roledatatable.rows.add(RowDatas);
        roledatatable.columns.adjust().draw(true);

    } catch (error) {
        Swal.fire('Sorry, something went wrong!', `${error}`, 'error');
    }
};
function CreateRoleDatatableRow(role) {
    return row = [
        role.Id,
        role.RoleName,
        GetRoleAction(role),
    ]
};
function GetRoleAction(role) {
    var btnDetails = `<a href="javascript:;" class="text-info    bg-light-info    border-0" onclick="CreateUserDatatable(${role.Id})"><i class="fa-regular fa-circle-info"></i></a>`;

    return btnDetails;
};

$('#roledatatable tbody').on('dblclick', 'tr', function (event) {

    var IdRole = $(this).data('id');

    CreateUserDatatable(IdRole)
});

/* ROLE DATATABLE */
var userdatatable;
function InitUserDatatable() {
    const options = {
        scrollY: 480,
        scrollX: true,
        order: [0, 'desc'],
        autoWidth: false,
        columnDefs: [
            { targets: "_all", orderable: false },
            { targets: [6], className: "row-action order-action d-flex text-center justify-content-center" },
            { targets: [0], visible: false },

        ],
        "lengthMenu": [[10, 15, 25, 50, -1], [10, 15, 25, 50, "All"]],
        createdRow: function (row, data, dataIndex) {
            $(row).addClass('cursor-pointer align-middle');
            $(row).data('id', data[0]);
        },
    };
    userdatatable = $('#userdatatable').DataTable(options);
};
async function CreateUserDatatable(IdRole) {
    try {
        users = await GetRoleUsers(IdRole);

        userdatatable.clear().draw();

        var RowDatas = [];
        $.each(users, function (k, user) {
            var rowdata = CreateUserDatatableRow(user);
            RowDatas.push(rowdata);
        });

        userdatatable.rows.add(RowDatas);
        userdatatable.columns.adjust().draw(true);

    } catch (error) {
        Swal.fire('Sorry, something went wrong!', `${error}`, 'error');
    }
};
function CreateUserDatatableRow(user) {
    return row = [
        user.Id,
        user.Username,
        user.VnName != null ? user.VnName : '',
        user.CnName != null ? user.CnName : '',
        user.EnName != null ? user.EnName : '',
        user.Email,
        GetUserAction(user),
    ]
};
function GetUserAction(user) {
    var btnDetails = `<a href="javascript:;" class="text-info    bg-light-info    border-0" onclick="Details(this, ${user.Id})"><i class="fa-regular fa-circle-info"></i></a>`;
    var btnUpdated = `<a href="javascript:;" class="text-warning bg-light-warning border-0" onclick="Updated(this, ${user.Id})   "><i class="fa-duotone fa-pen"></i></a>`;
    var btnDeleted = `<a href="javascript:;" class="text-danger  bg-light-danger  border-0" onclick="Deleted(this, ${user.Id}) "><i class="fa-duotone fa-trash"></i></a>`;

    return btnDetails + btnUpdated + btnDeleted;
};