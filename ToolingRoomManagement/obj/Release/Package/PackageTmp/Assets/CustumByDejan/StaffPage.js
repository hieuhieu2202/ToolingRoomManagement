var formMode = "add";
var idDevice_global;
$(document).ready(function () {
    loadDataDevice();
    btnAddDeviceOnClick();
    btnEditDeviceOnClick();
    btnCloseFormNhapOnClick();
    validateFormNhap();
    btnSaveDeviceOnClick();

    
})

/**
        Author: Ngo Canh Thin
        Date: 2023/04/24
        Reason: Tự động chọn Loại thiết bị khi đã chọn tên thiết bị
     */
function bindingKindOfDeviceSelected() {
    var idDeviceSelected = parseInt($('#device_name_add').val());
    $.ajax({
        type: "GET",
        url: "/Admin/Admin/GetByID",
        data: {
            ID: idDeviceSelected
        },
        dataType: "text",//Kieu du lieu tra ve
        contentType: "application/json",
        success: function (response) {
            var kindOfDeviceSelected = JSON.parse(response).kind_of_device;
            $('#tblAddDevice .kindOfDevice').val(kindOfDeviceSelected);
        },
        error: function (res) {

            console.log("fail");
        }
    });
}
function onchangeDevice_name_addSelect() {
    $(document).on('change', '#device_name_add', function () {
        bindingKindOfDeviceSelected();
    })
}

/** Thêm sửa xóa tìm kiếm thiết bị
 * Author: Ngo Canh Thin
 * Date: 2023/04/27
 * Thêm, sửa thiết bị
 */

/** Load toàn bộ thiết bị */
function loadDataDevice() {
    $.ajax({
        type: "GET",
        url: "/Device/GetByThin",
        dataType: "text",//Kieu du lieu tra ve
        success: function (response) {
            if (response) {
                var data = JSON.parse(response);
                var stt = 0;
                $('#tbl_id').empty();
                for (var item of data) {
                    stt++;
                    var trHTML = $(`<tr></tr>`);
                    for (var th of $("#tbl thead th")) {
                        let fieldName = $(th).attr("fieldName");
                        let valueOffieldName = item[fieldName];

                        // td
                        if (fieldName == "stt") {
                            var tdHTML = $(`<td scope="row">${stt}</td>`)
                        }
                        else if (fieldName == "action") {
                            var tdHTML = $(`<td scope="row"><button data-deviceid=${item.id} class="btnEditDevice" style="border: 0px;background: #1b2a47;"><i class="fa fa-edit" style="color:#dee83b;"></i></button></td>`);
                        }
                        else if (fieldName == "image_TB") {
                            var tdHTML = $(`<td scope="row"><button style="background: forestgreen;border: 1px solid green;border-radius: 7px;" onclick="ViewImage('','')">Xem</button></td>`);
                        }
                        else {
                            if (valueOffieldName) {
                                let formatType = $(th).attr("formatType");
                                if (formatType == "dateOutput") {
                                    var tdHTML = $(`<td scope="row">${valueOffieldName.split('T')[0] + " " + valueOffieldName.split("T")[1].split(".")[0]}</td>`)
                                }
                                else {
                                    var tdHTML = $(`<td scope="row">${(valueOffieldName)}</td>`);
                                }
                            }
                            else {
                                var tdHTML = $(`<td scope="row"></td>`)
                            }
                        }
                        // end td

                        trHTML.append(tdHTML);
                    }
                    $('#tbl_id').append(trHTML);
                }
            }
        },
        error: function (res) {

            alert("fail");
        }
    });
}
/** Bấm nút thêm mới thiết bị */
function btnAddDeviceOnClick() {
    $(document).on('click', '#btnAddDevice', function () {
        formMode = "add";
        // reset form nhập
        $('#myModal form').trigger("reset");
        // xóa validate label:
        $(".error").text("");
        // show modal
        $('#myModal').slideDown(500);
    })
}

