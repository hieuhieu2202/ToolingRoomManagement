$(function () {
    GetWarehouses();
    GetUserAndRole();
})

function GetWarehouses() {
    $.ajax({
        type: "GET",
        url: "/NVIDIA/Warehouse/GetWarehouses",
        dataType: "json",
        contentType: "application/json;charset=utf-8",
        success: function (response) {
            if (response.status) {
                const warehouses = JSON.parse(response.warehouses);

                WarehouseTable(warehouses);
            }
            else {
                toastr["error"](response.message, "ERROR");
            }
        },
        error: function (error) {
            Swal.fire("Something went wrong!", GetAjaxErrorMessage(error), "error");
        }
    });
}
function GetUserAndRole() {
    $.ajax({
        type: "GET",
        url: "/NVIDIA/BorrowManagement/GetUserAndRole",
        dataType: "json",
        contentType: "application/json;charset=utf-8",
        success: function (response) {
            if (response.status) {
                users = response.users;

                $.each(users, function (k, u) {
                    var option1 = $(`<option value="${u.Id}">${CreateUserName(u)}</option>`);
                    var option2 = $(`<option value="${u.Id}">${CreateUserName(u)}</option>`);
                    var option3 = $(`<option value="${u.Id}">${CreateUserName(u)}</option>`);

                    $('#wh-Manager1').append(option1);
                    $('#wh-Manager2').append(option2);
                    $('#wh-Manager3').append(option3);
                });
            }
            else {
                toastr["error"](response.message, "ERROR");
            }
        },
        error: function (error) {
            Swal.fire("Something went wrong!", GetAjaxErrorMessage(error), "error");
        }
    });
}

// Create table
var table_Warehouses;
function WarehouseTable(warehouses) {
    if (table_Warehouses) table_Warehouses.destroy();

    $('#table_Warehouses-tbody').html('');
    $.each(warehouses, function (no, item) {
        var row = $(`<tr class="align-middle" data-id="${item.Id}"></tr>`);

        // ID Warehouse
        row.append(`<td>${item.Id}</td>`);
        // Warehouse name
        row.append(`<td>${item.WarehouseName}</td>`);
        // Factory
        row.append(`<td>${item.Factory ? item.Factory : ''}</td>`);
        // Floor
        row.append(`<td>${item.Floors ? item.Floors : '' }</td>`);
        // User manager
        row.append(`<td><p class="fw-bold mb-1">${CreateUserName(item.UserManager)}</p><a href="javascript:;" class="m-0">${item.UserManager.Email}</a></td>`);        
        // Action
        row.append(`<td class="order-action d-flex text-center justify-content-center" style="height: 46px;align-items: center;">
                         <a href="javascript:;" class="text-info bg-light-info border-0      " title="Details" data-id="${item.Id}" onclick="Details(this, event)"><i class="fa-regular fa-circle-info"></i></a>
                         <a href="javascript:;" class="text-warning bg-light-warning border-0" title="Edit" data-id="${item.Id}" onclick="Edit(this, event)   "><i class="fa-duotone fa-pen"></i></a>
                         ${ item.Id != 1 ? `<a href="javascript:;" class="text-danger bg-light-danger border-0  " title="Delete" data-id="${item.Id}" onclick="Delete(this, event) "><i class="fa-duotone fa-trash"></i></a>`: ''}
                    </td>`);

        $('#table_Warehouses-tbody').append(row);
    });

    const options = {
        scrollY: 450,
        scrollX: true,
        order: [],
        autoWidth: false,
        paging: false,
        columnDefs: [
            { targets: "_all", orderable: false },
            { targets: [5], width: "60px", className: 'text-center' },
        ],
        dom: 'Bfrtip',
        buttons: [
            {
                className: 'btn-sm btn-outline-primary',
                text: '<i class="fa-solid fa-plus"></i> New Warehouse',
                action: function () {
                    ModalAdd();
                }
            }
        ]
    };
    table_Warehouses = $('#table_Warehouses').DataTable(options);

    $('button[aria-controls="table_Warehouses"]').removeClass('btn-outline-secondary');
}

