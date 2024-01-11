/* GET */
function GetRequests() {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: "/NVIDIA/RequestManagement/GetRequests",
            type: "GET",
            contentType: "application/json;charset=utf-8",
            dataType: "json",
            success: function (res) {
                if (res.status) {
                    var result = {
                        borrows: res.borrows,
                        returns: res.returns,
                        exports: res.exports,
                        cTotal: res.borrows.length + res.returns.length + res.exports.length,
                        cApproved:
                            res.borrows.filter(b => b.Status === "Approved").length +
                            res.returns.filter(r => r.Status === "Approved").length +
                            res.exports.filter(e => e.Status === "Approved").length,
                        cPending:
                            res.borrows.filter(b => b.Status === "Pending").length +
                            res.returns.filter(r => r.Status === "Pending").length +
                            res.exports.filter(e => e.Status === "Pending").length,
                        cRejected:
                            res.borrows.filter(b => b.Status === "Rejected").length +
                            res.returns.filter(r => r.Status === "Rejected").length +
                            res.exports.filter(e => e.Status === "Rejected").length
                    }
                    resolve(result);
                }
                else {
                    reject(res.message);
                }
            },
            error: function (error) {
                reject(GetAjaxErrorMessage(error));
            }
        });
    });
}
function GetUserRequests() {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: "/NVIDIA/RequestManagement/GetUserRequests",
            type: "GET",
            contentType: "application/json;charset=utf-8",
            dataType: "json",
            success: function (res) {
                if (res.status) {
                    var result = {
                        borrows: res.borrows,
                        returns: res.returns,
                        exports: res.exports,
                        cTotal: res.borrows.length + res.returns.length + res.exports.length,
                        cApproved:
                            res.borrows.filter(b => b.Status === "Approved").length +
                            res.returns.filter(r => r.Status === "Approved").length +
                            res.exports.filter(e => e.Status === "Approved").length,
                        cPending:
                            res.borrows.filter(b => b.Status === "Pending").length +
                            res.returns.filter(r => r.Status === "Pending").length +
                            res.exports.filter(e => e.Status === "Pending").length,
                        cRejected:
                            res.borrows.filter(b => b.Status === "Rejected").length +
                            res.returns.filter(r => r.Status === "Rejected").length +
                            res.exports.filter(e => e.Status === "Rejected").length
                    }
                    resolve(result);
                }
                else {
                    reject(res.message);
                }
            },
            error: function (error) {
                reject(GetAjaxErrorMessage(error));
            }
        });
    });
}
function GetRequest(IdRequest, Type) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: "/NVIDIA/RequestManagement/GetRequest",
            type: "GET",
            data: { IdRequest, Type },
            contentType: "application/json;charset=utf-8",
            dataType: "json",
            success: function (res) {
                if (res.status) {
                    resolve(res.request);
                }
                else {
                    reject(res.message);
                }
            },
            error: function (error) {
                reject(GetAjaxErrorMessage(error));
            }
        });
    });
}
function GetModelAndStations() {
    return new Promise((resolve, reject) => {
        $.ajax({
            type: "GET",
            url: "/NVIDIA/RequestManagement/GetModelsAndStations",
            dataType: "json",
            contentType: "application/json;charset=utf-8",
            success: function (response) {
                if (response.status) {
                    resolve(response);
                }
                else {
                    reject(response.message);
                }
            },
            error: function (error) {
                reject(GetAjaxErrorMessage(error));
            }
        });
    });
}


