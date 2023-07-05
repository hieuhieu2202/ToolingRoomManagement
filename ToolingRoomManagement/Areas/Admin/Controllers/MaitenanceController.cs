using Model.Dao;
using Model.EF;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using ToolingRoomManagement.Models;

namespace ToolingRoomManagement.Areas.Admin.Controllers
{
    public class MaitenanceController : Controller
    {
        ToolingRoomDbContext context = new ToolingRoomDbContext();
        // GET: Admin/Maitenance
        public ActionResult Index()
        {
            return View();
        }
        public string Create_Maintenace(MaintenanceModel model)
        {
            if (model.id.HasValue && model.id > 0)
            {
                var update_data = (from dt in context.MaintenanceRobots
                                   where dt.id == model.id
                                   select dt).FirstOrDefault();

                if (update_data == null) return "Khong co ban ghi";
                update_data.station_name = model.station_name;
                update_data.issue_1 = model.issue_1;
                update_data.issue_2 = model.issue_2;
                update_data.issue_3 = model.issue_3;
                update_data.issue_4 = model.issue_4;
                update_data.issue_5 = model.issue_5;
                update_data.issue_6 = model.issue_6;
                update_data.issue_7 = model.issue_7;
                update_data.issue_8 = model.issue_7;
                update_data.issue_9 = model.issue_7;
                update_data.note = model.note;
                context.SaveChanges();
                return "OK";
            }
            else
            {
                var session = (ToolingRoomManagement.Common.UserLogin)Session[ToolingRoomManagement.Common.CommonConstants.USER_SESSION];
                int create_by = Int32.Parse(session.UserID.ToString());
                string create_by_name = session.Fullname;
                var sessionPart = (ToolingRoomManagement.Common.SessionPart)Session[ToolingRoomManagement.Common.CommonConstants.SessionPart];
                var part = sessionPart.part;
                int id = new MaintenanceRobot_Dao().Insert(model.station_name, model.issue_1, model.issue_2, model.issue_3, model.issue_4, model.issue_5, model.issue_6, model.issue_7, model.issue_8, model.issue_9, model.note, create_by, create_by_name, part);
                if (id > 0)
                {
                    return "OK";
                }
                else
                {
                    return "NG";
                }
            }
        }
        public string Delete(int id)
        {
            var dele = new MaintenanceRobot_Dao().Delete(id);
            if (dele == true)
            {
                return "OK";
            }
            else
            {
                return "NG";
            }
        }
    }
}