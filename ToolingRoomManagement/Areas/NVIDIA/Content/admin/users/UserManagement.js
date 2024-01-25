$(document).ready(function () {
    InitDatatable();
    CreateDatatable();
});

/* DATATABLE */
var datatable, users;
function InitDatatable() {
    const options = {
        scrollY: 480,
        scrollX: true,
        order: [0, 'desc'],
        autoWidth: false,
        columnDefs: [
            { targets: "_all", orderable: false },
            { targets: [7], className: 'text-center' },
            { targets: [2, 4, 5], width: 150 },
            { targets: [3], width: 200 },
            { targets: [6], width: 350 },
            { targets: [8], className: "row-action order-action d-flex text-center justify-content-center" },
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
                    OpenCreateUserModal();
                }
            }
        ],
        createdRow: function (row, data, dataIndex) {
            $(row).addClass('cursor-pointer align-middle');
            $(row).data('id', data[0]);
        },
    };
    datatable = $('#datatable').DataTable(options);
};
async function CreateDatatable() {
    try {
        users = await GetUsers();

        var RowDatas = [];
        $.each(users, function (k, user) {
            var rowdata = CreateDatatableRow(user);
            RowDatas.push(rowdata);
        });

        datatable.rows.add(RowDatas);
        datatable.columns.adjust().draw(true);

    } catch (error) {
        Swal.fire('Sorry, something went wrong!', `${error}`, 'error');
    }
};
function CreateDatatableRow(user) {
    return row = [
        user.Id,
        user.Username,
        user.Password != null ? user.Password : '',
        user.VnName != null ? user.VnName : '',
        user.CnName != null ? user.CnName : '',
        user.EnName != null ? user.EnName : '',
        user.Email,
        GetUserStatus(user),
        GetUserAction(user),
    ]
};
function GetUserStatus(user) {
    switch (user.Status) {
        case "Active": {
            return (`<span class="fw-bold text-success"><i class="fa-duotone fa-shield-check"></i> Active</span>`);
        }
        case "No Active": {
            return (`<span class="fw-bold text-warning"><i class="fa-duotone fa-shield-slash"></i> No Active</span>`);
        }
        case "Locked": {
            return (`<span class="fw-bold text-danger"><i class="fa-duotone fa-shield-keyhole"></i> Locked</span>`);
        }
        case "Deleted": {
            return (`<span class="fw-bold text-secondary"><i class="fa-duotone fa-shield-exclamation"></i> Deleted</span>`);
        }
        default: {
            return (`<span>NA</span>`);
        }
    }
}
function GetUserAction(user) {
    var btnDetails = `<a href="javascript:;" class="text-info    bg-light-info    border-0" onclick="Details(this, ${user.Id})"><i class="fa-regular fa-circle-info"></i></a>`;
    var btnUpdated = `<a href="javascript:;" class="text-warning bg-light-warning border-0" onclick="Updated(this, ${user.Id})   "><i class="fa-duotone fa-pen"></i></a>`;
    var btnDeleted = `<a href="javascript:;" class="text-danger  bg-light-danger  border-0" onclick="Deleted(this, ${user.Id}) "><i class="fa-duotone fa-trash"></i></a>`;

    return btnDetails + btnUpdated + btnDeleted;
};




/* NEW USER*/
function OpenCreateUserModal() {
    $('#AddUser-CreatedDate').val(moment().format("YYYY-MM-DDTHH:mm:ss"));

    $('#modal-AddUser').modal('show');
};
$('#AddUser-Username').keydown(async function (e) {
    if (e.keyCode === 13) {
        try {
            var username = $('#AddUser-Username').val();
            var userinfo = await GetUserInformation(username);

            $('#AddUser-CnName').val(userinfo.USER_NAME);
            $('#AddUser-Email').val(userinfo.NOTES_ID);
            $('#AddUser-HireDate').val(userinfo.HIREDATE);
            $('#AddUser-LeaveDate').val(userinfo.LEAVEDAY);
        }
        catch (error) {
            console.log(error);
        }
    }
});
$('#AddUser-Username').blur(async function (e) {
    try {
        var username = $('#AddUser-Username').val();
        var userinfo = await GetUserInformation(username);

        $('#AddUser-CnName').val(userinfo.USER_NAME);
        $('#AddUser-Email').val(userinfo.NOTES_ID);
        $('#AddUser-HireDate').val(userinfo.HIREDATE);
        $('#AddUser-LeaveDate').val(userinfo.LEAVEDAY);
    }
    catch (error) {
        console.log(error);
    }
});
$('#modal-AddUser-Save').click(async function (e) {
    try {
        e.preventDefault();
        var user = await CreateUser(GetUserData('create'));

        var rowData = CreateDatatableRow(user);
        datatable.row.add(rowData).draw();

        toastr["success"](`Create user ${user.Username} success.`);
        $('#modal-AddUser').modal('hide');
    } catch (error) {
        Swal.fire('Sorry, something went wrong!', `${error}`, 'error');
    }

});


