using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using ToolingRoomManagement.Attributes;

namespace ToolingRoomManagement.Areas.NVIDIA.Controllers
{
    [Authentication(AllowAnonymous = false)]
    public class UserManagementController : Controller
    {
        // GET: NVIDIA/UserManagement
        public ActionResult UserManagement()
        {
            return View();
        }
        public ActionResult RoleManagement()
        {
            return View();
        }
    }
}