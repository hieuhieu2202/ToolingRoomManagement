using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using ToolingRoomManagement.Attributes;

namespace ToolingRoomManagement.Areas.NVIDIA.Controllers
{
    [Authentication]
    public class DashboardController : Controller
    {
        // GET: NVIDIA/Dashboard
        public ActionResult Index()
        {
            return View();
        }
    }
}