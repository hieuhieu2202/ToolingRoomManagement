using Model.Dao;
using Model.EF;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Script.Serialization;
using ToolingRoomManagement.Models;

namespace ToolingRoomManagement.Areas.Admin.Controllers
{
    public class LUXFT1Controller : Controller
    {
        // GET: Admin/LUXFT1
        ToolingRoomDbContext context = new ToolingRoomDbContext();
        public string Insert(LUX_FT1Model model)
        {
            if (model.id != null)
            {
                var data_update = context.LUXFT1.Where(x => x.id == model.id).SingleOrDefault();
                data_update.model_name = model.model_name;
                data_update.SN_lightbox = model.sn_lightbox;
                data_update.LUX_2 = model.LUX_2_ft1;
                data_update.LUX_5 = model.LUX_5_ft1;
                data_update.LUX_10 = model.LUX_10_ft1;
                data_update.LUX_1000 = model.LUX_1000_ft1;
                data_update.LUX_2000 = model.LUX_2000_ft1;
                data_update.LUX_5000 = model.LUX_5000_ft1;
                context.SaveChanges();
                return "OK";
            }
            else
            {
                var session = (ToolingRoomManagement.Common.UserLogin)Session[ToolingRoomManagement.Common.CommonConstants.USER_SESSION];
                var create_by = session.Fullname;
                int id_ob = new LUXFT1_Dao().Inser(model.model_name, model.sn_lightbox, model.LUX_2_ft1, model.LUX_5_ft1, model.LUX_10_ft1, model.LUX_1000_ft1, model.LUX_2000_ft1, model.LUX_5000_ft1, create_by);
                if (id_ob != 0)
                {
                    return "OK";

                }
                else
                {
                    return "NG";
                }
            }
        }
        public string getDataView()
        {
            var data = context.LUXFT1.ToList();
            var json = new JavaScriptSerializer().Serialize(data);
            return json;
        }
        public ActionResult Delete(int id)
        {
            var model = new LUXFT1_Dao().Delete(id);
            return Json(new
            {
                status = true
            });
        }
    }
}