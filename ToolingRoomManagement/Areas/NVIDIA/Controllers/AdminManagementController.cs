using Newtonsoft.Json;
using System;
using System.Data.Entity.Migrations;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Configuration;
using System.Web.Mvc;
using ToolingRoomManagement.Areas.NVIDIA.Entities;
using ToolingRoomManagement.Areas.NVIDIA.Repositories;
using ToolingRoomManagement.Attributes;

namespace ToolingRoomManagement.Areas.NVIDIA.Controllers
{
    public class AdminManagementController : Controller
    {
        ToolingRoomEntities db = new ToolingRoomEntities();

        // GET: NVIDIA/AdminManagement/UserManagement
        /* PAGE */
        [Authentication(Roles = new[] { "ADMIN" })]
        public ActionResult UserManagement()
        {
            return View();
        }

        // GET: NVIDIA/AdminManagement/UserRoleManagement
        [Authentication(Roles = new[] { "ADMIN" })]
        public ActionResult RoleManagement()
        {
            return View();
        }

        #region Role Management


        
        #endregion
    }
}