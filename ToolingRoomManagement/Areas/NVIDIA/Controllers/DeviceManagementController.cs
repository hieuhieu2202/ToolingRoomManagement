using Model.EF;
using OfficeOpenXml;
using OfficeOpenXml.Style;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data.Entity.Migrations;
using System.Drawing;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Text.Json;
using System.Web;
using System.Web.Mvc;
using System.Web.Services.Description;
using ToolingRoomManagement.Areas.NVIDIA.Entities;
using ToolingRoomManagement.Attributes;

namespace ToolingRoomManagement.Areas.NVIDIA.Controllers
{
    [Authentication]
    public class DeviceManagementController : Controller
    {
        ToolingRoomEntities db = new ToolingRoomEntities();

        // GET: Add Device Manual
        [HttpGet]
        public ActionResult AddDeviceManual()
        {
            return View();
        }
        [HttpPost]
        public JsonResult AddDeviceManual(FormCollection form)
        {
            try
            {
                Entities.Device device = new Entities.Device
                {
                    DeviceCode = form["PN"],
                    DeviceName = form["Description"],
                    Relation = form["Relation"],
                    ACC_KIT = form["ACCKIT"],
                    Type = form["Type"],
                    Status = form["Status"],
                    Specification = form["Specification"],
                    Unit = form["Unit"],
                    DeliveryTime = form["DeliveryTime"],
                };
                int dIdWarehouse = int.TryParse(form["Warehouse"], out dIdWarehouse) ? dIdWarehouse : 0;

                device.IdWareHouse = dIdWarehouse;

                double dBuffer = double.TryParse(form["Buffer"], out dBuffer) ? dBuffer : 0;
                device.Buffer = dBuffer / 100;

                int dLifeCycle = int.TryParse(form["LifeCycle"], out dLifeCycle) ? dLifeCycle : 0;
                device.LifeCycle = dLifeCycle;

                int dForcast = int.TryParse(form["Forcast"], out dForcast) ? dForcast : 0;
                device.Forcast = dForcast;

                int dQuantity = int.TryParse(form["Quantity"], out dQuantity) ? dQuantity : 0;
                device.Quantity = dQuantity;

                int dQtyConfirm = int.TryParse(form["Quantity"], out dQtyConfirm) ? dQtyConfirm : 0;
                device.QtyConfirm = dQtyConfirm;

                int dMinQty = int.TryParse(form["MinQuantity"], out dMinQty) ? dMinQty : 0;
                device.MinQty = dMinQty;

                int dPOQty = int.TryParse(form["POQuantity"], out dPOQty) ? dPOQty : 0;
                device.POQty = dPOQty;

                string dProductName = form["Product"];
                string dModelName = form["Model"];
                string dStationName = form["Station"];
                string dGroupName = form["Group"];
                string dVendorName = form["Vendor"];

                Entities.Product product = db.Products.FirstOrDefault(p => p.ProductName == dProductName);
                Entities.Model model = db.Models.FirstOrDefault(p => p.ModelName == dModelName);
                Entities.Station station = db.Stations.FirstOrDefault(p => p.StationName == dStationName);
                Entities.Group group = db.Groups.FirstOrDefault(p => p.GroupName == dGroupName);
                Entities.Vendor vendor = db.Vendors.FirstOrDefault(p => p.VendorName == dVendorName);

                // Add & Create Product
                if (product == null)
                {
                    product = new Entities.Product { ProductName = dProductName };
                    db.Products.Add(product);
                }
                device.IdProduct = product.Id;

                // Add & Create Model
                if (model == null)
                {
                    model = new Entities.Model { ModelName = dModelName };
                    db.Models.Add(model);
                }
                device.IdModel = model.Id;

                // Add & Create Station
                if (station == null)
                {
                    station = new Entities.Station { StationName = dStationName };
                    db.Stations.Add(station);
                }
                device.IdStation = station.Id;

                // Add & Create Group
                if (group == null)
                {
                    group = new Entities.Group { GroupName = dGroupName };
                    db.Groups.Add(group);
                }
                device.IdGroup = group.Id;

                // Add & Create Vendor
                if (vendor == null)
                {
                    vendor = new Entities.Vendor { VendorName = dVendorName };
                    db.Vendors.Add(vendor);
                }
                device.IdVendor = vendor.Id;

                DateTime dDeviceDate = DateTime.TryParse(form["Createddate"], out dDeviceDate) ? dDeviceDate : DateTime.Now;
                device.DeviceDate = dDeviceDate;

                device.CreatedDate = DateTime.Now;
                device.RealQty = dQtyConfirm;
                device.SysQuantity = dQtyConfirm;

                device.Status = Data.Common.CheckStatus(device);

                db.Devices.Add(device);

                // Create Layout
                if (form["Layout"] != null)
                {
                    var IdLayouts = form["Layout"].Split(',').Select(Int32.Parse).ToArray();

                    foreach (var IdLayout in IdLayouts)
                    {
                        if (!db.DeviceWarehouseLayouts.Any(l => l.IdDevice == device.Id && l.IdWarehouseLayout == IdLayout))
                        {
                            DeviceWarehouseLayout layout = new DeviceWarehouseLayout
                            {
                                IdDevice = device.Id,
                                IdWarehouseLayout = IdLayout
                            };
                            db.DeviceWarehouseLayouts.Add(layout);
                        }
                    }
                }

                db.SaveChanges();
                // Images
                var files = Request.Files;

                if (Request.Files.Count > 0)
                {
                    for (int i = 0; i < Request.Files.Count; i++)
                    {
                        HttpPostedFileBase imagefile = Request.Files[i];
                        var imagePath = SaveImage(imagefile, device);
                        if (string.IsNullOrEmpty(device.ImagePath))
                        {
                            device.ImagePath = imagePath;
                        }
                    }
                }

                db.SaveChanges();
                return Json(new { status = true });
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message });
            }
        }
        private string SaveImage(HttpPostedFileBase file, Entities.Device device)
        {
            try
            {
                var fileName = Path.GetFileNameWithoutExtension(file.FileName);
                var fileExtention = Path.GetExtension(file.FileName);

                var folderPath = Server.MapPath($"~/Data/NewToolingRoom/DeviceImages/{device.Id}");
                if (!Directory.Exists(folderPath)) Directory.CreateDirectory(folderPath);

                var savePath = Path.Combine(folderPath, $"{fileName} - {DateTime.Now.ToString("yyyy-MM-dd HH.mm.ss.ff")}{fileExtention}");

                file.SaveAs(savePath);

                return folderPath;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        // GET: Device Management

        [HttpGet]
        public JsonResult GetDevicesBOM()
        {
            try
            {
                List<Entities.DeviceBOM> deviceBOMs = db.DeviceBOMs.ToList();

                return Json(new { status = true, data = deviceBOMs }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        [HttpGet]
        public ActionResult DeviceManagement()
        {
            return View();
        }
        [HttpPost]
        public JsonResult ConfirmDevice(int Id, int QtyConfirm)
        {
            try
            {
                if (Id != 0)
                {
                    var rDevice = db.Devices.FirstOrDefault(d => d.Id == Id);
                    var afterDevice = rDevice;

                    var sQtyConfirm = rDevice.QtyConfirm + QtyConfirm;

                    if (rDevice.Quantity >= sQtyConfirm)
                    {
                        rDevice.QtyConfirm = sQtyConfirm;
                        rDevice.RealQty += QtyConfirm;

                        rDevice.Status = Data.Common.CheckStatus(rDevice);

                        db.Devices.AddOrUpdate(rDevice);
                        db.SaveChanges();

                        //Task SaveLog = Task.Run(() =>
                        //{
                        //    Entities.User user = (Entities.User)Session["SignSession"];
                        //    string path = Server.MapPath("/Areas/NVIDIA/Data/DeviceHistoryLog");
                        //    Data.Common.SaveDeviceHistoryLog(user, afterDevice, rDevice, path);
                        //});

                        return Json(new { status = true, device = rDevice });
                    }
                    else
                    {
                        return Json(new { status = false, message = "Quantity confirm > Quantity" });
                    }
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
        public JsonResult UpdateDevice(Entities.Device device, int[] IdLayouts, string sproduct, string smodel, string sstation, string sgroup, string svendor)
        {
            try
            {
                var afterDevice = device;
                if (db.Devices.Any(d => d.Id == device.Id))
                {
                    if (device.QtyConfirm > device.Quantity || device.RealQty > device.Quantity)
                    {
                        return Json(new { status = false, message = "Quantity confirm or Real Quantity > Quantity." });
                    }

                    if (device.RealQty > device.QtyConfirm)
                    {
                        return Json(new { status = false, message = "Real Quantity > Quantity confirm." });
                    }
                    if (device.Buffer == null) device.Buffer = 0;

                    device.CreatedDate = DateTime.Now;
                    device.Status = Data.Common.CheckStatus(device);
                    device.SysQuantity = device.RealQty - (db.Devices.FirstOrDefault(d => d.Id == device.Id).RealQty - db.Devices.FirstOrDefault(d => d.Id == device.Id).SysQuantity);


                    Entities.Product product = db.Products.FirstOrDefault(p => p.ProductName == sproduct);
                    Entities.Model model = db.Models.FirstOrDefault(p => p.ModelName == smodel);
                    Entities.Station station = db.Stations.FirstOrDefault(p => p.StationName == sstation);
                    Entities.Group group = db.Groups.FirstOrDefault(p => p.GroupName == sgroup);
                    Entities.Vendor vendor = db.Vendors.FirstOrDefault(p => p.VendorName == svendor);


                    // Add & Create Product
                    if (product == null)
                    {
                        product = new Entities.Product { ProductName = sproduct };
                        db.Products.Add(product);
                    }
                    device.IdProduct = product.Id;

                    // Add & Create Model
                    if (model == null)
                    {
                        model = new Entities.Model { ModelName = smodel };
                        db.Models.Add(model);
                    }
                    device.IdModel = model.Id;

                    // Add & Create Station
                    if (station == null)
                    {
                        station = new Entities.Station { StationName = sstation };
                        db.Stations.Add(station);
                    }
                    device.IdStation = station.Id;

                    // Add & Create Group
                    if (group == null)
                    {
                        group = new Entities.Group { GroupName = sgroup };
                        db.Groups.Add(group);
                    }
                    device.IdGroup = group.Id;

                    // Add & Create Vendor
                    if (vendor == null)
                    {
                        vendor = new Entities.Vendor { VendorName = svendor };
                        db.Vendors.Add(vendor);
                    }
                    device.IdVendor = vendor.Id;

                    // Layout
                    List<DeviceWarehouseLayout> deviceWarehouseLayouts = db.DeviceWarehouseLayouts.Where(dl => dl.IdDevice == device.Id).ToList();
                    db.DeviceWarehouseLayouts.RemoveRange(deviceWarehouseLayouts);

                    if (IdLayouts != null)
                    {
                        foreach (var IdLayout in IdLayouts)
                        {
                            DeviceWarehouseLayout deviceWarehouse = new DeviceWarehouseLayout
                            {
                                IdDevice = device.Id,
                                IdWarehouseLayout = IdLayout,
                                WarehouseLayout = db.WarehouseLayouts.FirstOrDefault(wh => wh.Id == IdLayout)
                            };
                            db.DeviceWarehouseLayouts.Add(deviceWarehouse);
                            device.DeviceWarehouseLayouts.Add(deviceWarehouse);
                        }
                    }

                    device.ImagePath = db.Devices.FirstOrDefault(d => d.Id == device.Id).ImagePath;

                    db.Devices.AddOrUpdate(device);
                    db.SaveChanges();

                    return Json(new { status = true, device });
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
        public JsonResult UpdateImage(FormCollection form)
        {
            try
            {
                int id = int.Parse(form["deviceid"]);

                var device = db.Devices.FirstOrDefault(d => d.Id == id);
                if(device != null)
                {
                    var files = Request.Files;
                    if (Request.Files.Count > 0)
                    {
                        for (int i = 0; i < Request.Files.Count; i++)
                        {
                            HttpPostedFileBase imagefile = Request.Files[i];
                            var imagePath = SaveImage(imagefile, device);
                            if (string.IsNullOrEmpty(device.ImagePath))
                            {
                                device.ImagePath = imagePath;
                            }
                        }
                    }

                    db.Devices.AddOrUpdate(device);
                    db.SaveChanges();

                    List<string> images = new List<string>();
                    if (!string.IsNullOrEmpty(device.ImagePath)) images = Directory.GetFiles(device.ImagePath).ToList();

                    return Json(new { status = true, images });
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
        public JsonResult GetWarehouseDevices(int IdWarehouse, int PageNum)
        {
            try
            {
                Entities.Warehouse warehouse = db.Warehouses.FirstOrDefault(w => w.Id == IdWarehouse);

                var skipAmount = 1000 * (PageNum - 1);

                var Devices = db.Devices.Where(d => d.IdWareHouse == warehouse.Id).OrderByDescending(d => d.Id).Skip(skipAmount).Take(1000).ToList();

                //var Devices = db.Devices.Where(d => d.IdWareHouse == warehouse.Id).OrderByDescending(d => d.Id).ToList();

                warehouse.Devices = Devices;
                return Json(new { status = true, warehouse });
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
                using (ToolingRoomEntities db = new ToolingRoomEntities())
                {
                    Entities.Device device = db.Devices.FirstOrDefault(d => d.Id == Id);

                    if (device != null)
                    {
                        if (!string.IsNullOrEmpty(device.ImagePath)){
                            if (Directory.Exists(device.ImagePath))
                            {
                                Directory.Delete(device.ImagePath, true);
                            }
                        }

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
        [HttpGet]
        public JsonResult DeleteImage(string src)
        {
            try
            {
                string filePath = Path.Combine(Server.MapPath(src));

                if (System.IO.File.Exists(filePath))
                {
                    System.IO.File.Delete(filePath);

                    string directoryName = Path.GetDirectoryName(filePath);

                    List<string> images = new List<string>();

                    images = Directory.GetFiles(directoryName).ToList();

                    return Json(new { status = true, images }, JsonRequestBehavior.AllowGet);
                }
                else
                {
                    return Json(new { status = false, message = "File not found." }, JsonRequestBehavior.AllowGet);
                }
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }


        // GET: Add Device Auto
        [HttpGet]
        public ActionResult AddDeviceBOM()
        {
            return View();
        }
        [HttpPost]
        public JsonResult AddDeviceAuto(HttpPostedFileBase file)
        {
            try
            {
                ExcelPackage.LicenseContext = OfficeOpenXml.LicenseContext.NonCommercial;

                if (file != null && file.ContentLength > 0)
                {
                    using (var package = new ExcelPackage(file.InputStream))
                    {
                        List<Entities.DeviceBOM> deviceBOMs = new List<DeviceBOM>();
                        var worksheet = package.Workbook.Worksheets[1];

                        foreach (int row in Enumerable.Range(2, worksheet.Dimension.End.Row - 1))
                        {
                            System.Diagnostics.Debug.WriteLine("Row: " + row);
                            var _productName = worksheet.Cells[row, 1].Value?.ToString();
                            var _productMTS = worksheet.Cells[row, 2].Value?.ToString();
                            var _groupName = worksheet.Cells[row, 12].Value?.ToString();
                            var _vendorName = worksheet.Cells[row, 13].Value?.ToString();
                            var _deviceCode = worksheet.Cells[row, 10].Value?.ToString();
                            var _deviceName = worksheet.Cells[row, 11].Value?.ToString();
                            int _deviceQty = int.TryParse(worksheet.Cells[row, 14].Value?.ToString(), out _deviceQty) ? _deviceQty : 0;
                            int _minQty = int.TryParse(worksheet.Cells[row, 15].Value?.ToString(), out _minQty) ? _minQty : 0;

                            #region Product
                            Entities.ProductBOM product = db.ProductBOMs.FirstOrDefault(p => p.ProductName == _productName && p.MTS == _productMTS);
                            if (product == null)
                            {
                                product = new Entities.ProductBOM
                                {
                                    ProductName = _productName,
                                    MTS = _productMTS
                                };
                                db.ProductBOMs.Add(product);
                            }
                            #endregion

                            #region Device
                            Entities.DeviceBOM device = db.DeviceBOMs.FirstOrDefault(d => d.DeviceCode == _deviceCode);
                            if (device == null)
                            {
                                device = new Entities.DeviceBOM
                                {
                                    DeviceCode = _deviceCode,
                                    DeviceName = _deviceName,
                                    Quantity = _deviceQty,
                                    Group = _groupName,
                                    Vendor = _vendorName,
                                    MinQty = _minQty,
                                };
                                db.DeviceBOMs.Add(device);
                            }
                            else
                            {
                                device.Quantity += _deviceQty;
                                device.MinQty = _minQty;
                            }
                            #endregion

                            #region link
                            Entities.ProductDeviceBOM productDeviceBOM = db.ProductDeviceBOMs.FirstOrDefault(c => c.IdProduct == product.Id && c.IdDevice == device.Id);
                            if (productDeviceBOM == null)
                            {
                                productDeviceBOM = new ProductDeviceBOM
                                {
                                    IdDevice = device.Id,
                                    IdProduct = product.Id,
                                };
                                db.ProductDeviceBOMs.Add(productDeviceBOM);
                                db.SaveChanges();
                            }
                            #endregion
                        }

                        db.SaveChanges();

                        return Json(new { status = true, data = deviceBOMs });
                    }
                }
                else
                {
                    return Json(new { status = false, message = "File is empty" });
                }
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message });
            }
        }
        private Entities.ProductDeviceBOM CreateDevice(ExcelWorksheet worksheet, int row)
        {


            var _productName = worksheet.Cells[row, 1].Value?.ToString();
            var _productMTS = worksheet.Cells[row, 2].Value?.ToString();
            var _groupName = worksheet.Cells[row, 12].Value?.ToString();
            var _vendorName = worksheet.Cells[row, 13].Value?.ToString();
            var _deviceCode = worksheet.Cells[row, 10].Value?.ToString();
            var _deviceName = worksheet.Cells[row, 11].Value?.ToString();
            int _deviceQty = int.TryParse(worksheet.Cells[row, 14].Value?.ToString(), out _deviceQty) ? _deviceQty : 0;


            #region Device
            Entities.DeviceBOM device = db.DeviceBOMs.FirstOrDefault(d => d.DeviceCode == _deviceCode);
            if (device == null)
            {
                device = new Entities.DeviceBOM
                {
                    DeviceCode = _deviceCode,
                    DeviceName = _deviceName,
                    Quantity = _deviceQty,
                    Group = _groupName,
                    Vendor = _vendorName,
                };

            }
            else
            {
                device.Quantity += _deviceQty;
            }
            db.DeviceBOMs.AddOrUpdate(device);
            #endregion

            #region Product
            Entities.ProductBOM product = db.ProductBOMs.FirstOrDefault(p => p.ProductName == _productName && p.MTS == _productMTS);
            if (product == null)
            {
                product = new Entities.ProductBOM
                {
                    ProductName = _productName,
                    MTS = _productMTS
                };
                db.ProductBOMs.Add(product);
            }
            #endregion

            #region link
            if (!db.ProductDeviceBOMs.Any(c => c.IdProduct == product.Id && c.IdDevice == device.Id))
            {
                Entities.ProductDeviceBOM productDeviceBOM = new ProductDeviceBOM
                {
                    IdDevice = device.Id,
                    IdProduct = product.Id,
                };
                db.ProductDeviceBOMs.Add(productDeviceBOM);

                return productDeviceBOM;
            }
            else
            {
                Entities.ProductDeviceBOM productDeviceBOM = db.ProductDeviceBOMs.FirstOrDefault(c => c.IdProduct == product.Id && c.IdDevice == device.Id);

                return productDeviceBOM;

            }
            #endregion
        }

        // GET: COMMON
        [HttpGet]
        public JsonResult GetSelectData()
        {
            try
            {
                db.Configuration.LazyLoadingEnabled = false;

                var warehouses = db.Warehouses.ToList();
                var products = db.Products.OrderBy(m => m.ProductName).ToList();
                var models = db.Models.OrderBy(m => m.ModelName).ToList();
                var stations = db.Stations.OrderBy(m => m.StationName).ToList();
                var groups = db.Groups.OrderBy(m => m.GroupName).ToList();
                var vendors = db.Vendors.OrderBy(m => m.VendorName).ToList();

                return Json(new { status = true, warehouses, products, models, stations, groups, vendors }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }
        [HttpPost]
        public JsonResult GetDevice(int Id)
        {
            try
            {
                Entities.Device device = db.Devices.FirstOrDefault(d => d.Id == Id);

                // Get All Borrow Of Device
                List<Entities.BorrowDevice> borrowDevices = db.BorrowDevices.Where(b => b.IdDevice == Id).ToList();
                List<Entities.Borrow> borrows = new List<Borrow>();
                foreach (var borrowdevice in borrowDevices)
                {
                    Entities.Borrow borrow = db.Borrows.FirstOrDefault(b => b.Id == borrowdevice.IdBorrow);

                    if (!borrows.Any(bl => bl.Id == borrow.Id))
                    {
                        borrows.Add(borrow);
                    }
                }
                // Get Warehouse by layout
                List<Entities.Warehouse> warehouses = new List<Warehouse>();
                foreach (var dwl in device.DeviceWarehouseLayouts)
                {

                    Entities.WarehouseLayout layout = dwl.WarehouseLayout;
                    Entities.Warehouse warehouse = db.Warehouses.FirstOrDefault(w => w.Id == layout.IdWareHouse);
                    warehouses.Add(warehouse);
                }
                foreach (var warehouse in warehouses)
                {
                    warehouse.Devices.Clear();
                    warehouse.UserManager.Password = "";
                    warehouse.WarehouseLayouts.Clear();
                }



                if (device != null)
                {
                    List<string> images = new List<string>();
                    if (!string.IsNullOrEmpty(device.ImagePath)) images = Directory.GetFiles(device.ImagePath).ToList();

                    return Json(new { status = true, device, borrows = JsonSerializer.Serialize(borrows), warehouses, images });
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
        public JsonResult GetWarehouseLayouts(int IdWarehouse)
        {
            try
            {
                Warehouse warehouse = db.Warehouses.FirstOrDefault(w => w.Id == IdWarehouse);

                if (warehouse != null)
                {
                    return Json(new { status = true, layouts = warehouse.WarehouseLayouts }, JsonRequestBehavior.AllowGet);
                }
                else
                {
                    return Json(new { status = false, message = "Warehouse is empty." }, JsonRequestBehavior.AllowGet);
                }
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message });
            }
        }

        // GET: Export Excel
        public ActionResult ExportExcel()
        {
            try
            {
                ExcelPackage.LicenseContext = OfficeOpenXml.LicenseContext.NonCommercial;

                string fileName = $"Devices - {DateTime.Now.ToString("yyyy.MM.dd HH.mm.ss.ff")}.xlsx";
                string folderPath = Server.MapPath("/Data/NewToolingroom");
                string filePath = Path.Combine(folderPath, fileName);

                #region Check Folder
                if (!Directory.Exists(folderPath))
                {
                    Directory.CreateDirectory(folderPath);
                }
                else
                {
                    foreach (string file in Directory.GetFiles(folderPath))
                    {
                        System.IO.File.Delete(file);
                    }
                }
                #endregion

                List<Entities.Device> devices = db.Devices.ToList();

                using (var DevicesExcel = new ExcelPackage(filePath))
                {
                    var worksheet = DevicesExcel.Workbook.Worksheets.Add("Devices");


                    #region Sheet Style
                    worksheet.Cells.Style.Font.Name = "Calibri";
                    worksheet.Cells.Style.Font.Size = 12;
                    worksheet.Cells.Style.Fill.PatternType = ExcelFillStyle.Solid;
                    worksheet.Cells.Style.Fill.BackgroundColor.SetColor(Color.Transparent);
                    worksheet.Cells.Style.VerticalAlignment = ExcelVerticalAlignment.Center;
                    worksheet.Cells.Style.HorizontalAlignment = ExcelHorizontalAlignment.Left;
                    #endregion

                    #region Header
                    // Style
                    {
                        ExcelRange cell = worksheet.Cells["A1:K1"];
                        cell.Merge = true;
                        cell.Value = "";
                        cell.Style.Fill.PatternType = ExcelFillStyle.Solid;
                        cell.Style.Fill.BackgroundColor.SetColor(Color.DodgerBlue);
                        cell.Style.Font.Size = 16;
                        cell.Style.Font.Color.SetColor(Color.White);
                        cell.Style.Font.Bold = true;
                        cell.Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                        cell.Style.Border.BorderAround(ExcelBorderStyle.Thin, Color.Black);
                    }

                    #endregion


                    DevicesExcel.Save();
                    return File(filePath, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
                }
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message });
            }
        }

        #region Device Unconfirm
        [HttpGet]
        public ActionResult DeviceConfirm()
        {
            return View();
        }
        [HttpPost]
        public JsonResult AddDeviceUnconfirm(HttpPostedFileBase file)
        {
            try
            {
                ExcelPackage.LicenseContext = OfficeOpenXml.LicenseContext.NonCommercial;

                if (file != null && file.ContentLength > 0)
                {
                    using (var package = new ExcelPackage(file.InputStream))
                    {
                        var worksheet = package.Workbook.Worksheets[1];

                        List<Entities.DeviceUnconfirm> devices = new List<Entities.DeviceUnconfirm>();

                        foreach (int row in Enumerable.Range(2, worksheet.Dimension.End.Row - 1))
                        {
                            var deviceCode = worksheet.Cells[row, 10].Value?.ToString();
                            if (string.IsNullOrEmpty(deviceCode)) continue;


                            // Create device in row excel
                            Entities.DeviceUnconfirm device = CreateDeviceUnconfirm(worksheet, row);

                            // Get device in db to check
                            var dbDevice = db.DeviceUnconfirms.FirstOrDefault(d =>
                                d.IdProduct == device.IdProduct &&
                                d.IdModel == device.IdModel &&
                                d.IdStation == device.IdStation &&
                                d.IdGroup == device.IdGroup &&
                                d.IdVendor == device.IdVendor &&
                                d.DeviceCode == device.DeviceCode &&
                                d.DeviceName == device.DeviceName);
                            // 1. Chưa có => tạo mới                           
                            if (dbDevice == null)
                            {
                                devices.Add(device);
                                db.DeviceUnconfirms.Add(device);
                                db.SaveChanges();
                            }
                            // 2. Đã có
                            else
                            {
                                // device after change
                                var iDevice = devices.FirstOrDefault(d => d.Id == dbDevice.Id);

                                if (iDevice != null)
                                {
                                    iDevice.Quantity = dbDevice.Quantity;
                                    iDevice.Status = dbDevice.Status;
                                }
                                else
                                {
                                    iDevice = dbDevice;
                                    iDevice.Status = dbDevice.Status;

                                    devices.Add(iDevice);
                                }

                                // Change in DB
                                int? qty = dbDevice.Quantity + device.Quantity;
                                dbDevice.Quantity = qty;
                                device.Quantity = qty;

                                db.DeviceUnconfirms.AddOrUpdate(dbDevice);
                                db.SaveChanges();
                            }

                        }


                        return Json(new { status = true, devices });
                    }
                }
                else
                {
                    return Json(new { status = false, message = "File is empty" });
                }
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message });
            }
        }
        private Entities.DeviceUnconfirm CreateDeviceUnconfirm(ExcelWorksheet worksheet, int row)
        {
            Entities.DeviceUnconfirm device = new Entities.DeviceUnconfirm();

            // Lấy các giá trị từ worksheet
            var productName = worksheet.Cells[row, 1].Value?.ToString();
            var productMTS = worksheet.Cells[row, 2].Value?.ToString();
            var modelName = worksheet.Cells[row, 22].Value?.ToString();
            var stationName = worksheet.Cells[row, 23].Value?.ToString();
            var groupName = worksheet.Cells[row, 12].Value?.ToString();
            var vendorName = worksheet.Cells[row, 13].Value?.ToString();
            var deviceCode = worksheet.Cells[row, 10].Value?.ToString();
            var deviceName = worksheet.Cells[row, 11].Value?.ToString();
            var ACC_KIT = worksheet.Cells[row, 17].Value?.ToString();
            var relation = worksheet.Cells[row, 18].Value?.ToString();

            // Lấy các giá trị khác từ worksheet
            DateTime deviceDate = DateTime.TryParseExact(worksheet.Cells[row, 15].Value?.ToString(), "M/d/yyyy h:mm:ss tt", CultureInfo.InvariantCulture, DateTimeStyles.None, out deviceDate) ? deviceDate : DateTime.Now;
            double deviceBuffer = double.TryParse(worksheet.Cells[row, 30].Value?.ToString(), out deviceBuffer) ? deviceBuffer : 0;
            double forcast = double.TryParse(worksheet.Cells[row, 27].Value?.ToString(), out forcast) ? forcast : 0;

            string deviceType = worksheet.Cells[row, 29].Value?.ToString();

            int deviceQty = int.TryParse(worksheet.Cells[row, 14].Value?.ToString(), out deviceQty) ? deviceQty : 0;
            int stationQty = int.TryParse(worksheet.Cells[row, 26].Value?.ToString(), out stationQty) ? stationQty : 0;
            int lifeCycle = int.TryParse(worksheet.Cells[row, 28].Value?.ToString(), out lifeCycle) ? lifeCycle : 0;


            #region Product
            Entities.Product product = db.Products.FirstOrDefault(p => p.ProductName == productName && p.MTS == productMTS);
            if (product == null)
            {
                product = new Entities.Product
                {
                    ProductName = productName,
                    MTS = productMTS
                };
                db.Products.Add(product);
            }
            device.IdProduct = product.Id;
            device.Product = product;
            #endregion

            #region Model
            Entities.Model model = db.Models.FirstOrDefault(m => m.ModelName == modelName);
            if (model == null)
            {
                model = new Entities.Model { ModelName = modelName };
                db.Models.Add(model);
            }
            device.IdModel = model.Id;
            device.Model = model;
            #endregion

            #region Station
            Entities.Station station = db.Stations.FirstOrDefault(s => s.StationName == stationName);
            if (station == null)
            {
                station = new Entities.Station { StationName = stationName };
                db.Stations.Add(station);
            }
            device.IdStation = station.Id;
            device.Station = station;
            #endregion

            #region Group
            Entities.Group group = db.Groups.FirstOrDefault(g => g.GroupName == groupName);
            if (group == null)
            {
                group = new Entities.Group { GroupName = groupName };
                db.Groups.Add(group);
            }
            device.IdGroup = group.Id;
            device.Group = group;
            #endregion

            #region Vendor
            Entities.Vendor vendor = db.Vendors.FirstOrDefault(v => v.VendorName == vendorName);
            if (vendor == null)
            {
                vendor = new Entities.Vendor { VendorName = vendorName };
                db.Vendors.Add(vendor);
            }
            device.IdVendor = vendor.Id;
            device.Vendor = vendor;
            #endregion

            #region Device
            device.DeviceCode = deviceCode;
            device.DeviceName = deviceName;
            device.DeviceDate = deviceDate;
            device.Buffer = deviceBuffer;
            device.ACC_KIT = ACC_KIT;
            device.Relation = relation;
            device.Quantity = 0;
            device.Type = deviceType;
            device.Status = "Unconfirmed";
            device.CreatedDate = DateTime.Now;
            device.LifeCycle = lifeCycle;
            device.Forcast = forcast;
            device.QtyConfirm = 0;
            device.RealQty = 0;

            if (device.Type == "D")
            {
                double cal = (double)(device.Forcast * 1000 / device.LifeCycle);
                if (cal < stationQty)
                {
                    device.Quantity = stationQty;
                }
                else
                {
                    device.Quantity = (int)Math.Ceiling(cal);
                }
            }
            else if (device.Type == "S")
            {
                device.Quantity = (int)Math.Ceiling((double)(deviceQty * stationQty * (1 + deviceBuffer)));
            }

            #endregion

            return device;
        }
        #endregion

        // POST: Upload
        public ActionResult UploadFile(HttpPostedFileBase file)
        {
            try
            {
                ExcelPackage.LicenseContext = OfficeOpenXml.LicenseContext.NonCommercial;

                if (file != null && file.ContentLength > 0)
                {
                    string fileName = $"Devices - {DateTime.Now.ToString("yyyy.MM.dd HH.mm.ss.ff")}.xlsx";
                    string folderPath = Server.MapPath("/Data/NewToolingroom");
                    string filePath = Path.Combine(folderPath, fileName);

                    #region Check Folder
                    if (!Directory.Exists(folderPath))
                    {
                        Directory.CreateDirectory(folderPath);
                    }
                    else
                    {
                        foreach (string fileii in Directory.GetFiles(folderPath))
                        {
                            System.IO.File.Delete(fileii);
                        }
                    }
                    #endregion

                    //var bg_light_danger = (System.Drawing.Color)System.Windows.Media.ColorConverter.ConvertFromString("#ffc7ce");
                    //var text_danger = (System.Drawing.Color)System.Windows.Media.ColorConverter.ConvertFromString("#9c0006");

                    //var bg_light_success = (System.Drawing.Color)System.Windows.Media.ColorConverter.ConvertFromString("#c6efce");
                    //var text_success = (System.Drawing.Color)System.Windows.Media.ColorConverter.ConvertFromString("#006100");

                    using (var outputPackage = new ExcelPackage(filePath))
                    using (var package = new ExcelPackage(file.InputStream))
                    {
                        var outWorksheet = outputPackage.Workbook.Worksheets.Add("Inventory");
                        var worksheet = package.Workbook.Worksheets[0];

                        //header
                        outWorksheet.Cells[1, 1].Value = "MTS"; //
                        outWorksheet.Cells[1, 2].Value = "MTS Details"; //
                        outWorksheet.Cells[1, 3].Value = "Product"; //
                        outWorksheet.Cells[1, 4].Value = "Model"; //
                        outWorksheet.Cells[1, 5].Value = "Station"; //

                        outWorksheet.Cells[1, 6].Value = "PN";                       
                        outWorksheet.Cells[1, 7].Value = "Description";

                        outWorksheet.Cells[1, 8].Value = "Group"; //
                        outWorksheet.Cells[1, 90].Value = "Vendor"; //
                        outWorksheet.Cells[1, 10].Value = "Buffer"; //

                        outWorksheet.Cells[1, 11].Value = "Dynamic/Static"; //

                        outWorksheet.Cells[1, 12].Value = "Quantity";

                        outWorksheet.Cells[1, 13].Value = "Relation"; //

                        outWorksheet.Cells[1, 14].Value = "Request";
                        outWorksheet.Cells[1, 15].Value = "Default Min Quantity";
                        outWorksheet.Cells[1, 16].Value = "GAP";

                        outWorksheet.Cells[1, 17].Value = "MOQ"; //
                        outWorksheet.Cells[1, 18].Value = "Life Cycle"; //

                        outWorksheet.Cells[1, 19].Value = "Risk";

                        outWorksheet.Cells["A1:S1"].Style.Border.Bottom.Style = ExcelBorderStyle.Thin;
                        outWorksheet.Cells["A1:S1"].Style.Border.Top.Style = ExcelBorderStyle.Thin;
                        outWorksheet.Cells["A1:S1"].Style.Border.Left.Style = ExcelBorderStyle.Thin;
                        outWorksheet.Cells["A1:S1"].Style.Border.Right.Style = ExcelBorderStyle.Thin;
                        outWorksheet.Cells["A1:S1"].Style.Font.Bold = true;

                        foreach (int row in Enumerable.Range(2, worksheet.Dimension.End.Row - 1))
                        {
                            var _PN = worksheet.Cells[row, 1].Value?.ToString();
                            var _RequestQty = int.Parse(worksheet.Cells[row, 2].Value?.ToString());

                            var devices = db.Devices.Where(d => d.DeviceCode.ToLower().Trim() == _PN.ToLower().Trim()).ToList();
                            if (devices.Count > 0)
                            {
                                string deviceName = "";
                                int qtyConfirm = 0;
                                int minQty = 0;

                                foreach (var _device in devices)
                                {
                                    deviceName = _device.DeviceName;
                                    qtyConfirm += _device.QtyConfirm ?? 0;
                                    minQty = _device.MinQty ?? 0;
                                }

                                var device = devices.First();

                                outWorksheet.Cells[row, 1].Value = device.Product == null ? "" : device.Product.MTS;
                                outWorksheet.Cells[row, 2].Value = "";
                                outWorksheet.Cells[row, 3].Value = device.Product == null ? "" : device.Product.ProductName;
                                outWorksheet.Cells[row, 4].Value = device.Model == null ? "" : device.Model.ModelName;
                                outWorksheet.Cells[row, 5].Value = device.Station == null ? "" : device.Station.StationName;

                                outWorksheet.Cells[row, 6].Value = _PN;
                                outWorksheet.Cells[row, 7].Value = device.DeviceName;

                                outWorksheet.Cells[row, 8].Value = device.Group == null ? "" : device.Group.GroupName;
                                outWorksheet.Cells[row, 9].Value = device.Vendor == null ? "" : device.Vendor.VendorName;
                                outWorksheet.Cells[row, 10].Value = device.Buffer == null ? "" : device.Buffer.ToString();

                                outWorksheet.Cells[row, 11].Value = device.Type != "D" ? "S" : "D";
                                outWorksheet.Cells[row, 12].Value = qtyConfirm;
                                outWorksheet.Cells[row, 13].Value = device.Relation == null ? "" : device.Relation;

                                outWorksheet.Cells[row, 14].Value = _RequestQty;
                                outWorksheet.Cells[row, 15].Value = minQty;

                                int gap = qtyConfirm - _RequestQty;
                                outWorksheet.Cells[row, 16].Value = gap;

                                outWorksheet.Cells[row, 17].Value = "";
                                outWorksheet.Cells[row, 18].Value = device.LifeCycle == null ? "" : device.LifeCycle.ToString();

                                if (gap > 0 && qtyConfirm > minQty)
                                {
                                    outWorksheet.Cells[row, 19].Value = "Low";

                                    outWorksheet.Cells[$"A{row}:S{row}"].Style.Fill.PatternType = ExcelFillStyle.Solid;
                                    outWorksheet.Cells[$"A{row}:S{row}"].Style.Fill.BackgroundColor.SetColor(Color.LightGreen);
                                    outWorksheet.Cells[$"A{row}:S{row}"].Style.Font.Color.SetColor(Color.DarkGreen);

                                }                           
                                else                        
                                {                           
                                    outWorksheet.Cells[row, 19].Value = "High";
                                                            
                                    outWorksheet.Cells[$"A{row}:S{row}"].Style.Fill.PatternType = ExcelFillStyle.Solid;
                                    outWorksheet.Cells[$"A{row}:S{row}"].Style.Fill.BackgroundColor.SetColor(Color.LightCoral);
                                    outWorksheet.Cells[$"A{row}:S{row}"].Style.Font.Color.SetColor(Color.Maroon);
                                }
                            }
                            else
                            {
                                outWorksheet.Cells[row, 6].Value = _PN;
                                outWorksheet.Cells[row, 14].Value = _RequestQty;

                                outWorksheet.Cells[$"A{row}:S{row}"].Style.Fill.PatternType = ExcelFillStyle.Solid;
                                outWorksheet.Cells[$"A{row}:S{row}"].Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.LightGray);
                            }

                            outWorksheet.Cells[$"A{row}:S{row}"].Style.Border.Bottom.Style = ExcelBorderStyle.Thin;
                            outWorksheet.Cells[$"A{row}:S{row}"].Style.Border.Top.Style = ExcelBorderStyle.Thin;
                            outWorksheet.Cells[$"A{row}:S{row}"].Style.Border.Left.Style = ExcelBorderStyle.Thin;
                            outWorksheet.Cells[$"A{row}:S{row}"].Style.Border.Right.Style = ExcelBorderStyle.Thin;
                        }

                        outWorksheet.Cells[outWorksheet.Dimension.Address].AutoFitColumns();
                        outputPackage.Save();

                        return Json(new { status = true, url = $"/Data/NewToolingroom/{fileName}" });
                    }
                }
                else
                {
                    return Json(new { status = false, message = "File is empty" });
                }
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message });
            }
        }
    }
}