/* DETAILS USER */
async function Details(elm, Id) {
    try {
        var user = await GetUser(Id);

        $('#DetailsUser-Username').val(user.Username);
        $('#DetailsUser-Password').val(user.Password);
        $('#DetailsUser-Email').val(user.Email);
        $('#DetailsUser-VnName').val(user.VnName);
        $('#DetailsUser-CnName').val(user.CnName);
        $('#DetailsUser-EnName').val(user.EnName);
        $('#DetailsUser-Status').val(user.Status);
        $('#DetailsUser-CreatedDate').val(moment(user.CreatedDate).format("YYYY-MM-DDTHH:mm:ss"));

        $('#modal-DetailsUser').modal('show');

    } catch (error) {
        Swal.fire('Sorry, something went wrong!', `${error}`, 'error');
    }
}

/* UPDATE USER */
async function Updated(elm, Id) {
    try {
        var user = await GetUser(Id);

        $('#UpdateUser-Username').val(user.Username);
        $('#UpdateUser-Password').val(user.Password);
        $('#UpdateUser-Email').val(user.Email);
        $('#UpdateUser-VnName').val(user.VnName);
        $('#UpdateUser-CnName').val(user.CnName);
        $('#UpdateUser-EnName').val(user.EnName);
        $('#UpdateUser-Status').val(user.Status);
        $('#UpdateUser-CreatedDate').val(moment(user.CreatedDate).format("YYYY-MM-DDTHH:mm:ss"));

        var index = datatable.row($(elm).closest('tr'));
        $('#modal-UpdateUser-Save').data('id', user.Id);
        $('#modal-UpdateUser-Save').data('index', index);

        $('#modal-UpdateUser').modal('show');

    } catch (error) {
        Swal.fire('Sorry, something went wrong!', `${error}`, 'error');
    }
};
$('#UpdateUser-Username').keydown(async function (e) {
    if (e.keyCode === 13) {
        try {
            var username = $('#AddUser-Username').val();
            var userinfo = await GetUserInformation(username);

            $('#AddUser-CnName').val(userinfo.USER_NAME);
            $('#AddUser-Email').val(userinfo.NOTES_ID);
            $('#AddUser-HireDate').val(userinfo.HIREDATE);
            $('#AddUser-LeaveDate').val(userinfo.LEAVEDAY);
        }
        catch (error) {
            console.log(error);
        }
    }
});
$('#UpdateUser-Username').blur(async function (e) {
    try {
        var username = $('#AddUser-Username').val();
        var userinfo = await GetUserInformation(username);

        $('#AddUser-CnName').val(userinfo.USER_NAME);
        $('#AddUser-Email').val(userinfo.NOTES_ID);
        $('#AddUser-HireDate').val(userinfo.HIREDATE);
        $('#AddUser-LeaveDate').val(userinfo.LEAVEDAY);
    }
    catch (error) {
        console.log(error);
    }
});
$('#modal-UpdateUser-Save').click(async function (e) {
    try {
        e.preventDefault();
        var user = await UpdateUser(GetUserData('update'));

        var index = $('#modal-UpdateUser-Save').data('index');

        var rowdata = CreateDatatableRow(user);
        datatable.row(index).data(rowdata).draw();

        toastr["success"](`Update user ${user.Username} success.`);
        $('#modal-UpdateUser').modal('hide');
    } catch (error) {
        Swal.fire('Sorry, something went wrong!', `${error}`, 'error');
    }

});

/* DELETE USER */
async function Deleted(elm, Id) {
    try {
        var user = await GetUser(Id);

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
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    var result = await DeleteUser(Id);
                    var index = datatable.row($(elm).closest('tr'));

                    if (result === true) {                       
                        datatable.row(index).remove().draw();  
                    }
                    else {
                        var rowdata = CreateDatatableRow(result);
                        datatable.row(index).data(rowdata).draw();
                    }

                    toastr["success"](`Delete user ${user.Username} success.`);
                } catch (error) {
                    Swal.fire('Sorry, something went wrong!', `${error}`, 'error');
                }
            }
        });

    } catch (error) {
        Swal.fire('Sorry, something went wrong!', `${error}`, 'error');
    }
}

/* OTHER */
function GetUserData(type) {
    switch (type) {
        case "create": {
            return user = {
                Username: $('#AddUser-Username').val(),
                Password: $('#AddUser-Password').val(),
                Email: $('#AddUser-Email').val(),
                VnName: $('#AddUser-VnName').val(),
                CnName: $('#AddUser-CnName').val(),
                EnName: $('#AddUser-EnName').val(),
                Status: $('#AddUser-Status').val(),
                CreatedDate: $('#AddUser-CreatedDate').val(),

                HireDate: $('#AddUser-HireDate').val(),
                LeaveDate: $('#AddUser-LeaveDate').val(),
            }
        }
        case "update": {
            return user = {
                Username: $('#UpdateUser-Username').val(),
                Password: $('#UpdateUser-Password').val(),
                Email: $('#UpdateUser-Email').val(),
                VnName: $('#UpdateUser-VnName').val(),
                CnName: $('#UpdateUser-CnName').val(),
                EnName: $('#UpdateUser-EnName').val(),
                Status: $('#UpdateUser-Status').val(),
                CreatedDate: $('#UpdateUser-CreatedDate').val(),
            }
        }
        default: {
            return null;
        }
    }
    
}