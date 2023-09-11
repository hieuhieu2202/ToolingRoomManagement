using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace ToolingRoomManagement.Areas.NVIDIA.Controllers
{
    public class BorrowManagementController : Controller
    {
        // GET: NVIDIA/BorrowManagement
        public ActionResult BorrowManagement()
        {
            return View();
        }
        public ActionResult BorrowDevice()
        {
            return View();
        }
        public ActionResult ReturnDevice()
        {
            return View();
        }
    }
}