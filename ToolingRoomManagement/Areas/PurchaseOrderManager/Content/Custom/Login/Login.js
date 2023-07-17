LoginCookies();
// Login Ajax
function login() {
    var CardId = $('#cardId').val();
    var Password = $('#password').val();
    var Remember = $("#rememberMe").is(":checked");
    // check login data
    if(!CheckLoginData(CardId, Password)) return;
    //Get data
    const data = {
        CardID: CardId,
        Password: Password,
        Remember: Remember
    }  
    // Send data to sever
    $.ajax({
        type: "POST",
        url: "/PurchaseOrderManager/Account/Login",
        data: JSON.stringify(data),
        contentType: "application/json",
        datatype: "json/text",
        success: function (respon) {
            if (respon.success) {
                window.location.href = respon.redirectTo;
            }
            if (respon.error) {
                Swal.fire({
                    title: `<strong>ERROR</strong>`,
                    text: respon.message,
                    icon: 'error',
                    confirmButtonText: 'Got it!',
                });
            }
        },
        error: function (respon) {
            Swal.fire({
                title: `<strong>REQUEST ERROR</strong>`,
                text: respon.message,
                icon: 'error',
                confirmButtonText: 'Got it!',
            });
        }
    });
}
function LoginCookies() {
    var cookieExists = checkCookieExistence("FileManagerRememberLogin");
    if (cookieExists) {
        var cookieValue = getCookieValue("FileManagerRememberLogin");
        // Send data to sever
        var data = {
            HashCardId: cookieValue
        }
        $.ajax({
            type: "POST",
            url: "/Account/LoginCookies",
            data: JSON.stringify(data),
            contentType: "application/json",
            datatype: "json/text",
            success: function (respon) {
                if (respon.success) {
                    window.location.href = respon.redirectTo;
                }               
            },
            error: function (respon) {
                Swal.fire({
                    title: `<strong>REQUEST ERROR</strong>`,
                    text: respon.message,
                    icon: 'error',
                    confirmButtonText: 'Got it!',
                });
            }
        });
    }
}

// First Validate data
function CheckLoginData(CardId, Password) {
    var check = true;

    $('#cardId').removeClass("is-invalid");
    $('#cardId').removeClass("is-valid");
    $('#password').removeClass("is-invalid");
    $('#password').removeClass("is-valid");
    $("#cardIDFeedback").hide();
    $("#passwordFeedback").hide();

    // check card id
    if (CardId == "") {
        $('#cardId').addClass("is-invalid");
        $("#cardIDFeedback").html("Please enter your Card ID!").show();
        check = false;
    }
    else if (CardId.length != 8) {
        $('#cardId').addClass("is-invalid");
        $("#cardIDFeedback").html("Please enter all 8 characters of the Card ID!").show();
        check = false;
    }   
    // check password
    if (Password == "") {
        $('#password').addClass("is-invalid");
        $("#passwordFeedback").html("Please enter your Password!").show();
        check = false;
    }
    return check;
}

// Key press event
function InputKeyPress(elm) {
    $(elm).removeClass("is-invalid");
    $(elm).removeClass("is-valid");
}
// Event key enter to login
document.addEventListener("keypress", function (event) {
    // If the user presses the "Enter" key on the keyboard
    if ($('.swal2-container').length == 0) {
        if (event.key === "Enter") {
            event.preventDefault();
            login();
        }
    }
});

// Funcion
function checkCookieExistence(cookieName) {
    return document.cookie.includes(cookieName);
}
function getCookieValue(cookieName) {
    var name = cookieName + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var cookieArray = decodedCookie.split(';');
    for (var i = 0; i < cookieArray.length; i++) {
        var cookie = cookieArray[i];
        while (cookie.charAt(0) == ' ') {
            cookie = cookie.substring(1);
        }
        if (cookie.indexOf(name) == 0) {
            return cookie.substring(name.length, cookie.length);
        }
    }
    return "";
}