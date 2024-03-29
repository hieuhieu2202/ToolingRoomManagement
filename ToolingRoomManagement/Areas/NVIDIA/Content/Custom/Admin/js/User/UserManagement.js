var UserManagementTable, _users;
$(document).ready(function () {
    CreateUserTable();
    GetUserTableData();
});

/* DATATABLE */
function CreateUserTable() {
    const options = {
        scrollY: 480,
        scrollX: true,
        order: [0, 'desc'],
        autoWidth: false,
        columnDefs: [
            { targets: "_all", orderable: false },
            { targets: [6], className: 'text-center' },
            { targets: [1, 3, 5], width: 150 },
            { targets: [2], width: 200 },
            { targets: [5], width: 350 },
            { targets: [7], className: "row-action order-action d-flex text-center justify-content-center" },
            { targets: [0], visible: false },

        ],
        "lengthMenu": [[10, 15, 25, 50, -1], [10, 15, 25, 50, "All"]],
        dom: "<'row'<'w-auto'B><'col-sm-12 col-md'l><'col-sm-12 col-md'f>>" +
            "<'row'<'col-sm-12'tr>>" +
            "<'row'<'col-sm-12 col-md-7'i><'col-sm-12 col-md-5'p>>",
        buttons: [
            {
                text: 'New User',
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
async function GetUserTableData() {
    try
    {
        _users = await GetUsers();

        var RowDatas = [];
        $.each(_users, function (k, user) {
            var rowdata = CreateUserTableRow(user);
            RowDatas.push(rowdata);
        });

        UserManagementTable.rows.add(RowDatas);
        UserManagementTable.columns.adjust().draw(true);

    }
    catch (error)
    {
        Swal.fire('Sorry, something went wrong!', `${error}`, 'error');
        console.error(error);
    }
};

/* DATATABLE ROW */
function CreateUserTableRow(user) {
    return row = [
        user.Id,
        user.Username,
        user.VnName != null ? user.VnName : '',
        user.CnName != null ? user.CnName : '',
        user.EnName != null ? user.EnName : '',
        user.Email,
        CreateUserTableCellStatus(user),
        CreateUserTableCellAction(user),
    ]
};
function CreateUserTableCellStatus(user) {
    if (user.Status == null) {
        user.Status = 'NA'
    }

    switch (user.Status.toUpperCase()) {
        case "ACTIVE": {
            return (`<span class="fw-bold text-success"><i class="fa-duotone fa-shield-check"></i> Active</span>`);
        }
        case "NO ACTIVE": {
            return (`<span class="fw-bold text-warning"><i class="fa-duotone fa-shield-slash"></i> No Active</span>`);
        }
        case "LOCKED": {
            return (`<span class="fw-bold text-danger"><i class="fa-duotone fa-shield-keyhole"></i> Locked</span>`);
        }
        case "DELETED": {
            return (`<span class="fw-bold text-secondary"><i class="fa-duotone fa-shield-exclamation"></i> Deleted</span>`);
        }
        default: {
            return (`<span>NA</span>`);
        }
    }
}
function CreateUserTableCellAction(user) {
    var btnDetails = `<a href="javascript:;" class="text-info    bg-light-info    border-0" data-id="${user.Id}" onclick="DetailUserModal_Open(this)"><i class="fa-regular fa-circle-info"></i></a>`;
    var btnUpdated = `<a href="javascript:;" class="text-warning bg-light-warning border-0" data-id="${user.Id}" onclick="UpdateUserModal_Open(this)"><i class="fa-duotone fa-pen"></i></a>`;
    var btnDeleted = `<a href="javascript:;" class="text-danger  bg-light-danger  border-0" data-id="${user.Id}" onclick="DeleteUserModal_Open(this)"><i class="fa-duotone fa-trash"></i></a>`;

    return btnDetails + btnUpdated + btnDeleted;
};

/* MAIN EVENT */

// Create
function CreateUserModal_Open() {
    $('#create-CreatedDate').val(moment().format("YYYY-MM-DDTHH:mm:ss"));
    $('#CreateUserModal').modal('show');
};
async function CreateUserModal_Save(elm) {
    try
    {
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
        }

        var result = await CreateUser(user);

        if (result) {

            var rowData = CreateTableRow(user);
            UserManagementTable.row.add(rowData).draw(false);

            toastr["success"](`Create user ${user.Username} success.`);
            $('#CreateUserModal').modal('hide');
        }
    }
    catch (error)
    {
        Swal.fire('Sorry, something went wrong!', `${error}`, 'error');
        console.error(error);
    }
}

// Update
async function UpdateUserModal_Open(elm) {
    try
    {
        var IdUser = $(elm).data('id');
        var IndexRow = UserManagementTable.row($(elm).closest('tr'));

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
    catch (error)
    {
        Swal.fire('Sorry, something went wrong!', `${error}`, 'error');
        console.log(error);
    }
}
async function UpdateUserModal_Save(elm) {
    try
    {
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
            var rowdata = CreateUserTableRow(user);
            UserManagementTable.row(IndexRow).data(rowdata).draw(false);
            toastr["success"](`Update user ${user.Username} success.`);
            $('#UpdateUserModal').modal('hide');
        }
    }
    catch (error)
    {
        Swal.fire('Sorry, something went wrong!', `${error}`, 'error');
        console.error(error);
    }
}

// Details
async function DetailUserModal_Open(elm) {
    try
    {
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
        var IdUser = $(elm).data('id');
        var IndexRow = UserManagementTable.row($(elm).closest('tr'));

        var user = await GetUser(IdUser);

        Swal.fire({
            title: 'Are you sure?',UserManagementTable.row(IndexRow).remove().draw(false);
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
                try
                {
                    var result = await DeleteUser(IdUser);

                    if (result != null) {
                        var rowdata = CreateUserTableRow(result);
                        UserManagementTable.row(IndexRow).data(rowdata).draw(false);                       
                    }
                    else {
                        UserManagementTable.row(IndexRow).remove().draw(false);
                    }

                    toastr["success"](`Delete user ${user.Username} success.`);
                }
                catch (error)
                {
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
    try
    {
        var username = $('#update-Username').val();
        var userinfo = await GetUserInformation(username);

        $('#update-CnName').val(userinfo.USER_NAME);
        $('#update-Email').val(userinfo.NOTES_ID);
        $('#update-HireDate').val(userinfo.HIREDATE);
        $('#update-LeaveDate').val(userinfo.LEAVEDAY);
    }
    catch (error)
    {
        console.error(error);
    }
});
