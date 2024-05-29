/**
 * USER
 */

/* GET */
function GetUsers() {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: "/NVIDIA/UserManagement/GetUsers",
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
function GetUser(IdUser) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: "/NVIDIA/UserManagement/GetUser?IdUser=" + IdUser,
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
function GetUserByUsername(Username) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: "/NVIDIA/UserManagement/GetUserByUsername?Username=" + Username,
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
function GetUserInformation(username) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: "/NVIDIA/UserManagement/GetUserInformation?username=" + username,
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

/* SET */
function CreateUserRole(IdUser, IdRole) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: "/NVIDIA/UserManagement/CreateUserRole",
            type: "POST",
            //data: JSON.stringify({ IdUser: IdUser, IdRole: IdRole }),
            data: JSON.stringify({ IdUser, IdRole }),
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
function CreateUser(user) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: "/NVIDIA/UserManagement/CreateUser",
            type: "POST",
            data: JSON.stringify({ user }),
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
function UpdateUser(user) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: "/NVIDIA/UserManagement/UpdateUser",
            type: "POST",
            data: JSON.stringify({ user }),
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
function DeleteUser(IdUser, IdRole = null) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: "/NVIDIA/UserManagement/DeleteUser",
            type: "POST",            
            contentType: "application/json;charset=utf-8",
            dataType: "json",
            data: JSON.stringify({ IdUser, IdRole }),
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