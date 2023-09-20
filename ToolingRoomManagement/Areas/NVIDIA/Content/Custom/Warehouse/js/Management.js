$(function () {
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

var table_Warehouses;
function WarehouseTable(warehouses) {
    if (table_Warehouses) table_Warehouses.destroy();

    $('#table_Warehouses-tbody').html('');
    $.each(warehouses, function (no, item) {
        var row = DrawTableRow(item);
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
        ],
        dom: 'Bfrtip',
        buttons: [
            {
                text: '<i class="fa-solid fa-plus"></i> New Warehouse',
                action: function () {
                    ModalAdd();
                }
            }
        ]
    };
    table_Warehouses = $('#table_Warehouses').DataTable(options);
}

function ModalAdd() {
    $('#warehouse-modal').modal('show');
}

function DrawTableRow(item, isTD = true) {
    var row = [];

    // Id
    row.push(item.Id);
    // WarehouseName
    row.push(item.WarehouseName);
    // Factory
    row.push(`${item.Factory ? item.Factory : ''}`);
    // Floors
    row.push(`${item.Floors ? item.Floors : ''}`);  
    //User
    row.push(`<p class="fw-bold mb-1">${CreateUserName(item.User)}</p>
              <a href="javascript:;" class="m-0">${item.User.Email}</a>`);
    // Action
    row.push(`<div class="dropdown">
					    	<button class="btn btn-outline-secondary button_dot" type="button" data-bs-toggle="dropdown" title="Action">
                                <i class="bx bx-dots-vertical-rounded"></i>
                            </button>
                            <div class="dropdown-menu order-actions">
                                <a href="javascript:;" class="text-success bg-light-success border-0 mb-2" title="Approve" data-id="${item.Id}" onclick="Approve(this, event)"><i class="bx bx-check"></i></a>                                
                                <a href="javascript:;" class="text-danger  bg-light-danger  border-0 mb-2" title="Reject " data-id="${item.Id}" onclick="Reject(this, event) "><i class="bx bx-x"></i></a>
                                <a href="javascript:;" class="text-info    bg-light-info    border-0     " title="Details" data-id="${item.Id}" onclick="Details(this, event)"><i class="bx bx-info-circle"></i></a>
						    </div>
					</div>`);

    if (isTD) {
        var rowHtml = $(`<tr class="align-middle" data-id="${item.Id}"></tr>`);
        $.each(row, function (k, v) {
            rowHtml.append(`<td>${v}</td>`);
        });
        return rowHtml;
    }
    else {
        return row;
    }
}
function CreateUserName(user) {
    var username = '';
    if (user.VnName && user.VnName != '') {
        username = `${user.Username} - ${user.VnName}`;
    }
    else if (user.CnName && user.CnName != '') {
        username = `${user.Username} - ${user.CnName}`;
    }
    if (user.EnName != null && user.EnName != '') {
        username += ` (${user.EnName})`;
    }

    return username;
}