// New Warehouse
function ModalAdd() {
    $('#AddModal-HeadTitle').text('New Warehouse Modal');
    $('#AddModal-BodyTitle').text('New Warehouse');

    $('#warehouse-modal .form-control').val('');

    $('#button_send').data('type', 'add');
    $('#button_send').removeAttr('id');
    $('#button_send').removeAttr('index', '');

    $('#wh-Manager1').val(1).trigger('change');
    $('#wh-Manager2').val('').trigger('change');
    $('#wh-Manager3').val('').trigger('change');

    $('#warehouse-modal input, select, textarea').prop('disabled', false);

    $('#warehouse-modal').modal('show');
}

// Edit
function Edit(elm, e) {
    e.preventDefault();

    var Id = $(elm).data('id');
    var Index = table_Warehouses.row(`[data-id="${Id}"]`).index();

    $('#button_send').data('type', 'edit');
    $('#button_send').data('id', Id);
    $('#button_send').data('index', Index);
    

    $.ajax({
        type: "GET",
        url: "/NVIDIA/Warehouse/GetWarehouse?Id=" + Id,
        dataType: "json",
        contentType: "application/json;charset=utf-8",
        success: function (response) {
            if (response.status) {
                $('#AddModal-HeadTitle').text('Edit Warehouse Modal');
                $('#AddModal-BodyTitle').text('Edit Warehouse');

                var warehouse = JSON.parse(response.warehouse);

                $('#warehouse-modal input, select, textarea').prop('disabled', false);

                $('#wh-WarehouseName').val(warehouse.WarehouseName);
                $('#wh-Factory').val(warehouse.Factory);
                $('#wh-Floors').val(warehouse.Floors);
                $('#wh-Manager1').val(warehouse.IdUserManager).trigger('change');
                $('#wh-Manager2').val(warehouse.IdUserDeputy1).trigger('change');
                $('#wh-Manager3').val(warehouse.IdUserDeputy2).trigger('change');
                $('#wh-Description').val(warehouse.Description);

                $('#warehouse-modal').modal('show');
            }
            else {
                toastr["error"](response.message, "ERROR");
            }
        },
        error: function (error) {
            Swal.fire("Something went wrong!", GetAjaxErrorMessage(error), "error");
        }
    });
}
$('#button_send').click(function (e) {
    e.preventDefault();

    var warehouse = {
        Id: $(this).data('id'),
        WarehouseName: $('#wh-WarehouseName').val(),
        WarehouseName: $('#wh-WarehouseName').val(),
        Factory: $('#wh-Factory').val(),
        Floors: $('#wh-Floors').val(),
        IdUserManager: $('#wh-Manager1').val(),
        IdUserDeputy1: $('#wh-Manager2').val(),
        IdUserDeputy2: $('#wh-Manager3').val(),
        Description: $('#wh-Description').val(),
    };

    if ($(this).data('type') == 'add') {
        $.ajax({
            type: "POST",
            url: "/NVIDIA/Warehouse/AddWarehouse",
            data: JSON.stringify(warehouse),
            dataType: "json",
            contentType: "application/json;charset=utf-8",
            success: function (response) {
                if (response.status) {
                    toastr["success"]('', "SUCCESS");
                    GetWarehouses();
                    $('#warehouse-modal').modal('hide');
                }
                else {
                    toastr["error"](response.message, "ERROR");
                }

                
            },
            error: function (error) {
                Swal.fire("Something went wrong!", GetAjaxErrorMessage(error), "error");
            }
        });
    }
    else if ($(this).data('type') == 'edit') {
        $.ajax({
            type: "POST",
            url: "/NVIDIA/Warehouse/UpdateWarehouse",
            data: JSON.stringify(warehouse),
            dataType: "json",
            contentType: "application/json;charset=utf-8",
            success: function (response) {
                if (response.status) {
                    toastr["success"]('', "SUCCESS");
                    GetWarehouses();
                    $('#warehouse-modal').modal('hide');
                }
                else {
                    toastr["error"](response.message, "ERROR");
                }

                
            },
            error: function (error) {
                Swal.fire("Something went wrong!", GetAjaxErrorMessage(error), "error");
            }
        });
    }
});

