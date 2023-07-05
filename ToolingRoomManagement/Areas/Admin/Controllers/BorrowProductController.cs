using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace ToolingRoomManagement.Areas.Admin.Controllers
{
    public class BorrowProductController : Controller
    {
        // GET: Admin/BorrowProduct
        public ActionResult UserBorrow()
        {
            return View();
        }
        public ActionResult ManagerUserBorrow()
        {
            return View();
        }
        public ActionResult AccountantPD()
        {
            return View();
        }
        public ActionResult ManagerPD1()
        {
            return View();
        }
        public ActionResult ManagerPD()
        {
            return View();
        }
        public ActionResult LeaderManager()
        {
            return View();
        }
        public ActionResult LeaderShift()
        {
            return View();
        }
        public ActionResult NightshiftUserBorow()
        {
            return View();
        }
        public ActionResult NightshiftOBAUser()
        {
            return View();
        }
        public ActionResult NightshiftAccountantPD()
        {
            return View();
        }
        public ActionResult NightshiftOBAAccountantPD()
        {
            return View();
        }
        public ActionResult NightshiftLeaderShift()
        {
            return View();
        }
       



        

        public ActionResult NightShiftUser()
        {
            return View();
        }
        public ActionResult NightShiftBorrowAccountantPD()
        {
            return View();
        }
        public ActionResult NightShiftBorrowLeaderPD()
        {
            return View();
        }

    }
}