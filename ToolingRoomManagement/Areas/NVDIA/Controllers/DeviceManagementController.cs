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

namespace ToolingRoomManagement.Areas.NVDIA.Controllers
{
    public class DeviceManagementController : Controller
    {
        // GET: NVDIA/DeviceManagement
        [HttpGet]
        public ActionResult AddDeviceAuto()
        {
            return View();
        }
        [HttpPost]
        public JsonResult AddDeviceAuto(HttpPostedFileBase file)
        {
            try
            {
                if (file != null && file.ContentLength > 0)
                {
                    using (var package = new ExcelPackage(file.InputStream))
                    {
                        var worksheet = package.Workbook.Worksheets[0]; // Chọn worksheet muốn đọc

                        List<Entities.Device> devices = new List<Entities.Device>();
                        List<Entities.Product> products = new List<Entities.Product>();
                        List<Entities.Model> models = new List<Entities.Model>();
                        List<Entities.Vendor> vendors = new List<Entities.Vendor>();
                        List<Entities.Group> groups = new List<Entities.Group>();
                        List<Entities.Station> stations = new List<Entities.Station>();

                        using(var db = new ToolingRoomEntities())
                        {
                            for (int row = 1; row <= worksheet.Dimension.End.Row; row++)
                            {
                                Entities.Device device = new Entities.Device();
                                Entities.Product product = new Entities.Product();
                                Entities.Model model = new Entities.Model();
                                Entities.Vendor vendor = new Entities.Vendor();
                                Entities.Group group = new Entities.Group();
                                Entities.Station station = new Entities.Station();

                                #region Product                                
                                product.ProductName = worksheet.Cells[row, 1].Value.ToString();
                                product.MTS = worksheet.Cells[row, 2].Value.ToString();
                                if(!db.Products.Any(p => p.ProductName == product.ProductName))
                                {
                                    db.Products.Add(product);
                                    products.Add(product);
                                }
                                #endregion

                                #region Model
                                model.ModelName = worksheet.Cells[row, 22].Value.ToString();
                                if(!db.Models.Any(m => m.ModelName == model.ModelName))
                                {
                                    db.Models.Add(model);
                                    models.Add(model);
                                }
                                #endregion

                                #region Station
                                station.StationName = worksheet.Cells[row, 23].Value.ToString();
                                if(!db.Stations.Any(s => s.StationName == station.StationName))
                                {
                                    db.Stations.Add(station);
                                    stations.Add(station);
                                }
                                #endregion

                                #region Group
                                group.GroupName = worksheet.Cells[row, 12].Value.ToString();
                                if(!db.Groups.Any(g => g.GroupName == group.GroupName))
                                {
                                    db.Groups.Add(group);
                                    groups.Add(group);
                                }
                                #endregion

                                #region Vendor
                                vendor.VendorName = worksheet.Cells[row, 13].Value.ToString();
                                if(!db.Vendors.Any(v => v.VendorName == vendor.VendorName))
                                {
                                    db.Vendors.Add(vendor);
                                    vendors.Add(vendor);
                                }
                                #endregion

                                db.SaveChanges();

                                device.DeviceCode = worksheet.Cells[row, 10].Value.ToString();
                                device.DeviceName = worksheet.Cells[row, 11].Value.ToString();
                                device.DeviceDate = DateTime.ParseExact(worksheet.Cells[row, 15].Value.ToString(), "M/d/yyyy h:mm:ss tt", CultureInfo.InvariantCulture);
                            }
                        }   
                    }
                }
                else
                {
                    return Json(new { status = false, message = "File is empty" });
                }

                return Json(new { status = true, message = "" });
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message });
            }
        }
    }
}