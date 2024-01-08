/* EXPORT DEVICE MODAL */
function CreateExportDeviceModal(rows, type) {
    $('#modal-ExportDevice .modal-title').text(`${type} Request Modal`);
    $('#modal-ExportDevice #modalbody-title').text(`${type} Device Request`);
    $('#modal-ExportDevice #modal-ExportDevice-btncreate').data('type', type);

    $('#ExportDevice-cardid').val($('#CardID').text());
    $('#ExportDevice-username').val($('#Name').text());
    $('#ExportDevice-createddate').val(moment().format("YYYY-MM-DDTHH:mm:ss"));
    $('#ExportDevice-note').val('');

    var tbody = $('#table_export-tbody');
    tbody.empty();
    $.each(rows, function (k, row) {
        var tr = $(`<tr class="align-middle" data-id="${row[1]}" data-index="${k}"></tr>`);
        tr.append(`<td class="text-center">${k + 1}</td>`);
        tr.append(`<td>${row[2] ? row[2] : ''}</td>`);
        tr.append(`<td>${row[3]}</td>`);
        tr.append(`<td>${row[4]}</td>`);
        tr.append(`<td class="text-center">${row[9]}</td>`);
        tr.append(`<td><input class="form-control" type="number" max="${row[7]}" placeholder="MAX: ${row[7]}" autocomplete="off"></td>`);

        tbody.append(tr);

    });




    $('#modal-ExportDevice').modal('show');
}
$('#modal-ExportDevice-btnAddSign').on('click', function (e) {
    e.preventDefault();

    var container = $('#modal-ExportDevice-signcontainer');

    var html = $(`<div class="row" sign-row>
                        <div class="col-auto text-center flex-column d-none d-sm-flex">
                            <div class="row h-50">
                                <div class="col border-end">&nbsp;</div>
                                <div class="col">&nbsp;</div>
                            </div>
                            <h5 class="m-2">
                                <span class="badge rounded-pill bg-primary">&nbsp;</span>
                            </h5>
                            <div class="row h-50">
                                <div class="col border-end">&nbsp;</div>
                                <div class="col">&nbsp;</div>
                            </div>
                        </div>
                        <div class="col py-2">
                            <div class="card radius-15 card-sign">
                                <div class="card-body">
                                    <div class="row">
                                        <div class="col-md-4">
                                            <label class="form-label">Role</label>
                                            <select class="form-select form-select" select-role>
                                                <option value="" selected>Role</option>
                                            </select>
                                        </div>
                                        <div class="col-md-7">
                                            <label class="form-label">User</label>
                                            <select type="text" class="form-select form-select" select-user></select>
                                        </div>
                                        <div class="col-1 btn-trash-sign">
                                            <button class="btn btn-sm btn-outline-danger" type="button"><i class="bx bx-trash m-0"></i></button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>`);

    // get select
    var select_role = html.find('[select-role]');
    var select_user = html.find('[select-user]');

    // fill data
    $.each(roles, function (k, item) {
        var otp = $(`<option value="${item.Id}">${item.RoleName}</option>`);
        select_role.append(otp);
    });
    $.each(users, function (k, item) {
        var opt = CreateUserOption(item);
        select_user.append(opt);
    });

    // select change event
    select_role.on('change', function () {
        select_user.empty();
        var roleId = $(this).val();

        if (roleId != '') {
            $.each(users, function (k, userItem) {
                $.each(userItem.UserRoles, function (k, userRoleItem) {
                    if (userRoleItem.Role.Id == roleId) {
                        var opt = CreateUserOption(userItem);
                        select_user.append(opt);
                    }
                });
            });
        }
        else {
            $.each(users, function (k, userItem) {
                var opt = CreateUserOption(userItem);
                select_user.append(opt);
            });
        }
    });

    // change dot color
    var dotArr = container.find('.badge.rounded-pill');
    $.each(dotArr, function (k, item) {
        $(item).removeClass('bg-primary');
        $(item).addClass('bg-light');
    });

    // add delete event
    html.find('.btn-trash-sign button').on('click', function (e) {
        e.preventDefault();
        html.fadeOut(300);
        setTimeout(() => {
            $(this).closest('[sign-row]').remove();
        }, 300);
    });

    // show card
    html.hide();
    container.prepend(html);
    html.fadeIn(300);
});
$('#modal-ExportDevice-btncreate').click(async function (e) {
    try {
        e.preventDefault();

        var type = $(this).data('type');

        var exportdata = GetExportData(type);
        var _export = await CreateExport(exportdata);

        var rowsToAdd = [];
        $.each(_export.ExportDevices, function (i, device) {
            var tablerow = CreateDatatableRow(_export, device);
            rowsToAdd.push(tablerow);
        });
        datatable.rows.add(rowsToAdd).draw(false);
        datatable.columns.adjust().draw(false);

        toastr["success"](`Create ${type} success.`, "SUCCESS");

        $('#modal-ExportDevice').modal('hide');
        $('#modal-AddExportDevice').modal('hide');

    } catch (error) {
        Swal.fire('Sorry, something went wrong!', `${error}`, 'error');
    }
})
function GetExportData(type) {
    var exportdata = {
        CreatedDate: $('#ExportDevice-createddate').val(),
        IdUser: '',
        Note: $('#ExportDevice-note').val(),
        Status: '',
        Type: type,
        UserExportSigns: [],
        ExportDevices: [],
        User: {
            Username: $('#ExportDevice-cardid').val()
        }
    };

    $.each($('#table_export-tbody tr'), function (k, row) {
        var tds = $(row).find('td');
        var exportDevice = {
            IdDevice: $(row).data('id'),
            ExportQuantity: $(tds[5]).find('input').val()
        }

        exportdata.ExportDevices.push(exportDevice);
    });

    $.each($('#modal-ExportDevice-signcontainer [select-user]'), function (k, selectuser) {
        var userExportSign = {
            IdUser: $(selectuser).val(),
            SignOrder: k + 1,
            Status: (k == 0) ? 'Pending' : 'Waitting'
        }
        exportdata.UserExportSigns.push(userExportSign);
    });

    return exportdata;
}