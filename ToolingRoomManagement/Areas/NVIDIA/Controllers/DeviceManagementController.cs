using OfficeOpenXml;
using OfficeOpenXml.Style;
using System;
using System.Collections.Generic;
using System.Data.Entity.Core.Common.CommandTrees.ExpressionBuilder;
using System.Data.Entity.Migrations;
using System.Diagnostics;
using System.Drawing;
using System.IO;
using System.Linq;
using System.Numerics;
using System.Runtime.CompilerServices;
using System.Text.Json;
using System.Text.RegularExpressions;
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

                // Remove old layout of device
                var deviceWarehouseLayouts = db.DeviceWarehouseLayouts.Where(l => l.IdDevice == device.Id).ToList();
                db.DeviceWarehouseLayouts.RemoveRange(deviceWarehouseLayouts);

                // Add new layout of device
                var layouts = new List<DeviceWarehouseLayout>();
                foreach (var IdLayout in IdLayouts)
                {
                    var deviceWarehouseLayout = new DeviceWarehouseLayout
                    {
                        IdDevice = device.Id,
                        IdWarehouseLayout = IdLayout,
                        WarehouseLayout = db.WarehouseLayouts.FirstOrDefault(wl => wl.Id == IdLayout)
                    };
                    db.DeviceWarehouseLayouts.Add(deviceWarehouseLayout);
                    layouts.Add(deviceWarehouseLayout);
                }

                return layouts;
            }
            else
            {
                // Remove all layout of device if null
                var deviceWarehouseLayouts = db.DeviceWarehouseLayouts.Where(l => l.IdDevice == device.Id).ToList();
                db.DeviceWarehouseLayouts.RemoveRange(deviceWarehouseLayouts);
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
                        MOQ = int.Parse(form["MOQ"]) != oldDevice.MOQ ? int.Parse(form["MOQ"]) : oldDevice.MOQ,

                        // Other data                       
                        Forcast = oldDevice.Forcast,
                        ACC_KIT = oldDevice.ACC_KIT,                       
                        CreatedDate = oldDevice.CreatedDate,
                        ImagePath = oldDevice.ImagePath,
                        Type_BOM = oldDevice.Type_BOM,
                    };
                    // *** Đừng xoá ngoặc :((
                    device.SysQuantity = device.RealQty - (oldDevice.RealQty - oldDevice.SysQuantity);

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
            var ACC_KIT = worksheet.Cells[row, 15].Value?.ToString();
            var relation = worksheet.Cells[row, 16].Value?.ToString();
            //var modelName = worksheet.Cells[row, 15].Value?.ToString();
            //var stationName = worksheet.Cells[row, 16].Value?.ToString();

            //double forcast = double.TryParse(worksheet.Cells[row, 18].Value?.ToString(), out forcast) ? forcast : 0;
            //int lifeCycle = int.TryParse(worksheet.Cells[row, 19].Value?.ToString(), out lifeCycle) ? lifeCycle : 0;
            //var Dynamic_Static = worksheet.Cells[row, 20].Value?.ToString();
            //double deviceBuffer = double.TryParse(worksheet.Cells[row, 21].Value?.ToString(), out deviceBuffer) ? deviceBuffer : 0;
            int quantity = int.TryParse(worksheet.Cells[row, 11].Value?.ToString(), out quantity) ? quantity : 0;

            //int moq = int.TryParse(worksheet.Cells[row, 24].Value?.ToString(), out moq) ? moq : 0;



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
            //Entities.Model model = db.Models.FirstOrDefault(m => m.ModelName == modelName.Trim());
            //if (model == null)
            //{
            //    model = new Entities.Model { ModelName = modelName.Trim() };
            //    db.Models.Add(model);
            //}
            //device.IdModel = model.Id;
            //device.Model = model;
            #endregion

            #region Station
            //Entities.Station station = db.Stations.FirstOrDefault(s => s.StationName == stationName.Trim());
            //if (station == null)
            //{
            //    station = new Entities.Station { StationName = stationName.Trim() };
            //    db.Stations.Add(station);
            //}
            //device.IdStation = station.Id;
            //device.Station = station;
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

            //device.Forcast = forcast;
            //device.LifeCycle = lifeCycle;
            //device.Type_BOM = Dynamic_Static;
            //device.Buffer = deviceBuffer;
            device.Quantity = quantity;

            //device.MOQ = moq;

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
                List<Entities.Borrow> borrows = db.Borrows.Where(b => b.BorrowDevices.Any(bd => bd.IdDevice == device.Id)).ToList(); ;
              
                // Get All Borrow Of Device               
                List<Entities.Return> returns = db.Returns.Where(r => r.ReturnDevices.Any(rd => rd.IdDevice == device.Id)).ToList();

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
                    warehouse.WarehouseLayouts.Clear();
                }
                device.Warehouse = db.Warehouses.FirstOrDefault(w => w.Id == device.IdWareHouse);
                device.Warehouse.Devices.Clear();
                device.Warehouse.WarehouseLayouts.Clear();



                if (device != null)
                {
                    List<string> images = new List<string>();
                    try
                    {
                        if (!string.IsNullOrEmpty(device.ImagePath)) images = Directory.GetFiles(device.ImagePath).ToList();
                    }
                    catch {}
                    

                    return Json(new { status = true, device, borrows, returns, warehouses, images });
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
                        outWorksheet.Cells[1, 9].Value = "Vendor"; //
                        outWorksheet.Cells[1, 10].Value = "Buffer"; //
                        outWorksheet.Cells[1, 11].Value = "Limit"; //

                        outWorksheet.Cells[1, 12].Value = "Dynamic/Static"; //

                        outWorksheet.Cells[1, 13].Value = "Quantity";

                        outWorksheet.Cells[1, 14].Value = "Relation"; //

                        outWorksheet.Cells[1, 15].Value = "Request";
                        outWorksheet.Cells[1, 16].Value = "Default Min Quantity";
                        outWorksheet.Cells[1, 17].Value = "GAP";

                        outWorksheet.Cells[1, 18].Value = "MOQ"; //
                        

                        outWorksheet.Cells[1, 19].Value = "Risk";
                        outWorksheet.Cells[1, 20].Value = "Have Picture (Y/N)";
                        outWorksheet.Cells[1, 21].Value = "Return NG Quantity";
                        outWorksheet.Cells[1, 22].Value = "Real Quantity";
                        outWorksheet.Cells[1, 23].Value = "Lead Time";
                        outWorksheet.Cells[1, 24].Value = "On The Way Quantity";

                        outWorksheet.Cells["A1:X1"].Style.Border.Bottom.Style = ExcelBorderStyle.Thin;
                        outWorksheet.Cells["A1:X1"].Style.Border.Top.Style = ExcelBorderStyle.Thin;
                        outWorksheet.Cells["A1:X1"].Style.Border.Left.Style = ExcelBorderStyle.Thin;
                        outWorksheet.Cells["A1:X1"].Style.Border.Right.Style = ExcelBorderStyle.Thin;
                        outWorksheet.Cells["A1:X1"].Style.Font.Bold = true;

                        System.Drawing.Color headerBackground = System.Drawing.ColorTranslator.FromHtml("#00B050");
                        outWorksheet.Cells[$"A1:X1"].Style.Fill.PatternType = ExcelFillStyle.Solid;
                        outWorksheet.Cells[$"A1:X1"].Style.Fill.BackgroundColor.SetColor(headerBackground);

                        foreach (int row in Enumerable.Range(2, worksheet.Dimension.End.Row - 1))
                        {
                            var _PN = worksheet.Cells[row, 1].Value?.ToString();
                            var _RequestQty = int.Parse(worksheet.Cells[row, 2].Value?.ToString());
                            int comingQty = CountComingDevice(_PN);

                            var devices = db.Devices.Where(d => d.DeviceCode.ToUpper().Trim() == _PN.ToUpper().Trim()).ToList();
                            if (devices.Count > 0)
                            {
                                string deviceName = "";
                                int qtyConfirm = 0;
                                int minQty = 0;
                                int NGQty = 0;
                                int realQty = 0;
                                string LeadTime = "";
                                

                                foreach (var _device in devices)
                                {
                                    deviceName = _device.DeviceName;
                                    qtyConfirm += _device.QtyConfirm ?? 0;
                                    minQty = _device.MinQty ?? 0;
                                    NGQty += _device.NG_Qty ?? 0;
                                    realQty += _device.RealQty ?? 0;

                                    if(_device.DeliveryTime != null)
                                    {
                                        LeadTime = _device.DeliveryTime;
                                    }
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
                                outWorksheet.Cells[row, 11].Value = device.LifeCycle == null ? "" : device.LifeCycle.ToString();

                                string type = "";
                                if(device.Type_BOM != null)
                                {
                                    type = device.Type_BOM;
                                }
                                else
                                {
                                    if (device.Type == "Fixture") type = "S";
                                    else if (device.Type == "S" || device.Type == "Static") type = "S";
                                    else if (device.Type == "D" || device.Type == "Dynamic") type = "D";
                                    else type = "NA";
                                }
                                outWorksheet.Cells[row, 12].Value = type;

                                outWorksheet.Cells[row, 13].Value = qtyConfirm;
                                outWorksheet.Cells[row, 14].Value = device.Relation == null ? "" : device.Relation;

                                outWorksheet.Cells[row, 15].Value = _RequestQty;
                                outWorksheet.Cells[row, 16].Value = minQty;

                                int gap = (qtyConfirm + comingQty) - (_RequestQty + NGQty);
                                //outWorksheet.Cells[row, 17].Value = gap;
                                outWorksheet.Cells[row, 17].Formula = $"(M{row}+ X{row})-(O{row}+U{row})";

                                outWorksheet.Cells[row, 18].Value = device.MOQ ?? 0;
                                

                                if (gap > 0 && qtyConfirm > minQty)
                                {
                                    outWorksheet.Cells[row, 19].Value = "Low";

                                    System.Drawing.Color successBackground = System.Drawing.ColorTranslator.FromHtml("#C6EFCE");
                                    System.Drawing.Color successText = System.Drawing.ColorTranslator.FromHtml("#006100");

                                    outWorksheet.Cells[$"A{row}:X{row}"].Style.Fill.PatternType = ExcelFillStyle.Solid;
                                    outWorksheet.Cells[$"A{row}:X{row}"].Style.Fill.BackgroundColor.SetColor(successBackground);
                                    outWorksheet.Cells[$"A{row}:X{row}"].Style.Font.Color.SetColor(successText);

                                }
                                else
                                {
                                    outWorksheet.Cells[row, 19].Value = "High";

                                    System.Drawing.Color dangerBackground = System.Drawing.ColorTranslator.FromHtml("#FFC7CE");
                                    System.Drawing.Color dangerText = System.Drawing.ColorTranslator.FromHtml("#9C0006");

                                    outWorksheet.Cells[$"A{row}:X{row}"].Style.Fill.PatternType = ExcelFillStyle.Solid;
                                    outWorksheet.Cells[$"A{row}:X{row}"].Style.Fill.BackgroundColor.SetColor(dangerBackground);
                                    outWorksheet.Cells[$"A{row}:X{row}"].Style.Font.Color.SetColor(dangerText);
                                }

                                outWorksheet.Cells[row, 20].Value = device.ImagePath != null ? "Y" : "N";
                                outWorksheet.Cells[row, 21].Value = NGQty;
                                outWorksheet.Cells[row, 22].Value = realQty;

                                bool hasNumber = Regex.IsMatch(LeadTime, @"\d");
                                outWorksheet.Cells[row, 23].Value = hasNumber ? LeadTime : "";

                                outWorksheet.Cells[row, 24].Value = comingQty;
                            }
                            else if(!db.ComingDevices.Any(d => d.DeviceUnconfirm.DeviceCode.ToUpper().Trim() == _PN.ToUpper().Trim()) && comingQty > 0){
                                var device = db.DeviceUnconfirms.FirstOrDefault(d => d.DeviceCode.ToUpper().Trim() == _PN.ToUpper().Trim());

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
                                outWorksheet.Cells[row, 11].Value = device.LifeCycle == null ? "" : device.LifeCycle.ToString();

                                string type = "";
                                if (device.Type_BOM != null)
                                {
                                    type = device.Type_BOM;
                                }
                                else
                                {
                                    if (device.Type == "Fixture") type = "S";
                                    else if (device.Type == "S" || device.Type == "Static") type = "S";
                                    else if (device.Type == "D" || device.Type == "Dynamic") type = "D";
                                    else type = "NA";
                                }
                                outWorksheet.Cells[row, 12].Value = type;

                                outWorksheet.Cells[row, 13].Value = 0;
                                outWorksheet.Cells[row, 14].Value = device.Relation == null ? "" : device.Relation;

                                outWorksheet.Cells[row, 15].Value = _RequestQty;
                                outWorksheet.Cells[row, 16].Value = device.MinQty;

                                int gap = comingQty - _RequestQty;
                                outWorksheet.Cells[row, 17].Formula = $"(M{row}+ X{row})-(O{row}+U{row})";
                                outWorksheet.Cells[row, 18].Value = device.MOQ ?? 0;

                                outWorksheet.Cells[row, 19].Value = "Mid";

                                System.Drawing.Color dangerBackground = System.Drawing.ColorTranslator.FromHtml("#FFEB9C");
                                System.Drawing.Color dangerText = System.Drawing.ColorTranslator.FromHtml("#DF8C00");
                                outWorksheet.Cells[$"A{row}:X{row}"].Style.Fill.PatternType = ExcelFillStyle.Solid;
                                outWorksheet.Cells[$"A{row}:X{row}"].Style.Fill.BackgroundColor.SetColor(dangerBackground);
                                outWorksheet.Cells[$"A{row}:X{row}"].Style.Font.Color.SetColor(dangerText);
                                outWorksheet.Cells[row, 20].Value = device.ImagePath != null ? "Y" : "N";

                                outWorksheet.Cells[row, 21].Value = 0;
                                outWorksheet.Cells[row, 22].Value = 0;

                                bool hasNumber = Regex.IsMatch(device.DeliveryTime, @"\d");
                                outWorksheet.Cells[row, 23].Value = hasNumber ? device.DeliveryTime : "";

                                outWorksheet.Cells[row, 24].Value = comingQty;

                            }
                            else
                            {
                                outWorksheet.Cells[row, 6].Value = _PN;
                                outWorksheet.Cells[row, 15].Value = _RequestQty;

                                outWorksheet.Cells[$"A{row}:X{row}"].Style.Fill.PatternType = ExcelFillStyle.Solid;
                                outWorksheet.Cells[$"A{row}:X{row}"].Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.LightGray);
                            }

                            outWorksheet.Cells[$"A{row}:X{row}"].Style.Border.Bottom.Style = ExcelBorderStyle.Thin;
                            outWorksheet.Cells[$"A{row}:X{row}"].Style.Border.Top.Style = ExcelBorderStyle.Thin;
                            outWorksheet.Cells[$"A{row}:X{row}"].Style.Border.Left.Style = ExcelBorderStyle.Thin;
                            outWorksheet.Cells[$"A{row}:X{row}"].Style.Border.Right.Style = ExcelBorderStyle.Thin;
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


        // Confirm Device
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

        #region Coming
        [HttpGet]
        public ActionResult ComingDevice()
        {
            return View();
        }
        public JsonResult GetComingDevices()
        {
            try
            {
                var ComingDevices = db.ComingDevices.OrderByDescending(d => d.Id).ToList();              
                return Json(new { status = true, ComingDevices }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message}, JsonRequestBehavior.AllowGet);
            }
        }
        public JsonResult GetComingDevice(int Id)
        {
            try
            {
                var ComingDevice = db.ComingDevices.FirstOrDefault(d => d.Id == Id);
                if(ComingDevice != null)
                {
                    if (ComingDevice.Device != null)
                    {
                        ComingDevice.Device.Warehouse = db.Warehouses.FirstOrDefault(w => w.Id == ComingDevice.Device.IdWareHouse);
                        ComingDevice.Device.Warehouse.Devices.Clear();
                        ComingDevice.Device.Warehouse.WarehouseLayouts.Clear();
                    }
                    else if (ComingDevice.DeviceUnconfirm != null)
                    {
                        ComingDevice.DeviceUnconfirm.Warehouse = db.Warehouses.FirstOrDefault(w => w.Id == ComingDevice.DeviceUnconfirm.IdWareHouse);
                        ComingDevice.DeviceUnconfirm.Warehouse.Devices.Clear();
                        ComingDevice.DeviceUnconfirm.Warehouse.WarehouseLayouts.Clear();
                    }

                    return Json(new { status = true, ComingDevice }, JsonRequestBehavior.AllowGet);
                }
                else
                {
                    return Json(new { status = false, message = "Coming device not found." }, JsonRequestBehavior.AllowGet);
                } 
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }
        public JsonResult GetDevice(int Id, string Type)
        {
            try
            {
                if(Type == "confirm")
                {
                    var device = db.Devices.FirstOrDefault(d => d.Id == Id);
                    if (device != null)
                    {
                        device.Warehouse = db.Warehouses.FirstOrDefault(w => w.Id == device.IdWareHouse);
                        device.Warehouse.Devices.Clear();
                        device.Warehouse.WarehouseLayouts.Clear();

                        return Json(new { status = true, device }, JsonRequestBehavior.AllowGet);
                    }
                    else
                    {
                        return Json(new { status = false, message = "Device not found." }, JsonRequestBehavior.AllowGet);
                    }
                }
                else if(Type == "unconfirm")
                {
                    var device = db.DeviceUnconfirms.FirstOrDefault(d => d.Id == Id);
                    if (device != null)
                    {
                        device.Warehouse = db.Warehouses.FirstOrDefault(w => w.Id == device.IdWareHouse);
                        device.Warehouse.Devices.Clear();
                        device.Warehouse.WarehouseLayouts.Clear();

                        return Json(new { status = true, device }, JsonRequestBehavior.AllowGet);
                    }
                    else
                    {
                        return Json(new { status = false, message = "Device not found." }, JsonRequestBehavior.AllowGet);
                    }
                }
                else
                {
                    return Json(new { status = false, message = "Type not found." }, JsonRequestBehavior.AllowGet);
                }               
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }
        public JsonResult GetWarehouseDevices_Coming(int Id)
        {
            try
            {
                var warehouse = db.Warehouses.FirstOrDefault(d => d.Id == Id);
                if (warehouse != null)
                {
                    var devices = db.Devices.Where(d => d.IdWareHouse == Id);
                    var deviceUnconfirms = db.DeviceUnconfirms.Where(d => d.IdWareHouse == Id);

                    return Json(new { status = true, devices, deviceUnconfirms }, JsonRequestBehavior.AllowGet);
                }
                else
                {
                    return Json(new { status = false, message = "Warehouse not found." }, JsonRequestBehavior.AllowGet);
                }
            }
            catch (Exception ex)
            {
                return Json(new {status = false, message = ex.Message}, JsonRequestBehavior.AllowGet);
            }
            
        }

        [HttpPost]
        public JsonResult AddComingDevice(ComingDevice ComingDevice)
        {
            try
            {
                if(ComingDevice.ComingQty <= 0 || ComingDevice.ComingQty == null || (ComingDevice.IdDevice == null && ComingDevice.IdDeviceUnconfirm == null))
                {
                    return Json(new { status = false, message = "Please double check data." });
                }

                ComingDevice.DateCreated = DateTime.Now;
                db.ComingDevices.Add(ComingDevice);
                db.SaveChanges();

                if (ComingDevice.IdDevice != null)
                {
                    ComingDevice.Device = db.Devices.FirstOrDefault(d => d.Id == ComingDevice.IdDevice);
                }
                else if (ComingDevice.IdDeviceUnconfirm != null)
                {
                    ComingDevice.DeviceUnconfirm = db.DeviceUnconfirms.FirstOrDefault(d => d.Id == ComingDevice.IdDeviceUnconfirm);
                }

                return Json(new { status = true, ComingDevice });
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message });
            }
        }
        public JsonResult UpdateComingDevice(ComingDevice ComingDevice)
        {
            try
            {
                if (ComingDevice.ComingQty <= 0 || ComingDevice.ComingQty == null)
                {
                    return Json(new { status = false, message = "Please double check data." });
                }

                var dbComingDevice = db.ComingDevices.FirstOrDefault(db => db.Id ==  ComingDevice.Id);
                dbComingDevice.ComingQty = ComingDevice.ComingQty;
                dbComingDevice.Type = ComingDevice.Type;
                dbComingDevice.IsConsign = ComingDevice.IsConsign;
                dbComingDevice.ExpectedDate = ComingDevice.ExpectedDate;

                db.ComingDevices.AddOrUpdate(dbComingDevice);
                db.SaveChanges();

                return Json(new { status = true, ComingDevice = dbComingDevice });
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message });
            }
        }
        public JsonResult DeleteComingDevice(int Id)
        {
            try
            {
                var ComingDevice = db.ComingDevices.FirstOrDefault(d => d.Id == Id);

                if(ComingDevice != null)
                {
                    db.ComingDevices.Remove(ComingDevice);
                    db.SaveChanges();
                }
                else
                {
                    return Json(new { status = false, message = "Coming device not found." });
                }
                return Json(new { status = true });
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message });
            }
        }
        public JsonResult ConfirmComingDevice(int cDeviceId, int ConfirmQty)
        {
            try
            {
                var ComingDevice = db.ComingDevices.FirstOrDefault(d => d.Id == cDeviceId);
                if(ComingDevice != null)
                {
                    var device = CreateDeviceInfo(ComingDevice);

                    device.QtyConfirm = device.RealQty = device.SysQuantity = device.Quantity = ConfirmQty;
                    if (!ComingDevice.IsConsign ?? false) device.POQty = ConfirmQty;
                    device.Status = Data.Common.CheckStatus(device);

                    if (ConfirmQty == ComingDevice.ComingQty) // Số lượng xác nhận == Số lượng Sắp đến => Thêm mới device, Xoá ComingDevice
                    {
                        db.Devices.Add(device);
                        db.ComingDevices.Remove(ComingDevice);
                        db.SaveChanges();

                        return Json(new { status = true, ComingDevice = true });
                    }
                    else if (ConfirmQty < ComingDevice.ComingQty)
                    {
                        ComingDevice.ComingQty -= ConfirmQty;

                        db.Devices.Add(device);
                        db.ComingDevices.AddOrUpdate(ComingDevice);
                        db.SaveChanges();

                        return Json(new { status = true, ComingDevice });
                    }
                    else if(ConfirmQty > ComingDevice.ComingQty)
                    {
                        return Json(new { status = false, message = $"Please double check confirm quantity. Max = {ComingDevice.ComingQty}." });
                    }
                    else
                    {
                        return Json(new { status = false, message = "Coming device not found." });
                    }
                }
                else
                {
                    return Json(new { status = false, message = "Confirm quantity not found." });
                }
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message });
            }
        }

        private Entities.Device CreateDeviceInfo(ComingDevice ComingDevice)
        {
            var cDevice = ComingDevice.Device;
            var uDevice = ComingDevice.DeviceUnconfirm;

            Device device = new Device();

            if (cDevice != null) // Data lấy từ bảng Device
            {
                device = cDevice;
                device.Quantity = 0;
                device.QtyConfirm = 0;
                device.RealQty = 0;
                device.SysQuantity = 0;
                device.POQty = 0;
                device.NG_Qty = 0;

                return device;
            }
            else if (uDevice != null) // Data lấy từ bảng Device
            {
                device.DeviceCode = uDevice.DeviceCode;
                device.DeviceDate = uDevice.DeviceDate;
                device.DeviceDate = uDevice.DeviceDate;
                device.Buffer = uDevice.Buffer;
                device.Type = ComingDevice.Type;
                device.isConsign = ComingDevice.IsConsign;
                device.IdWareHouse = uDevice.IdWareHouse;
                device.Group = uDevice.Group;
                device.Vendor = uDevice.Vendor;
                device.CreatedDate = uDevice.CreatedDate;
                device.IdProduct = uDevice.IdProduct;
                device.IdModel = uDevice.IdModel;
                device.IdStation = uDevice.IdStation;
                device.Relation = uDevice.Relation;
                device.LifeCycle = uDevice.LifeCycle;
                device.Forcast = uDevice.Forcast;
                device.ACC_KIT = uDevice.ACC_KIT;
                device.Specification = uDevice.Specification;
                device.Unit = uDevice.Unit;
                device.DeliveryTime = uDevice.DeliveryTime;
                device.Type_BOM = uDevice.Type_BOM;
                device.MOQ = uDevice.MOQ;

                device.Quantity = 0;
                device.QtyConfirm = 0;
                device.RealQty = 0;
                device.SysQuantity = 0;
                device.POQty = 0;
                device.NG_Qty = 0;

                return device;
            }
            else
            {
                return null;
            }
        }
        #endregion


        // SML
        public ActionResult UpdateBuffer(HttpPostedFileBase file)
        {
            try
            {
                ExcelPackage.LicenseContext = OfficeOpenXml.LicenseContext.NonCommercial;

                if (file != null && file.ContentLength > 0)
                {
                    string fileName = $"UpdateBuffer - {DateTime.Now.ToString("yyyy.MM.dd HH.mm.ss.ff")}.xlsx";
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
                    using (var package = new ExcelPackage(file.InputStream))
                    {
                        var worksheet = package.Workbook.Worksheets[0];
                        foreach (int row in Enumerable.Range(2, worksheet.Dimension.End.Row - 1))
                        {
                            var _PN = worksheet.Cells[row, 1].Value?.ToString();
                            double _Buffer = (double)Math.Round(double.Parse(worksheet.Cells[row, 2].Value?.ToString()), 2);

                            var devices = db.Devices.Where(d => d.DeviceCode.ToUpper().Trim() == _PN.ToUpper().Trim()).ToList();
                            foreach (var device in devices)
                            {
                                device.Buffer = _Buffer;
                                db.Devices.AddOrUpdate(device);
                            }
                        }
                        db.SaveChanges();

                        return Json(new { status = true });
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
        public ActionResult UpdateLimit(HttpPostedFileBase file)
        {
            try
            {
                ExcelPackage.LicenseContext = OfficeOpenXml.LicenseContext.NonCommercial;

                if (file != null && file.ContentLength > 0)
                {
                    string fileName = $"UpdateLimit - {DateTime.Now.ToString("yyyy.MM.dd HH.mm.ss.ff")}.xlsx";
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
                    using (var package = new ExcelPackage(file.InputStream))
                    {
                        var worksheet = package.Workbook.Worksheets[0];
                        foreach (int row in Enumerable.Range(2, worksheet.Dimension.End.Row - 1))
                        {
                            var _PN = worksheet.Cells[row, 1].Value?.ToString();
                            var _LifeCycle = int.Parse(worksheet.Cells[row, 2].Value?.ToString());

                            var devices = db.Devices.Where(d => d.DeviceCode.ToUpper().Trim() == _PN.ToUpper().Trim()).ToList();
                            foreach (var device in devices)
                            {
                                device.LifeCycle = _LifeCycle;
                                db.Devices.AddOrUpdate(device);
                            }
                        }
                        db.SaveChanges();

                        return Json(new { status = true });
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
        public ActionResult UpdateComingDevicesss(HttpPostedFileBase file)
        {
            try
            {
                ExcelPackage.LicenseContext = OfficeOpenXml.LicenseContext.NonCommercial;

                if (file != null && file.ContentLength > 0)
                {
                    string fileName = $"UpdateComingDevice - {DateTime.Now.ToString("yyyy.MM.dd HH.mm.ss.ff")}.xlsx";
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
                    using (var package = new ExcelPackage(file.InputStream))
                    {
                        var worksheet = package.Workbook.Worksheets[0];
                        foreach (int row in Enumerable.Range(2, worksheet.Dimension.End.Row - 1))
                        {
                            var _PN = worksheet.Cells[row, 1].Value?.ToString();
                            var __ComingQty = worksheet.Cells[row, 2].Value?.ToString();

                            int _ComingQty = 0;
                            if (__ComingQty != null)
                            {
                                _ComingQty = int.Parse(__ComingQty);
                            }
                            else
                            {
                                Debug.WriteLine($"PN: {_PN}, ComingQty = 0");
                                continue;
                            }

                            ComingDevice comingdevice = new ComingDevice();
                            comingdevice.Device = db.Devices.FirstOrDefault(d => d.DeviceCode.ToUpper().Trim() == _PN.ToUpper().Trim());

                            if (comingdevice.Device == null)
                            {
                                comingdevice.DeviceUnconfirm = db.DeviceUnconfirms.FirstOrDefault(d => d.DeviceCode.ToUpper().Trim() == _PN.ToUpper().Trim());
                                if (comingdevice.Device == null && comingdevice.DeviceUnconfirm == null)
                                {
                                    Debug.WriteLine($"PN: {_PN}, Row: {row}");
                                    continue;
                                }
                            }


                            if (comingdevice.Device != null)
                            {
                                comingdevice.IdDevice = comingdevice.Device.Id;
                            }
                            else if (comingdevice.DeviceUnconfirm != null)
                            {
                                comingdevice.IdDeviceUnconfirm = comingdevice.DeviceUnconfirm.Id;
                            }

                            comingdevice.ComingQty = _ComingQty;
                            comingdevice.DateCreated = comingdevice.ExpectedDate = DateTime.Now;
                            comingdevice.Type = comingdevice.Device != null ? comingdevice.Device.Type : comingdevice.DeviceUnconfirm.Type;
                            comingdevice.IsConsign = comingdevice.Device != null ? comingdevice.Device.isConsign : comingdevice.DeviceUnconfirm.isConsign;

                            db.ComingDevices.Add(comingdevice);
                        }
                        db.SaveChanges();

                        return Json(new { status = true });
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
        public ActionResult UpdateType(HttpPostedFileBase file)
        {
            try
            {
                ExcelPackage.LicenseContext = OfficeOpenXml.LicenseContext.NonCommercial;

                if (file != null && file.ContentLength > 0)
                {
                    string fileName = $"UpdateType - {DateTime.Now.ToString("yyyy.MM.dd HH.mm.ss.ff")}.xlsx";
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
                    using (var package = new ExcelPackage(file.InputStream))
                    {
                        var worksheet = package.Workbook.Worksheets[0];
                        foreach (int row in Enumerable.Range(2, worksheet.Dimension.End.Row - 1))
                        {
                            var _PN = worksheet.Cells[row, 1].Value?.ToString();
                            var _Type = worksheet.Cells[row, 2].Value?.ToString();

                            var devices = db.Devices.Where(d => d.DeviceCode.ToUpper().Trim() == _PN.ToUpper().Trim()).ToList();
                            foreach (var device in devices)
                            {
                                device.Type_BOM = _Type;
                                db.Devices.AddOrUpdate(device);
                            }
                        }
                        db.SaveChanges();

                        return Json(new { status = true });
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

        public int CountComingDevice(string PN)
        {
            var comingDevices = db.ComingDevices.Where(d => d.Device.DeviceCode.ToUpper().Trim() == PN.ToUpper().Trim()).ToList();


            int count = 0;

            foreach (var comingDevice in comingDevices)
            {
                count += comingDevice.ComingQty ?? 0;
            }

            return count;
        }
    }
}