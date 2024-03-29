/**
 * PRODUCT
 */

/* GET */
function GetProducts() {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: "/NVIDIA/ProductManagement/GetProducts",
            type: "GET",
            contentType: "application/json;charset=utf-8",
            dataType: "json",
            success: function (res) {
                if (res.status) {
                    resolve(res.data);
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
};
function GetProduct(IdProduct) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: `/NVIDIA/ProductManagement/GetProduct?IdProduct=${IdProduct}`,
            type: "GET",
            contentType: "application/json;charset=utf-8",
            dataType: "json",
            success: function (res) {
                if (res.status) {
                    resolve(res.data);
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
};

function GetDataAndProducts() {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: "/NVIDIA/ProductManagement/GetDataAndProducts",
            type: "GET",
            contentType: "application/json;charset=utf-8",
            dataType: "json",
            success: function (res) {
                if (res.status) {
                    resolve(res.data);
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
function GetDataAndProduct(IdProduct) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: `/NVIDIA/ProductManagement/GetDataAndProduct?IdProduct=${IdProduct}` ,
            type: "GET",
            contentType: "application/json;charset=utf-8",
            dataType: "json",
            success: function (res) {
                if (res.status) {
                    resolve(res.data);
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

function GetDevicesAndProducts() {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: "/NVIDIA/ProductManagement/GetDevicesAndProducts",
            type: "GET",
            contentType: "application/json;charset=utf-8",
            dataType: "json",
            success: function (res) {
                if (res.status) {
                    resolve(res.data);
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
function GetDevicesAndProduct(IdProduct) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: `/NVIDIA/ProductManagement/GetDataAndProduct?IdProduct=${IdProduct}`,
            type: "GET",
            contentType: "application/json;charset=utf-8",
            dataType: "json",
            success: function (res) {
                if (res.status) {
                    resolve(res.data);
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

/* SET */
function CreateProduct(product) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: "/NVIDIA/ProductManagement/CreateProduct",
            type: "POST",           
            contentType: "application/json;charset=utf-8",
            dataType: "json",
            data: JSON.stringify({ product }),
            success: function (res) {
                if (res.status) {
                    resolve(res.data);
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
};
function UpdateProduct(product) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: "/NVIDIA/ProductManagement/UpdateProduct",
            type: "POST",           
            contentType: "application/json;charset=utf-8",
            dataType: "json",
            data: JSON.stringify({ product }),
            success: function (res) {
                if (res.status) {
                    resolve(res.data);
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
};
function DeleteProduct(IdProduct) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: "/NVIDIA/ProductManagement/DeleteProduct",
            type: "POST",
            contentType: "application/json;charset=utf-8",
            dataType: "json",
            data: JSON.stringify({ IdProduct }),
            success: function (res) {
                if (res.status) {
                    resolve(res.data);
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
};