using System;
using System.Collections.Generic;
using System.Data.Entity.Migrations;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using ToolingRoomManagement.Areas.NVIDIA.Entities;

namespace ToolingRoomManagement.Areas.NVIDIA.Controllers
{
    public class InfoManagementController : Controller
    {
        // GET: NVIDIA/InfoManagement
        public ActionResult Product()
        {
            return View();
        }              
        public ActionResult ModelStation()
        {
            return View();
        }
    }
}