/* POST */
function Approved(IdRequest, IdSign, Type) {
    return new Promise((resolve, reject) => {
        var approvedUrl = '';
        switch (Type) {
            case "Borrow": {
                approvedUrl = '/NVIDIA/RequestManagement/Borrow_Approved';
                break;
            }
            case "Return": {
                approvedUrl = '/NVIDIA/RequestManagement/Return_Approved';
                break;
            }
            case "Export": {
                approvedUrl = '/NVIDIA/RequestManagement/Export_Approved';
                break;
            }
        }

        $.ajax({
            type: "POST",
            url: approvedUrl,
            data: JSON.stringify({ IdRequest, IdSign }),
            dataType: "json",
            contentType: "application/json;charset=utf-8",
            success: function (res) {
                if (res.status) {
                    var request = CustomRequest(res.request, Type);                  
                    resolve(request);
                }
                else {
                    reject(res.message);
                }
            },
            error: function (error) {
                reject(error);
            }
        });
    });
}
function Rejected(IdRequest, IdSign, Type, Note) {
    return new Promise((resolve, reject) => {
        var rejectedUrl = '';
        switch (Type) {
            case "Borrow": {
                rejectedUrl = '/NVIDIA/RequestManagement/Borrow_Rejected';
                break;
            }
            case "Return": {
                rejectedUrl = '/NVIDIA/RequestManagement/Return_Rejected';
                break;
            }
            case "Export": {
                rejectedUrl = '/NVIDIA/RequestManagement/Export_Rejected';
                break;
            }
        }

        $.ajax({
            type: "POST",
            url: rejectedUrl,
            data: JSON.stringify({ IdRequest, IdSign, Note }),
            dataType: "json",
            contentType: "application/json;charset=utf-8",
            success: function (res) {
                if (res.status) {
                    var request = CustomRequest(res.request, Type);                  
                    resolve(request);
                }
                else {
                    reject(res.message);
                }
            },
            error: function (error) {
                reject(error);
            }
        });
    });
}

