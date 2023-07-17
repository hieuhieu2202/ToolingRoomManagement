var table_PurchaseRequest;
var buttonNewRequest;

var topNum = 1;

$(document).ready(async function () {
    buttonNewRequest = initConfettiButton('buttonNewRequest', 'canvasNewRequest');
    GetListPR();    
    AddInputImageButtonEvent();
});

// Khởi tạo table
function GetListPR() {
    $.ajax({
        type: "GET",
        url: "/PurchaseOrderManager/QuotationRequest/GetListPR",
        contentType: "application/json;charset=utf-8",
        dataType: "json",
        async: false,
        success: function (response) {
            if (response.status) {
                sData = JSON.parse(response.data);
                $.each(sData, function (k, item) {
                    var rowData = CreateRowTable(item, false);
                    $('#table_PurchaseRequest_tbody').append(rowData);
                });             
                InitTable();
            }
            else {
                Swal.fire({
                    title: `ERROR`,
                    text: response.message,
                    icon: 'error',
                    confirmButtonText: 'Got it!',
                    buttonsStyling: false,
                    customClass: {
                        confirmButton: 'btn btn-danger'
                    },
                });
            }
        },
        error: function (error) {
            Swal.fire({
                title: `ERROR`,
                text: 'Server Error. Please contact us.',
                icon: 'error',
                confirmButtonText: 'Got it!',
                buttonsStyling: false,
                customClass: {
                    confirmButton: 'btn btn-danger'
                },
            });
        }
    });
}
function InitTable() {
    var scrollHeight = document.querySelector('#sidebar').offsetHeight - 300 + 'px';
    var options = {
        scrollY: scrollHeight,
        scrollX: false,
        paging: false,
        info: false,
        searching: true,
        scrollCollapse: true,
        fixedHeader: {
            header: true,
        },
        columnDefs: [
            { targets: [8], orderable: false, className: 'action-cell' },
            { targets: [1, 2, 3, 4, 5], className: 'text-center' },
            { targets: [9], visible: false, searchable: false },
            { targets: "_all", orderable: true, className: 'middle-cell' },           
        ],
        order: [[0, 'desc']]
    }
    table_PurchaseRequest = new DataTable('#table_PurchaseRequest', options);

    $('#table_PurchaseRequest_filter').hide();

    $('#table_PurchaseRequest_search').on('keyup', function () {
        table_PurchaseRequest.search($(this).val()).draw();
    });

    $('.dataTables_scrollBody').css('height', scrollHeight);

}


// Sự kiện khi tải lên hình ảnh => thêm nút xoá + preview ảnh
function AddInputImageButtonEvent() {
    var cell = $('.cell-image-upload').last();

    const input = $(cell).find('.imageInput');
    const previewContainer = $(cell).find('.previewContainer');
    const deleteButton = $(cell).find('.deleteButton');

    input.on('change', function (event) {
        previewContainer.html('');
        deleteButton.css('display', 'block');

        const files = event.target.files;
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const reader = new FileReader();

            reader.onload = function (event) {
                const img = $('<img>');
                img.attr('src', event.target.result);
                img.addClass('previewImage');
                previewContainer.append(img);

                $(img).on('click', function (img) {
                    let image = $('#Image_Preview');
                    image.attr('src', event.target.result);
                    $(image).click();
                });
            };
            reader.readAsDataURL(file);
        }
    });

    deleteButton.on('click', function () {
        previewContainer.html('');
        deleteButton.css('display', 'none');
        input.val('');
    });
}
var viewPreview;
$('#Image_Preview').on('click', function () {
    if (viewPreview) {
        viewPreview.destroy();
    }
    viewPreview = new Viewer(document.getElementById('Image_Preview'), {
        backdrop: true,
        button: false,
        focus: true,
        fullscreen: false,
        loading: true,
        loop: false,
        keyboard: false,
        movable: true,
        navbar: false,
        rotatable: false,
        scalable: false,
        slideOnTouch: false,
        title: false,
        toggleOnDbclick: false,
        toolbar: true,
        tooltip: true,
        transition: true,
        zoomable: true,
        zoomOnTouch: true,
        zoomOnWheel: true
    });
});


