$(function () {
    GetBorrowUserSigns();
});

function GetBorrowUserSigns() {
    $.ajax({
        type: "POST",
        url: "/NVIDIA/BorrowManagement/GetUserBorrowSigns",
        dataType: "json",
        contentType: "application/json;charset=utf-8",
        success: function (response) {
            if (response.status) {
                console.log(response);

                console.log(JSON.parse(response.borrows));
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