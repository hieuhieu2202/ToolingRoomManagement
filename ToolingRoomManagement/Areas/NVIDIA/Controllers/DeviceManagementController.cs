using Microsoft.SqlServer.Server;
using OfficeOpenXml;
using OfficeOpenXml.Style;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Data.Entity.Core.Common.CommandTrees.ExpressionBuilder;
using System.Data.Entity.Migrations;
using System.Diagnostics;
using System.Drawing;
using System.IO;
using System.Linq;
using System.Net;
using System.Numerics;
using System.Runtime.CompilerServices;
using System.Text.Json;
using System.Text.RegularExpressions;
using System.Web;
using System.Web.Mvc;
using System.Web.Services.Description;
using System.Windows.Media.Media3D;
using ToolingRoomManagement.Areas.NVIDIA.Entities;
using ToolingRoomManagement.Areas.NVIDIA.Reseptory;
using ToolingRoomManagement.Attributes;
using Group = ToolingRoomManagement.Areas.NVIDIA.Entities.Group;

namespace ToolingRoomManagement.Areas.NVIDIA.Controllers
{
    public class DeviceManagementController : Controller
    {
        private readonly ToolingRoomEntities db = new ToolingRoomEntities();

        /* ADD DEVICE MANUAL */
        #region Add device manual
        [HttpGet]
        [Authentication(Roles = new[] { "CRUD" })]
        public ActionResult AddDeviceManual()
        {
            return View();
        }

        [HttpPost]
        [Authentication(Roles = new[] { "CRUD" })]
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
                    DeviceOwner = form["Owner"]
                };
                // Check Type
                var types = form["Type"].Split('_');
                device.Type = types[1];
                device.isConsign = types[0] == "normal" ? false : true;

                // Warehouse
                int dIdWarehouse = int.TryParse(form["Warehouse"], out dIdWarehouse) ? dIdWarehouse : 0;
                device.IdWareHouse = dIdWarehouse;

                // Buffer
                double dBuffer = double.TryParse(form["Buffer"], out dBuffer) ? dBuffer : 0;
                device.Buffer = dBuffer / 100;

                // LifeCycle
                int dLifeCycle = int.TryParse(form["LifeCycle"], out dLifeCycle) ? dLifeCycle : 0;
                device.LifeCycle = dLifeCycle;

                // Forcat
                int dForcast = int.TryParse(form["Forcast"], out dForcast) ? dForcast : 0;
                device.Forcast = dForcast;

                // Qty
                int dQuantity = int.TryParse(form["Quantity"], out dQuantity) ? dQuantity : 0;
                device.Quantity = dQuantity;

                // Qty Confirm
                int dQtyConfirm = int.TryParse(form["Quantity"], out dQtyConfirm) ? dQtyConfirm : 0;
                device.QtyConfirm = dQtyConfirm;

                // Qty Min
                int dMinQty = int.TryParse(form["MinQuantity"], out dMinQty) ? dMinQty : 0;
                device.MinQty = dMinQty;

                // Qty PO
                //int dPOQty = int.TryParse(form["POQuantity"], out dPOQty) ? dPOQty : 0;
                //device.POQty = dPOQty;

                // Product, group, vendor
                device = AddNavigation(form, device);

                // Other
                device.DeviceDate = DateTime.Now;
                device.CreatedDate = DateTime.Now;
                device.RealQty = dQtyConfirm;
                device.SysQuantity = dQtyConfirm;

                // Statys
                device.Status = Data.Common.CheckStatus(device);

                db.Devices.Add(device);

                //  Layout
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

                // Alternative PN
                AlternativeDevice altdevice = new AlternativeDevice
                {
                    IdDevice = device.Id,
                    PNs = form["AlternativePN"]
                };
                db.AlternativeDevices.Add(altdevice);

