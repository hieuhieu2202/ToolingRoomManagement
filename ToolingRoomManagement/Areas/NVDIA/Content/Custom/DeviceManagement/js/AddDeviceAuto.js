$(function () {
    InitTableDeviceInfo()
});

var tableDeviceInfo;
function InitTableDeviceInfo() {

    const options = {

    }

    $('#example').DataTable(options);
}

$('#fileInput').on('change', function (e) {
    e.preventDefault();

    console.log('ok');

    let count = 0;
    progressMove(count);
    SendFileToServer();
    //const processInterval = setInterval(() => {
    //	count += 1;
    //	progressMove(count);
    //	$('.uploaded-file__info-process').css('width', `${count}%`);
    //	if (count == 100 || count == '100') {
    //		clearInterval(processInterval);
    //	}
    //},50)

});

function SendFileToServer() {
    const fileInput = document.querySelector('#fileInput');
    const file = fileInput.files[0];

    const formData = new FormData();
    formData.append('file', file);

    $.ajax({
        url: "/NVDIA/DeviceManagement/AddDeviceAuto",
        data: formData,
        type: "POST",
        processData: false,
        contentType: false,
        success: function (response) {
            if (response.status) {
                alert(response.message);
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