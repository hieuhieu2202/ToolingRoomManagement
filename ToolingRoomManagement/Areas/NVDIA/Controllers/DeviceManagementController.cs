using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using ToolingRoomManagement.Areas.NVDIA.Entities;
using OfficeOpenXml;
using OfficeOpenXml.FormulaParsing.Excel.Functions.Math;
using Microsoft.SqlServer.Server;
using System.Globalization;
using System.Data.Entity;
using System.Data.Entity.Migrations;
using ToolingRoomManagement.Models;

namespace ToolingRoomManagement.Areas.NVDIA.Controllers
{
    public class DeviceManagementController : Controller
    {
        ToolingRoomEntities db = new ToolingRoomEntities();
        // GET: NVDIA/DeviceManagement
        [HttpGet]
        public ActionResult AddDeviceAuto()
        {
            return View();
        }
        [HttpPost]
        public JsonResult AddDeviceAuto(HttpPostedFileBase file, int IdWareHouse)
        {
            try
            {
                List<Entities.Model> models = db.Models.ToList();
                List<Entities.Group> groups = db.Groups.ToList();
                List<Entities.Station> stations = db.Stations.ToList();
                List<Entities.Vendor> vendors = db.Vendors.ToList();
                List<Entities.Device> devices = db.Devices.ToList();
                
                return Json(new { status = true, devices, models, groups, stations, vendors });
                //if (file != null && file.ContentLength > 0)
                //{

                //    using (var db = new ToolingRoomEntities())
                //    using (var package = new ExcelPackage(file.InputStream))
                //    {
                //        var worksheet = package.Workbook.Worksheets[1];

                //        List<Entities.Device> devices = new List<Entities.Device>();

                //        foreach (int row in Enumerable.Range(2, worksheet.Dimension.End.Row - 1))
                //        {
                //            string deviceCode = worksheet.Cells[row, 10].Value?.ToString();
                //            if (string.IsNullOrEmpty(deviceCode)) continue;

                //            Entities.Device device = db.Devices.FirstOrDefault(d => d.DeviceCode == deviceCode);
                //            if (device == null)
                //            {
                //                device = new Entities.Device();
                //                #region Group
                //                var groupName = worksheet.Cells[row, 12].Value?.ToString();

                //                if (!string.IsNullOrEmpty(groupName))
                //                {
                //                    Entities.Group group = db.Groups.FirstOrDefault(g => g.GroupName == groupName);
                //                    if (group == null)
                //                    {
                //                        group = new Entities.Group { GroupName = groupName };
                //                        db.Groups.Add(group);
                //                    }
                //                    device.IdGroup = group.Id;
                //                    device.Group = group;
                //                }
                //                #endregion

                //                #region Vendor
                //                var vendorName = worksheet.Cells[row, 13].Value?.ToString();
                //                if (!string.IsNullOrEmpty(vendorName))
                //                {
                //                    Entities.Vendor vendor = db.Vendors.FirstOrDefault(v => v.VendorName == vendorName);
                //                    if (vendor == null)
                //                    {
                //                        vendor = new Entities.Vendor { VendorName = vendorName };
                //                        db.Vendors.Add(vendor);
                //                    }
                //                    device.IdVendor = vendor.Id;
                //                    device.Vendor = vendor;
                //                }
                //                #endregion

                //                #region Product
                //                var productName = worksheet.Cells[row, 1].Value?.ToString();
                //                var productMTS = worksheet.Cells[row, 2].Value?.ToString();
                //                if (!string.IsNullOrEmpty(productName) || !string.IsNullOrEmpty(productMTS))
                //                {
                //                    Entities.Product product = db.Products.FirstOrDefault(p => p.ProductName == productName);
                //                    if (product == null)
                //                    {
                //                        product = new Entities.Product
                //                        {
                //                            ProductName = productName,
                //                            MTS = productMTS
                //                        };
                //                        db.Products.Add(product);
                //                    }
                //                }
                //                #endregion

                //                #region Model
                //                var modelName = worksheet.Cells[row, 22].Value?.ToString();
                //                if (!string.IsNullOrEmpty(modelName))
                //                {
                //                    Entities.Model model = db.Models.FirstOrDefault(m => m.ModelName == modelName);
                //                    if (model == null)
                //                    {
                //                        model = new Entities.Model { ModelName = modelName };
                //                        db.Models.Add(model);
                //                    }
                //                }
                //                #endregion

                //                #region Station
                //                var stationName = worksheet.Cells[row, 23].Value?.ToString();
                //                if (!string.IsNullOrEmpty(stationName))
                //                {
                //                    Entities.Station station = db.Stations.FirstOrDefault(s => s.StationName == stationName);
                //                    if (station == null)
                //                    {
                //                        station = new Entities.Station { StationName = stationName };
                //                        db.Stations.Add(station);
                //                    }
                //                }
                //                #endregion

                //                #region Device
                //                DateTime deviceDate = DateTime.TryParseExact(worksheet.Cells[row, 15].Value?.ToString(), "M/d/yyyy h:mm:ss tt", CultureInfo.InvariantCulture, DateTimeStyles.None, out deviceDate) ? deviceDate : DateTime.Now;
                //                double deviceBuffer = double.TryParse(worksheet.Cells[row, 30].Value?.ToString(), out deviceBuffer) ? deviceBuffer : 0;


                //                device.DeviceCode = deviceCode;
                //                device.DeviceName = worksheet.Cells[row, 11].Value?.ToString();
                //                device.DeviceDate = deviceDate;
                //                device.Buffer = deviceBuffer;
                //                device.Quantity = 0;
                //                device.Type = worksheet.Cells[row, 29].Value.ToString();
                //                device.Status = "Pending";
                //                device.IdWareHouse = IdWareHouse;
                //                device.CreatedDate = DateTime.Now;

                //                int deviceQty = int.TryParse(worksheet.Cells[row, 14].Value?.ToString(), out deviceQty) ? deviceQty : 0;
                //                int stationQty = int.TryParse(worksheet.Cells[row, 26].Value?.ToString(), out stationQty) ? stationQty : 0;
                //                device.Quantity = (int)Math.Ceiling((double)(deviceQty * stationQty * (1 + device.Buffer)));
                //                #endregion

                //                devices.Add(device);
                //                db.Devices.Add(device);
                //            }
                //            else
                //            {
                //                int deviceQty = int.TryParse(worksheet.Cells[row, 14].Value?.ToString(), out deviceQty) ? deviceQty : 0;
                //                int stationQty = int.TryParse(worksheet.Cells[row, 26].Value?.ToString(), out stationQty) ? stationQty : 0;
                //                device.Quantity += (int)Math.Ceiling((double)(deviceQty * stationQty * (1 + device.Buffer)));
                //                device.Status = "Pending";

                //                devices.Add(device);
                //                db.Devices.AddOrUpdate(device);
                //            }

                //            db.SaveChanges();
                //        }
                //        return Json(new { status = true, data = devices });
                //    }
                //}
                //else
                //{
                //    return Json(new { status = false, message = "File is empty" });
                //}
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message });
            }
        }

        [HttpPost]
        public JsonResult DeleteDevice(int Id)
        {
            try
            {
                using(ToolingRoomEntities db = new ToolingRoomEntities())
                {
                    Entities.Device device = db.Devices.FirstOrDefault(d => d.Id == Id);

                    if (device != null)
                    {
                        db.Devices.Remove(device);
                        db.SaveChanges();
                        return Json(new { status = true });
                    }
                    else
                    {
                        return Json(new { status = false, message = "Device not found." });
                    }
                }
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message });
            }
        }

        [HttpPost]
        public JsonResult GetDevice(int Id)
        {
            try
            {
                List<Entities.Warehouse> warehouses = db.Warehouses.ToList();
                List<Entities.Model> models = db.Models.ToList();
                List<Entities.Group> groups = db.Groups.ToList();
                List<Entities.Vendor> vendors = db.Vendors.ToList();
                Entities.Device device = db.Devices.FirstOrDefault(d => d.Id == Id);

                if (device != null)
                {
                    return Json(new { status = true, device, warehouses, models, groups, vendors });
                }
                else
                {
                    return Json(new { status = false, message = "Device not found." });
                }
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message });
            }
        }

        [HttpPost]
        public JsonResult UpdateDevice(Device device)
        {
            try
            {
                if (device != null)
                {
                    db.Devices.AddOrUpdate(device);
                    db.SaveChanges();

                    Entities.Device rDevice = db.Devices.FirstOrDefault(d => d.Id == device.Id);

                    return Json(new { status = true, device = rDevice});
                }
                else
                {
                    return Json(new { status = false, message = "Device not found." });
                }
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message });
            }
        }

    }
}