/* FUNCTION */
function CustomRequest(request, type) {
    switch (type) {
        case "Borrow": {
            var customRequest = {
                Id: request.Id,
                CreatedDate: request.DateBorrow,
                Status: request.Status,
                Type: request.Type,
                DuaDate: request.DateDue,
                Note: request.Note,
                IdModel: request.IdModel,
                IdStation: request.IdStation,
                DeviceName: request.BorrowDevices.map(d => d.Device.DeviceCode),
                UserSigns: request.UserBorrowSigns,
                User: request.User
            }
            return customRequest;
        }
        case "Return": {
            var customRequest = {
                Id: request.Id,
                CreatedDate: request.DateReturn,
                ReturnDate: request.DateReturn,
                Note: request.Note,
                Status: request.Status,
                Type: request.Type,
                IdBorrow: request.IdBorrow,
                DeviceName: request.ReturnDevices.map(d => d.Device.DeviceCode),
                UserSigns: request.UserReturnSigns,
                User: request.User
            }
            return customRequest;
        }
        case "Export": {
            var customRequest = {
                Id: request.Id,
                CreatedDate: request.CreatedDate,
                Note: request.Note,
                Status: request.Status,
                Type: request.Type,
                DeviceName: request.ExportDevices.map(d => d.Device.DeviceCode),
                UserSigns: request.UserExportSigns,
                User: request.User
            }
            return customRequest;
        }
    }
}
function GetRequestType(request) {
    switch (request.Type) {
        case "Borrow": {
            return (`<span class="fw-bold text-primary">Borrow</span>`);
        }
        case "Take": {
            return (`<span class="fw-bold text-secondary">Take</span>`);
        }
        case "Return": {
            return (`<span class="fw-bold text-info">Return</span>`);
        }
        case "Return NG": {
            return (`<span class="fw-bold text-danger">NG</span>`);
        }
        case "Export": {
            return (`<span class="fw-bold text-success">Export</span>`);
        }
        default: {
            return (`<span class="fw-bold">NA</span></td>`);
        }
    }
}
function GetRequestStatus(request) {
    switch (request.Status) {
        case "Pending": {
            return (`<span class="badge bg-warning"><i class="fa-solid fa-timer"></i> Pending</span>`);
        }
        case "Approved": {
            return (`<span class="badge bg-success"><i class="fa-solid fa-check"></i> Approved</span>`);
        }
        case "Rejected": {
            return (`<span class="badge bg-danger"><i class="fa-solid fa-xmark"></i> Rejected</span>`);
        }
        default: {
            return (`<span class="badge bg-secondary">NA</span>`);
        }
    }
}
function GetRequestAction(request, type) {
    switch (type) {
        case "Borrow": {
            return (`<a href="javascript:;" class="text-info bg-light-info border-0" title="Details" data-id="${request.Id}" onclick="RequestDetails(${request.Id})"><i class="fa-regular fa-circle-info"></i></a>`);
        }
        case "Return": {
            return (`<a href="javascript:;" class="text-info bg-light-info border-0" title="Details" data-id="${request.Id}" onclick="ReturnDetails(${request.Id})"><i class="fa-regular fa-circle-info"></i></a>`);
        }
        case "Export": {
            return (`<a href="javascript:;" class="text-info bg-light-info border-0" title="Details" data-id="${request.Id}" onclick="ExportDetails(${request.Id})"><i class="fa-regular fa-circle-info"></i></a>`);
        }
    }   
}
function GetSignStatus(request) {
    const userSign = request.UserSigns.find(s => s.User.Username === $('#CardID').text());

    switch (userSign.Status) {
        case 'Waitting': {
            return `<span class="fw-bold text-primary">${userSign.Status}</span>`;
        }
        case 'Closed': {
            return `<span class="fw-bold text-secondary">${userSign.Status}</span>`;
        }
        case 'Pending': {
            return `<span class="fw-bold text-warning">${userSign.Status}</span>`;
        }
        case 'Approved': {
            return `<span class="fw-bold text-success">${userSign.Status}</span>`;
        }
        case 'Rejected': {
            return `<span class="fw-bold text-danger">${userSign.Status}</span>`;
        }
    }

}
function GetSignAction(request, type) {
    const userSign = request.UserSigns.find(s => s.User.Username === $('#CardID').text());

    var btnDetails, btnApproved, btnRejected;
   
    if (userSign.Status == "Pending") {
        switch (type) {
            case "Borrow": {
                btnDetails = `<a href="javascript:;" class="text-info bg-light-info border-0" title="Details" data-id="${request.Id}" onclick="RequestDetails(${request.Id}, ${userSign.Id}, 'Borrow', this)"><i class="fa-regular fa-circle-info"></i></a>`;
                break;
            }
            case "Return": {
                btnDetails = `<a href="javascript:;" class="text-info bg-light-info border-0" title="Details" data-id="${request.Id}" onclick="ReturnDetails(${request.Id}, ${userSign.Id}, 'Return', this)"><i class="fa-regular fa-circle-info"></i></a>`;
                break;
            }
            case "Export": {
                btnDetails = `<a href="javascript:;" class="text-info bg-light-info border-0" title="Details" data-id="${request.Id}" onclick="ExportDetails(${request.Id}, ${userSign.Id}, 'Export', this)"><i class="fa-regular fa-circle-info"></i></a>`;
                break;
            }
        }
        btnApproved = `<a href="javascript:;" class="text-success bg-light-success border-0" data-id="${request.Id}" data-idsign="${userSign.Id}" onclick="CreateApprovedAlert(${request.Id}, ${userSign.Id}, '${type}', this)"><i class="fa-duotone fa-check"></i></a>`;
        btnRejected = `<a href="javascript:;" class="text-danger  bg-light-danger  border-0" data-id="${request.Id}" data-idsign="${userSign.Id}" onclick="CreateRejectedAlert(${request.Id}, ${userSign.Id}, '${type}', this)"><i class="fa-solid fa-x"></i></a>`;

        return btnDetails + btnApproved + btnRejected;
    }
    else {
        switch (type) {
            case "Borrow": {
                btnDetails = `<a href="javascript:;" class="text-info bg-light-info border-0" title="Details" data-id="${request.Id}" onclick="RequestDetails(${request.Id})"><i class="fa-regular fa-circle-info"></i></a>`;
                break;
            }
            case "Return": {
                btnDetails = `<a href="javascript:;" class="text-info bg-light-info border-0" title="Details" data-id="${request.Id}" onclick="ReturnDetails(${request.Id})"><i class="fa-regular fa-circle-info"></i></a>`;
                break;
            }
            case "Export": {
                btnDetails = `<a href="javascript:;" class="text-info bg-light-info border-0" title="Details" data-id="${request.Id}" onclick="ExportDetails(${request.Id})"><i class="fa-regular fa-circle-info"></i></a>`;
                break;
            }
        }

        return btnDetails;
    }
}