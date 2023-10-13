$(function () {
    CreateProductTable();
});

// Table
function GetProducts() {
    return new Promise((resolve, reject) => {
        $.ajax({
            type: "GET",
            url: "/NVIDIA/Info/GetProducts",
            dataType: "json",
            contentType: "application/json;charset=utf-8",
            success: function (response) {
                if (response.status) {
                    resolve(response.products);
                } else {
                    toastr["error"](response.message, "ERROR");
                }
            },
            error: function (error) {
                Swal.fire("Something went wrong!", GetAjaxErrorMessage(error), "error");
            }
        });
    });
}
var table_Products;
async function CreateProductTable() {
    var products = await GetProducts();

    // Destroy Old Table
    if (table_Products) table_Products.destroy();

    // Draw rows
    $('#table_Products-body').empty();
    $.each(products, function (no, product) {
        var row = $(`<tr class="align-middle"></tr>`);

        // 0 ID
        row.append(`<td>${product.Id}</td>`);
        // 1 MTS
        row.append(`<td>${product.MTS ? product.MTS : ''}</td>`);
        // 2 Product Name
        row.append(`<td>${product.ProductName ? product.ProductName : ''}</td>`);
        // 3 Total Device
        row.append(`<td>${product.DeviceCount}</td>`);
        // 4 Action
        row.append(`<td>
                         <a href="javascript:;" class="text-info bg-light-info border-0      " title="Details" data-id="${product.Id}" onclick="Details(this, event)"><i class="fa-regular fa-circle-info"></i></a>
                         <a href="javascript:;" class="text-warning bg-light-warning border-0" title="Edit"    data-id="${product.Id}" onclick="Edit(this, event)   "><i class="fa-duotone fa-pen"></i></a>
                         <a href="javascript:;" class="text-danger bg-light-danger border-0  " title="Delete"  data-id="${product.Id}" onclick="Delete(this, event) "><i class="fa-duotone fa-trash"></i></a>
                    </td>`);
        

        $('#table_Products-body').append(row);
    });

    // Create Datatable
    const options = {
        scrollY: 480,
        scrollX: false,
        order: [0, 'desc'],
        autoWidth: true,
        columnDefs: [
            { targets: "_all", orderable: false },
            { targets: [0, 3], className: 'text-center' },
            { targets: [0], width: "100px" },
            { targets: [4], className: 'order-action d-flex text-center justify-content-center' },
        ],  
        createdRow: function (row, data, dataIndex) {
            $(row).data('id', data[1]);
        },
    };

    table_Products = $('#table_Products').DataTable(options);
    $('button[aria-controls="table_Products"]').removeClass('btn-outline-secondary');
    table_Products.columns.adjust();
}
$(".toggle-icon").click(function () {
    setTimeout(() => {
        table_Products.columns.adjust();
    }, 310);
});

