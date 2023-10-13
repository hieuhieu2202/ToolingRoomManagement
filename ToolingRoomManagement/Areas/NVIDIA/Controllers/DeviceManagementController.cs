using Model.EF;
using OfficeOpenXml;
using OfficeOpenXml.FormulaParsing.Excel.Functions.Text;
using System;
using System.Collections.Generic;
using System.Data.Entity.Migrations;
using System.Drawing.Printing;
using System.Globalization;
using System.Linq;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;
using ToolingRoomManagement.Areas.NVIDIA.Entities;
using ToolingRoomManagement.Attributes;
using ToolingRoomManagement.Models;

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

                if (!db.Devices.Any(d => d.DeviceCode == device.DeviceCode && d.IdWareHouse == device.IdWareHouse))
                {
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

                    int dMinQty = int.TryParse(form["MinQty"], out dMinQty) ? dMinQty : 0;
                    device.MinQty = dMinQty;

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
                    return Json(new { status = true });
                }
                else
                {
                    return Json(new { status = false, message = "The device already exists." });
                }
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message });
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
        public JsonResult UpdateDevice(Entities.Device device, int[] IdLayouts)
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
                    device.SysQuantity = device.RealQty;


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

                    db.Devices.AddOrUpdate(device);
                    db.SaveChanges();

                    //Task SaveLog = Task.Run(() =>
                    //{
                    //    Entities.User user = (Entities.User)Session["SignSession"];
                    //    string path = Server.MapPath("/Areas/NVIDIA/Data/DeviceHistoryLog");
                    //    Data.Common.SaveDeviceHistoryLog(user, afterDevice, device, path);
                    //});

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
        public JsonResult AddDeviceAuto(HttpPostedFileBase file)
        {
            try
            {
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
    }
}