// Sự kiện thêm mới đơn
$('#btn_AddNewRequest').on('click', function (e) {
    e.preventDefault();
    ClearModal();
    $('#NewPurchaseOrderRequest').modal('show');
});
$('#buttonNewRequest').on('click', function () {
    ButtonLoad(buttonNewRequest);

    var formHead = {};
    // Data header
    $("#PurchaseOrderRequestHead [name]").each(function () {
        var elementName = $(this).attr("name");
        var elementValue;

        if ($(this).is("td")) {
            elementValue = $(this).text();
        } else {
            elementValue = $(this).val();
        }

        formHead[elementName] = elementValue;
    });

    formHead['Status'] = $('#select-status').val();

    $("#PurchaseOrderRequestApply [name]").each(function () {
        var elementName = $(this).attr("name");
        var elementValue;

        if ($(this).is("th")) {
            elementValue = $(this).text();
        } else {
            elementValue = $(this).val();
        }

        formHead[elementName] = elementValue;
    });

    // Data Item
    var formItems = [];
    var formItemImages = {};
    $.each($('#PurchaseOrderRequestItem tr') ,function (key, row) {
        if ($(row).css('background-color') == 'rgba(0, 0, 0, 0.06)') {
            var cells = $(row).find('td');

            var formItem = {};
            var formItemImage = [];
            $(cells).each(function (k, cell) {
                var elementName = $(cell).attr("name");

                if ($(cell).hasClass("cell-image-upload")) {

                    var fileInput = $(cell).find("input[type='file']");
                    var files = fileInput[0].files;
                    for (var i = 0; i < files.length; i++) {
                        formItemImage.push(files[i]);
                    }
                    formItemImages[key] = formItemImage;
                }
                else if ($(cell).hasClass('cell-radio')) {
                    return;
                }
                else {
                    if (!$(cell).is('[number]')) {
                        formItem[elementName] = $(cell).text();;
                    }
                }
            });

            var radioType = $(row).find('input[type="radio"]');
            if (radioType[0].checked) {
                formItem['Type'] = 'one';
            }
            else {
                formItem['Type'] = 'more';
            }
            formItems.push(formItem);
        }

    });

    var SendData = {
        purchaseOrderRequest: formHead,
        purchaseOrderRequestItems: formItems,
        httpFiles: formItemImages
    }

    const validateMessage = Validate(SendData);
    if (validateMessage != null) {
        Swal.fire({
            title: `ERROR`,
            text: validateMessage,
            icon: 'error',
            confirmButtonText: 'Got it!',
            buttonsStyling: false,
            customClass: {
                confirmButton: 'btn btn-danger'
            },
        });
        ButtonReady(buttonNewRequest);
        return;
    }

    SendRequestToServer(SendData);
});
function Validate(SendData) {
    const pr = SendData.purchaseOrderRequest;

    if (!pr.RequestDepartment || pr.RequestDepartment.length > 20) {
        return '需求單位/費用代碼 (Đơn vị nhu cầu / mã bộ phận) is not valid. This field must be a string of 1 to 20 characters.';
    }
    if (!pr.UseDepartment || pr.UseDepartment.length > 20) {
        return '需求單位 (Mã bộ phận sử dụng) is not valid. This field must be a string of 1 to 20 characters.';
    }
    if (!pr.CostCode || pr.CostCode.length > 20) {
        return '需求單位費用代碼 (Mã chi phí) is not valid. This field must be a string of 1 to 20 characters.';
    }
    if (!pr.LegalEntity || pr.LegalEntity.length > 20) {
        return '下單法人 (Pháp nhân mua hàng) is not valid. This field must be a string of 1 to 20 characters.';
    }
    if (!pr.DeliveryLocation || pr.DeliveryLocation.length > 20) {
        return '交貨地點 (Địa điểm giao hàng) is not valid. This field must be a string of 1 to 20 characters.';
    }
    if (!pr.PlanDeliveryDate) {
        return '最晚需到廠日期 (Ngày tháng dự định cần giao hàng) is not valid.';
    }
    if (!pr.Requester || pr.Requester.length > 20) {
        return '需求人 (Người yêu cầu) is not valid. This field must be a string of 1 to 20 characters.';
    }
    if (!pr.RequesterPhoneNumber || pr.RequesterPhoneNumber.length > 20) {
        return '電話 (Số máy lẻ) is not valid. This field must be a string of 1 to 20 characters.';
    }
    if (!pr.RequesterEmail || pr.RequesterEmail.length > 100) {
        return '郵箱 (Hòm thư) is not valid. This field must be a string of 1 to 100 characters.';
    }

    const pri = SendData.purchaseOrderRequestItems;
    if (pri.length < 1) {
        return 'Request item is null. Please apply request item.';
    }
    else {
        var messageItem = "";
        $.each(pri, function (k, item) {
            if (!item.ProductName || item.ProductName.length > 100) {
                messageItem = `Item ${k + 1}: 品名 (Tên sản phẩm) is not valid. This field must be a string of 1 to 100 characters.`;
                return false;
            }
            if (!item.Brand || item.Brand.length > 50) {
                messageItem = `Item ${k + 1}: 品牌 (Nhãn hiệu) is not valid. This field must be a string of 1 to 50 characters.`;
                return false;
            }
            if (!item.Information || item.Information.length > 500) {
                messageItem = `Item ${k + 1}: 型號/規格說明 (Thông tin kỹ thuật / Quy cách) is not valid. This field must be a string of 1 to 500 characters.`;
                return false;
            }
            if (!item.Unit || item.Unit.length > 20) {
                messageItem = `Item ${k + 1}: 單位 (Đơn vị) is not valid. This field must be a string of 1 to 20 characters.`;
                return false;
            }
            if (!item.Quantity || item.Quantity.length > 50) {
                messageItem = `Item ${k + 1}: 需求數量 (SL yêu cầu) is not valid. This field must be a number of 1 to 50 characters.`;
                return false;
            }
            if (!item.MaterialCode.length || item.MaterialCode.length > 50) {
                messageItem = `Item ${k + 1}:料號/歷史採購單 (Mã liệu/Đơn mua lịch sử) is not valid. This field must be a string of 1 to 50 characters.`;
                return false;
            }
        });
        if (messageItem != "") {
            return messageItem;
        }
    }

    return null;
}
function SendRequestToServer(SendData) {
    var formData = new FormData(); // Make From Data
    {
        // Gán dữ liệu từ formHead vào formData
        for (var key in SendData.purchaseOrderRequest) {
            formData.append('purchaseOrderRequest.' + key, SendData.purchaseOrderRequest[key]);
        }

        // Gán dữ liệu từ purchaseOrderRequestItems vào formData
        for (var i = 0; i < SendData.purchaseOrderRequestItems.length; i++) {
            var item = SendData.purchaseOrderRequestItems[i];
            for (var key in item) {
                formData.append('purchaseOrderRequestItems[' + i + '].' + key, item[key]);
            }
        }
        // Gán tệp tin từ Item Image vào formData
        for (var key in SendData.httpFiles) {
            var files = SendData.httpFiles[key];
            if (files.length > 0) {
                for (var i = 0; i < files.length; i++) {
                    formData.append('itemImage[' + key + '][' + i + ']', files[i]);
                }
            }
            else {
                var emptyFile = new File([], 'empty.txt', { type: 'text/plain' });
                formData.append('itemImage[' + key + '][0]', emptyFile);
            }
        }
        // Gán tệp tin từ PR - PO - Orther file vào formData
        for (let i = 0; i < pr_files.length; i++) {
            formData.append('pr_files[' + i + ']', pr_files[i]);
        }
        for (let i = 0; i < po_files.length; i++) {
            formData.append('po_files[' + i + ']', po_files[i]);
        }
        for (let i = 0; i < or_files.length; i++) {
            formData.append('or_files[' + i + ']', or_files[i]);
        }
    }
    
    // Send to SV
    $.ajax({
        url: '/PurchaseOrderManager/QuotationRequest/NewPurchaseOrderRequest',
        type: 'POST',
        data: formData,
        contentType: false,
        processData: false,
        async: false,
        success: function (response) {
            if (response.status) {
                sData = JSON.parse(response.data);
                CreateRowTable(sData);

                setTimeout(() => {
                    ButtonComplete(buttonNewRequest);    
                }, 1000);

                
            }
            else {
                Swal.fire({
                    title: `ERROR`,
                    text: response.message,
                    icon: 'error',
                    confirmButtonText: 'Got it!',
                    buttonsStyling: false,
                    customClass: {
                        confirmButton: 'btn btn-danger'
                    },
                });

                ButtonReady(buttonNewRequest);
            }
        },
        error: function (error) {
            ButtonReady(buttonNewRequest);
            Swal.fire({
                title: `ERROR`,
                text: 'Server Error. Please contact us.',
                icon: 'error',
                confirmButtonText: 'Got it!',
                buttonsStyling: false,
                customClass: {
                    confirmButton: 'btn btn-danger'
                },
            });
        }
    });
}

