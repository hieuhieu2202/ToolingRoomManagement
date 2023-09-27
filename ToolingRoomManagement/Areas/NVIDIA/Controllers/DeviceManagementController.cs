using OfficeOpenXml;
using System;
using System.Collections.Generic;
using System.Data.Entity.Migrations;
using System.Globalization;
using System.Linq;
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
                    DeviceCode = form["DeviceCode"],
                    DeviceName = form["DeviceName"],
                    Relation = form["Relation"],
                    ACC_KIT = form["ACCKIT"],
                    Type = form["Type"],
                    Status = form["Status"],
                };

                double dBuffer = double.TryParse(form["Buffer"], out dBuffer) ? dBuffer : 0;
                device.Buffer = dBuffer;

                int dLifeCycle = int.TryParse(form["LifeCycle"], out dLifeCycle) ? dLifeCycle : 0;
                device.LifeCycle = dLifeCycle;

                int dForcast = int.TryParse(form["Forcast"], out dForcast) ? dForcast : 0;
                device.Forcast = dForcast;

                int dQuantity = int.TryParse(form["Quantity"], out dQuantity) ? dQuantity : 0;
                device.Quantity = dQuantity;

                int dQtyConfirm = int.TryParse(form["Quantity"], out dQtyConfirm) ? dQtyConfirm : 0;
                device.QtyConfirm = dQtyConfirm;

                int dIdWarehouse = int.TryParse(form["Warehouse"], out dIdWarehouse) ? dIdWarehouse : 0;
                device.IdWareHouse = dIdWarehouse;

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

                device.Status = Data.Common.CheckStatus(device);

                db.Devices.Add(device);

                // Create Layout
                var IdLayouts = form["Layout"].Split(',').Select(Int32.Parse).ToArray();
                foreach (var IdLayout in IdLayouts)
                {
                    if(!db.DeviceWarehouseLayouts.Any(l => l.IdDevice == device.Id && l.IdWarehouseLayout == IdLayout))
                    {
                        DeviceWarehouseLayout layout = new DeviceWarehouseLayout
                        {
                            IdDevice = device.Id,
                            IdWarehouseLayout = IdLayout
                        };
                        db.DeviceWarehouseLayouts.Add(layout);
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

                    var sQtyConfirm = rDevice.QtyConfirm + QtyConfirm;

                    if (rDevice.Quantity >= sQtyConfirm)
                    {
                        rDevice.QtyConfirm = sQtyConfirm;
                        rDevice.RealQty += QtyConfirm;

                        rDevice.Status = Data.Common.CheckStatus(rDevice);

                        db.Devices.AddOrUpdate(rDevice);
                        db.SaveChanges();

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
        public JsonResult UpdateDevice(Entities.Device device, int[] IdLayouts)
        {
            try
            {

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

                    device.CreatedDate = DateTime.Now;
                    device.Status = Data.Common.CheckStatus(device);

                    // Layout
                    List<DeviceWarehouseLayout> deviceWarehouseLayouts = db.DeviceWarehouseLayouts.Where(dl => dl.IdDevice == device.Id).ToList();
                    db.DeviceWarehouseLayouts.RemoveRange(deviceWarehouseLayouts);

                    if (IdLayouts == null) System.Diagnostics.Debug.WriteLine("SSS");

                    if(IdLayouts != null || IdLayouts.Length > 0 )
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
        public JsonResult GetWarehouseDevices(int IdWarehouse)
        {
            try
            {
                Entities.Warehouse warehouse = db.Warehouses.FirstOrDefault(w => w.Id == IdWarehouse);

                if (IdWarehouse == 0)
                {
                    Entities.User user = (Entities.User)Session["SignSession"];
                    warehouse = db.Warehouses.FirstOrDefault(w => w.IdUserManager == user.Id);
                    if (warehouse == null)
                    {
                        warehouse = db.Warehouses.Take(1).FirstOrDefault();
                    }
                }
                warehouse.Devices.OrderByDescending(d => d.CreatedDate);
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


        // GET: Add Device Auto
        [HttpGet]
        public ActionResult AddDeviceBOM()
        {
            return View();
        }
        [HttpPost]
        public JsonResult AddDeviceAuto(HttpPostedFileBase file, int IdWareHouse)
        {
            try
            {
                if (file != null && file.ContentLength > 0)
                {
                    using (var package = new ExcelPackage(file.InputStream))
                    {
                        var worksheet = package.Workbook.Worksheets[1];

                        var products = new List<Entities.Product>();
                        var models = new List<Entities.Model>();
                        var stations = new List<Entities.Station>();
                        var groups = new List<Entities.Group>();
                        var vendors = new List<Entities.Vendor>();

                        var devices = new List<Entities.Device>();

                        foreach (int row in Enumerable.Range(2, worksheet.Dimension.End.Row - 1))
                        {
                            var deviceCode = worksheet.Cells[row, 10].Value?.ToString();
                            var isRealBOM = worksheet.Cells[row, 20].Value?.ToString();
                            if (string.IsNullOrEmpty(deviceCode) || isRealBOM != "Y") continue;


                            // Create device in row excel
                            var device = CreateDevice(worksheet, row, IdWareHouse);

                            // Get device in db to check
                            var dbDevice = db.Devices.FirstOrDefault(d =>
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
                                db.Devices.Add(device);
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

                                dbDevice.Status = Data.Common.CheckStatus(dbDevice);

                                db.Devices.AddOrUpdate(dbDevice);
                                db.SaveChanges();
                            }

                            if (!products.Any(p => p.Id == device.Product.Id) && (device.Product.ProductName != null || device.Product.MTS != null)) products.Add(device.Product);
                            if (!models.Any(m => m.Id == device.Model.Id) && device.Model.ModelName != null) models.Add(device.Model);
                            if (!stations.Any(s => s.Id == device.Station.Id) && device.Station.StationName != null) stations.Add(device.Station);
                            if (!groups.Any(g => g.Id == device.Group.Id) && device.Group.GroupName != null) groups.Add(device.Group);
                            if (!vendors.Any(v => v.Id == device.Vendor.Id) && device.Vendor.VendorName != null) vendors.Add(device.Vendor);
                        }


                        return Json(new { status = true, products, models, stations, groups, vendors, devices });
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
        private Entities.Device CreateDevice(ExcelWorksheet worksheet, int row, int IdWareHouse)
        {
            Entities.Device device = new Entities.Device();

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
            device.IdWareHouse = IdWareHouse;
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
                foreach(var borrowdevice in borrowDevices)
                {
                    Entities.Borrow borrow = db.Borrows.FirstOrDefault(b => b.Id == borrowdevice.IdBorrow);
                    borrow.OModel = db.Models.FirstOrDefault(m => m.Id == borrow.Model);
                    borrow.OStation = db.Stations.FirstOrDefault(s => s.Id == borrow.Station);
                    if (!borrows.Any(bl => bl.Id == borrow.Id))
                    {
                        borrows.Add(borrow);
                    }
                }
                // Get Warehouse by layout
                List<Entities.Warehouse> warehouses = new List<Warehouse>();
                foreach(var dwl in device.DeviceWarehouseLayouts)
                {
                    
                    Entities.WarehouseLayout layout = dwl.WarehouseLayout;
                    Entities.Warehouse warehouse = db.Warehouses.FirstOrDefault(w => w.Id == layout.IdWareHouse);
                    warehouses.Add(warehouse);
                }
                foreach(var warehouse in warehouses)
                {
                    warehouse.Devices.Clear();
                    warehouse.User.Password = "";
                    warehouse.WarehouseLayouts.Clear();
                }

                if (device != null)
                {
                    return Json(new { status = true, device, borrows = JsonSerializer.Serialize(borrows), warehouses });
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

                if(warehouse != null)
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

       
    }
}