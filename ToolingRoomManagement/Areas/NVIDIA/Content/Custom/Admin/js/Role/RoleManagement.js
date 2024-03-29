var RoleManagementTable, _roles;
var UserManagementTable, _users;

$(document).ready(function () {
    CreateRoleTable();
    GetRoleTableData();

    CreateUserTable();
});

/* ROLE DATATABLE */
function CreateRoleTable() {
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
    RoleManagementTable = $('#role-datatable').DataTable(options);

    $('#role-datatable_filter').hide();
    $('#role-datatable_info').hide();
};
async function GetRoleTableData() {
    try
    {
        _roles = await GetRoles();

        var RowDatas = [];
        $.each(_roles, function (k, role) {
            var rowdata = CreateRoleTableRow(role);
            RowDatas.push(rowdata);
        });

        RoleManagementTable.rows.add(RowDatas);
        RoleManagementTable.columns.adjust().draw(true);
    }
    catch (error)
    {
        Swal.fire('Sorry, something went wrong!', `${error}`, 'error');
        console.error(error);
    }
};

/* ROLE DATATABLE ROW */
function CreateRoleTableRow(role) {
    return row = [
        role.Id,
        role.RoleName,
        CreateRoleTableCellAction(role),
    ]
};
function CreateRoleTableCellAction(role) {
    var btnDetails = `<a href="javascript:;" class="text-info    bg-light-info    border-0" data-id="${role.Id}" onclick="GetUserTableData(this)"><i class="fa-regular fa-circle-info"></i></a>`;
    return btnDetails;
};

/* ROLE DATATABLE EVENT */
$('#role-datatable tbody').on('dblclick', 'tr', function (event) {
    GetUserTableData($(this));
});


/* USER DATATABLE */
function CreateUserTable() {
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
    UserManagementTable = $('#user-datatable').DataTable(options);
};
async function GetUserTableData(elm) {
    try {
        var IdRole = $(elm).data('id');

        _users = await GetRoleUsers(IdRole);

        UserManagementTable.clear();
        var RowDatas = [];
        $.each(_users, function (k, user) {
            var rowdata = CreateUserTableRow(user);
            RowDatas.push(rowdata);
        });

        UserManagementTable.rows.add(RowDatas);
        UserManagementTable.columns.adjust().draw(true);

    } catch (error) {
        Swal.fire('Sorry, something went wrong!', `${error}`, 'error');
        console.error(error);
    }
};
function CreateUserTableRow(user) {
    return row = [
        user.Id,
        user.Username,
        user.VnName != null ? user.VnName : '',
        user.CnName != null ? user.CnName : '',
        user.EnName != null ? user.EnName : '',
        user.Email,
        GetUserTableCellAction(user),
    ]
};
function GetUserTableCellAction(user) {
    var btnDetails = `<a href="javascript:;" class="text-info    bg-light-info    border-0" data-id="${user.Id}" onclick="Details(this)"><i class="fa-regular fa-circle-info"></i></a>`;
    var btnUpdated = `<a href="javascript:;" class="text-warning bg-light-warning border-0" data-id="${user.Id}" onclick="Updated(this)   "><i class="fa-duotone fa-pen"></i></a>`;
    var btnDeleted = `<a href="javascript:;" class="text-danger  bg-light-danger  border-0" data-id="${user.Id}" onclick="Deleted(this) "><i class="fa-duotone fa-trash"></i></a>`;

    return btnDetails + btnUpdated + btnDeleted;
};