﻿$(function () {
    GetWarehouses();
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

                console.log(warehouses);
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
        row.append(`<td><p class="fw-bold mb-1">${CreateUserName(item.User)}</p><a href="javascript:;" class="m-0">${item.User.Email}</a></td>`);        
        // Action
        row.append(`<td class="order-action d-flex text-center justify-content-center" style="height: 46px;align-items: center;">
                         <a href="javascript:;" class="text-info bg-light-info border-0      " title="Details" data-id="${item.Id}" onclick="Details(this, event)"><i class="fa-regular fa-circle-info"></i></a>
                         <a href="javascript:;" class="text-warning bg-light-warning border-0" title="Edit" data-id="${item.Id}" onclick="Edit(this, event)   "><i class="fa-duotone fa-pen"></i></a>
                         <a href="javascript:;" class="text-danger bg-light-danger border-0  " title="Delete" data-id="${item.Id}" onclick="Delete(this, event) "><i class="fa-duotone fa-trash"></i></a>
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
                className: 'btn-outline-primary',
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
    GetUserAndRole();
    $('#warehouse-modal').modal('show');
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
                    var option = $(`<option value="${u.Id}">${CreateUserName(u)}</option>`);
                    $('#wh-Manager').append(option);
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