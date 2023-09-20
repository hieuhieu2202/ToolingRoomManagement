$('#SignIn').on('click', function (e) {
    e.preventDefault();

    var LoginData = {
        Username: $('#inputUsername').val(),
        Password: $('#inputPassword').val(),
        Remember: $("#inputRemember").is(":checked")
    }

    $.ajax({
        type: "POST",
        url: "/NVIDIA/Authentication/SignIn",
        data: JSON.stringify(LoginData),
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
});

// Other function
function GetAjaxErrorMessage(error) {
    var regex = new RegExp(`<title>(.*?)<\/title>`);
    var match = regex.exec(error.responseText);

    if (match && match.length >= 2) {
        var extractedContent = match[1];
        return extractedContent;
    } else {
        return "Lỗi không xác định.";
    }
}

$(document).keypress(function (event) {
    if (event.which === 13) {
        $('#SignIn').click();
    }
});