// Sự kiện thêm - xoá hàng động (dynamic)
function AddNewRow(e) {
    e.preventDefault();

    var ButtonArr = $('[dButton]');
    var Button = ButtonArr.eq(ButtonArr.length - 1);

    Button.attr('onclick', 'DeleteRow(this, event)');
    Button.unbind();
    Button.removeClass('btn-primary');
    Button.addClass('btn-danger');
    Button.html('<i class="bi bi-trash-fill"></i>');

    var thisRow = Button.closest('tr');
    thisRow.css('background-color', '#0000000f');
    thisRow.attr('data-type', 'new');

    var thisRowCells = thisRow.find('td');
    $.each(thisRowCells, function (k, cell) {
        if ($(cell).is('[contenteditable]')) {
            $(cell).attr('contenteditable', false);
        };
        if ($(cell).hasClass('cell-image-upload')) {
            $(cell).find('input').attr('disabled', true);
            var ImageClearButtonCell = $(cell).find('button');
            ImageClearButtonCell.attr('disabled', true);
            ImageClearButtonCell.css("color", "grey");
        }
        if ($(cell).hasClass('cell-radio')) {
            if ($(cell).find('input').is('[type="radio"]')){
                $(cell).find('input').attr('disabled', true);
            }           
        }
    });

    setTimeout(() => {
        topNum++;
        var itemRow = `<tr>
             <td class="text-center align-middle" number>${topNum}</td>
             <td contenteditable="true" name="ProductName"></td>
             <td contenteditable="true" name="Brand"></td>
             <td contenteditable="true" name="Information"></td>
             <td contenteditable="true" name="Unit"></td>
             <td contenteditable="true" name="Quantity"></td>
             <td class="cell-radio"><label><input type="radio" name="group-${topNum}" checked /></label></td>
             <td class="cell-radio"><label><input type="radio" name="group-${topNum}" /></label></td>
             <td contenteditable="true" name="MaterialCode"></td>
             <td contenteditable="true" name="ReferencePriceLink"></td>
             <td class="cell-image-upload row">
                 <input type="file" class="col-10 ps-0 imageInput" multiple name="Image" accept="image/*">
                 <button class="col-2 pe-0 deleteButton"><i class="bi bi-x-circle"></i></button>
                 <div class="col-12 previewContainer"></div>
             </td>
             <td contenteditable="true" name="Notes"></td>
             <td contenteditable="true" name="Feedback"></td>
         
             <td class="cell-radio" action>
                 <label>
                     <button class="btn btn-primary" dButton title="dynamic" onclick="AddNewRow(event)">
                         <i class="bi bi-check-lg"></i>
                     </button>         
                 </label>
             </td>
             <td></td>
         </tr>`;
        $('#PurchaseOrderRequestItem').append(itemRow);   

        AddInputImageButtonEvent();
    }, 100);
    
}
function DeleteRow(elm, e) {
    e.preventDefault();
    $(elm).closest('tr').remove();
}
$('#select-status').on('change', function (e) {
    var selected = $(this).find(":selected");

    var textClass = selected.attr('class');

    $(this).removeClass();
    $(this).addClass('form-select fw-bold');
    $(this).addClass(textClass);
});

