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
    var btnDetails = `<a href="javascript:;" class="text-info    bg-light-info    border-0" onclick="Details(${user.Id})"><i class="fa-regular fa-circle-info"></i></a>`;
    var btnUpdated = `<a href="javascript:;" class="text-warning bg-light-warning border-0" onclick="Updated(${user.Id})   "><i class="fa-duotone fa-pen"></i></a>`;
    var btnDeleted = `<a href="javascript:;" class="text-danger  bg-light-danger  border-0" onclick="Deleted(${user.Id}) "><i class="fa-duotone fa-trash"></i></a>`;

    return btnDetails + btnUpdated + btnDeleted;
};

/* DETAILS USER */


/* NEW USER*/
function OpenCreateUserModal() {
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
        var user = await CreateUser(GetUserData());

        var rowData = CreateDatatableRow(user);
        datatable.row.add(rowData).draw();

        toastr["success"](`Create user ${user.Username} success.`);
        $('#modal-AddUser').modal('hide');
    } catch (error) {
        Swal.fire('Sorry, something went wrong!', `${error}`, 'error');
    }
   
});
function GetUserData() {
    return user = {
        Username: $('#AddUser-Username').val(),
        Password: $('#AddUser-Password').val(),
        Email: $('#AddUser-Email').val(),
        VnName: $('#AddUser-VnName').val(),
        CnName: $('#AddUser-CnName').val(),
        EnName: $('#AddUser-EnName').val(),
        HireDate: $('#AddUser-HireDate').val(),
        LeaveDate: $('#AddUser-LeaveDate').val(),
        Status: 'No Active',
        CreatedDate: moment().format('YYYY-MM-DD HH:mm:ss'),
    }
}


/* UPDATE USER */

/* DELETE USER */
async function Deleted(Id) {
    try {
        var user = await GetUser(Id);

        console.log(user.Username);

    } catch (error) {
        Swal.fire('Sorry, something went wrong!', `${error}`, 'error');
    }
}