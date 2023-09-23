$(function () {
    GetWarehouseLayouts();

    offcanvasDetails = new bootstrap.Offcanvas($('#offcanvasDevice'));
});
var offcanvasDetails;

// Layout JsTree
var isCreatingNode = false;
var LayoutTree;
function GetWarehouseLayouts() {
    $.ajax({
        type: "GET",
        url: "/NVIDIA/Warehouse/GetWarehouseLayouts",
        dataType: "json",
        contentType: "application/json;charset=utf-8",
        success: function (response) {
            if (response.status) {
                const warehouses = response.warehouses;

                const dataRender = RenderData(warehouses);
                if (!LayoutTree) {
                    JsTreeInit(dataRender);
                }
                else {
                    LayoutTree.jstree(true).settings.core.data = dataRender;

                    $("#LayoutTree").jstree(true).refresh();
                    //$("#LayoutTree").jstree("open_all");
                }
                
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
function JsTreeInit(treeData) {
    LayoutTree = $("#LayoutTree").jstree({
        core: {
            themes: {
                responsive: true
            },
            check_callback: true,
            data: treeData,
        },
        plugins: ['contextmenu', 'dnd', 'search', 'types'],
        search: {
            case_insensitive: true,
            show_only_matches: true
        },
        types: {
            default: {
                icon: 'fa-solid fa-warehouse-full'
            },
            lv1: {
                icon: 'fa-solid fa-grip-lines'
            },
            lv2: {
                icon: 'fa-solid fa-line-columns'
            },
            lv3: {
                icon: 'fa-light fa-diagram-cells'
            }
        },
        contextmenu: {
            items: function (node) {
                var menuItems = {};

                if (node.parents.length <= 3) {
                    menuItems.createNode = {
                        label: 'Create',
                        action: function () {
                            isCreatingNode = true;

                            var currentNode = $.jstree.reference('#LayoutTree').get_selected();
                            if (currentNode.length === 1) {
                                var selectedNode = currentNode[0];
                                var newNodeText = '';
                                var newNodeType = 'lv';

                                // check current node and change name
                                if (node.parents.length === 1) {
                                    newNodeText = 'Line';
                                } else if (node.parents.length === 2) {
                                    newNodeText = 'Floor';
                                } else if (node.parents.length === 3) {
                                    newNodeText = 'Cell';
                                }

                                newNodeType = newNodeType + node.parents.length;

                                // Create new node and rename
                                var newTreeNode = $('#LayoutTree').jstree(true).create_node(selectedNode, {
                                    text: newNodeText,
                                    type: newNodeType,
                                });

                                if (newTreeNode) {
                                    // Chỉnh sửa tên node mới sau khi cây đã được tải hoàn thành
                                    $('#LayoutTree').jstree(true).edit(newTreeNode);
                                }
                            }
                        },
                    };
                }

                menuItems.RenameNode = {
                    label: 'Rename',
                    action: function () {
                        var currentNode = $.jstree.reference('#LayoutTree').get_selected();
                        $('#LayoutTree').jstree(true).edit(currentNode);
                    },
                };

                if (node.parents.length > 1) {
                    menuItems.DeleteNode = {
                        label: 'Delete',
                        action: function () {
                            var currentNode = $.jstree.reference('#LayoutTree').get_selected();
                            $('#LayoutTree').jstree(true).delete_node(currentNode);
                        },
                    };
                };

                // check current node and change name
                if (node.parents.length === 1) {
                    menuItems.createNode.label = 'Create Line';
                    menuItems.RenameNode.label = 'Rename Warehouse';
                }
                else if (node.parents.length === 2) {
                    menuItems.createNode.label = 'Create Floor';
                    menuItems.RenameNode.label = 'Rename Line';
                    menuItems.DeleteNode.label = 'Delete Line';
                }
                else if (node.parents.length === 3) {
                    menuItems.createNode.label = 'Create Cell';
                    menuItems.RenameNode.label = 'Rename Floor';
                    menuItems.DeleteNode.label = 'Delete Floor';
                }
                else if (node.parents.length) {
                    menuItems.RenameNode.label = 'Rename Cell';
                    menuItems.DeleteNode.label = 'Delete Cell';
                }

                return menuItems;
            },
        },
    }).on('ready.jstree', function () {
        $(this).jstree("open_all");
    });
}

// Create, Rename, Delete Affter Event
$('#LayoutTree').on('rename_node.jstree', function (e, data) {
    var curentNode = data.node;
    var parentNode = $('#LayoutTree').jstree('get_node', curentNode.parent);

    if (isCreatingNode) {
        switch (parentNode.type) {
            case 'default': {
                // Create Line
                var WarehouseNode = $('#LayoutTree').jstree('get_node', curentNode.parent);

                var IdWarehouse = WarehouseNode.id.split('_')[1];
                var LineName = curentNode.text;

                NewLine(curentNode, IdWarehouse, LineName);

                break;
            }
            case 'lv1': {
                // Create Floor
                var LineNode = $('#LayoutTree').jstree('get_node', curentNode.parent);
                var WarehouseNode = $('#LayoutTree').jstree('get_node', LineNode.parent);

                var IdWarehouse = WarehouseNode.id.split('_')[1];
                var LineName = LineNode.text;
                var FloorName = curentNode.text;

                NewFloor(curentNode, IdWarehouse, LineName, FloorName);

                break;
            }
            case 'lv2': {
                // Create Cell
                var FloorNode = $('#LayoutTree').jstree('get_node', curentNode.parent);
                var LineNode = $('#LayoutTree').jstree('get_node', FloorNode.parent);
                var WarehouseNode = $('#LayoutTree').jstree('get_node', LineNode.parent);

                var IdWarehouse = WarehouseNode.id.split('_')[1];
                var LineName = LineNode.text;
                var FloorName = FloorNode.text;
                var CellName = curentNode.text;

                NewCell(curentNode, IdWarehouse, LineName, FloorName, CellName);

                break;
            }
        }

        isCreatingNode = false;
    }
    else {
        switch (curentNode.type) {
            case 'default': {
                // Rename Warehouse
                var Id = curentNode.id.split('_')[1];
                var NewName = curentNode.text;
                var OldName = data.old;

                if (NewName != OldName)
                    RenameWarehouse(curentNode, Id, NewName, OldName);

                break;
            }
            case 'lv1': {
                // Rename Line
                var WarehouseNode = $('#LayoutTree').jstree('get_node', curentNode.parent);

                var IdWarehouse = WarehouseNode.id.split('_')[1];
                var NewName = curentNode.text;
                var OldName = data.old;

                if (NewName != OldName)
                    RenameLine(curentNode, IdWarehouse, NewName, OldName);

                break;
            }
            case 'lv2': {
                // Rename Floor
                var LineNode = $('#LayoutTree').jstree('get_node', curentNode.parent);
                var WarehouseNode = $('#LayoutTree').jstree('get_node', LineNode.parent);

                var IdWarehouse = WarehouseNode.id.split('_')[1];
                var LineName = LineNode.text;
                var NewName = curentNode.text;
                var OldName = data.old;

                if (NewName != OldName)
                    RenameFloor(curentNode, IdWarehouse, LineName, NewName, OldName);

                break;
            }
            case 'lv3': {
                // Rename Cell
                var FloorNode = $('#LayoutTree').jstree('get_node', curentNode.parent);
                var LineNode = $('#LayoutTree').jstree('get_node', FloorNode.parent);
                var WarehouseNode = $('#LayoutTree').jstree('get_node', LineNode.parent);

                var IdWarehouse = WarehouseNode.id.split('_')[1];
                var LineName = LineNode.text;
                var FloorName = FloorNode.text;
                var NewName = curentNode.text;
                var OldName = data.old;

                if (NewName != OldName)
                    RenameCell(curentNode, IdWarehouse, LineName, FloorName, NewName, OldName);

                break;
            }
        }
    }
});
$('#LayoutTree').on('delete_node.jstree', function (e, data) {
    var curentNode = data.node;

    switch (curentNode.type) {
        case 'lv1': {
            // Rename Line
            var WarehouseNode = $('#LayoutTree').jstree('get_node', curentNode.parent);

            var IdWarehouse = WarehouseNode.id.split('_')[1];
            var LineName = curentNode.text;

            DeleteLine(IdWarehouse, LineName);

            break;
        }
        case 'lv2': {
            // Rename Floor
            var LineNode = $('#LayoutTree').jstree('get_node', curentNode.parent);
            var WarehouseNode = $('#LayoutTree').jstree('get_node', LineNode.parent);

            var IdWarehouse = WarehouseNode.id.split('_')[1];
            var LineName = LineNode.text;
            var FloorName = curentNode.text;

            DeleteFloor(IdWarehouse, LineName, FloorName);

            break;
        }
        case 'lv3': {
            // Rename Cell
            var FloorNode = $('#LayoutTree').jstree('get_node', curentNode.parent);
            var LineNode = $('#LayoutTree').jstree('get_node', FloorNode.parent);
            var WarehouseNode = $('#LayoutTree').jstree('get_node', LineNode.parent);

            var IdWarehouse = WarehouseNode.id.split('_')[1];
            var LineName = LineNode.text;
            var FloorName = FloorNode.text;
            var CellName = curentNode.text;

            DeleteCell(IdWarehouse, LineName, FloorName, CellName);

            break;
        }
    }
});

// Select Node (Get node device)
$("#LayoutTree").on("select_node.jstree", function (e, data) {
    var curentNode = data.node;

    var sendData = {
        IdWarehouse: 0,
        LineName: '',
        FloorName: '',
        CellName: '',
    }

    // GetData
    switch (curentNode.type) {
        case 'default': {
            sendData.IdWarehouse = curentNode.id.split('_')[1];

            $('#btn_Layout-AddDevice').hide();

            break;
        }
        case 'lv1': {
            var WarehouseNode = $('#LayoutTree').jstree('get_node', curentNode.parent);
            sendData.IdWarehouse = WarehouseNode.id.split('_')[1];
            sendData.LineName = curentNode.text;

            $('#btn_Layout-AddDevice').html('<i class="fa-solid fa-plus"></i> Add Device to Line');
            $('#btn_Layout-AddDevice').show();

            break;
        }
        case 'lv2': {
            var LineNode = $('#LayoutTree').jstree('get_node', curentNode.parent);
            var WarehouseNode = $('#LayoutTree').jstree('get_node', LineNode.parent);

            sendData.IdWarehouse = WarehouseNode.id.split('_')[1];
            sendData.LineName = LineNode.text;
            sendData.FloorName = curentNode.text;

            $('#btn_Layout-AddDevice').html('<i class="fa-solid fa-plus"></i> Add Device to Floor');
            $('#btn_Layout-AddDevice').show();

            break;
        }
        case 'lv3': {
            var FloorNode = $('#LayoutTree').jstree('get_node', curentNode.parent);
            var LineNode = $('#LayoutTree').jstree('get_node', FloorNode.parent);
            var WarehouseNode = $('#LayoutTree').jstree('get_node', LineNode.parent);

            sendData.IdWarehouse = WarehouseNode.id.split('_')[1];
            sendData.LineName = LineNode.text;
            sendData.FloorName = FloorNode.text;
            sendData.CellName = curentNode.text;

            $('#btn_Layout-AddDevice').html('<i class="fa-solid fa-plus"></i> Add Device to Cell');
            $('#btn_Layout-AddDevice').show();

            break;
        }
    }

    $('#btn_Layout-AddDevice').data('idwarehouse', sendData.IdWarehouse);
    $('#btn_Layout-AddDevice').data('line', sendData.LineName);
    $('#btn_Layout-AddDevice').data('floor', sendData.FloorName);
    $('#btn_Layout-AddDevice').data('cell', sendData.CellName);

    // PostData
    $.ajax({
        type: "POST",
        url: "/NVIDIA/Warehouse/GetNodeDevices",
        data: JSON.stringify(sendData),
        dataType: "json",
        contentType: "application/json;charset=utf-8",
        success: function (response) {
            if (response.status) {
                console.log(response);

                CreateTableDevices(response.devices);               
            }
            else {
                toastr["error"](response.message, "ERROR");
            }
        },
        error: function (error) {
            Swal.fire("Something went wrong!", GetAjaxErrorMessage(error), "error");
        }
    });
});

// New Node
function NewLine(curentNode, IdWarehouse, LineName) {

    $.ajax({
        type: "POST",
        url: "/NVIDIA/Warehouse/NewLine",
        data: JSON.stringify({ IdWarehouse, LineName }),
        dataType: "json",
        contentType: "application/json;charset=utf-8",
        success: function (response) {
            if (response.status) {
                curentNode.Id = 'line_' + response.layout.Id;
                toastr["success"]('', "SUCCESS");
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
function NewFloor(curentNode, IdWarehouse, LineName, FloorName) {

    $.ajax({
        type: "POST",
        url: "/NVIDIA/Warehouse/NewFloor",
        data: JSON.stringify({ IdWarehouse, LineName, FloorName }),
        dataType: "json",
        contentType: "application/json;charset=utf-8",
        success: function (response) {
            if (response.status) {
                curentNode.Id = 'floor_' + response.layout.Id;
                toastr["success"]('', "SUCCESS");
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
function NewCell(curentNode, IdWarehouse, LineName, FloorName, CellName) {

    $.ajax({
        type: "POST",
        url: "/NVIDIA/Warehouse/NewCell",
        data: JSON.stringify({ IdWarehouse, LineName, FloorName, CellName }),
        dataType: "json",
        contentType: "application/json;charset=utf-8",
        success: function (response) {
            if (response.status) {
                curentNode.Id = 'cell_' + response.layout.Id;
                toastr["success"]('', "SUCCESS");
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

// Rename Node
function RenameWarehouse(curentNode, Id, NewName, OldName) {
    $.ajax({
        type: "POST",
        url: "/NVIDIA/Warehouse/RenameWarehouse",
        data: JSON.stringify({ Id, NewName }),
        dataType: "json",
        contentType: "application/json;charset=utf-8",
        success: function (response) {
            if (response.status) {
                toastr["success"]('', "SUCCESS");
            }
            else {
                curentNode.text = OldName;
                $('#LayoutTree').jstree(true).refresh();
                toastr["error"](response.message, "ERROR");
            }
        },
        error: function (error) {
            curentNode.text = OldName;
            $('#LayoutTree').jstree(true).refresh();
            Swal.fire("Something went wrong!", GetAjaxErrorMessage(error), "error");
        }
    });
}
function RenameLine(curentNode, IdWarehouse, NewName, OldName) {
    $.ajax({
        type: "POST",
        url: "/NVIDIA/Warehouse/RenameLine",
        data: JSON.stringify({ IdWarehouse, NewName, OldName }),
        dataType: "json",
        contentType: "application/json;charset=utf-8",
        success: function (response) {
            if (response.status) {
                toastr["success"]('', "SUCCESS");
            }
            else {
                curentNode.text = OldName;
                $('#LayoutTree').jstree(true).refresh();
                toastr["error"](response.message, "ERROR");
            }
        },
        error: function (error) {
            curentNode.text = OldName;
            $('#LayoutTree').jstree(true).refresh();
            Swal.fire("Something went wrong!", GetAjaxErrorMessage(error), "error");
        }
    });
}
function RenameFloor(curentNode, IdWarehouse, LineName, NewName, OldName) {
    $.ajax({
        type: "POST",
        url: "/NVIDIA/Warehouse/RenameFloor",
        data: JSON.stringify({ IdWarehouse, LineName, NewName, OldName }),
        dataType: "json",
        contentType: "application/json;charset=utf-8",
        success: function (response) {
            if (response.status) {
                toastr["success"]('', "SUCCESS");
            }
            else {
                curentNode.text = OldName;
                $('#LayoutTree').jstree(true).refresh();
                toastr["error"](response.message, "ERROR");
            }
        },
        error: function (error) {
            curentNode.text = OldName;
            $('#LayoutTree').jstree(true).refresh();
            Swal.fire("Something went wrong!", GetAjaxErrorMessage(error), "error");
        }
    });
}
function RenameCell(curentNode, IdWarehouse, LineName, FloorName, NewName, OldName) {
    $.ajax({
        type: "POST",
        url: "/NVIDIA/Warehouse/RenameCell",
        data: JSON.stringify({ IdWarehouse, LineName, FloorName, NewName, OldName }),
        dataType: "json",
        contentType: "application/json;charset=utf-8",
        success: function (response) {
            if (response.status) {
                toastr["success"]('', "SUCCESS");
            }
            else {
                curentNode.text = OldName;
                $('#LayoutTree').jstree(true).refresh();
                toastr["error"](response.message, "ERROR");
            }
        },
        error: function (error) {
            curentNode.text = OldName;
            $('#LayoutTree').jstree(true).refresh();
            Swal.fire("Something went wrong!", GetAjaxErrorMessage(error), "error");
        }
    });
}

// Delete Node
function DeleteLine(IdWarehouse, LineName) {
    $.ajax({
        type: "POST",
        url: "/NVIDIA/Warehouse/DeleteLine",
        data: JSON.stringify({ IdWarehouse, LineName }),
        dataType: "json",
        contentType: "application/json;charset=utf-8",
        success: function (response) {
            if (response.status) {
                toastr["success"]('', "SUCCESS");
            }
            else {
                GetWarehouseLayouts();
                toastr["error"](response.message, "ERROR");
            }
        },
        error: function (error) {
            GetWarehouseLayouts();
            Swal.fire("Something went wrong!", GetAjaxErrorMessage(error), "error");
        }
    });
}
function DeleteFloor(IdWarehouse, LineName, FloorName) {
    $.ajax({
        type: "POST",
        url: "/NVIDIA/Warehouse/DeleteFloor",
        data: JSON.stringify({ IdWarehouse, LineName, FloorName }),
        dataType: "json",
        contentType: "application/json;charset=utf-8",
        success: function (response) {
            if (response.status) {
                toastr["success"]('', "SUCCESS");
            }
            else {
                GetWarehouseLayouts();
                toastr["error"](response.message, "ERROR");
            }
        },
        error: function (error) {
            GetWarehouseLayouts();
            Swal.fire("Something went wrong!", GetAjaxErrorMessage(error), "error");
        }
    });
}
function DeleteCell(IdWarehouse, LineName, FloorName, CellName) {
    $.ajax({
        type: "POST",
        url: "/NVIDIA/Warehouse/DeleteCell",
        data: JSON.stringify({ IdWarehouse, LineName, FloorName, CellName }),
        dataType: "json",
        contentType: "application/json;charset=utf-8",
        success: function (response) {
            if (response.status) {
                toastr["success"]('', "SUCCESS");            
            }
            else {
                GetWarehouseLayouts();
                toastr["error"](response.message, "ERROR");
            }
        },
        error: function (error) {
            GetWarehouseLayouts();
            Swal.fire("Something went wrong!", GetAjaxErrorMessage(error), "error");
        }
    });
}

// Search
$('#LayoutTree').on('search.jstree', function (nodes, str, res) {
    if (str.nodes.length === 0) {
        $('#LayoutTree').jstree(true).hide_all();
    }
});
$('#search_Layout').keyup(function () {
    $('#LayoutTree').jstree(true).show_all();
    $('#LayoutTree').jstree('search', $(this).val());
});

// RenderJsTreeData
function RenderData(warehouses) {
    let result = [];

    warehouses.forEach(warehouse => {
        let warehouseLayouts = warehouse.WarehouseLayouts;

        let warehouseHierarchy = {
            id: 'warehouse_' + warehouse.Id,
            text: warehouse.WarehouseName,
            children: [],
        };

        warehouseLayouts.forEach(layoutItem => {
            let line = layoutItem.Line;
            let floor = layoutItem.Floor;
            let cell = layoutItem.Cell;

            let lineNode = warehouseHierarchy.children.find(child => child.text === line);

            if (!lineNode) {
                lineNode = {
                    id: 'line_' + layoutItem.Id,
                    text: line,
                    type: 'lv1',
                    children: [],
                };
                warehouseHierarchy.children.push(lineNode);
            }

            if (floor) {
                let floorNode = lineNode.children.find(child => child.text === floor);

                if (!floorNode) {
                    floorNode = {
                        id: 'floor_' + layoutItem.Id,
                        text: floor,
                        type: 'lv2',
                        children: [],
                    };
                    lineNode.children.push(floorNode);
                }

                if (cell) {
                    floorNode.children.push({
                        id: 'cell_' + layoutItem.Id,
                        text: cell,
                        type: 'lv3',
                    });
                }
            }
        });

        result.push(warehouseHierarchy);
    });

    return result;
}

// Devices Table
var TableDevices;
async function CreateTableDevices(devices) {
    if (TableDevices) TableDevices.destroy();

    $('#table_Devices-tbody').html('');
    await $.each(devices, async function (no, item) {
        var row = $(`<tr class="align-middle" data-id="${item.Id}"></tr>`);

        // MTS
        row.append(`<td>${(item.Product) ? item.Product.MTS : ""}</td>`);
        // Product Name
        row.append(`<td title="${(item.Product) ? item.Product.ProductName : ""}">${(item.Product) ? item.Product.ProductName : ""}</td>`);
        // Model
        row.append(`<td>${(item.Model) ? item.Model.ModelName : ""}</td>`);
        // Station
        row.append(`<td>${(item.Station) ? item.Station.StationName : ""}</td>`);
        // DeviceCode - PN
        row.append(`<td data-id="${item.Id}" data-code="${item.DeviceCode}">${item.DeviceCode}</td>`);
        // DeviceName
        row.append(`<td title="${item.DeviceName}">${item.DeviceName}</td>`);
        // Group
        row.append(`<td>${(item.Group) ? item.Group.GroupName : ""}</td>`);
        // Vendor
        row.append(`<td title="${(item.Vendor) ? item.Vendor.VendorName : ""}">${(item.Vendor) ? item.Vendor.VendorName : ""}</td>`);
        // Buffer
        row.append(`<td title="${item.Buffer}">${item.Buffer * 100}%</td>`);
        // Quantity
        row.append(`<td title="(Real Quantity)">${(item.RealQty != null) ? item.RealQty : 0}</td>`);
        // Type
        switch (item.Type) {
            case "S": {
                row.append(`<td><span class="text-success fw-bold">Static</span></td>`);
                break;
            }
            case "D": {
                row.append(`<td><span class="text-info fw-bold">Dynamic</span></td>`);
                break;
            }
            default: {
                row.append(`<td><span class="text-secondary fw-bold">N/A</span></td>`);
                break;
            }
        }
        // Status
        switch (item.Status) {
            case "Unconfirmed": {
                row.append(`<td><span class="badge bg-primary">Unconfirmed</span></td>`);
                break;
            }
            case "Part Confirmed": {
                row.append(`<td><span class="badge bg-warning">Part Confirmed</span></td>`);
                break;
            }
            case "Confirmed": {
                row.append(`<td><span class="badge bg-success">Confirmed</span></td>`);
                break;
            }
            case "Locked": {
                row.append(`<td><span class="badge bg-secondary">Locked</span></td>`);
                break;
            }
            case "Out Range": {
                row.append(`<td><span class="badge bg-danger">Out Range</span></td>`);
                break;
            }
            default: {
                row.append(`<td>N/A</td>`);
                break;
            }
        }
        // Action
        row.append(`<td class="order-action d-flex">
                         <a href="javascript:;" class="text-info bg-light-info border-0" title="Details" data-id="${item.Id}" onclick="Details(this, event)"><i class="fa-regular fa-circle-info"></i></a>
                    </td>`);

        $('#table_Devices-tbody').append(row);
    });

    const options = {
        scrollY: 500,
        scrollX: true,
        order: [],
        autoWidth: false,
        columnDefs: [
            { targets: "_all", orderable: false },
            { targets: [9, 10, 11, 12], className: "text-center justify-content-center" },
            { targets: [0, 1, 2, 3, 6, 7, 8], visible: false },
        ],
        "lengthMenu": [[10, 15, 25, 50, -1], [10, 15, 25, 50, "All"]]
    };
    $('#card_Layout-Devices').fadeIn(500);

    TableDevices = $('#table_Devices').DataTable(options);
    TableDevices.columns.adjust();

    
}

// RenderDeviceRow
function RenderDeviceRow(item) {
    var row = [];
    {
        // MTS
        row.push(`<td>${(item.Product) ? item.Product.MTS : ""}</td>`);
        // Product Name
        row.push(`<td title="${(item.Product) ? item.Product.ProductName : ""}">${(item.Product) ? item.Product.ProductName : ""}</td>`);
        // Model
        row.push(`<td>${(item.Model) ? item.Model.ModelName : ""}</td>`);
        // Station
        row.push(`<td>${(item.Station) ? item.Station.StationName : ""}</td>`);
        // DeviceCode - PN
        row.push(`<td data-id="${item.Id}" data-code="${item.DeviceCode}">${item.DeviceCode}</td>`);
        // DeviceName
        row.push(`<td title="${item.DeviceName}">${item.DeviceName}</td>`);
        // Group
        row.push(`<td>${(item.Group) ? item.Group.GroupName : ""}</td>`);
        // Vendor
        row.push(`<td>${(item.Vendor) ? item.Vendor.VendorName : ""}</td>`);
        // Buffer
        row.push(`<td title="${item.Buffer}">${item.Buffer * 100}%</td>`);
        // Quantity
        row.push(`<td title="Real Quantity">${(item.RealQty != null) ? item.RealQty : 0}</td>`);
        // Type
        switch (item.Type) {
            case "S": {
                row.push(`<td><span class="text-success fw-bold">Static</span></td>`);
                break;
            }
            case "D": {
                row.push(`<td><span class="text-info fw-bold">Dynamic</span></td>`);
                break;
            }
            default: {
                row.push(`<td><span class="text-secondary fw-bold">N/A</span></td>`);
                break;
            }
        }
        // Status
        switch (item.Status) {
            case "Unconfirmed": {
                row.push(`<td><span class="badge bg-primary">Unconfirmed</span></td>`);
                break;
            }
            case "Part Confirmed": {
                row.push(`<td><span class="badge bg-warning">Part Confirmed</span></td>`);
                break;
            }
            case "Confirmed": {
                row.push(`<td><span class="badge bg-success">Confirmed</span></td>`);
                break;
            }
            case "Locked": {
                row.push(`<td><span class="badge bg-secondary">Locked</span></td>`);
                break;
            }
            case "Out Range": {
                row.push(`<td><span class="badge bg-danger">Out Range</span></td>`);
                break;
            }
            default: {
                row.push(`<td>N/A</td>`);
                break;
            }
        }
        // Action
        row.push(`<td><div class="dropdown">
					            	<button class="btn btn-outline-secondary button_dot" type="button" data-bs-toggle="dropdown" title="Action">
                                        <i class="bx bx-dots-vertical-rounded"></i>
                                    </button>
                                    <div class="dropdown-menu order-actions">
                                        <a href="javascript:;" class="text-success bg-light-success border-0 mb-2" title="Confirm" data-id="${item.Id}" onclick="Confirm(this, event)"><i class="bx bx-check"></i></a>
                                        <a href="javascript:;" class="text-warning bg-light-warning border-0 mb-2" title="Edit   " data-id="${item.Id}" onclick="Edit(this, event)   "><i class="bx bxs-edit"></i></a>
                                        <a href="javascript:;" class="text-danger  bg-light-danger  border-0     " title="Delete " data-id="${item.Id}" onclick="Delete(this, event) "><i class="bx bxs-trash"></i></a>
					         	    </div>
					         </div></td>`);
    }
    return row;
}

// Add Device To Layout
$('#btn_Layout-AddDevice').on('click', function (e) {
    e.preventDefault();

    var data = {
        IdWarehouse: $(this).data('idwarehouse'),
        LineName: $(this).data('line'),
        FloorName: $(this).data('floor'),
        CellName: $(this).data('cell'),
    }

    $.ajax({
        type: "POST",
        url: "/NVIDIA/Warehouse/GetWarehouseDevices",
        data: JSON.stringify({ IdWarehouse: data.IdWarehouse }),
        dataType: "json",
        contentType: "application/json;charset=utf-8",
        success: function (response) {
            if (response.status) {




                $('#AddDeviceLayout-title').html($('#btn_Layout-AddDevice').text());
                $('#AddDeviceLayout-modal').modal('show');
            }
            else {
                toastr["error"](response.message, "ERROR");
            }
        },
        error: function (error) {
            Swal.fire("Something went wrong!", GetAjaxErrorMessage(error), "error");
        }
    });

});

var AddDeviceLayout_table_Devices;
async function CreateAddDeviceTable(devices) {
    if (AddDeviceLayout_table_Devices) AddDeviceLayout_table_Devices.destroy();
}


function IsDeviceInLayout(device, layout) {
    var check = false;
    device.DeviceWarehouseLayouts.forEach(function (item) {
        var deviceLayout = item.WarehouseLayout;
        if ((deviceLayout.Line == layout.LineName || deviceLayout.Line == layout.Line) &&
            (deviceLayout.Floor == layout.FloorName || deviceLayout.Line == layout.Floor) &&
            (deviceLayout.Cell == layout.CellName || deviceLayout.Line == layout.Cell))
        {
            check = true;
            return false;
        }
    });
    return check;
}

// Device Details
function Details(elm, e) {
    e.preventDefault();

    var IdDevice = $(elm).data('id');
    $.ajax({
        type: "POST",
        url: "/NVIDIA/Warehouse/GetDevice",
        data: JSON.stringify({ IdDevice }),
        dataType: "json",
        contentType: "application/json;charset=utf-8",
        success: function (response) {
            if (response.status) {
                var device = response.device;

                $('#device-DeviceCode').val(device.DeviceCode);
                $('#device-DeviceName').val(device.DeviceName);
                $('#device-DeviceDate').val(moment(device.DeviceDate).format('YYYY-MM-DD HH:mm:ss'));
                $('#device-DeviceProduct').val(device.Product ? device.Product.ProductName : '');
                $('#device-DeviceModel').val(device.Model ? device.Model.ModelName : '');
                $('#device-DeviceGroup').val(device.Group ? device.Group.GroupName : '');
                $('#device-DeviceVendor').val(device.Vendor ? device.Vendor.VendorName : '');
                $('#device-DeviceStation').val(device.Station ? device.Station.StationName : '');
                $('#device-DeviceType').val(device.Type);
                $('#device-DeviceStatus').val(device.Status);
                $('#device-DeviceQuantity').val(device.Quantity);
                $('#device-DeviceConfirmQty').val(device.QtyConfirm);
                $('#device-DeviceRealQty').val(device.RealQty);

                offcanvasDetails.show();
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

//row.append(`<td class="order-action d-flex">
//                         <a href="javascript:;" class="text-info bg-light-info border-0" title="Details" data-id="${item.Id}" onclick="Details(this, event)"><i class="fa-regular fa-circle-info"></i></a>
//                         <a href="javascript:;" class="text-info bg-light-info border-0" title="Details" data-id="${item.Id}" onclick="Details(this, event)"><i class="fa-regular fa-circle-info"></i></a>
//                         <a href="javascript:;" class="text-info bg-light-info border-0" title="Details" data-id="${item.Id}" onclick="Details(this, event)"><i class="fa-regular fa-circle-info"></i></a>
//                    </td>`);