/** Bấm nút sửa thiết bị */
function btnEditDeviceOnClick() {
    $(document).on('click', '.btnEditDevice', function () {
        // xóa validate label:
        $(".error").text("");
        formMode = "edit";
        idDevice_global = parseInt($(this).data("deviceid"));

        $.ajax({
            type: "GET",
            url: "/Device/GetByIdByThin",
            data: {
                id:idDevice_global
            },
            dataType: "text",//Kieu du lieu tra ve
            success: function (response) {
                
                var device = JSON.parse(response);
                
                // binding thiết bị:
                var inputs = $('#myModal form input,#myModal form select,#myModal form textarea');
                for (var input of inputs) {
                    var propValue = $(input).attr("name");
                    input.value = device[propValue];
                }
                // show modal:
                $('#myModal').slideDown(500);
            },
            error: function (res) {

                alert("fail");
            }
        });
       
    })
}



/** Bấm nút lưu thiết bị */
function btnSaveDeviceOnClick() {
    $(document).on('click', '#btnSaveDevice', function () {
        var data = {};
        if ($('#myModal form').valid()) {
            // binding data:
            var inputs = $('#myModal form input,#myModal form select,#myModal form textarea');
            for (var input of inputs) {
                var propValue = $(input).attr("name");
                if (propValue == "manager_id" || propValue == "gioihan" || propValue == "status" || propValue == "kind_of_device") {
                    data[propValue] = parseInt($(input).val());
                }
                else if (propValue) {
                    data[propValue] = $(input).val();
                }
            }

            // kiểm tra form mode:
            if (formMode == "add") {
                // chế độ thêm
                $.ajax({
                    type: "POST",
                    url: "/Device/CreateByThin",
                    data: JSON.stringify(data),
                    dataType: "text",//Kieu du lieu tra ve
                    contentType: "application/json",
                    success: function (response) {
                        if (response > 0) {
                            Swal.fire("success", "Thành công!", "success");
                            // reset form
                            $('#myModal form').trigger("reset");
                            
                            // loadData
                            loadDataDevice();
                        }
                        else if (response == 0) {
                            Swal.fire("warning", "Mã thiết bị đã tồn tại trong cơ sở dữ liệu, Hãy kiểm tra lại!", "warning");
                        }
                        else {
                            Swal.fire("error", "Có lỗi xảy ra, liên hệ bộ phận IOT để được hỗ trợ! (Phone: 31746)", "error");
                        }
                    },
                    error: function (res) {

                        alert("fail");
                    }
                });
            }
            if (formMode == "edit") {
                // chế độ sửa
                data.id = idDevice_global;
                $.ajax({
                    type: "POST",
                    url: "/Device/EditByThin",
                    data: JSON.stringify(data),
                    dataType: "text",//Kieu du lieu tra ve
                    contentType: "application/json",
                    success: function (response) {
                        debugger
                        if (response > 0) {
                            Swal.fire("success", "Thành công!", "success");
                            // hide modal
                            $('#myModal').fadeOut(500);
                            // loadData
                            loadDataDevice();
                        }
                        else if (response == 0) {
                            Swal.fire("warning", "Mã thiết bị đã tồn tại trong cơ sở dữ liệu, Hãy kiểm tra lại!", "warning");
                        }
                        else {
                            Swal.fire("error", "Có lỗi xảy ra, liên hệ bộ phận IOT để được hỗ trợ! (Phone: 31746)", "error");
                        }
                    },
                    error: function (res) {

                        alert("fail");
                    }
                });
            }
        }
    })
}

/** Bấm nút close form nhập */
function btnCloseFormNhapOnClick() {
    $(document).on('click', '.btnclose', function () {
        // show modal
        $('#myModal').fadeOut(500);
    })
}

/** Validate Form nhập */
function validateFormNhap() {
    $('#myModal form').validate({
        rules: {
            txtName: "required",
            txtCategoryType: "required"
        },
        messages: {
            txtName: {
                required: "Name is not empty!",
            },
            txtCategoryType: {
                required: "Category is not empty"
            }
        }
    });
}

/** Validate gia tien (price) */
$('#price').on('keypress', function (event) {
    $(this).val($(this).val().replace(/[^0-9\.]/g, ''));
    if ((event.which != 46 || $(this).val().indexOf('.') != -1) && (event.which < 48 || event.which > 57)) {
        event.preventDefault();
    }
});