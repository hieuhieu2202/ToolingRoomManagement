﻿/* NVIDIA/AdminManagement/UserManagement */

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
                    resolve(JSON.parse(res.user));
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

function GetRoles() {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: "/NVIDIA/AdminManagement/GetRoles",
            type: "GET",
            contentType: "application/json;charset=utf-8",
            dataType: "json",
            success: function (res) {
                if (res.status) {
                    resolve(res.roles);
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
function GetRoleUsers(IdRole) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: "/NVIDIA/AdminManagement/GetRoleUsers?IdRole=" + IdRole,
            type: "GET",
            contentType: "application/json;charset=utf-8",
            dataType: "json",
            success: function (res) {
                if (res.status) {
                    resolve(res.users);
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
                    resolve(JSON.parse(res.user));
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
                    resolve(resUser);
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
function DeleteUser(Id) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: "/NVIDIA/AdminManagement/DeleteUser",
            type: "POST",
            data: JSON.stringify({ Id }),
            contentType: "application/json;charset=utf-8",
            dataType: "json",
            success: function (res) {
                if (res.status) {
                    if (res.action == "Deleted") {
                        resolve(true);                       
                    }
                    else if (res.action == "Hidden"){
                        resolve(JSON.parse(res.user));
                    }
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

