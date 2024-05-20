/* GET */
function GetSimpleDevices() {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: `/NVIDIA/DeviceManagement/GetSimpleDevices`,
            type: 'GET',
            dataType: 'json',
            contentType: 'application/json;charset=utf-8',
            success: function (response) {
                if (response.status) {
                    resolve(response.data);
                }
                else {
                    reject(response.message);
                }
            },
            error: function (e) {
                reject(GetAjaxErrorMessage(error));
            },
        });
    });
}