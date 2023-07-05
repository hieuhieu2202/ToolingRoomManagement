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
    
    public class ClipOutputController : Controller
    {
        ToolingRoomDbContext context = new ToolingRoomDbContext();
        // GET: Admin/ClipOutput
        public ActionResult Index()
        {
            return View();
        }
        public int? EditQuantityEachDevice(ClipOutputModel model)
        {
            var update = (from dt in context.ClipOutputs
                                  where dt.id == model.id
                                  select dt).FirstOrDefault();

            if (update == null) return 0;
            update.quantity = model.quantity;
            context.SaveChanges();

            return update.receive_id;
        }
        public ActionResult Delete(int id)
        {
            new ClipOutput_Dao().Delete(id);
            return Json(new
            {
                status = true
            });
        }

    }
}