// Details
$('#table_Warehouses tbody').on('dblclick', 'tr', function (event) {

    var dataId = $(this).data('id');
    var elm = $(`<div data-id="${dataId}"></div>`);

    Details(elm, event);
});
function Details(elm, e) {
    e.preventDefault();

    var Id = $(elm).data('id');

    $.ajax({
        type: "GET",
        url: "/NVIDIA/Warehouse/GetWarehouse?Id=" + Id,
        dataType: "json",
        contentType: "application/json;charset=utf-8",
        success: function (response) {
            if (response.status) {
                $('#AddModal-HeadTitle').text('Details Warehouse Modal');
                $('#AddModal-BodyTitle').text('Details Warehouse');

                var warehouse = JSON.parse(response.warehouse);

                $('#warehouse-modal input, select, textarea').val('');
                $('#warehouse-modal input, select, textarea').prop('disabled', true);

                $('#wh-WarehouseName').val(warehouse.WarehouseName);
                $('#wh-Factory').val(warehouse.Factory);
                $('#wh-Floors').val(warehouse.Floors);
                $('#wh-Manager1').val(warehouse.IdUserManager).trigger('change');
                $('#wh-Manager2').val(warehouse.IdUserDeputy1).trigger('change');
                $('#wh-Manager3').val(warehouse.IdUserDeputy2).trigger('change');
                $('#wh-Description').val(warehouse.Description);

                $('#warehouse-modal').modal('show');
            }
            else {
                toastr["error"](response.message, "ERROR");
            }
        },
        error: function (error) {
            Swal.fire("Something went wrong!", GetAjaxErrorMessage(error), "error");
        }
    });
}

// Delete
function Delete(elm, e) {
    e.preventDefault();

    var Id = $(elm).data('id');
    var Index = table_Warehouses.row(`[data-id="${Id}"]`).index();

    $.ajax({
        type: "GET",
        url: "/NVIDIA/Warehouse/GetWarehouse?Id=" + Id,
        dataType: "json",
        contentType: "application/json;charset=utf-8",
        success: function (response) {
            if (response.status) {
                var warehouse = JSON.parse(response.warehouse);
                // message box
                Swal.fire({
                    title: `<strong style="font-size: 25px;">Do you want Delete this warehouse?</strong>`,
                    html: `<table class="table table-striped table-bordered table-message">
                               <tbody>
                                    <tr>
                                       <td>Warehouse Name</td>
                                       <td>${warehouse.WarehouseName}</td>
                                   </tr>
                                   <tr>
                                       <td>Factory</td>
                                       <td>${warehouse.Factory}</td>
                                   </tr>
                                   <tr>
                                       <td>Floor</td>
                                       <td>${warehouse.Floors}</td>
                                   </tr>
                               </tbody>
                           </table>
                           `,
                    icon: 'question',
                    iconColor: '#dc3545',
                    reverseButtons: false,
                    confirmButtonText: 'Delete',
                    showCancelButton: true,
                    cancelButtonText: 'Cancel',
                    buttonsStyling: false,
                    reverseButtons: true,
                    customClass: {
                        cancelButton: 'btn btn-outline-secondary fw-bold me-3',
                        confirmButton: 'btn btn-danger fw-bold'
                    },
                }).then((result) => {
                    if (result.isConfirmed) {
                        $.ajax({
                            type: "POST",
                            url: "/NVIDIA/Warehouse/DeleteWarehouse",
                            data: JSON.stringify({ Id }),
                            dataType: "json",
                            contentType: "application/json;charset=utf-8",
                            success: function (response) {
                                if (response.status) {
                                    table_Warehouses.row(Index).remove().draw(false);

                                    toastr["success"]("Delete Warehouse success.", "SUCCRESS");
                                }
                                else {
                                    toastr["error"](response.message, "ERROR");
                                }
                            },
                            error: function (error) {
                                Swal.fire("Something went wrong!", GetAjaxErrorMessage(error), "error");
                            }
                        });
                    }
                });
            }
            else {
                toastr["error"](response.message, "ERROR");
            }
        },
        error: function (error) {
            Swal.fire("Something went wrong!", GetAjaxErrorMessage(error), "error");
        }
    });
}