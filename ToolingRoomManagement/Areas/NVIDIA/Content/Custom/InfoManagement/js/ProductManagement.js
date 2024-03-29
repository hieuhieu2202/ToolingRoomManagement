var ProductManagementTable, _productsData;
var DeviceManagementTable, _devicesData;
$(document).ready(function () {
    CreateProductTable();
    GetProductTableData();
});

/* DATATABLE */
function CreateProductTable() {
    const options = {
        scrollY: 480,
        scrollX: false,
        order: [0, 'desc'],
        autoWidth: true,
        columnDefs: [
            { targets: "_all", orderable: false },
            { targets: [0, 3], className: 'text-center' },
            { targets: [0], visible: false },
            { targets: [4], with: 10, className: 'order-action' },
        ],
        dom: "<'row'<'w-auto'B><'col-sm-12 col-md'l><'col-sm-12 col-md'f>>" +
            "<'row'<'col-sm-12'tr>>" +
            "<'row'<'col-sm-12 col-md-7'i><'col-sm-12 col-md-5'p>>",
        buttons: [
            {
                text: 'New Product',
                action: function (e, dt, button, config) {
                    CreateProductModal_Open();
                }
            }
        ],
        createdRow: function (row, data, dataIndex) {
            $(row).data('id', data[0]);
        },
    };
    ProductManagementTable = $('#product-datatable').DataTable(options);
}
async function GetProductTableData() {
    try {
        _productsData = await GetDataAndProducts();

        var RowDatas = [];
        $.each(_productsData, function (k, data) {
            var rowdata = CreateProductTableRow(data);
            RowDatas.push(rowdata);
        });

        ProductManagementTable.rows.add(RowDatas);
        ProductManagementTable.columns.adjust().draw(true);

    }
    catch (error) {
        Swal.fire('Sorry, something went wrong!', `${error}`, 'error');
        console.error(error);
    }
}

function CreateDeviceTable() {
    const options = {
        scrollY: 480,
        scrollX: false,
        order: [0, 'desc'],
        autoWidth: true,
        columnDefs: [
            { targets: "_all", orderable: false },
            { targets: [0], visible: false },
        ],      
        createdRow: function (row, data, dataIndex) {
            $(row).data('id', data[0]);
        },
    };
    ProductManagementTable = $('#product-datatable').DataTable(options);
}

/* DATATABLE ROW */
function CreateProductTableRow(data) {
    return row = [
        data.Product.Id,
        data.Product.MTS ? data.Product.MTS : '',
        data.Product.ProductName ? data.Product.ProductName : '',
        data.Total.Device,
        CreateProductTableCellAction(data.Product),
    ]
};
function CreateProductTableCellAction(product) {
    var btnDetails = `<a href="javascript:;" class="text-info    bg-light-info    border-0" data-id="${product.Id}" onclick="DetailProductModal_Open(this)"><i class="fa-regular fa-circle-info"></i></a>`;
    var btnUpdate  = `<a href="javascript:;" class="text-warning bg-light-warning border-0" data-id="${product.Id}" onclick="UpdateProductModal_Open(this)"><i class="fa-duotone fa-pen"></i></a>`;
    var btnDelete  = `<a href="javascript:;" class="text-danger  bg-light-danger  border-0" data-id="${product.Id}" onclick="DeleteProductModal_Open(this)"><i class="fa-duotone fa-trash"></i></a>`;

    return btnDetails + btnUpdate + btnDelete;
};

/* MAIN EVENT */

// Create
function CreateProductModal_Open() {
    $('#CreateProductModal').modal('show');
}
async function CreateProductModal_Save() {
    try
    {
        var product = {
            MTS: $('#create-MTS').val(),
            ProductName: $('#create-ProductName').val()
        }

        var result = await CreateProduct(product);

        if (result) {

            var rowData = CreateProductTableRow(result);
            ProductManagementTable.row.add(rowData).draw(false);

            toastr["success"](`Create Product ${product.ProductName} success.`);
            $('#CreateProductModal').modal('hide');
        }
    }
    catch (error)
    {
        Swal.fire('Sorry, something went wrong!', `${error}`, 'error');
        console.error(error);
    }
}

// Update
async function UpdateProductModal_Open(elm) {
    try
    {
        var IdProduct = $(elm).data('id');
        var IndexRow = ProductManagementTable.row($(elm).closest('tr'));

        var product = await GetProduct(IdProduct);

        $('#update-MTS').val(product.MTS);
        $('#update-ProductName').val(product.ProductName);

        $('#UpdateProductModal_Save').data('id', IdProduct);
        $('#UpdateProductModal_Save').data('index', IndexRow);

        $('#UpdateProductModal').modal('show');
    }
    catch (error)
    {
        Swal.fire('Sorry, something went wrong!', `${error}`, 'error');
        console.log(error);
    }
}
async function UpdateProductModal_Save(elm) {
    try
    {
        var IdProduct = $(elm).data('id');
        var IndexRow = $(elm).data('index');

        var product = {
            Id: IdProduct,
            MTS: $('#update-MTS').val(),
            ProductName: $('#update-ProductName').val(),
        }

        var result = await UpdateProduct(product);

        if (result) {
            var rowdata = CreateProductTableRow(result);
            ProductManagementTable.row(IndexRow).data(rowdata).draw(false);

            toastr["success"](`Update Product ${product.ProductName} success.`);
            $('#UpdateProductModal').modal('hide');
        }
    }
    catch (error)
    {
        Swal.fire('Sorry, something went wrong!', `${error}`, 'error');
        console.error(error);
    }
}

// Delete
async function DeleteProductModal_Open(elm) {
    try {
        var IdProduct = $(elm).data('id');
        var IndexRow = ProductManagementTable.row($(elm).closest('tr'));

        var product = await GetProduct(IdProduct);

        Swal.fire({
            title: 'Are you sure?',
            html: `Do you want delete Product '${product.MTS} - ${product.ProductName}'?`,
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
                    var result = await DeleteProduct(IdProduct);

                    if (result) {
                        ProductManagementTable.row(IndexRow).remove().draw(false);

                        toastr["success"](`Delete Product '${product.MTS} - ${product.ProductName}' success.`);
                    }
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

// Details
function DetailProductModal_Open() {

}

async function sss() {
    var products = await GetProducts();

    // Destroy Old Table
    if (table_Products) table_Products.destroy();

    // Draw rows
    $('#table_Products-body').empty();
    $.each(products, function (no, product) {
        var row = $(`<tr class="align-middle" data-id="${product.Id}" style="cursor:pointer;"></tr>`);

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
}

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
$('#table_Products tbody').on('dblclick', 'tr', function (event) {

    var dataId = $(`<div data-id="${$(this).data('id')}"></div>`);
    Details(dataId, event);
});
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
