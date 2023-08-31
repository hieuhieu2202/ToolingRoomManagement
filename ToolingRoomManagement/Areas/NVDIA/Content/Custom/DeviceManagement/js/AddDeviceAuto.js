$(function () {
    SendFileToServer();
});

var tableDeviceInfo;


$('#fileInput').on('change', function (e) {
    e.preventDefault();

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

    const IdWareHouse = 1;
    formData.append('IdWareHouse', IdWareHouse);

    $.ajax({
        url: "/NVDIA/DeviceManagement/AddDeviceAuto",
        data: formData,
        type: "POST",
        processData: false,
        contentType: false,
        success: function (response) {
            if (response.status) {
                var deviceList = response.data;

                CreateTableAddDevice(deviceList);
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

async function CreateTableAddDevice(datas) {
    if (tableDeviceInfo) tableDeviceInfo.destroy();

    await $.each(datas, function (no, item) {
        var row = $('<tr></tr>');

        // DeviceCode
        row.append(`<td>${item.DeviceCode}</td>`);
        // DeviceName
        row.append(`<td>${item.DeviceName}</td>`);
        // Group
        try {
            row.append(`<td>${item.Group.GroupName}</td>`);
        }
        catch {
            row.append(`<td>N/A</td>`);
        }       
        // Vendor
        try {
            row.append(`<td>${item.Vendor.VendorName}</td>`);
        }
        catch {
            row.append(`<td>N/A</td>`);
        }       
        // Buffer
        row.append(`<td>${item.Buffer * 100}%</td>`);
        // Quantity
        row.append(`<td>${item.Quantity}</td>`);
        // Type
        switch (item.Type) {
            case "S": {
                row.append(`<td>Static</td>`);
                break;
            }
            case "D": {
                row.append(`<td>Dynamic</td>`);
                break;
            }
            default: {
                row.append(`<td>N/A</td>`);
                break;
            }
        }
        // Status
        switch (item.Status) {
            case "Pending": {
                row.append(`<td>Pending</td>`);
                break;
            }
            default: {
                row.append(`<td>N/A</td>`);
                break;
            }
        }
        // Action
        row.append(`<td>Button</td>`);

        $('#table_addDevice_tbody').append(row);
    });
    $('#card-device-details').show();

    const options = {
        scrollX: true,
        columnDefs: [
            { targets: [0, 5, 7], orderable: true },
            { targets: "_all", orderable: false },
        ],
    };
    tableDeviceInfo = $('#table_addDevice').DataTable(options);
    tableDeviceInfo.columns.adjust();

    
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