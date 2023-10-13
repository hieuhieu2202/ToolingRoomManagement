$(function () {
    CreateModelTable();
    CreateStationTable();
})

// Table
function GetModels() {
    return new Promise((resolve, reject) => {
        $.ajax({
            type: "GET",
            url: "/NVIDIA/Info/GetModels",
            dataType: "json",
            contentType: "application/json;charset=utf-8",
            success: function (response) {
                if (response.status) {
                    resolve(response.models);
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
var table_Model;
async function CreateModelTable() {
    var models = await GetModels();

    // Destroy Old Table
    if (table_Model) table_Model.destroy();

    // Draw rows
    $('#table_Model-body').empty();
    $.each(models, function (no, model) {
        var row = $(`<tr class="align-middle"></tr>`);

        // 0 ID
        row.append(`<td>${model.Id}</td>`);
        // 2 Model Name
        row.append(`<td>${model.ModelName ? model.ModelName : ''}</td>`);
        // 3 Total Device
        row.append(`<td>${model.DeviceCount}</td>`);
        // 4 Action
        row.append(`<td>
                         <a href="javascript:;" class="text-info bg-light-info border-0      " title="Details" data-id="${model.Id}" onclick="ModelDetails(this, event)"><i class="fa-regular fa-circle-info"></i></a>
                         <a href="javascript:;" class="text-warning bg-light-warning border-0" title="Edit"    data-id="${model.Id}" onclick="ModelEdit(this, event)   "><i class="fa-duotone fa-pen"></i></a>
                         <a href="javascript:;" class="text-danger bg-light-danger border-0  " title="Delete"  data-id="${model.Id}" onclick="ModelDelete(this, event) "><i class="fa-duotone fa-trash"></i></a>
                    </td>`);


        $('#table_Model-body').append(row);
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

    table_Model = $('#table_Model').DataTable(options);
    table_Model.columns.adjust();
}
$(".toggle-icon").click(function () {
    setTimeout(() => {
        table_Model.columns.adjust();
    }, 310);
});

// Add
$('#btn-NewModel').click(function (e) {
    e.preventDefault();

    $('#ModelModal-HeadTitle').text('Model Modal');
    $('#ModelModal-BodyTitle').text('New Model');

    $('#Model-ModelName').text('');

    $('#ModelModal-button_send').data('type', 'add');

    $('#ModelModal-modal').modal('show');
});
// Details
function ModelDetails(elm, e) {
    e.preventDefault();

    var Id = $(elm).data('id');

    $.ajax({
        type: "GET",
        url: "/NVIDIA/Info/GetModel?Id=" + Id,
        dataType: "json",
        contentType: "application/json;charset=utf-8",
        success: function (response) {
            if (response.status) {
                var model = response.model;

                $('#ModelDetails-ModelName').val(model.ModelName);

                $('#table_ModelDetails-body').empty();
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

                    $('#table_ModelDetails-body').append(tr);
                });

                $('#ModelDetails-modal').modal('show');
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
function ModelEdit(elm, e) {
    e.preventDefault();

    $('#ModelModal-HeadTitle').text('Model Modal');
    $('#ModelModal-BodyTitle').text('Edit Model');

    var Id = $(elm).data('id');
    var Index = table_Model.row(`[data-id="${Id}"]`).index();

    $.ajax({
        type: "GET",
        url: "/NVIDIA/Info/GetModel?Id=" + Id,
        dataType: "json",
        contentType: "application/json;charset=utf-8",
        success: function (response) {
            if (response.status) {
                var model = response.model;

                $('#Model-ModelName').val(model.ModelName);

                $('#ModelModal-button_send').data('type', 'edit');
                $('#ModelModal-button_send').data('id', model.Id);
                $('#ModelModal-button_send').data('index', Index);

                $('#ModelModal-modal').modal('show');
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
function ModelDelete(elm, e) {
    var Id = $(elm).data('id');
    var Index = table_Model.row(`[data-id="${Id}"]`).index();

    $.ajax({
        type: "GET",
        url: "/NVIDIA/Info/GetModel?Id=" + Id,
        dataType: "json",
        contentType: "application/json;charset=utf-8",
        success: function (response) {
            if (response.status) {
                var model = response.model;

                Swal.fire({
                    title: `<strong style="font-size: 25px;">Do you want Delete this Model?</strong>`,
                    html: `<table class="table table-striped table-bordered table-message">
                               <tbody>
                                   <tr>
                                       <td>Product Name</td>
                                       <td>${model.ModelName}</td>
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
                            url: "/NVIDIA/Info/DeleteModel",
                            data: JSON.stringify({ Id }),
                            dataType: "json",
                            contentType: "application/json;charset=utf-8",
                            success: function (response) {
                                if (response.status) {
                                    table_Model.row(Index).remove().draw(false);

                                    toastr["success"]("Delete Model success.", "SUCCRESS");
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
$('#ModelModal-button_send').click(function (e) {
    var model = {
        ModelName: $('#Model-ModelName').val()
    }

    if ($(this).data('type') == 'add') {
        $.ajax({
            type: "POST",
            url: "/NVIDIA/Info/CreateModel",
            data: JSON.stringify(model),
            dataType: "json",
            contentType: "application/json;charset=utf-8",
            success: function (response) {
                if (response.status) {
                    var model = response.model;

                    table_Model.row.add(CreateNewRowModel(model)).draw(false);

                    toastr["success"]("Add New Model success.", "SUCCRESS");
                    $('#ModelModal-modal').modal('hide');
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
        model.Id = $(this).data('id');
        var Index = $(this).data('index');

        $.ajax({
            type: "POST",
            url: "/NVIDIA/Info/EditModel",
            data: JSON.stringify(model),
            dataType: "json",
            contentType: "application/json;charset=utf-8",
            success: function (response) {
                if (response.status) {
                    var model = response.model;

                    table_Model.row(Index).data(CreateNewRowModel(model)).draw(false);

                    toastr["success"]("Edit Model success.", "SUCCRESS");

                    $('#ModelModal-modal').modal('hide');
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
function CreateNewRowModel(model) {
    var row = [];

    // 0 ID
    row.push(`<td>${model.Id}</td>`);
    // 1 Model Name
    row.push(`<td>${model.ModelName ? model.ModelName : ''}</td>`);
    // 2 Total Device
    row.push(`<td>${model.DeviceCount}</td>`);
    // 3 Action
    row.push(`<td>
                         <a href="javascript:;" class="text-info bg-light-info border-0      " title="Details" data-id="${model.Id}" onclick="ModelDetails(this, event)"><i class="fa-regular fa-circle-info"></i></a>
                         <a href="javascript:;" class="text-warning bg-light-warning border-0" title="Edit"    data-id="${model.Id}" onclick="ModelEdit(this, event)   "><i class="fa-duotone fa-pen"></i></a>
                         <a href="javascript:;" class="text-danger bg-light-danger border-0  " title="Delete"  data-id="${model.Id}" onclick="ModelDelete(this, event) "><i class="fa-duotone fa-trash"></i></a>
                    </td>`);

    return row;
}



// Table
function GetStations() {
    return new Promise((resolve, reject) => {
        $.ajax({
            type: "GET",
            url: "/NVIDIA/Info/GetStations",
            dataType: "json",
            contentType: "application/json;charset=utf-8",
            success: function (response) {
                if (response.status) {
                    resolve(response.stations);
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
var table_Station;
async function CreateStationTable() {
    var stations = await GetStations();

    // Destroy Old Table
    if (table_Station) table_Station.destroy();

    // Draw rows
    $('#table_Station-body').empty();
    $.each(stations, function (no, station) {
        var row = $(`<tr class="align-middle"></tr>`);

        // 0 ID
        row.append(`<td>${station.Id}</td>`);
        // 2 Station Name
        row.append(`<td>${station.StationName ? station.StationName : ''}</td>`);
        // 3 Total Device
        row.append(`<td>${station.DeviceCount}</td>`);
        // 4 Action
        row.append(`<td>
                         <a href="javascript:;" class="text-info bg-light-info border-0      " title="Details" data-id="${station.Id}" onclick="StationDetails(this, event)"><i class="fa-regular fa-circle-info"></i></a>
                         <a href="javascript:;" class="text-warning bg-light-warning border-0" title="Edit"    data-id="${station.Id}" onclick="StationEdit(this, event)   "><i class="fa-duotone fa-pen"></i></a>
                         <a href="javascript:;" class="text-danger bg-light-danger border-0  " title="Delete"  data-id="${station.Id}" onclick="StationDelete(this, event) "><i class="fa-duotone fa-trash"></i></a>
                    </td>`);


        $('#table_Station-body').append(row);
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

    table_Station = $('#table_Station').DataTable(options);
    table_Station.columns.adjust();
}
$(".toggle-icon").click(function () {
    setTimeout(() => {
        table_Station.columns.adjust();
    }, 310);
});

// Add
$('#btn-NewStation').click(function (e) {
    e.preventDefault();

    $('#StationModal-HeadTitle').text('Station Modal');
    $('#StationModal-BodyTitle').text('New Station');

    $('#Station-StationName').text('');

    $('#StationModal-button_send').data('type', 'add');

    $('#StationModal-modal').modal('show');
});
// Details
function StationDetails(elm, e) {
    e.preventDefault();

    var Id = $(elm).data('id');

    $.ajax({
        type: "GET",
        url: "/NVIDIA/Info/GetStation?Id=" + Id,
        dataType: "json",
        contentType: "application/json;charset=utf-8",
        success: function (response) {
            if (response.status) {
                var station = response.station;

                $('#StationDetails-StationName').val(station.StationName);

                $('#table_StationDetails-body').empty();
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

                    $('#table_StationDetails-body').append(tr);
                });

                $('#StationDetails-modal').modal('show');
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
function StationEdit(elm, e) {
    e.preventDefault();

    $('#StationModal-HeadTitle').text('Station Modal');
    $('#StationModal-BodyTitle').text('Edit Station');

    var Id = $(elm).data('id');
    var Index = table_Station.row(`[data-id="${Id}"]`).index();

    $.ajax({
        type: "GET",
        url: "/NVIDIA/Info/GetStation?Id=" + Id,
        dataType: "json",
        contentType: "application/json;charset=utf-8",
        success: function (response) {
            if (response.status) {
                var station = response.station;

                $('#Station-StationName').val(station.StationName);

                $('#StationModal-button_send').data('type', 'edit');
                $('#StationModal-button_send').data('id', station.Id);
                $('#StationModal-button_send').data('index', Index);

                $('#StationModal-modal').modal('show');
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
function StationDelete(elm, e) {
    var Id = $(elm).data('id');
    var Index = table_Station.row(`[data-id="${Id}"]`).index();

    $.ajax({
        type: "GET",
        url: "/NVIDIA/Info/GetStation?Id=" + Id,
        dataType: "json",
        contentType: "application/json;charset=utf-8",
        success: function (response) {
            if (response.status) {
                var station = response.station;

                Swal.fire({
                    title: `<strong style="font-size: 25px;">Do you want Delete this Station?</strong>`,
                    html: `<table class="table table-striped table-bordered table-message">
                               <tbody>
                                   <tr>
                                       <td>Product Name</td>
                                       <td>${station.StationName}</td>
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
                            url: "/NVIDIA/Info/DeleteStation",
                            data: JSON.stringify({ Id }),
                            dataType: "json",
                            contentType: "application/json;charset=utf-8",
                            success: function (response) {
                                if (response.status) {
                                    table_Station.row(Index).remove().draw(false);

                                    toastr["success"]("Delete Station success.", "SUCCRESS");
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
$('#StationModal-button_send').click(function (e) {
    var station = {
        StationName: $('#Station-StationName').val()
    }

    if ($(this).data('type') == 'add') {
        $.ajax({
            type: "POST",
            url: "/NVIDIA/Info/CreateStation",
            data: JSON.stringify(station),
            dataType: "json",
            contentType: "application/json;charset=utf-8",
            success: function (response) {
                if (response.status) {
                    var station = response.station;

                    table_Station.row.add(CreateNewRowStation(station)).draw(false);

                    toastr["success"]("Add New Station success.", "SUCCRESS");
                    $('#StationModal-modal').modal('hide');
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
        station.Id = $(this).data('id');
        var Index = $(this).data('index');

        $.ajax({
            type: "POST",
            url: "/NVIDIA/Info/EditStation",
            data: JSON.stringify(station),
            dataType: "json",
            contentType: "application/json;charset=utf-8",
            success: function (response) {
                if (response.status) {
                    var station = response.station;

                    table_Station.row(Index).data(CreateNewRowStation(station)).draw(false);

                    toastr["success"]("Edit Station success.", "SUCCRESS");

                    $('#StationModal-modal').modal('hide');
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
function CreateNewRowStation(station) {
    var row = [];

    // 0 ID
    row.push(`<td>${station.Id}</td>`);
    // 1 station Name
    row.push(`<td>${station.StationName ? station.StationName : ''}</td>`);
    // 2 Total Device
    row.push(`<td>${station.DeviceCount}</td>`);
    // 3 Action
    row.push(`<td>
                         <a href="javascript:;" class="text-info bg-light-info border-0      " title="Details" data-id="${station.Id}" onclick="StationDetails(this, event)"><i class="fa-regular fa-circle-info"></i></a>
                         <a href="javascript:;" class="text-warning bg-light-warning border-0" title="Edit"    data-id="${station.Id}" onclick="StationEdit(this, event)   "><i class="fa-duotone fa-pen"></i></a>
                         <a href="javascript:;" class="text-danger bg-light-danger border-0  " title="Delete"  data-id="${station.Id}" onclick="StationDelete(this, event) "><i class="fa-duotone fa-trash"></i></a>
                    </td>`);

    return row;
}