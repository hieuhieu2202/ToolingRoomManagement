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
    public class SheildingBoxController : Controller
    {
        // GET: Admin/SheildingBox
        ToolingRoomDbContext context = new ToolingRoomDbContext();
        public ActionResult Index()
        {
            return View();
        }
        public string Create_SheildingBox(SheildingBoxModel model)
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
                var update_sh = (from dt in context.SheildingBoxes
                                      where dt.id == model.id
                                      select dt).FirstOrDefault();

                if (update_sh == null) return "Khong co ban ghi";
                var data = context.SheildingBoxes.Where(x => x.Calibration_Date == update_sh.Calibration_Date && x.End_Date == update_sh.End_Date&&x.id==update_sh.id).ToList();

                update_sh.Model_Name = model.model_name;
                foreach (var item in data)
                {
                    item.Calibration_Date = model.calibration_date;
                    item.End_Date = model.end_date;
                }
                update_sh.Group_Name = model.group_name;
                update_sh.Station_Name = model.station_name;
                update_sh.Mac = model.sheildingbox_mac;
                update_sh.Calibration_Date = model.calibration_date;
                update_sh.End_Date = model.end_date;
                if (model.file_name != null)
                {
                    update_sh.File_Name = file_name;
                    model.file_name.SaveAs(Server.MapPath("/Data/Shelingbox/" + file_name));
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
                int id_sheildingbox = new SheildingBox_Dao().Insert(model.model_name, model.group_name, model.station_name, model.sheildingbox_mac, model.calibration_date, model.end_date, user_name, part,file_name);
                if (model.file_name != null)
                {
                    model.file_name.SaveAs(Server.MapPath("/Data/Shelingbox/" + file_name));
                }
                if (id_sheildingbox > 0)
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
            var dele = new SheildingBox_Dao().Delete(id);
            if (dele == true)
            {
                return "OK";
            }
            else
            {
                return "NG";
            }
        }
        public string Create_Weekly(WeeklyModel model)
        {
            if(model.id.HasValue && model.id > 0)
            {
                var update_data = (from dt in context.WeeklyCheckLists
                                   where dt.id == model.id
                                   select dt).FirstOrDefault();

                if (update_data == null) return "Khong co ban ghi";
                update_data.station_id = model.station_id;
                update_data.sheilding_mac = model.sheilding_mac;
                update_data.issue_1 = model.issue_1;
                update_data.issue_2 = model.issue_2;
                update_data.issue_3 = model.issue_3;
                update_data.issue_4 = model.issue_4;
                update_data.issue_5 = model.issue_5;
                update_data.issue_6 = model.issue_6;
                update_data.issue_7 = model.issue_7;
                update_data.issue_8 = model.issue_8;
                update_data.note = model.note;
                update_data.create_date= model.create_date;
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
                int id = new WeeklyCheckList_Dao().Insert(model.station_id,
                                                          model.sheilding_mac, 
                                                          model.issue_1, 
                                                          model.issue_2, 
                                                          model.issue_3, 
                                                          model.issue_4, 
                                                          model.issue_5, 
                                                          model.issue_6, 
                                                          model.issue_7,
                                                          model.issue_8, 
                                                          model.note, 
                                                          create_by, 
                                                          create_by_name,part.ToUpper(),
                                                          model.create_date);
                if(id > 0)
                {
                    return "OK";
                }
                else
                {
                    return "NG";
                }
            }
        }
        public string Delete_Weekly(int id)
        {
            var dele = new WeeklyCheckList_Dao().Delete(id);
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