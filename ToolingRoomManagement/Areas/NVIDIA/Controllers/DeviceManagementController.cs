using OfficeOpenXml;
using OfficeOpenXml.Style;
using System;
using System.Collections.Generic;
using System.Data.Entity.Migrations;
using System.Drawing;
using System.IO;
using System.Linq;
using System.Numerics;
using System.Runtime.CompilerServices;
using System.Text.Json;
using System.Web;
using System.Web.Mvc;
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
                    Status = form["Status"],
                    Specification = form["Specfication"],
                    Unit = form["Unit"],
                    DeliveryTime = form["DeliveryTime"],
                };
                // Check Type
                var types = form["Type"].Split('_');
                device.Type = types[1];
                device.isConsign = types[0] == "normal" ? false : true;

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

                device = AddNavigation(form, device);

                DateTime dDeviceDate = DateTime.TryParse(form["Createddate"], out dDeviceDate) ? dDeviceDate : DateTime.Now;
                device.DeviceDate = dDeviceDate;

                device.CreatedDate = DateTime.Now;
                device.RealQty = dQtyConfirm;
                device.SysQuantity = dQtyConfirm;

                device.Status = Data.Common.CheckStatus(device);

                db.Devices.Add(device);

                // Create Layout
                device.DeviceWarehouseLayouts = AddLayout(form, device);

                // Images
                if (Request.Files.Count > 0)
                {
                    for (int i = 0; i < Request.Files.Count; i++)
                    {
                        HttpPostedFileBase imagefile = Request.Files[i];
                        var imagePath = SaveImage(imagefile, device.Id);
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
        private string SaveImage(HttpPostedFileBase file, int IdDevice, bool isUnconfirm = false)
        {
            try
            {
                var fileName = Path.GetFileNameWithoutExtension(file.FileName);
                var fileExtention = Path.GetExtension(file.FileName);
                string folderName = isUnconfirm ? "DeviceUnconfirmImages" : "DeviceImages";

                var folderPath = Server.MapPath($"~/Data/NewToolingRoom/{folderName}/{IdDevice}");
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

        private Entities.Device AddNavigation(FormCollection form, Entities.Device device)
        {
            string dProductName = form["Product"];
            string dModelName = form["Model"];
            string dStationName = form["Station"];
            string dGroupName = form["Group"];
            string dVendorName = form["Vendor"];

            var dProductNames = dProductName.Split('|');
            Entities.Product product = new Product();
            if (dProductNames.Length <= 1)
            {
                string sProductname = dProductNames[0].Trim();
                product = db.Products.FirstOrDefault(p => p.ProductName == sProductname);
            }
            else if(dProductNames.Length == 2)
            {
                string sProductname = dProductNames[0].Trim();
                string sMTS = dProductNames[1].Trim();
                product = db.Products.FirstOrDefault(p => p.ProductName == sProductname && p.MTS == sMTS);
            }
            
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
            device.Product = product;

            // Add & Create Model
            if (model == null)
            {
                model = new Entities.Model { ModelName = dModelName };
                db.Models.Add(model);
            }
            device.IdModel = model.Id;
            device.Model = model;

            // Add & Create Station
            if (station == null)
            {
                station = new Entities.Station { StationName = dStationName };
                db.Stations.Add(station);
            }
            device.IdStation = station.Id;
            device.Station = station;

            // Add & Create Group
            if (group == null)
            {
                group = new Entities.Group { GroupName = dGroupName };
                db.Groups.Add(group);
            }
            device.IdGroup = group.Id;
            device.Group = group;

            // Add & Create Vendor
            if (vendor == null)
            {
                vendor = new Entities.Vendor { VendorName = dVendorName };
                db.Vendors.Add(vendor);
            }
            device.IdVendor = vendor.Id;
            device.Vendor = vendor;

            return device;
        }
        private List<DeviceWarehouseLayout> AddLayout(FormCollection form, Entities.Device device)
        {
            if (form["Layout"] != null)
            {
                var IdLayouts = form["Layout"].Split(',').Select(Int32.Parse).Distinct().ToArray();

                var layouts = new List<DeviceWarehouseLayout>();
                foreach (var IdLayout in IdLayouts)
                {
                    var deviceWarehouseLayout = db.DeviceWarehouseLayouts.FirstOrDefault(l => l.IdDevice == device.Id && l.IdWarehouseLayout == IdLayout);
                    if (deviceWarehouseLayout == null)
                    {
                        deviceWarehouseLayout = new DeviceWarehouseLayout
                        {
                            IdDevice = device.Id,
                            IdWarehouseLayout = IdLayout
                        };
                        db.DeviceWarehouseLayouts.Add(deviceWarehouseLayout);
                        layouts.Add(deviceWarehouseLayout);
                    }
                    else
                    {
                        layouts.Add(deviceWarehouseLayout);
                    }
                }

                return layouts;
            }
            else
            {
                return null;
            }

        }

        // GET: Device Management
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
        public JsonResult UpdateDevice(FormCollection form)
        {
            try
            {
                int Id = int.Parse(form["Id"]);
                var oldDevice = db.Devices.FirstOrDefault(d => d.Id == Id);             
                if (oldDevice != null)
                {
                    Entities.Device device = new Device
                    {
                        Id = oldDevice.Id,
                        DeviceCode = form["DeviceCode"],
                        DeviceName = form["DeviceName"],
                        Specification = form["Specification"],

                        //Type = form["Type"],
                        DeviceDate = DateTime.Parse(form["DeviceDate"]),
                        DeliveryTime = form["DeliveryTime"],

                        IdWareHouse = int.Parse(form["IdWareHouse"]),
                        Buffer = (double)Math.Round(double.Parse(form["Buffer"]), 2),
                        Quantity = int.Parse(form["Quantity"]),
                        POQty = int.Parse(form["POQty"]),
                        Unit = form["Unit"],

                        Relation = form["Relation"],
                        LifeCycle = int.Parse(form["LifeCycle"]),
                        QtyConfirm = int.Parse(form["QtyConfirm"]),
                        RealQty = int.Parse(form["RealQty"]),
                        MinQty = int.Parse(form["MinQty"]),

                        // Other data                       
                        Forcast = oldDevice.Forcast,
                        ACC_KIT = oldDevice.ACC_KIT,                       
                        MOQ = oldDevice.MOQ,
                        CreatedDate = oldDevice.CreatedDate,
                        ImagePath = oldDevice.ImagePath,
                        Type_BOM = oldDevice.Type_BOM,
                    };
                    // ***
                    device.SysQuantity = device.RealQty - oldDevice.RealQty - oldDevice.SysQuantity;

                    // Add Navigation Data
                    device = AddNavigation(form, device);
                    device.DeviceWarehouseLayouts = AddLayout(form, device);
                    device.Status = Data.Common.CheckStatus(device);

                    // Check Type
                    var types = form["Type"].Split('_');
                    device.Type = types[1];
                    device.isConsign = types[0] == "normal" ? false : true;

                    string temp = JsonSerializer.Serialize(oldDevice);

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
                            var imagePath = SaveImage(imagefile, device.Id);
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

                //var skipAmount = 1000 * (PageNum - 1);

                //var Devices = db.Devices.Where(d => d.IdWareHouse == warehouse.Id).OrderByDescending(d => d.Id).Skip(skipAmount).Take(1000).ToList();

                var Devices = db.Devices.Where(d => d.IdWareHouse == warehouse.Id).OrderByDescending(d => d.Id).ToList();

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
        public JsonResult AddDeviceUnconfirm(HttpPostedFileBase file, int IdWarehouse)
        {
            try
            {
                ExcelPackage.LicenseContext = OfficeOpenXml.LicenseContext.NonCommercial;

                if (file != null && file.ContentLength > 0)
                {
                    using (var package = new ExcelPackage(file.InputStream))
                    {
                        var worksheet = package.Workbook.Worksheets[0];

                        List<Entities.DeviceUnconfirm> devices = new List<Entities.DeviceUnconfirm>();

                        foreach (int row in Enumerable.Range(2, worksheet.Dimension.End.Row - 1))
                        {
                            string deviceCode = worksheet.Cells[row, 7].Value?.ToString();
                            if (string.IsNullOrEmpty(deviceCode))
                            {
                                continue;
                            }

                            // Create device in row excel
                            Entities.DeviceUnconfirm device = CreateDeviceUnconfirm(worksheet, row);
                            device.IdWareHouse = IdWarehouse;

                            var dbDevice = CheckDevice(device);

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
                                db.SaveChanges();
                                continue;
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

            var deviceCode = worksheet.Cells[row, 7].Value?.ToString();
            var deviceName = worksheet.Cells[row, 8].Value?.ToString();
            var groupName = worksheet.Cells[row, 9].Value?.ToString();
            var vendorName = worksheet.Cells[row, 10].Value?.ToString();

            int minQty = int.TryParse(worksheet.Cells[row, 12].Value?.ToString(), out minQty) ? minQty : 0;
            var ACC_KIT = worksheet.Cells[row, 13].Value?.ToString();
            var relation = worksheet.Cells[row, 14].Value?.ToString();
            var modelName = worksheet.Cells[row, 15].Value?.ToString();
            var stationName = worksheet.Cells[row, 16].Value?.ToString();

            double forcast = double.TryParse(worksheet.Cells[row, 18].Value?.ToString(), out forcast) ? forcast : 0;
            int lifeCycle = int.TryParse(worksheet.Cells[row, 19].Value?.ToString(), out lifeCycle) ? lifeCycle : 0;
            var Dynamic_Static = worksheet.Cells[row, 20].Value?.ToString();
            double deviceBuffer = double.TryParse(worksheet.Cells[row, 21].Value?.ToString(), out deviceBuffer) ? deviceBuffer : 0;
            int quantity = int.TryParse(worksheet.Cells[row, 22].Value?.ToString(), out quantity) ? quantity : 0;

            int moq = int.TryParse(worksheet.Cells[row, 24].Value?.ToString(), out moq) ? moq : 0;



            #region Product
            Entities.Product product = db.Products.FirstOrDefault(p => p.ProductName == productName.Trim() && p.MTS == productMTS.Trim());

            if (product == null)
            {
                product = new Entities.Product
                {
                    ProductName = productName.Trim(),
                    MTS = productMTS.Trim()
                };
                db.Products.Add(product);
            }
            device.IdProduct = product.Id;
            device.Product = product;
            #endregion

            #region Model
            Entities.Model model = db.Models.FirstOrDefault(m => m.ModelName == modelName.Trim());
            if (model == null)
            {
                model = new Entities.Model { ModelName = modelName.Trim() };
                db.Models.Add(model);
            }
            device.IdModel = model.Id;
            device.Model = model;
            #endregion

            #region Station
            Entities.Station station = db.Stations.FirstOrDefault(s => s.StationName == stationName.Trim());
            if (station == null)
            {
                station = new Entities.Station { StationName = stationName.Trim() };
                db.Stations.Add(station);
            }
            device.IdStation = station.Id;
            device.Station = station;
            #endregion

            #region Group
            Entities.Group group = db.Groups.FirstOrDefault(g => g.GroupName == groupName.Trim());
            if (group == null)
            {
                group = new Entities.Group { GroupName = groupName.Trim() };
                db.Groups.Add(group);
            }
            device.IdGroup = group.Id;
            device.Group = group;
            #endregion

            #region Vendor
            Entities.Vendor vendor = db.Vendors.FirstOrDefault(v => v.VendorName == vendorName.Trim());
            if (vendor == null)
            {
                vendor = new Entities.Vendor { VendorName = vendorName.Trim() };
                db.Vendors.Add(vendor);
            }
            device.IdVendor = vendor.Id;
            device.Vendor = vendor;
            #endregion

            #region Device
            device.DeviceCode = deviceCode;
            device.DeviceName = deviceName;

            device.MinQty = minQty;
            device.ACC_KIT = ACC_KIT;
            device.Relation = relation;

            device.Forcast = forcast;
            device.LifeCycle = lifeCycle;
            device.Type_BOM = Dynamic_Static;
            device.Buffer = deviceBuffer;
            device.Quantity = quantity;

            device.MOQ = moq;

            device.Status = "Unconfirmed";
            device.CreatedDate = DateTime.Now;

            #endregion

            return device;
        }
        private DeviceUnconfirm CheckDevice(DeviceUnconfirm device)
        {
            // Get device in db to check
            var dbDevice = db.DeviceUnconfirms.FirstOrDefault(d =>
                d.IdProduct == device.IdProduct &&
                d.IdModel == device.IdModel &&
                d.IdStation == device.IdStation &&
                d.IdGroup == device.IdGroup &&
                d.IdVendor == device.IdVendor &&
                d.DeviceCode == device.DeviceCode &&
                d.DeviceName == device.DeviceName);

            if (dbDevice != null) {
                dbDevice.IdWareHouse = device.IdWareHouse;
                return dbDevice;
            }
            
            else return null;
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
                    try
                    {
                        if (!string.IsNullOrEmpty(device.ImagePath)) images = Directory.GetFiles(device.ImagePath).ToList();
                    }
                    catch {}
                    

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

        // GET: Export Excel / Inventory
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

        #region Device Confirm
        [HttpGet]
        public ActionResult ConfirmDevice()
        {
            return View();
        }
        [HttpGet]
        public JsonResult GetDevicesUnconfirm(int IdWarehouse)
        {
            try
            {
                var devices = db.DeviceUnconfirms.Where(d => d.IdWareHouse == IdWarehouse).OrderByDescending(d => d.Id).ToList();

                return Json(new { status = true, devices }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new {status = false, message = ex.Message}, JsonRequestBehavior.AllowGet);
            }
        }
        [HttpGet]
        public JsonResult GetDeviceUnconfirm(int Id)
        {
            try
            {
                var device = db.DeviceUnconfirms.FirstOrDefault(d => d.Id == Id);

                if (device != null)
                {
                    List<string> images = new List<string>();
                    if (!string.IsNullOrEmpty(device.ImagePath)) images = Directory.GetFiles(device.ImagePath).ToList();

                    return Json(new { status = true, device, images }, JsonRequestBehavior.AllowGet);
                }
                else
                {
                    return Json(new { status = false, message = "Device not found." });
                }              
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }
        [HttpPost]
        public JsonResult DeviceUnconfirm_UpdateImage(FormCollection form)
        {
            try
            {
                int id = int.Parse(form["deviceid"]);

                var device = db.DeviceUnconfirms.FirstOrDefault(d => d.Id == id);
                if (device != null)
                {
                    var files = Request.Files;
                    if (Request.Files.Count > 0)
                    {
                        for (int i = 0; i < Request.Files.Count; i++)
                        {
                            HttpPostedFileBase imagefile = Request.Files[i];
                            var imagePath = SaveImage(imagefile, device.Id, true);
                            if (string.IsNullOrEmpty(device.ImagePath))
                            {
                                device.ImagePath = imagePath;
                            }
                        }
                    }

                    db.DeviceUnconfirms.AddOrUpdate(device);
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
        [HttpGet]
        public JsonResult DeviceUnconfirm_DeleteImage(string src)
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
        [HttpPost] 
        public JsonResult AddConfirmDevice(FormCollection form)
        {
            try
            {
                int IdDeviceUnconfirm = int.Parse(form["Id"]);
                var deviceUnconfirm = db.DeviceUnconfirms.FirstOrDefault(d => d.Id == IdDeviceUnconfirm);

                if (deviceUnconfirm != null)
                {
                    Entities.Device device = new Device
                    {
                        DeviceCode = form["DeviceCode"],
                        DeviceName = form["DeviceName"],
                        Specification = form["Specification"],

                        //Type = form["Type"],
                        DeviceDate = DateTime.Parse(form["DeviceDate"]),
                        DeliveryTime = form["DeliveryTime"],

                        IdWareHouse = int.Parse(form["IdWareHouse"]),
                        Buffer = (double)Math.Round(double.Parse(form["Buffer"]), 2),
                        POQty = int.Parse(form["POQty"]),
                        MinQty = int.Parse(form["MinQty"]),

                        Relation = form["Relation"],
                        LifeCycle = int.Parse(form["LifeCycle"]),
                        QtyConfirm = int.Parse(form["QtyConfirm"]),
                        Unit = form["Unit"],

                        // Other data
                        Quantity = deviceUnconfirm.Quantity,
                        CreatedDate = deviceUnconfirm.CreatedDate,
                        Forcast = deviceUnconfirm.Forcast,
                        ACC_KIT = deviceUnconfirm.ACC_KIT,
                        RealQty = int.Parse(form["QtyConfirm"]),
                        SysQuantity = int.Parse(form["QtyConfirm"]),
                        Type_BOM = deviceUnconfirm.Type_BOM,
                        MOQ = deviceUnconfirm.MOQ,
                    };

                    // Add Navigation Data
                    device = AddNavigation(form, device);
                    device.DeviceWarehouseLayouts = AddLayout(form, device);
                    device.Status = Data.Common.CheckStatus(device);

                    // Check Type
                    var types = form["Type"].Split('_');
                    device.Type = types[1];
                    device.isConsign = types[0] == "normal" ? false : true;
                    db.Devices.Add(device);
                    db.SaveChanges();

                    // Copy Image
                    device.ImagePath = CopyImages(deviceUnconfirm, device);
                    db.Devices.AddOrUpdate(device);
                    db.SaveChanges();

                    return Json(new { status = true });
                }
                else
                {
                    return Json(new { status = false, message = "Device not found." });
                }


                
            }
            catch (Exception ex)
            {
                return Json(new {status = false, message = ex.Message});
            }
        }
        private string CopyImages(DeviceUnconfirm deviceUnconfirm, Entities.Device device)
        {
            string sourcePath = deviceUnconfirm.ImagePath;
            string destinationPath = Server.MapPath($"~/Data/NewToolingRoom/DeviceImages/{device.Id}"); ;

            List<string> images = new List<string>();

            if (!Directory.Exists(destinationPath)) Directory.CreateDirectory(destinationPath);

            if (Directory.Exists(sourcePath))
            {
                images = Directory.GetFiles(sourcePath).ToList();

                foreach (string imagePath in images)
                {
                    string destinationFile = Path.Combine(destinationPath, Path.GetFileName(imagePath));
                    System.IO.File.Copy(imagePath, destinationFile, true);
                }

                return destinationPath;
            }
            else
            {
                return string.Empty;
            }
        }

        #endregion
    }
}