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
    public class LUXFT3Controller : Controller
    {
        // GET: Admin/LUXFT3
        ToolingRoomDbContext context = new ToolingRoomDbContext();
        public string Insert(LUX_FT3Model model)
        {
            if (model.id != null)
            {
                var data_update = context.LUXFT3.Where(x => x.id == model.id).SingleOrDefault();
                data_update.model_name = model.model_name;
                data_update.SN_lightbox = model.sn_lightbox;
                data_update.LUX_1 = model.LUX_1;
                data_update.LUX_2 = model.LUX_2;
                data_update.LUX_3 = model.LUX_3;
                data_update.K_1 = model.K_1;
                data_update.K_2 = model.K_2;
                data_update.K_3 = model.K_3;
                context.SaveChanges();
                return "OK";
            }
            else
            {
                var session = (ToolingRoomManagement.Common.UserLogin)Session[ToolingRoomManagement.Common.CommonConstants.USER_SESSION];
                var create_by = session.Fullname;
                int id_ob = new LUXFT3_Dao().Insert(model.model_name, model.sn_lightbox, model.LUX_1, model.LUX_2, model.LUX_3, model.K_1, model.K_2, model.K_3, create_by);
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
            var data = context.LUXFT3.ToList();
            var json = new JavaScriptSerializer().Serialize(data);
            return json;
        }
        public ActionResult Delete(int id)
        {
            var model = new LUXFT3_Dao().Delete(id);
            return Json(new
            {
                status = true
            });
        }
    }
}