                db.SaveChanges();
                return Json(new { status = true });
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message });
            }
        }
        [Authentication(Roles = new[] { "CRUD" })]
        private string SaveImage(HttpPostedFileBase file, int IdDevice, bool isUnconfirm = false)
        {
            try
            {
                var fileName = Path.GetFileNameWithoutExtension(file.FileName);

                Debug.WriteLine(fileName);

                var fileExtention = Path.GetExtension(file.FileName);
                string folderName = isUnconfirm ? "DeviceUnconfirmImages" : "DeviceImages";

                var folderPath = Server.MapPath($"~/Data/NewToolingRoom/{folderName}/{IdDevice}");

                Debug.WriteLine(folderPath);

                if (!Directory.Exists(folderPath)) Directory.CreateDirectory(folderPath);

                var savePath = Path.Combine(folderPath, $"{fileName} - {DateTime.Now:yyyy-MM-dd HH.mm.ss.ff}{fileExtention}");

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
            else if (dProductNames.Length == 2)
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
        [Authentication(Roles = new[] { "CRUD" })]
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
        #endregion

        /* DEVICE MANAGERMENT */
        #region Device Management
        [HttpGet]
        [Authentication]
        public ActionResult DeviceManagement()
        {
            return View();
        }
        [Authentication(Roles = new[] { "CRUD" })]
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

        [HttpPost]
        [Authentication(Roles = new[] { "CRUD" })]
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
        [Authentication(Roles = new[] { "CRUD" })]
        public JsonResult UpdateDevice(FormCollection form)
        {
            try
            {
                int Id = int.Parse(form["Id"]);
                var oldDevice = db.Devices.FirstOrDefault(d => d.Id == Id);

                string vendorname = form["Vendor"];
                string groupname = form["Group"];
                string[] products = form["Product"].Split('|');
                string productname = products[0].Trim();
                string mts = products.Length == 2 ? products[1].Trim() : "";

                var product = db.Products.FirstOrDefault(p => p.ProductName == productname && (mts != string.Empty ? p.MTS == mts : true));
                var group = db.Groups.FirstOrDefault(g => g.GroupName == groupname);
                var vendor = db.Vendors.FirstOrDefault(v => v.VendorName == vendorname);


                if (oldDevice != null)
                {
                    Entities.Device device = new Entities.Device
                    {
                        Id = oldDevice.Id,
                        DeviceCode = form["DeviceCode"],
                        DeviceName = form["DeviceName"],
                        DeviceDate = DateTime.Now,
                        Buffer = (double)Math.Round(double.Parse(form["Buffer"]), 2),
                        Quantity = int.Parse(form["Quantity"]),
                        //Type = 
                        IdWareHouse = int.Parse(form["IdWareHouse"]),
                        IdGroup = group.Id,
                        IdVendor = vendor.Id,
                        CreatedDate = oldDevice.CreatedDate,
                        IdProduct = product.Id,
                        //IdModel = int.Parse(form["IdModel"]),
                        //IdStation = int.Parse(form["IdStation"]),
                        Relation = form["Relation"],
                        LifeCycle = int.Parse(form["LifeCycle"]),
                        Forcast = oldDevice.Forcast,
                        QtyConfirm = int.Parse(form["QtyConfirm"]),
                        ACC_KIT = oldDevice.ACC_KIT,
                        RealQty = int.Parse(form["RealQty"]),
                        ImagePath = oldDevice.ImagePath,
                        Specification = form["Specification"],
                        Unit = form["Unit"],
                        DeliveryTime = form["DeliveryTime"],
                        //SysQuantity = 
                        MinQty = int.Parse(form["MinQty"]),
                        POQty = int.Parse(form["POQty"]),
                        Type_BOM = oldDevice.Type_BOM,
                        MOQ = int.Parse(form["MOQ"]) != oldDevice.MOQ ? int.Parse(form["MOQ"]) : oldDevice.MOQ,
                        //isConsign =
                        NG_Qty = int.Parse(form["NG_Qty"]),
                        DeviceOwner = form["Owner"],
                    };
                    // Alternative PN
                    var AltPN = oldDevice.AlternativeDevices.FirstOrDefault();
                    if (AltPN != null)
                    {
                        AltPN.PNs = form["AltPNs"];
                        device.AlternativeDevices.Add(AltPN);
                    }
                    else
                    {
                        AltPN = new AlternativeDevice
                        {
                            IdDevice = device.Id,
                            PNs = form["AltPNs"]
                        };

                        db.AlternativeDevices.Add(AltPN);
                        device.AlternativeDevices.Add(AltPN);
                    }

                    // *** Đừng xoá ngoặc :((
                    device.SysQuantity = device.RealQty - (oldDevice.RealQty - oldDevice.SysQuantity);

                    // Add Navigation Data
                    device = AddNavigation(form, device);
                    device.DeviceWarehouseLayouts = AddLayout(form, device);
                    device.Status = Data.Common.CheckStatus(device);

                    // Check Type
                    var types = form["Type"].Split('_');
                    device.Type = types[1];
                    device.isConsign = types[0] != "normal";

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
        [Authentication(Roles = new[] { "CRUD" })]
        public JsonResult UpdateImage(FormCollection form)
        {
            try
            {
                int id = int.Parse(form["deviceid"]);

                var device = db.Devices.FirstOrDefault(d => d.Id == id);
                if (device != null)
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
        [Authentication(Roles = new[] { "CRUD" })]
        public JsonResult DeleteDevice(int Id)
        {
            try
            {
                using (ToolingRoomEntities db = new ToolingRoomEntities())
                {
                    Entities.Device device = db.Devices.FirstOrDefault(d => d.Id == Id);

                    if (device != null)
                    {
                        device.Status = "Deleted";

                        db.Devices.AddOrUpdate(device);
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
        #endregion

        /* ADD DEVICE FORM BOM */
        #region ADD DEVICE FORM BOM
        [HttpGet]
        [Authentication(Roles = new[] { "CRUD" })]
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
                            string alternativePN = worksheet.Cells[row, 4].Value?.ToString();

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

                                if (alternativePN != string.Empty)
                                {
                                    AlternativeDevice alternative = new AlternativeDevice
                                    {
                                        IdDevice = device.Id,
                                        PNs = alternativePN
                                    };
                                    db.AlternativeDevices.Add(alternative);
                                }

                                db.SaveChanges();
                            }
                            // 2. Đã có
                            else
                            {
                                device.Id = dbDevice.Id;
                                db.DeviceUnconfirms.AddOrUpdate(device);

                                if (alternativePN != string.Empty)
                                {
                                    AlternativeDevice alternative = db.AlternativeDevices.FirstOrDefault(d => d.IdDevice == device.Id);
                                    alternative.PNs = alternativePN;
                                    db.AlternativeDevices.AddOrUpdate(alternative);
                                }

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

            var deviceCode = worksheet.Cells[row, 7].Value?.ToString();
            var deviceName = worksheet.Cells[row, 8].Value?.ToString();
            var groupName = worksheet.Cells[row, 9].Value?.ToString();
            var vendorName = worksheet.Cells[row, 10].Value?.ToString();

            int minQty = int.TryParse(worksheet.Cells[row, 12].Value?.ToString(), out minQty) ? minQty : 0;
            var ACC_KIT = worksheet.Cells[row, 15].Value?.ToString();
            var relation = worksheet.Cells[row, 16].Value?.ToString();

            //var modelName = worksheet.Cells[row, 15].Value?.ToString();
            //var stationName = worksheet.Cells[row, 16].Value?.ToString();

            double forcast = double.TryParse(worksheet.Cells[row, 18].Value?.ToString(), out forcast) ? forcast : 0;
            int lifeCycle = int.TryParse(worksheet.Cells[row, 19].Value?.ToString(), out lifeCycle) ? lifeCycle : 0;
            var Dynamic_Static = worksheet.Cells[row, 20].Value?.ToString();
            double deviceBuffer = double.TryParse(worksheet.Cells[row, 21].Value?.ToString(), out deviceBuffer) ? deviceBuffer : 0;
            int quantity = int.TryParse(worksheet.Cells[row, 11].Value?.ToString(), out quantity) ? quantity : 0;

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

            device.Forcast = forcast;
            device.LifeCycle = lifeCycle;
            device.Type_BOM = Dynamic_Static;
            device.Buffer = deviceBuffer;
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

            if (dbDevice != null)
            {
                dbDevice.IdWareHouse = device.IdWareHouse;
                return dbDevice;
            }

            else return null;
        }
        #endregion

        /* COMMON */
        #region Common
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
                var deviceCodes = db.Devices.Where(d => d.DeviceCode != null && !string.IsNullOrEmpty(d.DeviceCode))
                                            .Select(d => d.DeviceCode)
                                            .Distinct()
                                            .ToList();


                return Json(new { status = true, warehouses, products, models, stations, groups, vendors, deviceCodes }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message }, JsonRequestBehavior.AllowGet);
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
        public JsonResult GetWarehouseDevices(int IdWarehouse)
        {
            try
            {
                //PageNum = 1;
                Entities.Warehouse warehouse = db.Warehouses.FirstOrDefault(w => w.Id == IdWarehouse);
                //var skipAmount = 1000 * (PageNum - 1);

                //var Devices = db.Devices.Where(d => d.IdWareHouse == warehouse.Id).OrderByDescending(d => d.Id).Skip(skipAmount).Take(1000).ToList();

                warehouse.Devices = warehouse.Devices.Where(d => d.IdWareHouse == warehouse.Id && d.Status != "Deleted").OrderByDescending(d => d.Id).ToList();

                return Json(new { status = true, warehouse });
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message });
            }
        }      
        public JsonResult GetDeviceByCode(string DeviceCode)
        {
            try
            {
                Device device = db.Devices.FirstOrDefault(d => d.DeviceCode.ToUpper().Trim() == DeviceCode.ToUpper().Trim());
                if (device != null)
                {                  
                    return Json(new { status = true, device }, JsonRequestBehavior.AllowGet);
                }
                else
                {
                    return Json(new { status = false, message = "Device not found." }, JsonRequestBehavior.AllowGet);
                }
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
                Device device = db.Devices.FirstOrDefault(d => d.Id == Id);
                if (device != null)
                {
                    // Get All Borrow Of Device
                    List<Borrow> borrows = GetDeviceBorrows(device);

                    // Get All Borrow Of Device               
                    List<Return> returns = GetDeviceReturns(device);

                    // Get All Export Of Device               
                    List<Export> exports = GetDeviceExports(device);

                    // Get Warehouse by layout
                    List<Warehouse> warehouses = GetDeviceWarehouseLayouts(device);

                    // GetImagePaths
                    List<string> images = GetDeviceImagePaths(device);

                    return Json(new { status = true, device, borrows, returns, exports, warehouses, images });
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
        public List<Borrow> GetDeviceBorrows(Device device)
        {
            List<Borrow> borrows = db.Borrows.Where(b => b.BorrowDevices.Any(bd => bd.IdDevice == device.Id)).ToList();
            foreach (var borrow in borrows)
            {
                foreach (var borrowDevice in borrow.BorrowDevices)
                {
                    borrowDevice.Device = null;
                }
            }
            return borrows;
        }
        public List<Return> GetDeviceReturns(Device device)
        {
            List<Return> returns = db.Returns.Where(r => r.ReturnDevices.Any(rd => rd.IdDevice == device.Id)).ToList();
            foreach (var _return in returns)
            {
                foreach (var returnDevice in _return.ReturnDevices)
                {
                    returnDevice.Device = null;
                }
            }
            return returns;
        }
        public List<Export> GetDeviceExports(Device device)
        {
            List<Export> exports = db.Exports.Where(r => r.ExportDevices.Any(rd => rd.IdDevice == device.Id)).ToList();
            foreach (var export in exports)
            {
                foreach (var exportDevice in export.ExportDevices)
                {
                    exportDevice.Device = null;
                }
            }
            return exports;
        }
        public List<Warehouse> GetDeviceWarehouseLayouts(Device device)
        {
            List<Warehouse> warehouses = new List<Warehouse>();
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
            return warehouses;
        }
        public List<string> GetDeviceImagePaths(Device device)
        {
            List<string> images = new List<string>();
            try
            {
                if (!string.IsNullOrEmpty(device.ImagePath)) images = Directory.GetFiles(device.ImagePath).ToList();
            }
            catch
            {

            }
            return images;
        }
        #endregion

        /* EXCEL - INVENTORY */
        #region Excel - Inventory
        public ActionResult ExportExcel()
        {
            try
            {
                ExcelPackage.LicenseContext = OfficeOpenXml.LicenseContext.NonCommercial;

                string fileName = $"Devices - {DateTime.Now:yyyy.MM.dd HH.mm.ss.ff}.xlsx";
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
            ExcelPackage.LicenseContext = OfficeOpenXml.LicenseContext.NonCommercial;

            if (file != null && file.ContentLength > 0)
            {
                string fileName = $"Devices - {DateTime.Now:yyyy.MM.dd HH.mm.ss.ff}.xlsx";
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

                using (var outputPackage = new ExcelPackage(filePath))
                using (var package = new ExcelPackage(file.InputStream))
                {
                    var outWorksheet = outputPackage.Workbook.Worksheets.Add("Inventory");
                    var worksheet = package.Workbook.Worksheets[0];

                    //header
                    outWorksheet.Cells[1, 1].Value = "MTS";
                    outWorksheet.Cells[1, 2].Value = "Product";
                    outWorksheet.Cells[1, 3].Value = "PN";
                    outWorksheet.Cells[1, 4].Value = "Alternative PN";
                    outWorksheet.Cells[1, 5].Value = "Description";
                    outWorksheet.Cells[1, 6].Value = "Group";
                    outWorksheet.Cells[1, 7].Value = "Vendor";
                    outWorksheet.Cells[1, 8].Value = "Quantity";
                    outWorksheet.Cells[1, 9].Value = "AltPNQuantity";
                    outWorksheet.Cells[1, 10].Value = "DefaultMinQuantity";
                    outWorksheet.Cells[1, 11].Value = "Relation";
                    outWorksheet.Cells[1, 12].Value = "LifeCycleLimit";
                    outWorksheet.Cells[1, 13].Value = "Dynamic/Static";
                    outWorksheet.Cells[1, 14].Value = "Buffer";
                    outWorksheet.Cells[1, 15].Value = "LeadTime";
                    outWorksheet.Cells[1, 16].Value = "MOQ";
                    outWorksheet.Cells[1, 17].Value = "PR Quantity";
                    outWorksheet.Cells[1, 18].Value = "PR No";
                    outWorksheet.Cells[1, 19].Value = "PR Date";
                    outWorksheet.Cells[1, 20].Value = "PO No";
                    outWorksheet.Cells[1, 21].Value = "PO Date";
                    outWorksheet.Cells[1, 22].Value = "Days (PO - PR)";
                    outWorksheet.Cells[1, 23].Value = "Type";
                    outWorksheet.Cells[1, 24].Value = "ETD";
                    outWorksheet.Cells[1, 25].Value = "ETA";
                    outWorksheet.Cells[1, 26].Value = "RealQuantity";
                    outWorksheet.Cells[1, 27].Value = "NG_Quantity";
                    outWorksheet.Cells[1, 28].Value = "RequestQuantity";
                    outWorksheet.Cells[1, 29].Value = "GAP";
                    outWorksheet.Cells[1, 30].Value = "Risk";
                    outWorksheet.Cells[1, 31].Value = "HavePicture (Y/N)";
                    outWorksheet.Cells[1, 32].Value = "Owner";
                    outWorksheet.Cells[1, 33].Value = "Remark";

                    outWorksheet.Cells["A1:AG1"].Style.Border.Bottom.Style = ExcelBorderStyle.Thin;
                    outWorksheet.Cells["A1:AG1"].Style.Border.Top.Style = ExcelBorderStyle.Thin;
                    outWorksheet.Cells["A1:AG1"].Style.Border.Left.Style = ExcelBorderStyle.Thin;
                    outWorksheet.Cells["A1:AG1"].Style.Border.Right.Style = ExcelBorderStyle.Thin;
                    outWorksheet.Cells["A1:AG1"].Style.Font.Bold = true;

                    outWorksheet.Cells[$"AD1:AD{worksheet.Dimension.End.Row}"].Style.Font.Bold = true;

                    System.Drawing.Color headerBackground = System.Drawing.ColorTranslator.FromHtml("#00B050");
                    outWorksheet.Cells[$"A1:AG1"].Style.Fill.PatternType = ExcelFillStyle.Solid;
                    outWorksheet.Cells[$"A1:AG1"].Style.Fill.BackgroundColor.SetColor(headerBackground);

                    System.Drawing.Color successBackground = System.Drawing.ColorTranslator.FromHtml("#C6EFCE");
                    System.Drawing.Color successText = System.Drawing.ColorTranslator.FromHtml("#006100");
                    System.Drawing.Color dangerBackground = System.Drawing.ColorTranslator.FromHtml("#FFC7CE");
                    System.Drawing.Color dangerText = System.Drawing.ColorTranslator.FromHtml("#9C0006");
                    System.Drawing.Color warningBackground = System.Drawing.ColorTranslator.FromHtml("#FFEB9C");
                    System.Drawing.Color warningText = System.Drawing.ColorTranslator.FromHtml("#9C5700");

                    int countLoop = 1;
                    foreach (int row in Enumerable.Range(2, worksheet.Dimension.End.Row - 1))
                    {
                        var _PN = worksheet.Cells[row, 1].Value?.ToString();
                        var _RequestQty = int.Parse(worksheet.Cells[row, 2].Value?.ToString());
                        //int comingQty = CountComingDevice(_PN);

                        List<Entities.Device> devices = db.Devices.Where(d => d.DeviceCode.ToUpper().Trim() == _PN.ToUpper().Trim() && d.Status != "Deleted").ToList();
                        if (devices.Count > 0)
                        {
                            Debug.WriteLine($"{countLoop++} - {_PN}");
                            Entities.Device device = devices.FirstOrDefault();
                            device.Product = devices?.FirstOrDefault(d => d.Product != null)?.Product;
                            device.Group = devices?.FirstOrDefault(d => d.Group != null)?.Group;
                            device.Vendor = devices?.FirstOrDefault(d => d.Vendor != null)?.Vendor;

                            var dtemp1 = devices.FirstOrDefault(d => d.AlternativeDevices != null && d.AlternativeDevices.Count > 0);
                            device.AlternativeDevices = dtemp1 != null ? dtemp1.AlternativeDevices : null;

                            device.QtyConfirm = devices.Sum(d => d.QtyConfirm);
                            device.RealQty = devices.Sum(d => d.RealQty);
                            device.NG_Qty = devices.Sum(d => d.NG_Qty);

                            var dtemp2 = devices.FirstOrDefault(d => Regex.IsMatch(d.DeliveryTime, @"\d"));

                            device.DeliveryTime = dtemp2 != null ? dtemp2.DeliveryTime : "";
                            device.MinQty = devices.FirstOrDefault(d => d.MinQty != null)?.MinQty;
                            device.Buffer = devices.Max(d => d.Buffer);
                            device.LifeCycle = devices.Max(d => d.LifeCycle);
                            device.Type_BOM = devices.FirstOrDefault(d => d.Type_BOM != null)?.Type_BOM;
                            device.ImagePath = devices.FirstOrDefault(d => d.ImagePath != null)?.ImagePath;
                            device.Relation = devices.FirstOrDefault(d => d.Relation != null)?.Relation;
                            device.MOQ = devices.FirstOrDefault(d => d.MOQ != null)?.MOQ;

                            //int ComingQty = CountComingDevice(_PN);
                            int PR_Qty = CountPRDevice(_PN);

                            int AltPnQty = (device.AlternativeDevices != null) ? CountAltPNQuantity(device.AlternativeDevices.ToList().First().PNs) : 0;
                            int GAP = (PR_Qty + (device.RealQty ?? 0)) - _RequestQty;
                            int totalQty = (device.QtyConfirm ?? 0) + PR_Qty;

                            string Risk = "High";
                            if (GAP > 0 && totalQty >= (device.MinQty ?? 0))
                            {
                                Risk = "Low";
                            }
                            else if (GAP >= 0 && totalQty < (device.MinQty ?? 0))
                            {
                                Risk = "Mid";
                            }
                            else
                            {
                                Risk = "High";
                            }


                            // MTS, Product, PN, AlternativePN, Description
                            outWorksheet.Cells[row, 1].Value = (device.Product != null) ? device.Product.MTS : string.Empty;
                            outWorksheet.Cells[row, 2].Value = (device.Product != null) ? device.Product.ProductName : string.Empty;
                            outWorksheet.Cells[row, 3].Value = (device.DeviceCode != null) ? device.DeviceCode : string.Empty;
                            outWorksheet.Cells[row, 4].Value = (device.AlternativeDevices != null && device.AlternativeDevices.Count > 0) ? device.AlternativeDevices.First().PNs : string.Empty;
                            outWorksheet.Cells[row, 5].Value = (device.DeviceName != null) ? device.DeviceName : string.Empty;
                            // Group, Vendor, Quantity, AltPNQuantity, DefaultMinQuantity
                            outWorksheet.Cells[row, 6].Value = (device.Group != null) ? device.Group.GroupName : string.Empty;
                            outWorksheet.Cells[row, 7].Value = (device.Vendor != null) ? device.Vendor.VendorName : string.Empty;
                            outWorksheet.Cells[row, 8].Value = (device.QtyConfirm != null) ? device.QtyConfirm : 0;
                            outWorksheet.Cells[row, 9].Value = AltPnQty;
                            outWorksheet.Cells[row, 10].Value = (device.MinQty != null) ? device.MinQty : 0;
                            // Relation, LifeCycleLimit, Dynamic/Static, Buffer, LeadTime, MOQ                               
                            outWorksheet.Cells[row, 11].Value = (device.Relation != null) ? device.Relation : string.Empty;
                            outWorksheet.Cells[row, 12].Value = (device.LifeCycle != null) ? device.LifeCycle : 0;
                            outWorksheet.Cells[row, 13].Value = (device.Type_BOM != null) ? device.Type_BOM : (device.Type == "NA") ? "NA" : (device.Type.Length > 0 ? device.Type[0].ToString() : "");
                            outWorksheet.Cells[row, 14].Value = (device.Buffer != null) ? device.Buffer : 0;
                            outWorksheet.Cells[row, 15].Value = (device.DeliveryTime != null) ? device.DeliveryTime : string.Empty;
                            outWorksheet.Cells[row, 16].Value = (device.MOQ != null) ? device.MOQ : 0;
                            // PR                        
                            outWorksheet.Cells[row, 17].Value = PR_Qty;

                            var PRDevices = db.DevicePRs.Where(d => d.Device.DeviceCode.ToUpper().Trim() == _PN.ToUpper().Trim()).ToList();

                            var i = 0;
                            foreach (var dpr in PRDevices)
                            {
                                var type = db.PurchaseRequests.FirstOrDefault(p => p.Id == dpr.IdPurchaseRequest).Type;
                                if (i < PRDevices.Count - 1)
                                {
                                    outWorksheet.Cells[row, 18].Value += (dpr.PR_No ?? "") + "\r\n";
                                    outWorksheet.Cells[row, 19].Value += (dpr.PR_CreatedDate?.ToString("yyyy-MM-dd HH:mm") ?? "") + "\r\n";
                                    outWorksheet.Cells[row, 20].Value += (dpr.PO_No ?? "") + "\r\n";
                                    outWorksheet.Cells[row, 21].Value += (dpr.PO_CreatedDate?.ToString("yyyy-MM-dd HH:mm") ?? "") + "\r\n";

                                    var days = (dpr.PR_CreatedDate != null && dpr.PO_CreatedDate != null) ? ((dpr.PO_CreatedDate ?? DateTime.Now) - (dpr.PR_CreatedDate ?? DateTime.Now)).Days : 0;
                                    outWorksheet.Cells[row, 22].Value += days + "\r\n";

                                    outWorksheet.Cells[row, 23].Value += $"{type}\r\n";
                                    outWorksheet.Cells[row, 24].Value += (dpr.PO_CreatedDate?.ToString("yyyy-MM-dd HH:mm") ?? "") + "\r\n";
                                    outWorksheet.Cells[row, 25].Value += (dpr.PO_CreatedDate?.ToString("yyyy-MM-dd HH:mm") ?? "") + "\r\n";
                                }
                                else
                                {
                                    outWorksheet.Cells[row, 18].Value += (dpr.PR_No ?? "");
                                    outWorksheet.Cells[row, 19].Value += (dpr.PR_CreatedDate?.ToString("yyyy-MM-dd HH:mm") ?? "");
                                    outWorksheet.Cells[row, 20].Value += (dpr.PO_No ?? "");
                                    outWorksheet.Cells[row, 21].Value += (dpr.PO_CreatedDate?.ToString("yyyy-MM-dd HH:mm") ?? "");

                                    var days = (dpr.PR_CreatedDate != null && dpr.PO_CreatedDate != null) ? ((dpr.PO_CreatedDate ?? DateTime.Now) - (dpr.PR_CreatedDate ?? DateTime.Now)).Days : 0;
                                    outWorksheet.Cells[row, 22].Value += days.ToString();

                                    outWorksheet.Cells[row, 23].Value += $"{type}";
                                    outWorksheet.Cells[row, 24].Value += (dpr.PO_CreatedDate?.ToString("yyyy-MM-dd HH:mm") ?? "");
                                    outWorksheet.Cells[row, 25].Value += (dpr.PO_CreatedDate?.ToString("yyyy-MM-dd HH:mm") ?? "");
                                }
                                i++;
                                
                            }
                            outWorksheet.Cells[row, 18, row, 25].Style.WrapText = true;

                            // RealQuantity, NGQuantity, RequestQuantity, GAP, Risk, HavePicture (Y/N), Owner
                            outWorksheet.Cells[row, 26].Value = (device.RealQty != null) ? device.RealQty : 0;
                            outWorksheet.Cells[row, 27].Value = (device.NG_Qty != null) ? device.NG_Qty : 0;
                            outWorksheet.Cells[row, 28].Value = _RequestQty;
                            outWorksheet.Cells[row, 29].Formula = $"(Q{row}+Z{row})-AB{row}";
                            outWorksheet.Cells[row, 30].Value = Risk;
                            outWorksheet.Cells[row, 31].Value = (device.ImagePath != null) ? "Y" : "N";
                            outWorksheet.Cells[row, 32].Value = (device.DeviceOwner != null) ? device.DeviceOwner : "";

                            switch (Risk)
                            {
                                case "Low":
                                    outWorksheet.Cells[$"A{row}:AG{row}"].Style.Fill.PatternType = ExcelFillStyle.Solid;
                                    outWorksheet.Cells[$"A{row}:AG{row}"].Style.Fill.BackgroundColor.SetColor(successBackground);
                                    outWorksheet.Cells[$"A{row}:AG{row}"].Style.Font.Color.SetColor(successText);
                                    break;
                                case "Mid":                                    
                                    outWorksheet.Cells[$"A{row}:AG{row}"].Style.Fill.PatternType = ExcelFillStyle.Solid;
                                    outWorksheet.Cells[$"A{row}:AG{row}"].Style.Fill.BackgroundColor.SetColor(warningBackground);
                                    outWorksheet.Cells[$"A{row}:AG{row}"].Style.Font.Color.SetColor(warningText);
                                    break;
                                case "High":
                                    outWorksheet.Cells[$"A{row}:AG{row}"].Style.Fill.PatternType = ExcelFillStyle.Solid;
                                    outWorksheet.Cells[$"A{row}:AG{row}"].Style.Fill.BackgroundColor.SetColor(dangerBackground);
                                    outWorksheet.Cells[$"A{row}:AG{row}"].Style.Font.Color.SetColor(dangerText);
                                    break;
                            }

                        }
                        else
                        {
                            outWorksheet.Cells[row, 3].Value = _PN;
                            outWorksheet.Cells[row, 27].Value = _RequestQty;

                            outWorksheet.Cells[$"A{row}:AG{row}"].Style.Fill.PatternType = ExcelFillStyle.Solid;
                            outWorksheet.Cells[$"A{row}:AG{row}"].Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.LightGray);
                        }

                        outWorksheet.Cells[$"A{row}:AG{row}"].Style.Border.Bottom.Style = ExcelBorderStyle.Thin;
                        outWorksheet.Cells[$"A{row}:AG{row}"].Style.Border.Top.Style = ExcelBorderStyle.Thin;
                        outWorksheet.Cells[$"A{row}:AG{row}"].Style.Border.Left.Style = ExcelBorderStyle.Thin;
                        outWorksheet.Cells[$"A{row}:AG{row}"].Style.Border.Right.Style = ExcelBorderStyle.Thin;
                    }
                

                    outWorksheet.Cells[outWorksheet.Dimension.Address].AutoFitColumns();
                    outWorksheet.Cells[outWorksheet.Dimension.Address].Style.VerticalAlignment = ExcelVerticalAlignment.Center;

                    outWorksheet.Column(18).Width = 30;
                    outWorksheet.Column(19).Width = 20;
                    outWorksheet.Column(20).Width = 30;
                    outWorksheet.Column(21).Width = 20;
                    outWorksheet.Column(23).Width = 20;
                    outWorksheet.Column(24).Width = 20;
                    outWorksheet.Column(25).Width = 20;

                    outputPackage.Save();

                    return Json(new { status = true, url = $"/Data/NewToolingroom/{fileName}" });
                }
            }
            else
            {
                return Json(new { status = false, message = "File is empty" });
            }
        }
        #endregion

        /* CONFIRM  DEVICE */
        #region Device Confirm
        [HttpGet]
        [Authentication(Roles = new[] { "CRUD" })]
        public ActionResult ConfirmDevice()
        {
            return View();
        }
        public JsonResult GetDevicesUnconfirm(int IdWarehouse)
        {
            try
            {
                var devices = db.DeviceUnconfirms.Where(d => d.IdWareHouse == IdWarehouse).OrderByDescending(d => d.Id).ToList();

                return Json(new { status = true, devices }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }
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

        // [HttpPost]
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
                        DeviceDate = DateTime.Now,
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
                        Quantity = int.Parse(form["QtyConfirm"]),
                        CreatedDate = DateTime.Parse(form["CreatedDate"]),
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
                return Json(new { status = false, message = ex.Message });
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

        /* COMING DEVICE */
        #region Coming
        [HttpGet]
        [Authentication]
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
                return Json(new { status = false, message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }
        public JsonResult GetComingDevice(int Id)
        {
            try
            {
                var ComingDevice = db.ComingDevices.FirstOrDefault(d => d.Id == Id);
                if (ComingDevice != null)
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
                if (Type == "confirm")
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
                else if (Type == "unconfirm")
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
                return Json(new { status = false, message = ex.Message }, JsonRequestBehavior.AllowGet);
            }

        }

        [HttpPost]
        public JsonResult AddComingDevice(ComingDevice ComingDevice)
        {
            try
            {
                if (ComingDevice.ComingQty <= 0 || ComingDevice.ComingQty == null || (ComingDevice.IdDevice == null && ComingDevice.IdDeviceUnconfirm == null))
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

                var dbComingDevice = db.ComingDevices.FirstOrDefault(db => db.Id == ComingDevice.Id);
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

                if (ComingDevice != null)
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
                if (ComingDevice != null)
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
                    else if (ConfirmQty > ComingDevice.ComingQty)
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

        /* HIDDEN UPDATE */
        #region Hidden Update
        [Authentication(Roles = new[] { "CRUD" })]
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
        [Authentication(Roles = new[] { "CRUD" })]
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
        [Authentication(Roles = new[] { "CRUD" })]
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
                                    var __Des = worksheet.Cells[row, 3].Value?.ToString();
                                    if (!string.IsNullOrEmpty(__Des))
                                    {
                                        Device device = new Device
                                        {
                                            DeviceCode = _PN,
                                            DeviceName = __Des,
                                            DeviceDate = DateTime.Now,
                                            Buffer = 0,
                                            Quantity = 0,
                                            Type = "NA",
                                            Status = "Out Range",
                                            IdWareHouse = 1,
                                            IdGroup = 341,
                                            IdVendor = 350,
                                            CreatedDate = DateTime.Now,
                                            IdProduct = 368,
                                            IdModel = 339,
                                            IdStation = 323,
                                            Relation = "",
                                            LifeCycle = 0,
                                            Forcast = 0,
                                            QtyConfirm = 0,
                                            ACC_KIT = null,
                                            RealQty = 0,
                                            ImagePath = null,
                                            Specification = "",
                                            Unit = "",
                                            DeliveryTime = " Week",
                                            SysQuantity = 0,
                                            MinQty = 0,
                                            POQty = 0,
                                            Type_BOM = null,
                                            MOQ = 0,
                                            isConsign = false,
                                            NG_Qty = 0,
                                        };

                                        db.Devices.Add(device);
                                        comingdevice.Device = device;
                                    }
                                    else
                                    {
                                        Debug.WriteLine($"PN: {_PN}, Row: {row}");
                                        continue;
                                    }

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
        [Authentication(Roles = new[] { "CRUD" })]
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
        [Authentication(Roles = new[] { "CRUD" })]
        public ActionResult UpdateRelation(HttpPostedFileBase file)
        {
            try
            {
                ExcelPackage.LicenseContext = OfficeOpenXml.LicenseContext.NonCommercial;

                if (file != null && file.ContentLength > 0)
                {
                    string fileName = $"UpdateRelation - {DateTime.Now.ToString("yyyy.MM.dd HH.mm.ss.ff")}.xlsx";
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
                            var _Relation = worksheet.Cells[row, 2].Value?.ToString();

                            var devices = db.Devices.Where(d => d.DeviceCode.ToUpper().Trim() == _PN.ToUpper().Trim()).ToList();
                            foreach (var device in devices)
                            {
                                device.Relation = _Relation;
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
        [Authentication(Roles = new[] { "CRUD" })]
        public ActionResult UpdateOwner(HttpPostedFileBase file)
        {
            try
            {
                ExcelPackage.LicenseContext = OfficeOpenXml.LicenseContext.NonCommercial;

                if (file != null && file.ContentLength > 0)
                {
                    string fileName = $"UpdateOwner - {DateTime.Now.ToString("yyyy.MM.dd HH.mm.ss.ff")}.xlsx";
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
                            var _Owner = worksheet.Cells[row, 2].Value?.ToString();

                            var devices = db.Devices.Where(d => d.DeviceCode.ToUpper().Trim() == _PN.ToUpper().Trim()).ToList();
                            foreach (var device in devices)
                            {
                                device.DeviceOwner = _Owner;
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
        [Authentication(Roles = new[] { "CRUD" })]
        public ActionResult UpdateProduct(HttpPostedFileBase file)
        {
            try
            {
                ExcelPackage.LicenseContext = OfficeOpenXml.LicenseContext.NonCommercial;

                if (file != null && file.ContentLength > 0)
                {
                    string fileName = $"UpdateMTS - {DateTime.Now.ToString("yyyy.MM.dd HH.mm.ss.ff")}.xlsx";
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
                            var _MTS = worksheet.Cells[row, 1].Value?.ToString();
                            var _Product = worksheet.Cells[row, 2].Value?.ToString();

                            var products = db.Products.Where(p => p.MTS.ToUpper().Trim() == _MTS.ToUpper().Trim()).ToList();

                            if (_MTS != null && products.Count > 0)
                            {
                                products.First().ProductName = _Product;
                                db.Products.AddOrUpdate(products.First());

                                for (int i = 1; i < products.Count; i++)
                                {
                                    var IdProduct = products[i].Id;
                                    var devices = db.Devices.Where(d => d.IdProduct == IdProduct).ToList();
                                    foreach (var device in devices)
                                    {
                                        device.IdProduct = products.First().Id;
                                        db.Devices.AddOrUpdate(device);
                                    }

                                    db.Products.Remove(products[i]);
                                    db.SaveChanges();
                                }
                            }
                            else
                            {
                                var product = new Product
                                {
                                    MTS = _MTS,
                                    ProductName = _Product,
                                };
                                db.Products.Add(product);
                                db.SaveChanges();
                            }
                        }


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
        [Authentication(Roles = new[] { "CRUD" })]
        public ActionResult UpdateDescription(HttpPostedFileBase file)
        {
            try
            {
                ExcelPackage.LicenseContext = OfficeOpenXml.LicenseContext.NonCommercial;

                if (file != null && file.ContentLength > 0)
                {
                    string fileName = $"UpdateDescription - {DateTime.Now.ToString("yyyy.MM.dd HH.mm.ss.ff")}.xlsx";
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
                            var _Desc = worksheet.Cells[row, 2].Value?.ToString();

                            var devices = db.Devices.Where(d => d.DeviceCode.ToUpper().Trim() == _PN.ToUpper().Trim()).ToList();

                            if (_PN != null && devices.Count > 0)
                            {
                                foreach (var device in devices)
                                {
                                    device.DeviceName = _Desc.Trim();
                                    db.Devices.AddOrUpdate(device);
                                }
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
        [Authentication(Roles = new[] { "CRUD" })]
        public ActionResult UpdateGroupAndVendor(HttpPostedFileBase file)
        {
            try
            {
                ExcelPackage.LicenseContext = OfficeOpenXml.LicenseContext.NonCommercial;

                if (file != null && file.ContentLength > 0)
                {
                    string fileName = $"UpdateGroupVendor - {DateTime.Now.ToString("yyyy.MM.dd HH.mm.ss.ff")}.xlsx";
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
                            var _Group = worksheet.Cells[row, 2].Value?.ToString();
                            var _Vendor = worksheet.Cells[row, 3].Value?.ToString();

                            var devices = db.Devices.Where(d => d.DeviceCode.ToUpper().Trim() == _PN.ToUpper().Trim()).ToList();

                            if (_PN != null && devices.Count > 0)
                            {
                                foreach (var device in devices)
                                {
                                    var group = db.Groups.FirstOrDefault(g => g.GroupName.ToUpper().Trim() == _Group.ToUpper().Trim());
                                    var vendor = db.Vendors.FirstOrDefault(g => g.VendorName.ToUpper().Trim() == _Vendor.ToUpper().Trim());

                                    if (group == null)
                                    {
                                        group = new Group
                                        {
                                            GroupName = _Group
                                        };
                                        db.Groups.Add(group);
                                    }
                                    else
                                    {
                                        group.GroupName = _Group.Trim();
                                        db.Groups.AddOrUpdate(group);
                                    }
                                    if (vendor == null)
                                    {
                                        vendor = new Vendor
                                        {
                                            VendorName = _Vendor
                                        };
                                        db.Vendors.Add(vendor);
                                    }
                                    else
                                    {
                                        vendor.VendorName = _Vendor.Trim();
                                        db.Vendors.AddOrUpdate(vendor);
                                    }

                                    device.IdGroup = group.Id;
                                    device.IdVendor = vendor.Id;
                                    db.Devices.AddOrUpdate(device);
                                }
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
        [Authentication(Roles = new[] { "CRUD" })]
        public ActionResult UpdateMinQty(HttpPostedFileBase file)
        {
            try
            {
                ExcelPackage.LicenseContext = OfficeOpenXml.LicenseContext.NonCommercial;

                if (file != null && file.ContentLength > 0)
                {
                    string fileName = $"UpdateMinQty - {DateTime.Now.ToString("yyyy.MM.dd HH.mm.ss.ff")}.xlsx";
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
                            var _MinQty = worksheet.Cells[row, 2].Value?.ToString();

                            var devices = db.Devices.Where(d => d.DeviceCode.ToUpper().Trim() == _PN.ToUpper().Trim()).ToList();

                            if (_PN != null && devices.Count > 0)
                            {
                                foreach (var device in devices)
                                {
                                    device.MinQty = int.Parse(_MinQty);
                                    db.Devices.AddOrUpdate(device);
                                }
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
        [Authentication(Roles = new[] { "CRUD" })]
        public ActionResult UpdateDeviceProduct(HttpPostedFileBase file)
        {
            try
            {
                ExcelPackage.LicenseContext = OfficeOpenXml.LicenseContext.NonCommercial;

                if (file != null && file.ContentLength > 0)
                {
                    string fileName = $"UpdateDeviceProduct - {DateTime.Now.ToString("yyyy.MM.dd HH.mm.ss.ff")}.xlsx";
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
                            var _MTS = worksheet.Cells[row, 2].Value?.ToString();
                            var _PRODUCT = worksheet.Cells[row, 3].Value?.ToString();

                            Debug.WriteLine(_MTS);

                            var devices = db.Devices.Where(d => d.DeviceCode.ToUpper().Trim() == _PN.ToUpper().Trim()).ToList();

                            var product = new Product();
                            if(_MTS != null)
                            {
                                product = db.Products.FirstOrDefault(p => p.MTS.ToUpper().Trim() == _MTS.ToUpper().Trim());
                            }

                            if(product == null && _PRODUCT != null)
                            {
                                product = db.Products.FirstOrDefault(p => p.ProductName.ToUpper().Trim() == _PRODUCT.ToUpper().Trim());
                            }
                            
                            if(product.MTS == null && product.ProductName == null)
                            {
                                product = new Product
                                {
                                    ProductName = _PRODUCT,
                                    MTS = _MTS,
                                };
                                db.Products.Add(product);
                                db.SaveChanges();
                            }

                            if (_PN != null && devices.Count > 0)
                            {
                                foreach (var device in devices)
                                {
                                    device.IdProduct = product.Id;
                                    db.Devices.AddOrUpdate(device);
                                }
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
        [Authentication(Roles = new[] { "CRUD" })]
        public ActionResult UpdateDeviceFile(HttpPostedFileBase file)
        {
            try
            {
                ExcelPackage.LicenseContext = OfficeOpenXml.LicenseContext.NonCommercial;

                if (file != null && file.ContentLength > 0)
                {
                    string fileName = $"UpdateDevice - {DateTime.Now.ToString("yyyy.MM.dd HH.mm.ss.ff")}.xlsx";
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
                            var _MTS = worksheet.Cells[row, 1].Value?.ToString();
                            var _PRODUCT = worksheet.Cells[row, 2].Value?.ToString();
                            var _PN = worksheet.Cells[row, 3].Value?.ToString();
                            var _DESC = worksheet.Cells[row, 5].Value?.ToString();
                            var _GROUP = worksheet.Cells[row, 6].Value?.ToString();
                            var _VENDOR = worksheet.Cells[row, 7].Value?.ToString();
                            var _MINQTY = int.Parse(worksheet.Cells[row, 10].Value?.ToString());
                            var _RELATION = worksheet.Cells[row, 11].Value?.ToString();
                            var _LIMIT = int.Parse(worksheet.Cells[row, 12].Value?.ToString());
                            var _TYPE = worksheet.Cells[row, 13].Value?.ToString();
                            var _BUFFER = (double)Math.Round(double.Parse(worksheet.Cells[row, 14].Value?.ToString()), 2);

                            var product = new Product();
                            if (_MTS != null)
                            {
                                product = db.Products.FirstOrDefault(p => p.MTS == _MTS);
                            }
                            else if (_PRODUCT != null)
                            {
                                product = db.Products.FirstOrDefault(p => p.ProductName == _PRODUCT);
                            }
                            else
                            {
                                product = db.Products.FirstOrDefault(p => p.MTS == null);
                            }
                            
                            var group = db.Groups.FirstOrDefault(g => g.GroupName == _GROUP);
                            var vendor = db.Vendors.FirstOrDefault(v => v.VendorName.ToUpper().Trim() == _VENDOR.ToUpper().Trim());

                            Debug.WriteLine(_PN);

                            var device = new Device
                            {
                                IdProduct = product.Id,
                                DeviceCode = _PN,
                                DeviceName = _DESC,
                                IdGroup = group.Id,
                                IdVendor = vendor.Id,
                                MinQty = _MINQTY,
                                Relation = _RELATION,
                                LifeCycle = _LIMIT,
                                Type_BOM = _TYPE,
                                Buffer = _BUFFER,

                                CreatedDate = DateTime.Now,
                                IdWareHouse = 1,
                                DeliveryTime = " Weel",
                                
                                Quantity = 0,                               
                                QtyConfirm = 0,
                                RealQty = 0,
                                SysQuantity = 0
                            };

                            db.Devices.Add(device);
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
        [Authentication(Roles = new[] { "CRUD" })]
        public ActionResult UpdatePurchaseRequest(HttpPostedFileBase file)
        {
            try
            {
                ExcelPackage.LicenseContext = OfficeOpenXml.LicenseContext.NonCommercial;

                if (file != null && file.ContentLength > 0)
                {
                    string fileName = $"UpdatePurchaseRequest - {DateTime.Now.ToString("yyyy.MM.dd HH.mm.ss.ff")}.xlsx";
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
                    using (var context = new ToolingRoomEntities())
                    using (var package = new ExcelPackage(file.InputStream))
                    {
                        var worksheet = package.Workbook.Worksheets[0];

                        var devices = context.DevicePRs.Include(dpr => dpr.Device).ToList();
                        foreach(var device in devices)
                        {
                            var d_pn = device.Device.DeviceCode.Trim().ToUpper();
                            var d_qty = device.Quantity;

                            for (int row = 2; row <= worksheet.Dimension.End.Row; row++)
                            {
                                var pr_pn = worksheet.Cells[row, 2].Text.Trim().ToUpper();
                                int.TryParse(worksheet.Cells[row, 3].Text, out int pr_qty);

                                if (d_pn == pr_pn && d_qty == pr_qty)
                                {
                                    device.PR_No = worksheet.Cells[row, 4].Text.Trim().ToUpper();
                                    device.PR_Quantity = d_qty;
                                    if (DateTime.TryParse(worksheet.Cells[row, 6].Text, out DateTime pr_date)) device.PR_CreatedDate = pr_date;

                                    device.PO_No = worksheet.Cells[row, 7].Text.Trim().ToUpper();
                                    if (DateTime.TryParse(worksheet.Cells[row, 8].Text, out DateTime po_date)) device.PO_CreatedDate = po_date;

                                    if (DateTime.TryParse(worksheet.Cells[row, 9].Text, out DateTime eta)) device.ETA_Date = eta;
                                    if (DateTime.TryParse(worksheet.Cells[row, 10].Text, out DateTime etd)) device.ETD_Date = etd;

                                    device.IdUserCreated = 17;

                                    context.DevicePRs.AddOrUpdate(device);

                                    break;
                                }
                            }
                        }

                        context.SaveChanges();

                        foreach(var purchaseRequest in context.PurchaseRequests)
                        {
                            RPurchaseRequest.CheckPurchaseRequestStatus(context, purchaseRequest);
                        }

                        context.SaveChanges();

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

        private int CountComingDevice(string PN)
        {
            var comingDevices = db.ComingDevices.Where(d => d.Device.DeviceCode.ToUpper().Trim() == PN.ToUpper().Trim()).ToList();


            int count = 0;

            foreach (var comingDevice in comingDevices)
            {
                count += comingDevice.ComingQty ?? 0;
            }

            return count;
        }
        private int CountPRDevice(string PN)
        {
            var devices = db.DevicePRs.Where(d => d.Device.DeviceCode.ToUpper().Trim() == PN.ToUpper().Trim()).ToList();


            int count = 0;

            foreach (var device in devices)
            {
                count += device.PR_Quantity ?? 0;
            }

            return count;
        }
        private int CountAltPNQuantity(string sPN)
        {
            if (!string.IsNullOrEmpty(sPN.Trim()))
            {
                int Qty = 0;
                string[] PNs = sPN.Split(',');
                foreach (string PN in PNs)
                {
                    var devices = db.Devices.Where(d => d.DeviceCode == PN);
                    foreach (var device in devices)
                    {
                        Qty += device.QtyConfirm ?? 0;
                    }
                }
                return Qty;
            }
            else
            {
                return 0;
            }
        }
        #endregion

        /* NEW FUNC */
        public JsonResult GetSimpleDevices()
        {
            try
            {
                var result = RDevice.GetSimpleDevices();
                return Json(new { status = true, data = result }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }
    }
}