var popperInstance = null;
$('#table_PurchaseRequest tbody').on('mouseover', 'tr', function (event) {
    var rowData = table_PurchaseRequest.row(this).data();


    var hiddenCellData = table_PurchaseRequest.row(this).data()[9];

    // Sử dụng Popper.js để hiển thị tooltip
    var tooltip = document.createElement('div');
    tooltip.innerHTML = hiddenCellData;
    tooltip.classList.add('tooltip'); // Thêm class cho tooltip (tùy chỉnh theo ý muốn)



    // Gắn tooltip vào DOM
    $(this).append(tooltip);

    if (popperInstance) {
        popperInstance.destroy();
        popperInstance = null;
    }
    popperInstance = Popper.createPopper(event.currentTarget, tooltip, {
        placement: 'bottom-start',
        modifiers: [
            {
                name: 'offset',
                options: {
                    offset: [0, 10] // Căn chỉnh vị trí hiển thị tooltip so với chuột
                }
            }
        ]
    });
});

$('#table_PurchaseRequest tbody').on('mouseout', 'tr', function () {    
    var tooltip = $(this).find('.tooltip');
    tooltip.remove();
});

// Function khác
function CreateRowTable(data, IsAddRow = true) {
    var dataItem = data.PurchaseOrderRequestItems;
    var container = `<div class="card">`;
    $.each(dataItem, function (k, v) {
        container += `
                        <div class="card-body pb-0">
                               <h5 class="card-title py-1 m-0">${v.ProductName}<span>| ${v.Brand}</span></h5>
                               <div class="news">
                                   <div class="post-item clearfix">
                                       <p class="mb-0">* ${v.Information}</p>
                                       <p class="mb-0">* ${v.Quantity} (${v.Unit})</p>
                                   </div>
                               </div>
                            </div>`;
    });
    container += `</div>`

    var newRowData = [
        `<td>${data.CreatedDate.replace('T', ' ').substring(0, 19)}</td>`,
        `<td>${data.RequestDepartment}</td>`,
        `<td>${data.UseDepartment}</td>`,
        `<td>${data.CostCode} </td>`,
        `<td>${data.Requester}</td>`,
        `<td>${data.RequesterPhoneNumber}</td>`,
        `<td>${data.RequesterEmail}</td>`,
        `<td>${RenderStatusSpan(data.Status)}</td>`,   
        `<td>${RenderActionButton(data)}</td>`, 
        `<td>${container}</td>`
    ];

    if (IsAddRow) {
        if (table_PurchaseRequest) {
            table_PurchaseRequest.row.add(newRowData).draw();      

            table_PurchaseRequest.destroy();
            InitTable();
        }
    } else {
        return `<tr>${newRowData}</tr>`;
    }
}
function RenderStatusSpan(status) {
    if (status === '询问价格 Hỏi giá') {
        return `<span class="badge bg-info text-white">询问价格 Hỏi giá</span>`;
    }
    else if (status === '采购申请 PR') {
        return `<span class="badge bg-warning text-white">采购申请 PR</span>`;
    }
    else if (status === '采购订单 PO') {
        return `<span class="badge bg-info text-white">采购订单 PO</span>`;
    }
    else if (status === '送货 Giao hàng') {
        return `<span class="badge bg-secondary text-white">送货 Giao hàng</span>`;
    }
    else if (status === '收到 Nhận hàng') {
        return `<span class="badge bg-danger text-white">收到 Nhận hàng</span>`;
    }

}
function RenderActionButton(data) {
    return `<button type="button" edt class="btn btn-outline-warning border-0" data-id="${data.Id}"><i class="bi bi-pencil-square"></i></button>
            <button type="button" del class="btn btn-outline-danger border-0" data-id="${data.Id}"><i class="bi bi-trash"></i></button></td>`;
}
function ClearModal() {
    {
        $("#PurchaseOrderRequestHead [name]").each(function () {
            $(this).html('');
            $(this).val('');
        });
        $('#PurchaseOrderRequestApply [name]').each(function () {
            $(this).html('');
        });
        $('#select-status option:eq(0)').prop('selected', true);
        $('#select-status').removeClass();
        $('#select-status').addClass('form-select fw-bold text-primary');
    }
    {
        var firstRow = `<tr>
                            <td class="text-center align-middle" number>1</td>
                            <td contenteditable="true" name="ProductName"></td>
                            <td contenteditable="true" name="Brand"></td>
                            <td contenteditable="true" name="Information"></td>
                            <td contenteditable="true" name="Unit"></td>
                            <td contenteditable="true" name="Quantity"></td>
                            <td class="cell-radio"><label><input type="radio" name="group-1" checked /></label></td>
                            <td class="cell-radio"><label><input type="radio" name="group-1" /></label></td>
                            <td contenteditable="true" name="MaterialCode"></td>
                            <td contenteditable="true" name="ReferencePriceLink"></td>
                            <td class="cell-image-upload row">
                                <input type="file" class="col-10 ps-0 imageInput" multiple name="Image" accept="image/*">
                                <button class="col-2 pe-0 deleteButton"><i class="bi bi-x-circle"></i></button>
                                <div class="col-12 previewContainer"></div>
                            </td>
                            <td contenteditable="true" name="Notes"></td>
                            <td contenteditable="true" name="Feedback"></td>

                            <td class="cell-radio" action>
                                <label>
                                    <button class="btn btn-primary" dButton title="dynamic" onclick="AddNewRow(event)">
                                        <i class="bi bi-check-lg"></i>
                                    </button>
                                </label>
                            </td>
                        </tr>`
        $('#PurchaseOrderRequestItem').html(firstRow);
        AddInputImageButtonEvent();
        topNum = 1;
    }
    {
        pr_files = [];
        po_files = [];
        or_files = [];

        $('#pr_preview').html('');
        $('#po_preview').html('');
        $('#or_preview').html('');
    }   
}
async function GetFiles(folderPath) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: '/PurchaseOrderManager/QuotationRequest/GetFiles',
            type: 'GET',
            dataType: 'json',
            data: { folderPath: folderPath },
            success: function (result) {
                resolve(result);
            },
            error: function (error) {
                
            }
        });
    });
}


