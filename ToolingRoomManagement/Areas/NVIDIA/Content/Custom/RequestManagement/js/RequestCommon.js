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




/* FUNCTION */
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
    return (`<a href="javascript:;" class="text-info bg-light-info border-0" title="Details" data-id="${request.Id}" data-type="${type}" onclick="RequestDetails(${request.Id})"><i class="fa-regular fa-circle-info"></i></a>`);
}

async function GetExports() {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: "/NVIDIA/ExportManagement/GetExports",
            type: "GET",
            contentType: "application/json;charset=utf-8",
            dataType: "json",
            success: function (res) {
                if (res.status) {
                    resolve(res.exports);
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
// 7. Create Export
async function CreateExport(exportdata) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: "/NVIDIA/ExportManagement/NewExport",
            type: "POST",
            data: JSON.stringify({ exportdata }),
            contentType: "application/json;charset=utf-8",
            dataType: "json",
            success: function (res) {
                if (res.status) {
                    resolve(res.export);
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