using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using ToolingRoomManagement.Areas.NVIDIA.Repositories;
using ToolingRoomManagement.Attributes;

namespace ToolingRoomManagement.Areas.NVIDIA.Controllers
{
    public class RoleManagementController : Controller
    {

        /* GET */
        [Authentication(Roles = new[] { "ADMIN" })]
        public JsonResult GetRoles()
        {
            try
            {
                var result  = RRoles.GetRoles();
                return Json(new { status = true, data = result }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }
        
        [Authentication(Roles = new[] { "ADMIN" })]
        public JsonResult GetRoleUsers(int IdRole)
        {
            try
            {
                var result = RRoles.GetRoleUsers(IdRole);
                return Json(new { status = true, data = result }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }
    }
}