// Function cho confetti button
function ButtonLoad(btnObj) {
    $(btnObj.button).prop('disabled', true)
    btnObj.button.classList.add('loading');
    btnObj.button.classList.remove('ready');
}
function ButtonComplete(btnObj) {
    btnObj.button.classList.add('complete');
    btnObj.button.classList.remove('loading');
    setTimeout(() => {
        btnObj.initBurst();
        setTimeout(() => {
            $(btnObj.button).prop('disabled', false)
            btnObj.button.classList.add('ready');
            btnObj.button.classList.remove('complete');
        }, 2000);
    }, 320);
}
function ButtonReady(btnObj) {
    $(btnObj.button).prop('disabled', false)
    btnObj.button.classList.add('ready');
    btnObj.button.classList.remove('complete');
    btnObj.button.classList.remove('loading');
}


// Edit event
$(document).on('click', 'button[edt]', function (e) {
    e.preventDefault();

    var id = $(this).data('id');
    $.ajax({
        type: "GET",
        url: "/PurchaseOrderManager/QuotationRequest/GetSinglePR/" + id,
        contentType: "application/json;charset=utf-8",
        dataType: "json",
        success: function (res) {
            const data = JSON.parse(res.data);

            ShowModalEdit(data);
        },
        error: function () {
        }
    });
});
async function ShowModalEdit(data) {
    ClearModal();

    {
        $('[name="RequestDepartment"]').html(data.RequestDepartment);
        $('[name="UseDepartment"]').html(data.UseDepartment);
        $('[name="CostCode"]').html(data.CostCode);
        $('[name="LegalEntity"]').html(data.LegalEntity);

        $('[name="DeliveryLocation"]').html(data.DeliveryLocation);
        $('[name="PlanDeliveryDate"]').val(data.PlanDeliveryDate.split("T")[0]);

        $('[name="Requester"]').html(data.Requester);
        $('[name="RequesterPhoneNumber"]').html(data.RequesterPhoneNumber);
        $('[name="RequesterEmail"]').html(data.RequesterEmail);

        $('[name="Approver"]').html(data.Approver);
        $('[name="Reviewer"]').html(data.Reviewer);
        $('#select-status').val(data.Status).change();
    }
   
    {
        $('#PurchaseOrderRequestItem').html('');
        var itemLength = data.PurchaseOrderRequestItems.length;
        topNum = itemLength + 1;
        for (let i = 0; i < itemLength; i++) {
            var item = data.PurchaseOrderRequestItems[i];

            var row = $(`<tr style="background-color: rgba(0, 0, 0, 0.06);" data-type="old" data-id="${item.Id}"></tr>`);
            row.append(`<td class="text-center align-middle" number>${i + 1}</td>`);
            row.append(`<td contenteditable="false" name="ProductName">${item.ProductName}</td>`);
            row.append(`<td contenteditable="false" name="Brand">${item.Brand}</td>`);
            row.append(`<td contenteditable="false" name="Information">${item.Information}</td>`);
            row.append(`<td contenteditable="false" name="Unit">${item.Unit}</td>`);
            row.append(`<td contenteditable="false" name="Quantity">${item.Quantity}</td>`);
            row.append(`<td class="cell-radio"><label><input type="radio" name="group-${i + 1}" ${(item.Type == 'one') ? 'checked' : ""} disabled="disabled"></label></td>`);
            row.append(`<td class="cell-radio"><label><input type="radio" name="group-${i + 1}" ${(item.Type == 'more') ? 'checked' : ""} disabled="disabled"></label></td>`);
            row.append(`<td contenteditable="false" name="MaterialCode">${item.MaterialCode}</td>`);
            row.append(`<td contenteditable="false" name="ReferencePriceLink">${item.ReferencePriceLink}</td>`);
            row.append(` <td class="cell-image-upload row">
                         <input type="file" class="col-10 ps-0 imageInput" multiple="" name="Image" disabled="disabled">
                         <button class="col-2 pe-0 deleteButton"><i class="bi bi-x-circle"></i></button>
                         <div class="col-12 previewContainer"></div>
                     </td>`);
            row.append(`<td contenteditable="false" name="Notes">${item.Notes}</td>`);
            row.append(`<td contenteditable="false" name="Feedback">${(item.Feedback != null) ? item.Feedback : ""}</td>`);
            row.append(`<td class="cell-radio" action=""><label><button class="btn btn-danger" dbutton="" title="dynamic" onclick="DeleteRow(this, event)"><i class="bi bi-trash-fill"></i></button></label></td>`);

            // add Item image and show event
            $.each(item.PurchaseOrderRequestImages, async function (k, ii) {
                if (ii.Directory != undefined) {
                    try {
                        var ItemImages = await GetFiles(ii.Directory);
                        var ImageContainer = row.find('.previewContainer');
                        ItemImages.forEach(function (item) {
                            const img = $(`<img src="${item.replace(/^.*\\Areas/, "/Areas")}" class="previewImage">`);

                            $(img).on('click', function (img) {
                                let image = $('#Image_Preview');
                                image.attr('src', item.replace(/^.*\\Areas/, "/Areas"));
                                $(image).click();
                            });

                            ImageContainer.append(img);
                        });
                    }
                    catch {
                        return;
                    }
                    
                }
            });                 

            // done
            $('#PurchaseOrderRequestItem').append(row);
        }
        var firstRow = `<tr>
                            <td class="text-center align-middle" number>${topNum}</td>
                            <td contenteditable="true" name="ProductName"></td>
                            <td contenteditable="true" name="Brand"></td>
                            <td contenteditable="true" name="Information"></td>
                            <td contenteditable="true" name="Unit"></td>
                            <td contenteditable="true" name="Quantity"></td>
                            <td class="cell-radio"><label><input type="radio" name="group-${topNum}" checked /></label></td>
                            <td class="cell-radio"><label><input type="radio" name="group-${topNum}" /></label></td>
                            <td contenteditable="true" name="MaterialCode"></td>
                            <td contenteditable="true" name="ReferencePriceLink"></td>
                            <td class="cell-image-upload row">
                                <input type="file" class="col-10 ps-0 imageInput" multiple name="Image" accept="image/*">
                                <button class="col-2 pe-0 deleteButton"><i class="bi bi-x-circle"></i></button>
                                <div class="col-12 previewContainer"></div>
                            </td>
                            <td contenteditable="true" name="Notes"></td>
                            <td contenteditable="true" name="Feedback"></td>

                            <td class="cell-radio" action>
                                <label>
                                    <button class="btn btn-primary" dButton title="dynamic" onclick="AddNewRow(event)">
                                        <i class="bi bi-check-lg"></i>
                                    </button>
                                </label>
                            </td>
                        </tr>`
        $('#PurchaseOrderRequestItem').append(firstRow);
        AddInputImageButtonEvent();
    }

    {
        var itemLength = data.PurchaseOrderRequestFiles.length;
        for (let i = 0; i < itemLength; i++) {

            if (data.PurchaseOrderRequestFiles[i].Type == "PR") {
                const prFiles = await GetFiles(data.PurchaseOrderRequestFiles[i].Path);

                var prContainer = $('#pr_preview');

                for (let i = 0; i < prFiles.length; i++) {
                    var filename = prFiles[i].substring(prFiles[i].lastIndexOf("\\") + 1);
                    var filelink = prFiles[i].replace(/^.*\\Areas/, "/Areas");

                    pr_files.push(filelink);

                    var linkelm = $(`<a href="${filelink}" class="cursor-pointer" target="_blank">${filename}</a>`);
                    var removebtn = $('<i class="bi bi-x text-danger ps-2 cursor-pointer"></i>');

                    removebtn.on('click', function (e) {
                        e.preventDefault();
                        var row = $(this).closest('div');
                        row.remove();
                        pr_files.splice(row.data('index'), 1);
                    });

                    var container = $(`<div data-index="${i}"></div>`);
                    container.append(linkelm);
                    container.append(removebtn);

                    prContainer.append(container);
                }
            }
            if (data.PurchaseOrderRequestFiles[i].Type == "PO") {
                const poFiles = await GetFiles(data.PurchaseOrderRequestFiles[i].Path);

                var poContainer = $('#po_preview');

                for (let i = 0; i < poFiles.length; i++) {
                    var filename = poFiles[i].substring(poFiles[i].lastIndexOf("\\") + 1);
                    var filelink = poFiles[i].replace(/^.*\\Areas/, "/Areas");

                    po_files.push(filelink);

                    var linkelm = $(`<a href="${filelink}" class="cursor-pointer" target="_blank">${filename}</a>`);
                    var removebtn = $('<i class="bi bi-x text-danger ps-2 cursor-pointer"></i>');

                    removebtn.on('click', function (e) {
                        e.preventDefault();
                        var row = $(this).closest('div');
                        row.remove();
                        po_files.splice(row.data('index'), 1);
                    });

                    var container = $(`<div data-index="${i}"></div>`);
                    container.append(linkelm);
                    container.append(removebtn);

                    poContainer.append(container);
                }
            }
            if (data.PurchaseOrderRequestFiles[i].Type == "OR") {
                const orFiles = await GetFiles(data.PurchaseOrderRequestFiles[i].Path);

                var orContainer = $('#or_preview');

                for (let i = 0; i < orFiles.length; i++) {
                    var filename = orFiles[i].substring(orFiles[i].lastIndexOf("\\") + 1);
                    var filelink = orFiles[i].replace(/^.*\\Areas/, "/Areas");

                    or_files.push(filelink);

                    var linkelm = $(`<a href="${filelink}" class="cursor-pointer" target="_blank">${filename}</a>`);
                    var removebtn = $('<i class="bi bi-x text-danger ps-2 cursor-pointer"></i>');

                    removebtn.on('click', function (e) {
                        e.preventDefault();
                        var row = $(this).closest('div');
                        row.remove();
                        or_files.splice(row.data('index'), 1);
                    });

                    var container = $(`<div data-index="${i}"></div>`);
                    container.append(linkelm);
                    container.append(removebtn);

                    orContainer.append(container);
                }
            }
        }
        
    }
    $('#NewPurchaseOrderRequest').modal('show');
}

