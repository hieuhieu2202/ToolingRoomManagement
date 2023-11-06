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
    try {
        const cookieValue = decodeURIComponent(document.cookie).split(';').find(cookie => cookie.trim().startsWith(name + '='));
        let value = null;
        $.each(cookieValue.split('&'), function (k, v) {
            if (v.includes(item)) {
                value = GetText(v, item + '=', '').toString();
            }
        });
        return value;
    } catch {
        return "";
    }
    
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


// mutil language
$(document).ready(function () {
    InitI18next();
});
function InitI18next() {
    function loadTranslation(language) {
        return new Promise(function (resolve, reject) {
            $.getJSON('/Areas/NVIDIA/Content/Custom/language/' + language + '.json')
                .done(function (data) {
                    resolve(data);
                })
                .fail(function (error) {
                    reject(error);
                });
        });
    }

    Promise.all([loadTranslation('vi'), loadTranslation('en')])
        .then(function (translations) {

            var lang = getDefaultLanguage();

            i18next.init({
                lng: lang,
                debug: false,
                fallbackLng: 'en',
                resources: {
                    vi: {
                        translation: translations[0],
                    },
                    en: {
                        translation: translations[1],
                    },
                },
                detection: {
                    order: ['querystring', 'cookie', 'localStorage', 'navigator', 'htmlTag', 'path', 'subdomain'],
                },
            });

            UpdateLanguageText();
        })
        .catch(function (error) {
            console.error('Failed to load translations:', error);
        });
}
function ChangeLanguage(language) {

    var thisLang = localStorage.getItem('language');
    if (language === thisLang) {
        return;
    }
    else {
        i18next.changeLanguage(language, function (err, t) {
            if (err) {
                Swal.fire('Sorry, something went wrong!', err, 'error');
            }
            else {
                localStorage.setItem('language', language);
                UpdateLanguageText();
            }
        });
    }
}
function UpdateLanguageText() {
    $('[data-i18n]').each(function () {
        var key = $(this).data('i18n');

        if (key.includes('[plh]')) {
            key = key.replace(/\[plh\]/g, '');
            const text = i18next.t(key);

            $(this).attr("placeholder", text);
        }
        else {
            const text = i18next.t(key);
            $(this).html(text);
        }
    });
}
function getDefaultLanguage() {
    const storedLanguage = localStorage.getItem('language');

    if (storedLanguage == 'vi') {
        var select = $('#select_language').prev();
        select.html('<i class="fi fi-vn"></i>');
        return storedLanguage;
    }
    else if (storedLanguage == 'en') {
        var select = $('#select_language').prev();
        select.html('<i class="fi fi-gb"></i>');
        return storedLanguage;
    }
    else if (storedLanguage == null) {
        var select = $('#select_language').prev();
        select.html('<i class="fi fi-gb"></i>');
        return 'en';
    }
}
$('#select_language a').click(function (e) {
    e.preventDefault();

    var lang = $(this).data('lang');
    var icon = $(this).find('i').clone();
    var select = $('#select_language').prev();
    select.html(icon);

    ChangeLanguage(lang);
});