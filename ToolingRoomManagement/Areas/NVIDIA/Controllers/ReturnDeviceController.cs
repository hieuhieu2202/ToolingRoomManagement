using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using ToolingRoomManagement.Areas.NVIDIA.Entities;

namespace ToolingRoomManagement.Areas.NVIDIA.Controllers
{
    public class ReturnDeviceController : Controller
    {
        ToolingRoomEntities db = new ToolingRoomEntities();
        // GET: NVIDIA/ReturnDevice
        public ActionResult ReturnNG()
        {
            return View();
        }
        public ActionResult Shipping()
        {
            return View();
        }

        [HttpGet]
        public JsonResult GetDevice(int Id)
        {
            try
            {
                var device = db.Devices.FirstOrDefault(d => d.Id == Id);
                if (device != null)
                {
                    return Json(new { status = true, device }, JsonRequestBehavior.AllowGet);
                }
                else
                {
                    return Json(new { status = false, message = "Device does not exists." }, JsonRequestBehavior.AllowGet);
                }
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }
        public JsonResult GetReturnDevices()
        {
            try
            {
                var ReturnDevices = db.ReturnNGs.ToList();

                return Json(new {status = true, ReturnDevices}, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new {status = false , message = ex.Message}, JsonRequestBehavior.AllowGet);
            }
        }
        public JsonResult GetReturnDevice(int Id)
        {
            try
            {
                var ReturnDevice = db.ReturnNGs.FirstOrDefault(d => d.Id == Id);
                if(ReturnDevice != null)
                {
                    return Json(new { status = true, ReturnDevice }, JsonRequestBehavior.AllowGet);
                }
                else
                {
                    return Json(new { status = false, message = "Return NG Device does not exists." }, JsonRequestBehavior.AllowGet);
                }
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        //[HttpPost]
        //public JsonResult NewReturnNG(ReturnNG returnNG)
        //{
        //    try
        //    {
        //        var device = db.Devices.FirstOrDefault(d => d.Id == returnNG.IdDevice);
        //        if (device != null)
        //        {
        //            if(returnNG.Quantity > 0 && returnNG.Quantity <= device.RealQty) {

        //            }
        //        }
        //    }
        //    catch (Exception ex)
        //    {
        //        Json(new { status = false, message = ex.Message });
        //    }
        //}
    }
}