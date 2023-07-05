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
    public class FixtureController : Controller
    {
        // GET: Admin/Fixture
        ToolingRoomDbContext context = new ToolingRoomDbContext();
        public ActionResult Index()
        {
            return View();
        }
        public string Create_Fixture(FixtureModel model)
        {
            var file_name = "";
            if (model.file_name != null)
            {
                file_name = Guid.NewGuid() + "_" + model.file_name.FileName.Replace(",", "");
            }
            else
            {
                file_name = "";
            }
            if (model.id.HasValue && model.id > 0)
            {
                var update_fixture = (from dt in context.Fixtures
                                     where dt.id == model.id
                                     select dt).FirstOrDefault();

                if (update_fixture == null) return "Khong co ban ghi";
                update_fixture.Model_Name = model.model_name;
                update_fixture.Group_Name = model.group_name;
                update_fixture.Station_Name = model.station_name;
                update_fixture.Calibration_Date = model.calibration_date;
                update_fixture.End_Date = model.end_date;
                if (file_name != "")
                {
                    update_fixture.File_Name = file_name;
                    model.file_name.SaveAs(Server.MapPath("/Data/Fixture/" + file_name));
                }
                context.SaveChanges();
                return "OK";
            }
            else
            {
                var sessionPart = (ToolingRoomManagement.Common.SessionPart)Session[ToolingRoomManagement.Common.CommonConstants.SessionPart];
                string part = sessionPart.part.ToString();
                var session = (ToolingRoomManagement.Common.UserLogin)Session[ToolingRoomManagement.Common.CommonConstants.USER_SESSION];
                string user_name = session.Fullname;
                int id_fixture = new Fixture_Dao().Insert(model.model_name, model.group_name, model.station_name, model.calibration_date, model.end_date, file_name, user_name, part.ToUpper());
                if (file_name != "")
                {
                    model.file_name.SaveAs(Server.MapPath("/Data/Fixture/" + file_name));
                }
                
                if (id_fixture > 0)
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
            var dele = new Fixture_Dao().Delete(id);
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