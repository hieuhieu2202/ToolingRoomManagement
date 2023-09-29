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

$(function () {
    var User = {
        CardID: GetCookieValue('UserInfo', 'CardID'),
        VnName: GetCookieValue('UserInfo', 'VnName'),
        CnName: GetCookieValue('UserInfo', 'CnName'),
        EnName: GetCookieValue('UserInfo', 'EnName')
    }

    $('#CardID').text(User.CardID);

    var textUsername = CreateNavUserName(User);

    $('#Name').text(textUsername);
    $('#UserAvatar').attr("src", GenerateAvatar(textUsername));
});

//Draw avatar
function GenerateAvatar(text, foregroundColor = "white", backgroundColor = "black") {
    var stringText = text.charAt(0);

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    canvas.width = 120;
    canvas.height = 120;

    // Draw background
    context.fillStyle = backgroundColor;
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Draw text
    context.font = "bold 60px sans-serif";
    context.fillStyle = foregroundColor;
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(stringText, canvas.width / 2, (canvas.height / 2) + 5);

    return canvas.toDataURL("image/png");
}
//Get cookies
function GetCookieValue(name, item) {
    const cookieValue = decodeURIComponent(document.cookie).split(';').find(cookie => cookie.trim().startsWith(name + '='));
    let value = null;
    $.each(cookieValue.split('&'), function (k, v) {
        if (v.includes(item)) {
            value = GetText(v, item + '=', '').toString();
        }
    });
    return value;
}
//Get Text
function GetText(Input, Start, End) {
    try {
        if (!Input.includes(Start)) {
            return Input;
        }
        let StartPos = Input.indexOf(Start) + Start.length;
        let dataBack = Input.substring(StartPos, Input.length);
        if (End == '') {
            dataBack = dataBack.substring(0, dataBack.length);
            return dataBack.trim();
        }
        dataBack = dataBack.substring(0, dataBack.indexOf(End));
        return dataBack.trim();
    } catch {
        return Input;
    }
}

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

// Create Username
function CreateNavUserName(user) {
    var username = '';
    if (user.VnName && user.VnName != '') {
        username = `${user.VnName}`;
    }
    else if (user.CnName && user.CnName != '') {
        username = `${user.CnName}`;
    }
    if (user.EnName != null && user.EnName != '') {
        username += ` (${user.EnName})`;
    }

    return username;
}
function CreateUserName(user) {
    var username = '';
    if (user.VnName && user.VnName != '') {
        username = `${user.Username} - ${user.VnName}`;
    }
    else if (user.CnName && user.CnName != '') {
        username = `${user.Username} - ${user.CnName}`;
    }
    if (user.EnName != null && user.EnName != '') {
        username += ` (${user.EnName})`;
    }

    return username;
}