$(function () {
    GetDepartments();
});

function GetDepartments() {
    $.ajax({
        type: "GET",
        url: "/NVIDIA/Authentication/GetDepartments",
        dataType: "json",
        contentType: "application/json;charset=utf-8",
        success: function (response) {
            if (response.status) {
                // Department
                $('#inputSelectDepart').empty();
                $.each(response.departments, function (k, item) {
                    let opt = $(`<option value="${item.Id}">${item.DepartCode} - ${item.DepartName}</option>`);
                    $('#inputSelectDepart').append(opt);
                });
            }
            else {
                Swal.fire(i18next.t('global.swal_title'), response.message, "error");
            }
        },
        error: function (error) {
            Swal.fire(i18next.t('global.swal_title'), GetAjaxErrorMessage(error), "error");
        }
    });
}

$('#SignUp').on('click', function (e) {
    e.preventDefault();

    if ($("#CheckChecked").is(":checked")) {
        var SignUpData = {
            Username: $('#inputCardId').val(),
            Email: $('#inputEmail').val(),
            CreatePassword: $('#inputCreatePassword').val(),
            ConfirmPassword: $('#inputConfirmPassword').val(),
            Department: $('#inputSelectDepart').val(),
        }
        if (SignUpData.CreatePassword !== SignUpData.ConfirmPassword) {
            Swal.fire(i18next.t('global.swal_title'), 'Mismatched Create Password and Confirm Password.', 'error');
        }

        $.ajax({
            type: "POST",
            url: "/NVIDIA/Authentication/SignUp",
            data: JSON.stringify(SignUpData),
            contentType: "application/json",
            datatype: "json/text",
            success: function (response) {
                if (response.status) {
                    //window.location.href = response.redirectTo;

                    Swal.fire({
                        title: `<p style="font-size: 25px;">${i18next.t('signup.signup_success')}</p><p style="font-size: 20px;">${i18next.t('signup.verify_account')}</p>`,
                        html: `<table class="table table-striped table-bordered table-message">
                               <tbody>
                                   <tr>
                                       <td>${i18next.t('signup.cardid')}</td>
                                       <td>${response.user.Username}</td>
                                   </tr>
                                   <tr>
                                       <td>${i18next.t('signup.email')}</td>
                                       <td>${response.user.Email}</td>
                                   </tr>
                               </tbody>
                           </table>
                           `,
                        icon: 'success',
                        reverseButtons: false,
                        confirmButtonText: i18next.t('signin.signin'),
                        showCancelButton: true,
                        cancelButtonText: i18next.t('global.cancel'),
                        buttonsStyling: false,
                        reverseButtons: true,
                        customClass: {
                            cancelButton: 'btn btn-outline-secondary fw-bold me-3',
                            confirmButton: 'btn btn-success fw-bold'
                        },
                    }).then((result) => {
                        if (result.isConfirmed) {
                            window.location.href = response.redirectTo;
                        }
                    });
                }
                else {
                    Swal.fire(i18next.t('global.swal_title'), response.message, 'error');
                }
            },
            error: function (error) {
                Swal.fire('Sorry, something went wrong!', GetAjaxErrorMessage(error), 'error');
            }
        });
    }
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
        $('#SignUp').click();
    }
});

window.onload = function () {
    //Particles.init({
    //    selector: ".background"
    //});
};
//const particles = Particles.init({
//    selector: ".background",
//    maxParticles: 150,
//    color: ["#03dac6", "#ff0266", "#000000"],
//    connectParticles: true,
//    responsive: [
//        {
//            breakpoint: 768,
//            options: {
//                color: ["#faebd7", "#03dac6", "#ff0266"],
//                maxParticles: 80,
//                connectParticles: true
//            }
//        }, {
//            breakpoint: 425,
//            options: {
//                maxParticles: 100,
//                connectParticles: true
//            }
//        }, {
//            breakpoint: 320,
//            options: {
//                maxParticles: 0
//            }
//        }
//    ],
//});