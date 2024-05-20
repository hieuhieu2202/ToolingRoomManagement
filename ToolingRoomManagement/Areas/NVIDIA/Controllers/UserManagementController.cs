using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;
using ToolingRoomManagement.Areas.NVIDIA.Entities;
using ToolingRoomManagement.Areas.NVIDIA.Data;
using ToolingRoomManagement.Areas.NVIDIA.Reseptory;
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
                var result = RUser.GetUsers();

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
                var result = RUser.GetUser(IdUser);

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
                var result = RUser.GetUserByUsername(Username);

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
                var result = await RUser.GetUserInformation(username);
                return Json(new { status = true, data = result }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        /* POST */
        [Authentication(Roles = new[] { "ADMIN" })]
        public JsonResult CreateUser(User user)
        {
            try
            {
                var result = RUser.CreateUser(user);

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
                var result = RUser.UpdateUser(user);

                return Json(new { status = true, data = result }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message }, JsonRequestBehavior.AllowGet);
            }

        }

        [Authentication(Roles = new[] { "ADMIN" })]
        public JsonResult DeleteUser(int IdUser)
        {
            try
            {
                var result = RUser.DeleteUser(new User { Id = IdUser });

                return Json(new { status = true, data = result }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }
    }
}