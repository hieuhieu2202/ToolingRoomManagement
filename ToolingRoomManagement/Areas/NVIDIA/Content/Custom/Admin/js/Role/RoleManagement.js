var RoleManagementTable, _roles;
var UserManagementTable, _users;
var IdSelectedRole = null;
var _allUsers;

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
        dom: "<'row'<'w-auto'B><'col-sm-12 col-md'l><'col-sm-12 col-md'f>>" +
            "<'row'<'col-sm-12'tr>>" +
            "<'row'<'col-sm-12 col-md-7'i><'col-sm-12 col-md-5'p>>",
        buttons: [
            {
                text: '<i class="fa-solid fa-plus"></i> ADD USER',
                attr: {
                    id: 'AddUser'
                },
                action: function (e, dt, button, config) {
                    AddUserModal_Open();
                }
            },
            {
                text: '<i class="fa-solid fa-plus"></i> CREATE USER',
                attr: {
                    id: 'CreateUser'
                },
                action: function (e, dt, button, config) {
                    CreateUserModal_Open();
                }
            }
        ],
        createdRow: function (row, data, dataIndex) {
            $(row).addClass('cursor-pointer align-middle');
            $(row).data('id', data[0]);
        },
    };
    UserManagementTable = $('#user-datatable').DataTable(options);
};
async function GetUserTableData(elm) {
    try {
        IdSelectedRole = $(elm).data('id');

        _users = await GetRoleUsers(IdSelectedRole);

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
    var btnDetails = `<a href="javascript:;" class="text-info    bg-light-info    border-0" data-id="${user.Id}" onclick="DetailUserModal_Open(this)"><i class="fa-regular fa-circle-info"></i></a>`;
    var btnUpdated = `<a href="javascript:;" class="text-warning bg-light-warning border-0" data-id="${user.Id}" onclick="UpdateUserModal_Open(this)   "><i class="fa-duotone fa-pen"></i></a>`;
    var btnDeleted = `<a href="javascript:;" class="text-danger  bg-light-danger  border-0" data-id="${user.Id}" onclick="DeleteUserModal_Open(this) "><i class="fa-duotone fa-trash"></i></a>`;

    return btnDetails + btnUpdated + btnDeleted;
};

/* USER DATATABLE EVENT */

// Add User
async function AddUserModal_Open() {
    try {
        if (!IdSelectedRole) {
            Swal.fire('Sorry, something went wrong!', `Please select role.`, 'error');
            return false;
        }

        if (!_allUsers) _allUsers = await GetUsers();

        let addUserSelect = $("#add-User");
        addUserSelect.empty();
        _allUsers.forEach((user) => {
            if (!user.UserRoles.some((ur) => { return ur.IdRole == IdSelectedRole })) {
                let username = `${user.Username} - ${user.VnName ? user.VnName : user.CnName ? user.CnName : user.EnName ? user.EnName : ''}`;
                addUserSelect.append(`<option value="${user.Id}">${username}</option>`);
            }
        });

        addUserSelect.select2({
            theme: 'bootstrap4',
            dropdownParent: $('#AddUserModal'),
        });

        $('#AddUserModal').modal('show');

    } catch (e) {
        Swal.fire('Sorry, something went wrong!', `${e}`, 'error');
        console.log(e);
    }
}
async function AddUserModal_Save(){
    try {

        var result = await CreateUserRole($("#add-User").val(), IdSelectedRole);

        if (result) {

            var rowData = CreateUserTableRow(result);
            UserManagementTable.row.add(rowData).draw(false);

            toastr["success"](`Add user ${result.Username} success.`);
            $('#AddUserModal').modal('hide');
        }
    } catch (e) {
        Swal.fire('Sorry, something went wrong!', `${e}`, 'error');
        console.log(e);
    }
}

// Create
function CreateUserModal_Open() {
    if (!IdSelectedRole) {
        Swal.fire('Sorry, something went wrong!', `Please select role.`, 'error');
        return false;
    }

    $('#create-CreatedDate').val(moment().format("YYYY-MM-DDTHH:mm:ss"));
    $('#CreateUserModal').modal('show');
};
async function CreateUserModal_Save(elm) {
    try {
        var user = {
            Username: $('#create-Username').val(),
            Password: $('#create-Password').val(),
            Email: $('#create-Email').val(),
            VnName: $('#create-VnName').val(),
            CnName: $('#create-CnName').val(),
            EnName: $('#create-EnName').val(),
            Status: $('#create-Status').val(),
            CreatedDate: $('#create-CreatedDate').val(),
            HireDate: $('#create-HireDate').val(),
            LeaveDate: $('#create-LeaveDate').val(),
            UserRoles: [{
                IdRole: IdSelectedRole
            }]
        }

        var result = await CreateUser(user);

        if (result) {

            var rowData = CreateUserTableRow(result);
            UserManagementTable.row.add(rowData).draw(false);

            toastr["success"](`Create user ${user.Username} success.`);
            $('#CreateUserModal').modal('hide');
        }
    }
    catch (error) {
        Swal.fire('Sorry, something went wrong!', `${error}`, 'error');
        console.error(error);
    }
}

// Update
async function UpdateUserModal_Open(elm) {
    try {
        if (!IdSelectedRole) {
            Swal.fire('Sorry, something went wrong!', `Please select role.`, 'error');
            return false;
        }

        var IdUser = $(elm).data('id');
        var IndexRow = UserManagementTable.row($(elm).closest('tr')).index();

        var result = await GetUser(IdUser);

        $('#update-Username').val(result.Username);
        $('#update-Password').val(result.Password);
        $('#update-Email').val(result.Email);
        $('#update-VnName').val(result.VnName);
        $('#update-CnName').val(result.CnName);
        $('#update-EnName').val(result.EnName);
        $('#update-Status').val(result.Status);
        $('#update-CreatedDate').val(moment(result.CreatedDate).format("YYYY-MM-DDTHH:mm:ss"));


        $('#UpdateUserModel_Save').data('id', IdUser);
        $('#UpdateUserModel_Save').data('index', IndexRow);

        $('#UpdateUserModal').modal('show');

    }
    catch (error) {
        Swal.fire('Sorry, something went wrong!', `${error}`, 'error');
        console.log(error);
    }
}
async function UpdateUserModal_Save(elm) {
    try {
        var IdUser = $(elm).data('id');
        var IndexRow = $(elm).data('index');

        var user = {
            Id: IdUser,
            Username: $('#update-Username').val(),
            Password: $('#update-Password').val(),
            Email: $('#update-Email').val(),
            VnName: $('#update-VnName').val(),
            CnName: $('#update-CnName').val(),
            EnName: $('#update-EnName').val(),
            Status: $('#update-Status').val(),
            CreatedDate: $('#update-CreatedDate').val(),
        }

        var result = await UpdateUser(user);

        if (result) {
            var rowdata = CreateUserTableRow(result);
            UserManagementTable.row(IndexRow).data(rowdata).draw(false);
            toastr["success"](`Update user ${user.Username} success.`);
            $('#UpdateUserModal').modal('hide');
        }
    }
    catch (error) {
        Swal.fire('Sorry, something went wrong!', `${error}`, 'error');
        console.error(error);
    }
}

// Details
async function DetailUserModal_Open(elm) {
    try {
        var IdUser = $(elm).data('id');
        var result = await GetUser(IdUser);

        $('#details-Username').val(result.Username);
        $('#details-Password').val(result.Password);
        $('#details-Email').val(result.Email);
        $('#details-VnName').val(result.VnName);
        $('#details-CnName').val(result.CnName);
        $('#details-EnName').val(result.EnName);
        $('#details-Status').val(result.Status);
        $('#details-CreatedDate').val(moment(result.CreatedDate).format("YYYY-MM-DDTHH:mm:ss"));

        $('#DetailUserModal').modal('show');
    }
    catch (error) {
        Swal.fire('Sorry, something went wrong!', `${error}`, 'error');
        console.error(error);
    }
}

// Delete
async function DeleteUserModal_Open(elm) {
    try {
        if (!IdSelectedRole) {
            Swal.fire('Sorry, something went wrong!', `Please select role.`, 'error');
            return false;
        }

        var IdUser = $(elm).data('id');
        var IndexRow = UserManagementTable.row($(elm).closest('tr')).index();

        var user = await GetUser(IdUser, IdSelectedRole);

        Swal.fire({
            title: 'Are you sure?',
            html: `Do you want delete user '${user.Username}'?`,
            icon: 'question',
            iconColor: '#dc3545',
            reverseButtons: false,
            confirmButtonText: "Delete",
            showCancelButton: true,
            cancelButtonText: "Cancel",
            buttonsStyling: false,
            reverseButtons: true,
            customClass: {
                cancelButton: 'btn btn-outline-secondary fw-bold me-3',
                confirmButton: 'btn btn-danger fw-bold'
            },
        }).then(async (swarResult) => {
            if (swarResult.isConfirmed) {
                try {
                    var result = await DeleteUser(IdUser, IdSelectedRole);

                    UserManagementTable.row(IndexRow).remove().draw(false);

                    toastr["success"](`Delete user ${user.Username} success.`);
                }
                catch (error) {
                    Swal.fire('Sorry, something went wrong!', `${error}`, 'error');
                    console.error(error);
                }
            }
        });

    } catch (error) {
        Swal.fire('Sorry, something went wrong!', `${error}`, 'error');
        console.error(error);
    }
}

/* OTHER EVENT */
$('#create-Username').blur(async function (e) {
    try {
        var username = $('#create-Username').val();
        var userinfo = await GetUserInformation(username);

        $('#create-CnName').val(userinfo.USER_NAME);
        $('#create-Email').val(userinfo.NOTES_ID);
        $('#create-HireDate').val(userinfo.HIREDATE);
        $('#create-LeaveDate').val(userinfo.LEAVEDAY);
    }
    catch (error) {
        console.error(error);
    }
});
$('#update-Username').blur(async function (e) {
    try {
        var username = $('#update-Username').val();
        var userinfo = await GetUserInformation(username);

        $('#update-CnName').val(userinfo.USER_NAME);
        $('#update-Email').val(userinfo.NOTES_ID);
        $('#update-HireDate').val(userinfo.HIREDATE);
        $('#update-LeaveDate').val(userinfo.LEAVEDAY);
    }
    catch (error) {
        console.error(error);
    }
});