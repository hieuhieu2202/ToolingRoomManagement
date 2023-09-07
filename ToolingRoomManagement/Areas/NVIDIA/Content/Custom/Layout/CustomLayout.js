function SignOut() {
    $.ajax({
        type: "POST",
        url: "/NVIDIA/Authentication/SignOut",
        contentType: "application/json",
        datatype: "json/text",
        success: function (response) {
            if (response.status) {
                window.location.href = response.redirectTo;
            }
            else {
                Swal.fire('Sorry, something went wrong!', response.message, 'error');
            }
        },
        error: function (error) {
            Swal.fire('Sorry, something went wrong!', GetAjaxErrorMessage(error), 'error');
        }
    });
}