$(function () {
    GetWarehouseLayouts();
});

// Layout JsTree
var isCreatingNode = false;
function GetWarehouseLayouts() {
    $.ajax({
        type: "GET",
        url: "/NVIDIA/Warehouse/GetWarehouseLayouts",
        dataType: "json",
        contentType: "application/json;charset=utf-8",
        success: function (response) {
            if (response.status) {
                const warehouses = response.warehouses;

                JsTree(RenderData(warehouses));
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
function JsTree(treeData) {
    $("#LayoutTree").jstree({
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
    });
}

// Create, Rename, Delete Node Affter Event
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

                RenameWarehouse(curentNode, Id, NewName, OldName);

                break;
            }
            case 'lv1': {
                // Rename Line
                var WarehouseNode = $('#LayoutTree').jstree('get_node', curentNode.parent);

                var IdWarehouse = WarehouseNode.id.split('_')[1];
                var NewName = curentNode.text;
                var OldName = data.old;

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

                RenameCell(curentNode, IdWarehouse, LineName, FloorName, NewName, OldName);

                break;
            }
        }
    }
});
$('#LayoutTree').on('delete_node.jstree', function (e, data) {
    var curentNode = data.node;

    switch (curentNode.type) {
        case 'default': {
            // Rename Warehouse
            var Id = curentNode.id.split('_')[1];
            var NewName = curentNode.text;
            var OldName = data.old;

            RenameWarehouse(curentNode, Id, NewName, OldName);

            break;
        }
        case 'lv1': {
            // Rename Line
            var WarehouseNode = $('#LayoutTree').jstree('get_node', curentNode.parent);

            var IdWarehouse = WarehouseNode.id.split('_')[1];
            var NewName = curentNode.text;
            var OldName = data.old;

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

            RenameCell(curentNode, IdWarehouse, LineName, FloorName, NewName, OldName);

            break;
        }
    }
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




















//Create Warehouse Layout
function CreateWarehouseLayouts(WarehouseLayouts) {
    const layout = LayoutInfo(WarehouseLayouts);

    $('#LineContainer').empty();

    for (const line in layout) {
        DrawNewLine(line);

        const numFloors = Object.keys(layout[line]);
        var floor_container = $(`#line_${line} .floor_container`);

        numFloors.forEach(floor => {
            const numCells = layout[line][floor].length;

            DrawNewFloor(line, floor_container, floor);


            var cell_container = $(`#line_${line} .floor_container [wh_floor_${floor}] [wh_cells]`);

            for (let i = 1; i <= numCells; i++) {
                DrawNewCell(cell_container, i);
            }
        });
    };
}
function LayoutInfo(data) {
    const warehouseInfo = {};
    data.forEach(item => {
        const line = item.Line;
        const floor = item.Floor;
        const cell = item.Cell;

        warehouseInfo[line] = warehouseInfo[line] || {};
        if (floor != null)
            warehouseInfo[line][floor] = warehouseInfo[line][floor] || [];
        if (cell != null)
            warehouseInfo[line][floor].push(cell);
    });
    return warehouseInfo;
}


function DrawNewLine(LineNum) {
    var html = $(`<!-- Line ${LineNum} -->
                  <div class="accordion-item" wh_line id="line_${LineNum}">
                      <h2 class="accordion-header" id="heading_${LineNum}">
                          <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapse_${LineNum}" aria-expanded="true" aria-controls="collapse_${LineNum}">Line ${LineNum}</button>
                      </h2>
                      <div id="collapse_${LineNum}" class="accordion-collapse collapse show" aria-labelledby="heading_${LineNum}" data-bs-parent="#accordion_wh">
                          <div class="accordion-body">
                              <div class="floor_container">
                                  
                              </div>
                  
                              <div class="mt-2">
                                  <button class="btn btn-sm btn-secondary w-100" BtnNewFloor data-line="${LineNum}"><i class="fa-solid fa-plus"></i> New floor</button>
                              </div>
                          </div>
                      </div>
                  </div>
                  <!-- End Line ${LineNum}-->`);

    // Button new floor
    var BtnNewFloor = $(html).find('[BtnNewFloor]');
    BtnNewFloor.on('click', function (e) {
        e.preventDefault();
        AddNewFloor(LineNum);
    });

    // hide collapse
    $('.collapse').collapse();

    // append html
    $('#layout_modal-LineContainer').append(html);
    html.hide().fadeIn(500);
}
//New Floor
function AddNewFloor(LineNum) {
    const IdWarehouse = $('#input_WareHouse').val();

    $.ajax({
        type: "POST",
        url: "/NVIDIA/Warehouse/NewFloor",
        data: JSON.stringify({ IdWarehouse: IdWarehouse, Line: LineNum }),
        dataType: "json",
        contentType: "application/json;charset=utf-8",
        success: function (response) {
            if (response.status) {
                var floor_container = $(`#line_${LineNum} .floor_container`);
                var FloorNum = floor_container.find('[wh_floor]').length;

                DrawNewFloor(LineNum, floor_container, ++FloorNum);
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
function DrawNewFloor(LineNum, floor_container, FloorNum) {
    var html = $(`<!-- Floor ${FloorNum} -->
                <div class="field mb-3" wh_floor wh_floor_${FloorNum}>
                    <fieldset class="border rounded-3 p-2">
                        <legend class="fs-6 fw-bold float-none w-auto px-3">
                            <div class="d-flex">
                                <div class="float-left">Floor ${FloorNum}</div>
                                <a class="float-right ms-3"><span class="badge bg-light-info text-info"><i class="fa-solid fa-plus"></i> New Cell</span></a>
                            </div>
                        </legend>
                        <div class="row m-0 floor-cells" wh_cells>

                        </div>
                    </fieldset>
                </div>
                <!-- End Floor ${FloorNum} -->`);
    // new cell event
    var BtnNewCell = html.find('a');
    BtnNewCell.on('click', function (e) {
        e.preventDefault();
        AddNewCell(LineNum, FloorNum);
    });

    floor_container.append(html);
    html.hide().fadeIn(500);
}
// New Cell
function AddNewCell(LineNum, FloorNum) {
    const IdWarehouse = $('#input_WareHouse').val();

    $.ajax({
        type: "POST",
        url: "/NVIDIA/Warehouse/NewCell",
        data: JSON.stringify({ IdWarehouse: IdWarehouse, Line: LineNum, Floor: FloorNum }),
        dataType: "json",
        contentType: "application/json;charset=utf-8",
        success: function (response) {
            if (response.status) {
                var cell_container = $(`#line_${LineNum} .floor_container [wh_floor_${FloorNum}] [wh_cells]`);
                var CellNum = cell_container.find('.col-2').length;

                DrawNewCell(cell_container, ++CellNum);
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
function DrawNewCell(cell_container, CellNum) {
    var html = $(`<div class="col-2 mb-2"><div class="p-2 border rounded-2 text-center" wh_cell>Cell ${CellNum}</div></div>`);

    cell_container.append(html);
    html.hide().fadeIn(500);
}


//data: [{
//    text: "AUTO",
//    children: [{
//        text: "Line1",
//        type: "lv1",
//        children: []
//    }]
//}, {
//    text: "TE",
//    children: [{
//        text: "Line1",
//        type: "lv1",
//        children: [{
//            text: 'Floor1',
//            type: 'lv2',
//            children: [{
//                text: 'Cell1',
//                type: 'lv3',
//            }]
//        }]
//    }]
//}]
//        },