// Add
$('#btn-NewProduct').click(function (e) {
    e.preventDefault();

    $('#Modal-HeadTitle').text('Product Modal');
    $('#Modal-BodyTitle').text('New Product');

    $('#p-MTS').val('');
    $('#p-ProductName').text('');

    $('#button_send').data('type', 'add');

    $('#product-modal').modal('show');
});
// Details
function Details(elm, e) {
    e.preventDefault();

    var Id = $(elm).data('id');

    $.ajax({
        type: "GET",
        url: "/NVIDIA/Info/GetProduct?Id=" + Id,
        dataType: "json",
        contentType: "application/json;charset=utf-8",
        success: function (response) {
            if (response.status) {
                var product = response.product;

                $('#details-MTS').val(product.MTS);
                $('#details-ProductName').val(product.ProductName);

                $('#table_details-body').empty();
                $.each(response.devices, function (k, device) {
                    var tr = $(`<tr data-id="${device.Id}" style="vertical-align: middle;"></tr>`);
                    tr.append(`<td class="text-center">${k + 1}</td>`);
                    tr.append(`<td>${device.DeviceCode ? device.DeviceCode : ''}</td>`);
                    tr.append(`<td style="max-width: 200px; text-overflow: ellipsis;">${device.DeviceName}</td>`);
                    tr.append(`<td style="max-width: 200px; text-overflow: ellipsis;">${device.Specification}</td>`);
                    tr.append(`<td style="max-width: 120px; text-overflow: ellipsis;">${device.Model ? device.Model.ModelName : ''}</td>`);
                    tr.append(`<td style="max-width: 120px; text-overflow: ellipsis;">${device.Station ? device.Station.StationName : ''}</td>`);
                    tr.append(`<td class="text-center">${device.RealQty}</td>`);
                    tr.append(`<td>${device.Unit}</td>`);

                    var type = '';
                    switch (device.Type) {
                        case 'S': {
                            type = '<span class="text-success fw-bold">Static</span>';
                            break;
                        }
                        case 'D': {
                            type = '<span class="text-info fw-bold">Dynamic</span>';
                            break;
                        }
                        case 'Consign': {
                            type = '<span class="text-warning fw-bold">Consign</span>';
                            break;
                        }
                        case 'Fixture': {
                            type = '<span class="text-primary fw-bold">Fixture</span>'
                            break;
                        }
                        default: {
                            type = '<span class="text-secondary fw-bold">N/A</span>';
                            break;
                        }
                    }
                    tr.append(`<td class="text-center">${type}</td>`);

                    var status = '';
                    switch (device.Status) {
                        case "Unconfirmed": {
                            status = `<span class="badge bg-primary">Unconfirmed</span>`;
                            break;
                        }
                        case "Part Confirmed": {
                            status = `<span class="badge bg-warning">Part Confirmed</span>`;
                            break;
                        }
                        case "Confirmed": {
                            status = `<span class="badge bg-success">Confirmed</span>`;
                            break;
                        }
                        case "Locked": {
                            status = `<span class="badge bg-secondary">Locked</span>`;
                            break;
                        }
                        case "Out Range": {
                            status = `<span class="badge bg-danger">Out Range</span>`;
                            break;
                        }
                        default: {
                            status = `N/A`;
                            break;
                        }
                    }
                    tr.append(`<td class="text-center">${status}</td>`);

                    $('#table_details-body').append(tr);
                });

                $('#details-modal').modal('show');
            } else {
                toastr["error"](response.message, "ERROR");
            }
        },
        error: function (error) {
            Swal.fire("Something went wrong!", GetAjaxErrorMessage(error), "error");
        }
    });
}
// Edit
function Edit(elm, e) {
    e.preventDefault();

    $('#Modal-HeadTitle').text('Product Modal');
    $('#Modal-BodyTitle').text('Edit Product');

    var Id = $(elm).data('id');
    var Index = table_Products.row(`[data-id="${Id}"]`).index();

    $.ajax({
        type: "GET",
        url: "/NVIDIA/Info/GetProduct?Id=" + Id,
        dataType: "json",
        contentType: "application/json;charset=utf-8",
        success: function (response) {
            if (response.status) {
                var product = response.product;

                $('#p-MTS').val(product.MTS);
                $('#p-ProductName').val(product.ProductName);

                $('#button_send').data('type', 'edit');
                $('#button_send').data('id', product.Id);
                $('#button_send').data('index', Index);

                $('#product-modal').modal('show');
            } else {
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
    var Id = $(elm).data('id');
    var Index = table_Products.row(`[data-id="${Id}"]`).index();

    $.ajax({
        type: "GET",
        url: "/NVIDIA/Info/GetProduct?Id=" + Id,
        dataType: "json",
        contentType: "application/json;charset=utf-8",
        success: function (response) {
            if (response.status) {
                var product = response.product;

                Swal.fire({
                    title: `<strong style="font-size: 25px;">Do you want Delete this Product?</strong>`,
                    html: `<table class="table table-striped table-bordered table-message">
                               <tbody>
                                    <tr>
                                       <td>MTS</td>
                                       <td>${product.MTS ? product.MTS : ''}</td>
                                   </tr>
                                   <tr>
                                       <td>Product Name</td>
                                       <td>${product.ProductName}</td>
                                   </tr>
                                   <tr>
                                       <td>Device Count</td>
                                       <td>${response.devices.length}</td>
                                   </tr>
                               </tbody>
                           </table>`,
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
                            url: "/NVIDIA/Info/DeleteProduct",
                            data: JSON.stringify({ Id: Id }),
                            dataType: "json",
                            contentType: "application/json;charset=utf-8",
                            success: function (response) {
                                if (response.status) {
                                    table_Products.row(Index).remove().draw(false);

                                    toastr["success"]("Delete product success.", "SUCCRESS");
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

            } else {
                toastr["error"](response.message, "ERROR");
            }
        },
        error: function (error) {
            Swal.fire("Something went wrong!", GetAjaxErrorMessage(error), "error");
        }
    });
}

// Send Add or Edit data
$('#button_send').click(function (e) {
    var product = {
        MTS: $('#p-MTS').val(),
        ProductName: $('#p-ProductName').val()
    }

    if ($(this).data('type') == 'add') {
        $.ajax({
            type: "POST",
            url: "/NVIDIA/Info/CreateProduct",
            data: JSON.stringify(product),
            dataType: "json",
            contentType: "application/json;charset=utf-8",
            success: function (response) {
                if (response.status) {
                    var product = response.product;

                    table_Products.row.add(CreateNewRow(product)).draw(false);

                    toastr["success"]("Add New product success.", "SUCCRESS");
                    $('#product-modal').modal('hide');
                } else {
                    toastr["error"](response.message, "ERROR");
                }
            },
            error: function (error) {
                Swal.fire("Something went wrong!", GetAjaxErrorMessage(error), "error");
            }
        });
    }
    else {
        product.Id = $(this).data('id');
        var Index = $(this).data('index');

        $.ajax({
            type: "POST",
            url: "/NVIDIA/Info/EditProduct",
            data: JSON.stringify(product),
            dataType: "json",
            contentType: "application/json;charset=utf-8",
            success: function (response) {
                if (response.status) {
                    var product = response.product;

                    table_Products.row(Index).data(CreateNewRow(product)).draw(false);

                    toastr["success"]("Edit product success.", "SUCCRESS");

                    $('#product-modal').modal('hide');
                } else {
                    toastr["error"](response.message, "ERROR");
                }
            },
            error: function (error) {
                Swal.fire("Something went wrong!", GetAjaxErrorMessage(error), "error");
            }
        });
    }
});
function CreateNewRow(product) {
    var row = [];

    // 0 ID
    row.push(`<td>${product.Id}</td>`);
    // 1 MTS
    row.push(`<td>${product.MTS ? product.MTS : ''}</td>`);
    // 2 Product Name
    row.push(`<td>${product.ProductName ? product.ProductName : ''}</td>`);
    // 3 Total Device
    row.push(`<td>${product.DeviceCount}</td>`);
    // 4 Action
    row.push(`<td>
                         <a href="javascript:;" class="text-info bg-light-info border-0      " title="Details" data-id="${product.Id}" onclick="Details(this, event)"><i class="fa-regular fa-circle-info"></i></a>
                         <a href="javascript:;" class="text-warning bg-light-warning border-0" title="Edit"    data-id="${product.Id}" onclick="Edit(this, event)   "><i class="fa-duotone fa-pen"></i></a>
                         <a href="javascript:;" class="text-danger bg-light-danger border-0  " title="Delete"  data-id="${product.Id}" onclick="Delete(this, event) "><i class="fa-duotone fa-trash"></i></a>
                    </td>`);

    return row;
}
