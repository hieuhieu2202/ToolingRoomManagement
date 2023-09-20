$(function () {
    GetWarehouses();
});


function GetWarehouses() {
    $.ajax({
        type: "GET",
        url: "/NVIDIA/Warehouse/GetWarehouses",
        dataType: "json",
        contentType: "application/json;charset=utf-8",
        success: function (response) {
            if (response.status) {
                const warehouses = JSON.parse(response.warehouses);

                $.each(warehouses, function (k, wh) {
                    var option = $(`<option value="${wh.Id}">${wh.WarehouseName}</option>`);
                    $('#input_WareHouse').append(option);
                });
                $('#input_WareHouse').change();
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
$('#input_WareHouse').on('change', function (e) {
    e.preventDefault();

    var IdWarehouse = $(this).val();

    $.ajax({
        type: "GET",
        url: "/NVIDIA/Warehouse/GetWarehouseLayouts?IdWarehouse=" + IdWarehouse,
        dataType: "json",
        contentType: "application/json;charset=utf-8",
        success: function (response) {
            if (response.status) {
                const WarehouseLayouts = JSON.parse(response.WarehouseLayouts);

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


function AddNewLine() {
    const IdWarehouse = $('#input_WareHouse').val();

    $.ajax({
        type: "POST",
        url: "/NVIDIA/Warehouse/NewLine",
        data: JSON.stringify({ IdWarehouse: IdWarehouse }),
        dataType: "json",
        contentType: "application/json;charset=utf-8",
        success: function (response) {
            if (response.status) {
                var AccordionItems = $('#LineContainer .accordion-item');

                DrawNewLine(++AccordionItems.length);
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
function DrawNewLine(LineNum) {
    var html = $(`<!-- Line ${LineNum} -->
                  <div class="accordion-item" wh_line>
                      <h2 class="accordion-header" id="heading_${LineNum}">
                          <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapse_${LineNum}" aria-expanded="true" aria-controls="collapse_${LineNum}">Line ${LineNum}</button>
                      </h2>
                      <div id="collapse_${LineNum}" class="accordion-collapse collapse show" aria-labelledby="heading_${LineNum}" data-bs-parent="#accordion_wh">
                          <div class="accordion-body">
                              <div class="floor_container">
                                  <!-- Floor 1 -->
                                  <div class="field mb-3" wh_floor>
                                      <fieldset class="border rounded-3 p-2">
                                          <legend class="fs-6 fw-bold float-none w-auto px-3">
                                              <div class="d-flex">
                                                  <div class="float-left">Floor 1</div>
                                                  <a class="float-right ms-3" data-line="${LineNum}" data-floor="1"><span class="badge bg-light-info text-info"><i class="fa-solid fa-plus"></i> New Cell</span></a>
                                              </div>
                                          </legend>
                                          <div class="row m-0 floor-cells" wh_cells>
                                              <div class="col-2"><div class="p-2 border rounded-2 text-center" wh_cell>Cell 1</div></div>
                                          </div>
                                      </fieldset>
                                  </div>
                                  <!-- End Floor 1-->   
                              </div>
                  
                              <div class="mt-2">
                                  <button class="btn btn-outline-secondary w-100" BtnNewFloor data-line="${LineNum}"><i class="fa-solid fa-plus"></i> Add new floor</button>
                              </div>
                          </div>
                      </div>
                  </div>
                  <!-- End Line ${LineNum}-->`);
    var BtnNewFloor = $(html).find('[BtnNewFloor]');
    BtnNewFloor.on('click', function (e) {
        e.preventDefault();



        AddNewFloor(LineNum);
    })

    $('#LineContainer').append(html);
}

function AddNewFloor(LineNum) {
    const IdWarehouse = $('#input_WareHouse').val();
    const Line = LineNum;

    $.ajax({
        type: "POST",
        url: "/NVIDIA/Warehouse/NewFloor",
        data: JSON.stringify({ IdWarehouse: IdWarehouse }),
        dataType: "json",
        contentType: "application/json;charset=utf-8",
        success: function (response) {
            if (response.status) {
                var AccordionItems = $('#LineContainer .accordion-item');

                //console.log(AccordionItems.length);

                //DrawNewLine(++AccordionItems.length);
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
function DrawNewFloor() {
    var html = `<!-- Line ${LineNum} -->
                <div class="accordion-item" wh_line>
                    <h2 class="accordion-header" id="heading_${LineNum}">
                        <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapse_${LineNum}" aria-expanded="true" aria-controls="collapse_${LineNum}">Line ${LineNum}</button>
                    </h2>
                    <div id="collapse_${LineNum}" class="accordion-collapse collapse show" aria-labelledby="heading_${LineNum}" data-bs-parent="#accordion_wh">
                        <div class="accordion-body">
                            <div class="floor_container">
                                <!-- Floor 1 -->
                                <div class="field mb-3" wh_floor>
                                    <fieldset class="border rounded-3 p-2">
                                        <legend class="fs-6 fw-bold float-none w-auto px-3">
                                            <div class="d-flex">
                                                <div class="float-left">Floor 1</div>
                                                <a class="float-right ms-3"><span class="badge bg-light-info text-info"><i class="fa-solid fa-plus"></i> New Cell</span></a>
                                            </div>
                                        </legend>
                                        <div class="row m-0 floor-cells" wh_cells>
                                            <div class="col-2"><div class="p-2 border rounded-2 text-center" wh_cell>Cell 1</div></div>
                                        </div>
                                    </fieldset>
                                </div>
                                <!-- End Floor 1-->   
                            </div>

                            <div class="mt-2">
                                <button class="btn btn-outline-secondary w-100" BtnNewFloor><i class="fa-solid fa-plus"></i> Add new floor</button>
                            </div>
                        </div>
                    </div>
                </div>
                <!-- End Line ${LineNum}-->`;
    var BtnNewFloor = $(html).find('[Btn-NewFloor]');
    BtnNewFloor.on('click', function (e) {
        e.preventDefault();

    })

    $('#LineContainer').append(html);
}