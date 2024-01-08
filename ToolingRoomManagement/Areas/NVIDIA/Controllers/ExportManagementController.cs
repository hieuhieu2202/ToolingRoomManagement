using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Web;
using System.Web.Mvc;
using ToolingRoomManagement.Areas.NVIDIA.Entities;

namespace ToolingRoomManagement.Areas.NVIDIA.Controllers
{
    public class ExportManagementController : Controller
    {
        ToolingRoomEntities db = new ToolingRoomEntities();
        // GET: NVIDIA/ReturnDevice
        public ActionResult Management()
        {
            return View();
        }

        [HttpGet]
        public JsonResult GetWarehouses()
        {
            try
            {
                var warehouses = db.Warehouses.Select(w => new
                {
                    w.Id,
                    w.WarehouseName,
                }).ToList();

                return Json(new { status = true, warehouses }, JsonRequestBehavior.AllowGet);
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
                var roles = db.Roles.Where(u => u.RoleName != "admin").ToList();
                var users = db.Users.Where(u => u.Username != "admin").ToList();

                return Json(new { status = true, users, roles }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }
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

        public JsonResult GetExports()
        {
            try
            {
                var exports = db.Exports.ToList();

                return Json(new { status = true, exports }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }
        public JsonResult GetExport(int Id)
        {
            try
            {
                var export = db.Exports.FirstOrDefault(d => d.Id == Id);
                if (export != null)
                {
                    return Json(new { status = true, export }, JsonRequestBehavior.AllowGet);
                }
                else
                {
                    return Json(new { status = false, message = "Export request does not exists." }, JsonRequestBehavior.AllowGet);
                }
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        [HttpPost]
        public JsonResult NewExport(Export exportdata)
        {
            try
            {
                var user = db.Users.FirstOrDefault(u => u.Username == exportdata.User.Username);
                if (user != null)
                {
                    var export = new Export
                    {
                        CreatedDate = exportdata.CreatedDate,
                        IdUser = user.Id,
                        Note = exportdata.Note,
                        Status = "Pending",
                        Type = exportdata.Type,
                    };                   

                    foreach (var exportdevice in exportdata.ExportDevices)
                    {
                        var device = db.Devices.FirstOrDefault(d => d.Id == exportdevice.IdDevice);
                        if (device != null)
                        {
                            var exportDevice = new ExportDevice
                            {
                                IdExport = export.Id,
                                IdDevice = device.Id,
                                ExportQuantity = exportdevice.ExportQuantity,
                            };
                            //db.ExportDevices.Add(exportDevice);
                            exportDevice.Device = device;
                            export.ExportDevices.Add(exportDevice);
                        }
                    }

                    foreach (var userexportsign in exportdata.UserExportSigns)
                    {
                        var usersign = db.Users.FirstOrDefault(u => u.Id == userexportsign.IdUser);
                        if (usersign != null)
                        {
                            var userExportSign = new UserExportSign
                            {
                                IdExport = export.Id,
                                IdUser = user.Id,
                                SignOrder = userexportsign.SignOrder,
                                Status = (userexportsign.SignOrder == 1) ? "Pending" : "Waitting"
                            };
                            //db.UserExportSigns.Add(userExportSign);
                            userExportSign.User = usersign;
                            export.UserExportSigns.Add(userExportSign);
                        }
                    }

                    export.User = user;

                    db.Exports.Add(export);
                    db.SaveChanges();
                    return Json(new { status = true, export });
                }
                else
                {
                    return Json(new { status = false, message = "User does not exists." });
                }
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message });
            }
        }
    }
}