/* NVIDIA/AdminManagement/UserManagement */

/* GET */
function GetUsers() {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: "/NVIDIA/AdminManagement/GetUsers",
            type: "GET",
            contentType: "application/json;charset=utf-8",
            dataType: "json",
            success: function (res) {
                if (res.status) {
                    resolve(JSON.parse(res.users));
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
function GetUser(Id) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: "/NVIDIA/AdminManagement/GetUser?Id=" + Id,
            type: "GET",
            contentType: "application/json;charset=utf-8",
            dataType: "json",
            success: function (res) {
                if (res.status) {
                    var resUser = JSON.parse(res.user);
                    resolve(resUser[0]);
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
function GetUserInformation(username) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: "/NVIDIA/AdminManagement/GetUserInformation?username=" + username,
            type: "GET",
            contentType: "application/json;charset=utf-8",
            dataType: "json",
            success: function (res) {
                if (res.status) {
                    resolve(JSON.parse(res.data));
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

/* POST */
function CreateUser(user) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: "/NVIDIA/AdminManagement/CreateUser",
            type: "POST",
            data: JSON.stringify({ user }),
            contentType: "application/json;charset=utf-8",
            dataType: "json",
            success: function (res) {
                if (res.status) {
                    var resUser = JSON.parse(res.user);
                    resolve(resUser[0]);
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
function UpdateUser(user) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: "/NVIDIA/AdminManagement/UpdateUser",
            type: "POST",
            data: JSON.stringify({ user }),
            contentType: "application/json;charset=utf-8",
            dataType: "json",
            success: function (res) {
                if (res.status) {
                    var resUser = JSON.parse(res.user);
                    resolve(resUser[0]);
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
function DeleteUser(IdUser) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: "/NVIDIA/AdminManagement/DeleteUser",
            type: "POST",
            data: JSON.stringify({ IdUser }),
            contentType: "application/json;charset=utf-8",
            dataType: "json",
            success: function (res) {
                if (res.status) {
                    resolve(true);
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

