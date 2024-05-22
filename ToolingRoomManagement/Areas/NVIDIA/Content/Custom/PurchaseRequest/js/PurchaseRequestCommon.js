/* GET */
function GetPurchaseRequests() {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: `/NVIDIA/RequestManagement/GetPurchaseRequests`,         
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
                reject(GetAjaxErrorMessage(e));
            },
        });
    });
}
function GetPurchaseRequest(IdPurchaseRequest) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: `/NVIDIA/RequestManagement/GetPurchaseRequest?IdPurchaseRequest=${IdPurchaseRequest}`,
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
                reject(GetAjaxErrorMessage(e));
            },
        });
    });
}

/* POST */
function CreatePurchaseRequest(PurchaseRequest) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: `/NVIDIA/RequestManagement/CreatePurchaseRequest`,
            type: 'POST',
            dataType: 'json',
            contentType: 'application/json;charset=utf-8',
            data: JSON.stringify({ PurchaseRequest }),
            success: function (response) {
                if (response.status) {
                    resolve(response.data);
                }
                else {
                    reject(response.message);
                }
            },
            error: function (e) {
                reject(GetAjaxErrorMessage(e));
            },
        });
    });
}
function UpdatePurchaseRequest(PurchaseRequest) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: `/NVIDIA/RequestManagement/UpdatePurchaseRequest`,
            type: 'POST',
            dataType: 'json',
            contentType: 'application/json;charset=utf-8',
            data: JSON.stringify({ PurchaseRequest }),
            success: function (response) {
                if (response.status) {
                    resolve(response.data);
                }
                else {
                    reject(response.message);
                }
            },
            error: function (e) {
                reject(GetAjaxErrorMessage(e));
            },
        });
    });
}
function DeletePurchaseRequest(IdPurchaseRequest) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: `/NVIDIA/RequestManagement/DeletePurchaseRequest?IdPurchaseRequest=${IdPurchaseRequest}`,
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
                reject(GetAjaxErrorMessage(e));
            },
        });
    });
}