async function GetEditData() {
    return new Promise((resolve, reject) => {

        var SendData = {};
        {
            
            // Data header
            $("#PurchaseOrderRequestHead [name]").each(function () {
                var elementName = $(this).attr("name");
                var elementValue;

                if ($(this).is("td")) {
                    elementValue = $(this).text();
                } else {
                    elementValue = $(this).val();
                }

                SendData.PurchaseOrderRequest[elementName] = elementValue;
            });

            SendData.PurchaseOrderRequest.Status = $('#select-status').val();

            $("#PurchaseOrderRequestApply [name]").each(function () {
                var elementName = $(this).attr("name");
                var elementValue;

                if ($(this).is("th")) {
                    elementValue = $(this).text();
                } else {
                    elementValue = $(this).val();
                }

                SendData.PurchaseOrderRequest[elementName] = elementValue;
            });
        }
        {

        }
        {

        }
    });
}

// Delete event
$(document).on('click', 'button[del]', function (e) {
    e.preventDefault();

    var row = $(this).parents('tr');

    Swal.fire({
        title: '您确定吗？</br>Bạn có chắc chắn không?',
        html: `<p class="text-danger">此操作将无法恢复!</br>Bạn sẽ không thể hoàn nguyên điều này!</p>`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: '是的</br>Đúng',
        cancelButtonText: '取消</br>Hủy bỏ'
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                url: "/PurchaseOrderManager/QuotationRequest/DeletePurchaseOrderRequest",
                type: "POST",
                data: JSON.stringify({ Id: $(this).data('id') }),
                dataType: "json",
                contentType: "application/json;charset=utf-8",
                success: function (res) {
                    if (res.status) {                       
                        Swal.fire(
                            '已删除!</br> Đã xóa!',
                            '您的文件已被删除.</br>Tập tin của bạn đã bị xóa.',
                            'success'
                        );
                        table_PurchaseRequest.row(row).remove().draw();
                    }
                    else {
                        Swal.fire(
                            '错误!</br> Lỗi!',
                            '发生了错误.</br>Đã có lỗi xảy ra.',
                            'error'
                        );
                    }                  
                },
                error: function () {
                }
            });

            
        }
    })
});



