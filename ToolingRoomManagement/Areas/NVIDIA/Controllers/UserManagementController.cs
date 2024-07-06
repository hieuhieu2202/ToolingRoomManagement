using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;
using ToolingRoomManagement.Areas.NVIDIA.Entities;
using ToolingRoomManagement.Areas.NVIDIA.Data;
using ToolingRoomManagement.Areas.NVIDIA.Repositories;
using ToolingRoomManagement.Attributes;

namespace ToolingRoomManagement.Areas.NVIDIA.Controllers
{
    [Authentication]
    public class UserManagementController : Controller
    {
        // GET: NVIDIA/UserManagement
        

        /* GET*/
        [Authentication(Roles = new[] { "ADMIN" })]
        public JsonResult GetUsers()
        {
            try
            {
                var result = RUsers.GetUsers();

                return Json(new { status = true, data = result }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        [Authentication(Roles = new[] { "ADMIN" })]
        public JsonResult GetUser(int IdUser)
        {
            try
            {
                var result = RUsers.GetUser(IdUser);

                return Json(new { status = true, data = result }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        public JsonResult GetUserByUsername(string Username)
        {
            try
            {
                var result = RUsers.GetUserByUsername(Username);

                return Json(new { status = true, data = result }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        public async Task<JsonResult> GetUserInformation(string username)
        {
            try
            {
                var result = await RUsers.GetUserInformation(username);
                return Json(new { status = true, data = result }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        /* POST */
        [Authentication(Roles = new[] { "ADMIN" })]
        public JsonResult CreateUserRole(int IdUser, int IdRole)
        {
            try
            {
                var result = RUsers.CreateUserRole(IdUser, IdRole);

                return Json(new { status = true, data = result }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message }, JsonRequestBehavior.AllowGet);
            }

        }

        [Authentication(Roles = new[] { "ADMIN" })]
        public JsonResult CreateUser(User user)
        {
            try
            {
                var result = RUsers.CreateUser(user);

                return Json(new { status = true, data = result }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message }, JsonRequestBehavior.AllowGet);
            }

        }

        [Authentication(Roles = new[] { "ADMIN" })]
        public JsonResult UpdateUser(User user)
        {
            try
            {
                var result = RUsers.UpdateUser(user);

                return Json(new { status = true, data = result }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message }, JsonRequestBehavior.AllowGet);
            }

        }

        [Authentication(Roles = new[] { "ADMIN" })]
        public JsonResult DeleteUser(int IdUser, int? IdRole = null)
        {
            try
            {
                var result = RUsers.DeleteUser(new User { Id = IdUser }, IdRole);

                return Json(new { status = true, data = result }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }
    }
}