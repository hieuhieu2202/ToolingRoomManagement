/**
 * ROLE
 */

/* GET */
function GetRoles() {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: "/NVIDIA/RoleManagement/GetRoles",
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
}
function GetRoleUsers(IdRole) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: "/NVIDIA/RoleManagement/GetRoleUsers?IdRole=" + IdRole,
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
}