// File đính kèm.
var pr_files = [];
var po_files = [];
var or_files = [];
$('#pr_file').on('change', function (e) {
    var files = $(this)[0].files;

    for (let file of files) {
        var hasFile = CheckFile(file, pr_files);
        if (!hasFile) {
            pr_files.push(file);
        }
    }

    ShowFile('pr_preview', pr_files);
});
$('#po_file').on('change', function (e) {
    var files = $(this)[0].files;

    for (let file of files) {
        var hasFile = CheckFile(file, po_files);
        if (!hasFile) {
            po_files.push(file);
        }
    }

    ShowFile('po_preview', po_files);
});
$('#or_file').on('change', function (e) {
    var files = $(this)[0].files;

    for (let file of files) {
        var hasFile = CheckFile(file, or_files);
        if (!hasFile) {
            or_files.push(file);
        }
    }

    ShowFile('or_preview', or_files);
});

function CheckFile(file, filesArr) {
    for (let i = 0; i < filesArr.length; i++) {
        if (filesArr[i].name === file.name) {
            return true;
        }
    }
    return false;
}
function ShowFile(IdContainer, filesArr) {
    $(`#${IdContainer}`).html('');

    for (let i = 0; i < filesArr.length; i++) {
        var fileRow = $(`<div data-index="${i}"></div>`);

        var filePath = URL.createObjectURL(filesArr[i]);
        fileRow.append(`<a href="${filePath}" class="cursor-pointer" target="_blank">${filesArr[i].name}</a>`);

        var button = $('<i class="bi bi-x text-danger ps-2 cursor-pointer"></i>');
        button.on('click', function (e) {
            e.preventDefault();
            var row = $(this).closest('div');
            row.remove();
            pr_files.splice(row.data('index'), 1);
        });
        fileRow.append(button);

        $(`#${IdContainer}`).append(fileRow);
    }
}