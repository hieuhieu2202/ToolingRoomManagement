$(function () {
    CreateGroupTable();
    CreateVendorTable();
});

// Table
function GetGroups() {
    return new Promise((resolve, reject) => {
        $.ajax({
            type: "GET",
            url: "/NVIDIA/Info/GetGroups",
            dataType: "json",
            contentType: "application/json;charset=utf-8",
            success: function (response) {
                if (response.status) {
                    resolve(response.groups);

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
var table_Group;
async function CreateGroupTable() {
    var groups = await GetGroups();

    // Destroy Old Table
    if (table_Group) table_Group.destroy();

    // Draw rows
    $('#table_Group-body').empty();
    $.each(groups, function (no, group) {
        var row = $(`<tr class="align-middle" data-id="${group.Id}" style="cursor:pointer;"></tr>`);

        // 0 ID
        row.append(`<td>${group.Id}</td>`);
        // 2 Group Name
        row.append(`<td>${group.GroupName ? group.GroupName : ''}</td>`);
        // 3 Total Device
        row.append(`<td>${group.DeviceCount}</td>`);
        // 4 Action
        row.append(`<td>
                         <a href="javascript:;" class="text-info bg-light-info border-0      " title="Details" data-id="${group.Id}" onclick="GroupDetails(this, event)"><i class="fa-regular fa-circle-info"></i></a>
                         <a href="javascript:;" class="text-warning bg-light-warning border-0" title="Edit"    data-id="${group.Id}" onclick="GroupEdit(this, event)   "><i class="fa-duotone fa-pen"></i></a>
                         <a href="javascript:;" class="text-danger bg-light-danger border-0  " title="Delete"  data-id="${group.Id}" onclick="GroupDelete(this, event) "><i class="fa-duotone fa-trash"></i></a>
                    </td>`);


        $('#table_Group-body').append(row);
    });

    // Create Datatable
    const options = {
        scrollY: 480,
        scrollX: false,
        order: [0, 'desc'],
        autoWidth: true,
        columnDefs: [
            { targets: "_all", orderable: false },
            { targets: [0], className: 'text-center' },
            { targets: [0], width: "100px" },
            { targets: [3], className: 'order-action d-flex text-center justify-content-center' },
        ],
        createdRow: function (row, data, dataIndex) {
            $(row).data('id', data[0]);
        },
    };

    table_Group = $('#table_Group').DataTable(options);
    table_Group.columns.adjust();
}
$(".toggle-icon").click(function () {
    setTimeout(() => {
        table_Group.columns.adjust();
    }, 310);
});

// Add
$('#btn-NewGroup').click(function (e) {
    e.preventDefault();

    $('#GroupModal-HeadTitle').text('Group Modal');
    $('#GroupModal-BodyTitle').text('New Group');

    $('#Group-GroupName').text('');

    $('#GroupModal-button_send').data('type', 'add');

    $('#GroupModal-modal').modal('show');
});
// Details
function GroupDetails(elm, e) {
    e.preventDefault();

    var Id = $(elm).data('id');

    $.ajax({
        type: "GET",
        url: "/NVIDIA/Info/GetGroup?Id=" + Id,
        dataType: "json",
        contentType: "application/json;charset=utf-8",
        success: function (response) {
            if (response.status) {
                var group = response.group;

                $('#GroupDetails-GroupName').val(group.GroupName);

                $('#table_GroupDetails-body').empty();
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

                    $('#table_GroupDetails-body').append(tr);
                });

                $('#GroupDetails-modal').modal('show');
            } else {
                toastr["error"](response.message, "ERROR");
            }
        },
        error: function (error) {
            Swal.fire("Something went wrong!", GetAjaxErrorMessage(error), "error");
        }
    });
}
$('#table_Group tbody').on('dblclick', 'tr', function (event) {

    var dataId = $(`<div data-id="${$(this).data('id')}"></div>`);
    GroupDetails(dataId, event);
});
// Edit
function GroupEdit(elm, e) {
    e.preventDefault();

    $('#GroupModal-HeadTitle').text('Group Modal');
    $('#GroupModal-BodyTitle').text('Edit Group');

    var Id = $(elm).data('id');
    var Index = table_Group.row(`[data-id="${Id}"]`).index();

    $.ajax({
        type: "GET",
        url: "/NVIDIA/Info/GetGroup?Id=" + Id,
        dataType: "json",
        contentType: "application/json;charset=utf-8",
        success: function (response) {
            if (response.status) {
                var group = response.group;

                $('#Group-GroupName').val(group.GroupName);

                $('#GroupModal-button_send').data('type', 'edit');
                $('#GroupModal-button_send').data('id', group.Id);
                $('#GroupModal-button_send').data('index', Index);

                $('#GroupModal-modal').modal('show');
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
function GroupDelete(elm, e) {
    var Id = $(elm).data('id');
    var Index = table_Group.row(`[data-id="${Id}"]`).index();

    $.ajax({
        type: "GET",
        url: "/NVIDIA/Info/GetGroup?Id=" + Id,
        dataType: "json",
        contentType: "application/json;charset=utf-8",
        success: function (response) {
            if (response.status) {
                var group = response.group;

                Swal.fire({
                    title: `<strong style="font-size: 25px;">Do you want Delete this Group?</strong>`,
                    html: `<table class="table table-striped table-bordered table-message">
                               <tbody>
                                   <tr>
                                       <td>Product Name</td>
                                       <td>${group.GroupName}</td>
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
                            url: "/NVIDIA/Info/DeleteGroup",
                            data: JSON.stringify({ Id }),
                            dataType: "json",
                            contentType: "application/json;charset=utf-8",
                            success: function (response) {
                                if (response.status) {
                                    table_Group.row(Index).remove().draw(false);

                                    toastr["success"]("Delete Group success.", "SUCCRESS");
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
$('#GroupModal-button_send').click(function (e) {
    var group = {
        GroupName: $('#Group-GroupName').val()
    }

    if ($(this).data('type') == 'add') {
        $.ajax({
            type: "POST",
            url: "/NVIDIA/Info/CreateGroup",
            data: JSON.stringify(group),
            dataType: "json",
            contentType: "application/json;charset=utf-8",
            success: function (response) {
                if (response.status) {
                    var group = response.group;

                    table_Group.row.add(CreateNewRowGroup(group)).draw(false);

                    toastr["success"]("Add New Group success.", "SUCCRESS");
                    $('#GroupModal-modal').modal('hide');
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
        group.Id = $(this).data('id');
        var Index = $(this).data('index');

        $.ajax({
            type: "POST",
            url: "/NVIDIA/Info/EditGroup",
            data: JSON.stringify(group),
            dataType: "json",
            contentType: "application/json;charset=utf-8",
            success: function (response) {
                if (response.status) {
                    var group = response.group;

                    table_Group.row(Index).data(CreateNewRowGroup(group)).draw(false);

                    toastr["success"]("Edit Group success.", "SUCCRESS");

                    $('#GroupModal-modal').modal('hide');
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
function CreateNewRowGroup(group) {
    var row = [];

    // 0 ID
    row.push(`<td>${group.Id}</td>`);
    // 1 station Name
    row.push(`<td>${group.GroupName ? group.GroupName : ''}</td>`);
    // 2 Total Device
    row.push(`<td>${group.DeviceCount}</td>`);
    // 3 Action
    row.push(`<td>
                         <a href="javascript:;" class="text-info bg-light-info border-0      " title="Details" data-id="${group.Id}" onclick="GroupDetails(this, event)"><i class="fa-regular fa-circle-info"></i></a>
                         <a href="javascript:;" class="text-warning bg-light-warning border-0" title="Edit"    data-id="${group.Id}" onclick="GroupEdit(this, event)   "><i class="fa-duotone fa-pen"></i></a>
                         <a href="javascript:;" class="text-danger bg-light-danger border-0  " title="Delete"  data-id="${group.Id}" onclick="GroupDelete(this, event) "><i class="fa-duotone fa-trash"></i></a>
                    </td>`);

    return row;
}


// Table
function GetVendors() {
    return new Promise((resolve, reject) => {
        $.ajax({
            type: "GET",
            url: "/NVIDIA/Info/GetVendors",
            dataType: "json",
            contentType: "application/json;charset=utf-8",
            success: function (response) {
                if (response.status) {
                    resolve(response.vendors);

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
var table_Vendor;
async function CreateVendorTable() {
    var vendors = await GetVendors();

    // Destroy Old Table
    if (table_Vendor) table_Vendor.destroy();

    // Draw rows
    $('#table_Vendor-body').empty();
    $.each(vendors, function (no, vendor) {
        var row = $(`<tr class="align-middle" data-id="${vendor.Id}" style="cursor:pointer;"></tr>`);

        // 0 ID
        row.append(`<td>${vendor.Id}</td>`);
        // 2 Vendor Name
        row.append(`<td>${vendor.VendorName ? vendor.VendorName : ''}</td>`);
        // 3 Total Device
        row.append(`<td>${vendor.DeviceCount}</td>`);
        // 4 Action
        row.append(`<td>
                         <a href="javascript:;" class="text-info bg-light-info border-0      " title="Details" data-id="${vendor.Id}" onclick="VendorDetails(this, event)"><i class="fa-regular fa-circle-info"></i></a>
                         <a href="javascript:;" class="text-warning bg-light-warning border-0" title="Edit"    data-id="${vendor.Id}" onclick="VendorEdit(this, event)   "><i class="fa-duotone fa-pen"></i></a>
                         <a href="javascript:;" class="text-danger bg-light-danger border-0  " title="Delete"  data-id="${vendor.Id}" onclick="VendorDelete(this, event) "><i class="fa-duotone fa-trash"></i></a>
                    </td>`);


        $('#table_Vendor-body').append(row);
    });

    // Create Datatable
    const options = {
        scrollY: 480,
        scrollX: false,
        order: [0, 'desc'],
        autoWidth: true,
        columnDefs: [
            { targets: "_all", orderable: false },
            { targets: [0], className: 'text-center' },
            { targets: [0], width: "100px" },
            { targets: [3], className: 'order-action d-flex text-center justify-content-center' },
        ],
        createdRow: function (row, data, dataIndex) {
            $(row).data('id', data[0]);
        },
    };

    table_Vendor = $('#table_Vendor').DataTable(options);
    table_Vendor.columns.adjust();
}
$(".toggle-icon").click(function () {
    setTimeout(() => {
        table_Vendor.columns.adjust();
    }, 310);
});

// Add
$('#btn-NewVendor').click(function (e) {
    e.preventDefault();

    $('#VendorModal-HeadTitle').text('Vendor Modal');
    $('#VendorModal-BodyTitle').text('New Vendor');

    $('#Vendor-VendorName').text('');

    $('#VendorModal-button_send').data('type', 'add');

    $('#VendorModal-modal').modal('show');
});
// Details
function VendorDetails(elm, e) {
    e.preventDefault();

    var Id = $(elm).data('id');

    $.ajax({
        type: "GET",
        url: "/NVIDIA/Info/GetVendor?Id=" + Id,
        dataType: "json",
        contentType: "application/json;charset=utf-8",
        success: function (response) {
            if (response.status) {
                var vendor = response.vendor;

                $('#VendorDetails-VendorName').val(vendor.VendorName);

                $('#table_VendorDetails-body').empty();
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

                    $('#table_VendorDetails-body').append(tr);
                });

                $('#VendorDetails-modal').modal('show');
            } else {
                toastr["error"](response.message, "ERROR");
            }
        },
        error: function (error) {
            Swal.fire("Something went wrong!", GetAjaxErrorMessage(error), "error");
        }
    });
}
$('#table_Vendor tbody').on('dblclick', 'tr', function (event) {

    var dataId = $(`<div data-id="${$(this).data('id')}"></div>`);
    VendorDetails(dataId, event);
});
// Edit
function VendorEdit(elm, e) {
    e.preventDefault();

    $('#VendorModal-HeadTitle').text('Vendor Modal');
    $('#VendorModal-BodyTitle').text('Edit Vendor');

    var Id = $(elm).data('id');
    var Index = table_Vendor.row(`[data-id="${Id}"]`).index();

    $.ajax({
        type: "GET",
        url: "/NVIDIA/Info/GetVendor?Id=" + Id,
        dataType: "json",
        contentType: "application/json;charset=utf-8",
        success: function (response) {
            if (response.status) {
                var vendor = response.vendor;

                $('#Vendor-VendorName').val(vendor.VendorName);

                $('#VendorModal-button_send').data('type', 'edit');
                $('#VendorModal-button_send').data('id', vendor.Id);
                $('#VendorModal-button_send').data('index', Index);

                $('#VendorModal-modal').modal('show');
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
function VendorDelete(elm, e) {
    var Id = $(elm).data('id');
    var Index = table_Vendor.row(`[data-id="${Id}"]`).index();

    $.ajax({
        type: "GET",
        url: "/NVIDIA/Info/GetVendor?Id=" + Id,
        dataType: "json",
        contentType: "application/json;charset=utf-8",
        success: function (response) {
            if (response.status) {
                var vendor = response.vendor;

                Swal.fire({
                    title: `<strong style="font-size: 25px;">Do you want Delete this Vendor?</strong>`,
                    html: `<table class="table table-striped table-bordered table-message">
                               <tbody>
                                   <tr>
                                       <td>Product Name</td>
                                       <td>${vendor.VendorName}</td>
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
                            url: "/NVIDIA/Info/DeleteVendor",
                            data: JSON.stringify({ Id }),
                            dataType: "json",
                            contentType: "application/json;charset=utf-8",
                            success: function (response) {
                                if (response.status) {
                                    table_Vendor.row(Index).remove().draw(false);

                                    toastr["success"]("Delete Vendor success.", "SUCCRESS");
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
$('#VendorModal-button_send').click(function (e) {
    var vendor = {
        VendorName: $('#Vendor-VendorName').val()
    }

    if ($(this).data('type') == 'add') {
        $.ajax({
            type: "POST",
            url: "/NVIDIA/Info/CreateVendor",
            data: JSON.stringify(vendor),
            dataType: "json",
            contentType: "application/json;charset=utf-8",
            success: function (response) {
                if (response.status) {
                    var vendor = response.vendor;

                    table_Vendor.row.add(CreateNewRowVendor(vendor)).draw(false);

                    toastr["success"]("Add New Vendor success.", "SUCCRESS");
                    $('#VendorModal-modal').modal('hide');
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
        vendor.Id = $(this).data('id');
        var Index = $(this).data('index');

        $.ajax({
            type: "POST",
            url: "/NVIDIA/Info/EditVendor",
            data: JSON.stringify(vendor),
            dataType: "json",
            contentType: "application/json;charset=utf-8",
            success: function (response) {
                if (response.status) {
                    var vendor = response.vendor;

                    table_Vendor.row(Index).data(CreateNewRowVendor(vendor)).draw(false);

                    toastr["success"]("Edit Vendor success.", "SUCCRESS");

                    $('#VendorModal-modal').modal('hide');
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
function CreateNewRowVendor(vendor) {
    var row = [];

    // 0 ID
    row.push(`<td>${vendor.Id}</td>`);
    // 1 Vendor Name
    row.push(`<td>${vendor.VendorName ? vendor.VendorName : ''}</td>`);
    // 2 Total Device
    row.push(`<td>${vendor.DeviceCount}</td>`);
    // 3 Action
    row.push(`<td>
                         <a href="javascript:;" class="text-info bg-light-info border-0      " title="Details" data-id="${vendor.Id}" onclick="VendorDetails(this, event)"><i class="fa-regular fa-circle-info"></i></a>
                         <a href="javascript:;" class="text-warning bg-light-warning border-0" title="Edit"    data-id="${vendor.Id}" onclick="VendorEdit(this, event)   "><i class="fa-duotone fa-pen"></i></a>
                         <a href="javascript:;" class="text-danger bg-light-danger border-0  " title="Delete"  data-id="${vendor.Id}" onclick="VendorDelete(this, event) "><i class="fa-duotone fa-trash"></i></a>
                    </td>`);

    return row;
}