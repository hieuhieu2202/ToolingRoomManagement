using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Web;
using System.Web.Mvc;
using ToolingRoomManagement.Areas.NVIDIA.Entities;
using ToolingRoomManagement.Attributes;

namespace ToolingRoomManagement.Areas.NVIDIA.Controllers
{
    [Authentication]
    public class WarehouseController : Controller
    {
        ToolingRoomEntities db = new ToolingRoomEntities();

        // Management
        public ActionResult Management()
        {
            return View();
        }
        public JsonResult GetWarehouses()
        {
            try
            {
                db.Configuration.LazyLoadingEnabled = false;
                List<Entities.Warehouse> warehouses = db.Warehouses.ToList();

                foreach (var warehouse in warehouses)
                {
                    warehouse.User = db.Users.FirstOrDefault(u => u.Id == warehouse.IdUserManager);
                }

                return Json(new { status = true, warehouses = JsonSerializer.Serialize(warehouses) }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }
        public JsonResult GetUsers()
        {
            try
            {
                db.Configuration.LazyLoadingEnabled = false;
                List<Entities.User> users = db.Users.ToList();

                return Json(new { status = true, users = JsonSerializer.Serialize(users) }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }



        //Layouts
        public ActionResult Layout()
        {
            return View();
        }
        public JsonResult GetWarehouseLayouts(int IdWarehouse)
        {
            try
            {
                List<Entities.WarehouseLayout> WarehouseLayouts = db.WarehouseLayouts.Where(wl => wl.IdWareHouse == IdWarehouse).ToList();

                return Json(new { status = true, WarehouseLayouts = JsonSerializer.Serialize(WarehouseLayouts) }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }
        public JsonResult NewLine(int IdWarehouse)
        {
            try
            {
                int maxLine = db.WarehouseLayouts.Where(wl => wl.IdWareHouse == IdWarehouse).Max(wl => wl.Line) ?? 0;

                WarehouseLayout layout = new WarehouseLayout
                {
                    IdWareHouse = IdWarehouse,
                    Line = maxLine + 1,
                    Floor = 1,
                    Cell = 1
                };

                db.WarehouseLayouts.Add(layout);
                //db.SaveChanges();

                return Json(new { status = true });
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message });
            }
        }
        public JsonResult NewFloor(int IdWarehouse, int Line)
        {
            try
            {
                int maxFloor = db.WarehouseLayouts.Where(wl => wl.IdWareHouse == IdWarehouse && wl.Line == Line).Max(wl => wl.Floor) ?? 0;

                WarehouseLayout layout = new WarehouseLayout
                {
                    IdWareHouse = IdWarehouse,
                    Line = Line,
                    Floor = maxFloor + 1,
                    Cell = 1
                };

                db.WarehouseLayouts.Add(layout);
                //db.SaveChanges();

                return Json(new { status = true });
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message });
            }
        }
        //public JsonResult NewFloorsCell(int IdWarehouse)
        //{

        //}

    }
}