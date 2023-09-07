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
                toastr["error"](response.message, "ERROR");
            }
        },
        error: function (error) {
            Swal.fire("Something went wrong!", GetAjaxErrorMessage(error), "error");
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
            Swal.fire('Sorry, something went wrong!', 'Mismatched Create Password and Confirm Password.', 'error');
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
                        title: `<p style="font-size: 25px;">Sign Up Success.</p><p style="font-size: 20px;">Please contact the administrator to verify your account.</p>`,
                        html: `<table class="table table-striped table-bordered table-message">
                               <tbody>
                                   <tr>
                                       <td>Card ID</td>
                                       <td>${response.user.Username}</td>
                                   </tr>
                                   <tr>
                                       <td>Email</td>
                                       <td>${response.user.Email}</td>
                                   </tr>
                               </tbody>
                           </table>
                           `,
                        icon: 'success',
                        reverseButtons: false,
                        confirmButtonText: 'Sign In',
                        showCancelButton: true,
                        cancelButtonText: 'Cancel',
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
                    Swal.fire('Sorry, something went wrong!', response.message, 'error');
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