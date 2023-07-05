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
    public class GoldenController : Controller
    {
        // GET: Admin/Golden
        ToolingRoomDbContext context = new ToolingRoomDbContext();
        public ActionResult Index()
        {
            return View();
        }
        public string Create_Golden(GoldenModel model)
        {
            
            var file_name = "";
            if (model.file_name != null)
            {
                file_name = Guid.NewGuid() + "_" + model.file_name.FileName.Replace(",", ""); ;
            }
            else
            {
                file_name = "";
            }

            if (model.id.HasValue && model.id > 0)
            {
                var update_golden = (from dt in context.Goldens
                                     where dt.id == model.id
                                     select dt).FirstOrDefault();

                if (update_golden == null) return "Khong co ban ghi";
                update_golden.Golden_Name = model.golden_name;
                update_golden.Mac = model.golden_mac;
                update_golden.Model_Name = model.model_name;
                update_golden.Group_Name = model.group_name;
                update_golden.Create_Date = model.create_date;
                update_golden.End_Date = model.end_date;
                if (model.file_name != null)
                {
                    update_golden.File_Name = file_name;
                    model.file_name.SaveAs(Server.MapPath("/Data/Golden/" + file_name));
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
                int id_golden = new Golden_Dao().Insert(model.golden_name,model.golden_mac,model.model_name,model.group_name,model.create_date,model.end_date,file_name,part.ToUpper(), user_name);
                if (file_name != "")
                {
                    model.file_name.SaveAs(Server.MapPath("/Data/Golden/" + file_name));
                }
                if (id_golden > 0)
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
            var delete = new Golden_Dao().Delete(id);
            if (delete == true)
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