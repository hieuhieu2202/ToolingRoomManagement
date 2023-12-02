window.onload = function () {
    Particles.init({
        selector: ".background"
    });

    const errorMessage = CheckErrorCookie("SmartOfficeMessage");
    if (errorMessage != null) {
        Swal.fire(i18next.t('global.swal_title'), errorMessage, 'error');
    }

};
const particles = Particles.init({
    selector: ".background",
    maxParticles: 150,
    color: ["#03dac6", "#ff0266", "#000000"],
    connectParticles: true,
    responsive: [
        {
            breakpoint: 768,
            options: {
                color: ["#faebd7", "#03dac6", "#ff0266"],
                maxParticles: 80,
                connectParticles: true
            }
        }, {
            breakpoint: 425,
            options: {
                maxParticles: 100,
                connectParticles: true
            }
        }, {
            breakpoint: 320,
            options: {
                maxParticles: 0
            }
        }
    ],
});

function CheckErrorCookie(cookieName) {
    const cookies = document.cookie.split(';');

    let targetCookie = null;
    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.startsWith(cookieName + '=')) {
            targetCookie = cookie;
            break;
        }
    }
    if (targetCookie) {
        const cookieValue = targetCookie.substring(cookieName.length + 1);
        document.cookie = cookieName + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';

        return cookieValue;
    } else {
        return null;
    }
}

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
                Swal.fire(i18next.t('global.swal_title'), response.message, 'error');
            }
        },
        error: function (error) {
            Swal.fire(i18next.t('global.swal_title'), GetAjaxErrorMessage(error), 'error');
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
