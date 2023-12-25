using System;
using System.Collections.Generic;
using System.Drawing.Drawing2D;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using ToolingRoomManagement.Areas.NVIDIA.Entities;

namespace ToolingRoomManagement.Areas.API.Controllers
{
    public class ToolroomController : Controller
    {
        // GET: API/Toolroom

        public JsonResult GetStaticDevice()
        {
            try
            {
                using (ToolingRoomEntities db = new ToolingRoomEntities())
                {
                    List<StaticDevice> list = new List<StaticDevice>();

                    var devices = db.Devices
                                    .Where(d => (d.Type == "Fixture" || d.Type == "Static" || d.Type_BOM == "S") && d.Status != "Deleted" && d.DeviceCode != string.Empty)
                                    .GroupBy(d => d.DeviceCode)
                                    .Select(group => group.FirstOrDefault())
                                    .ToList();

                    foreach (var device in devices)
                    {                       
                        StaticDevice staticDevice = new StaticDevice
                        {
                            bu = "MBD",
                            cft = "NVIDIA",
                            factory = "F06",
                            floor = 2,
                            location = GetDeviceLocation(device),
                            typeEquipmentName = device.DeviceName,
                            status = (device.Status != "Lock") ? "OK" : "NG",
                            parameter = device.Unit,
                            equipmentCode = device.DeviceCode,
                            safeNumber = GetDeviceMinQty(device),
                            brand = device.Vendor != null ? device.Vendor.VendorName : "",
                            typeAsset = device.isConsign == true ? "客" : "自",
                            createDate = device.DeviceDate?.ToString("yyyy-MM-dd"),
                            typeEquipment = GetDeviceType(device),

                        };
                        list.Add(staticDevice);
                    }
                    return Json(list, JsonRequestBehavior.AllowGet);
                }
            }
            catch (Exception ex)
            {
                return Json($"Exception: {ex.Message}", JsonRequestBehavior.AllowGet);
            }
        }
        public JsonResult GetDynamicDevice()
        {
            try
            {
                using (ToolingRoomEntities db = new ToolingRoomEntities())
                {
                    List<StaticDevice> list = new List<StaticDevice>();

                    var devices = db.Devices
                                    .Where(d => d.Type == "Dynamic" || d.Type_BOM == "D" && d.Status != "Deleted" && d.DeviceCode != string.Empty)
                                    .GroupBy(d => d.DeviceCode)
                                    .Select(group => group.FirstOrDefault())
                                    .ToList();

                    foreach (var device in devices)
                    {
                        StaticDevice staticDevice = new StaticDevice
                        {
                            bu = "MBDI",
                            cft = "NVIDIA",
                            factory = "F06",
                            floor = 2,
                            location = GetDeviceLocation(device),
                            typeEquipmentName = device.DeviceName,
                            status = (device.Status != "Lock") ? "OK" : "NG",
                            parameter = device.Unit,
                            equipmentCode = device.DeviceCode,
                            safeNumber = GetDeviceMinQty(device),
                            brand = device.Vendor != null ? device.Vendor.VendorName : "",
                            typeAsset = device.isConsign == true ? "客" : "自",
                            createDate = device.DeviceDate?.ToString("yyyy-MM-dd"),
                            typeEquipment = GetDeviceType(device),
                        };
                        list.Add(staticDevice);
                    }
                    return Json(list, JsonRequestBehavior.AllowGet);
                }
            }
            catch (Exception ex)
            {
                return Json($"Exception: {ex.Message}", JsonRequestBehavior.AllowGet);
            }
        }
        public JsonResult GetTypeQuantity()
        {
            try
            {
                using (ToolingRoomEntities db = new ToolingRoomEntities())
                {
                    List<TypeQuantity> list = new List<TypeQuantity>();
                    foreach (var type in db.Devices.Where(d => d.Type != "NA" && d.DeviceCode != string.Empty).Select(d => d.Type).Distinct())
                    {
                        

                        var devices = db.Devices.Where(d => d.Type == type).Select(d => d.Id);

                        var totalDeviceConfirmQty = 0;
                        var totalDeviceRealQty = 0;
                        foreach (var deviceId in devices)
                        {
                            totalDeviceConfirmQty += db.Devices.Where(d => d.Id == deviceId).Sum(d => d.QtyConfirm) ?? 0;
                            totalDeviceRealQty += db.Devices.Where(d => d.Id == deviceId).Sum(d => d.RealQty) ?? 0;
                        }

                        TypeQuantity typeDevices = new TypeQuantity
                        {
                            bu = "MBD",
                            cft = "NVIDIA",
                            factory = "F06",
                            floor = 2,
                            typeEquipment = (type == "Fixture") ? "fixture" : (type == "Static") ? "fixedAsset" : (type == "Dynamic") ? "consume" : "na",
                            quantityOff = totalDeviceRealQty,
                            quantityOn = totalDeviceConfirmQty - totalDeviceRealQty,
                        };
                        list.Add(typeDevices);
                    }
                    return Json(list, JsonRequestBehavior.AllowGet);
                }
            }
            catch (Exception ex)
            {
                return Json($"Exception: {ex.Message}", JsonRequestBehavior.AllowGet);
            }
        }
        public JsonResult GetDeviceQuantity()
        {
            try
            {
                using (ToolingRoomEntities db = new ToolingRoomEntities())
                {
                    List<DeviceQuantity> list = new List<DeviceQuantity>();

                    var devices = db.Devices
                                    .Where(d => d.Type != "NA" && d.Status != "Deleted" && d.DeviceCode != string.Empty)
                                    .GroupBy(d => d.DeviceCode)
                                    .Select(group => group.FirstOrDefault())
                                    .ToList();

                    foreach (var device in devices)
                    {

                        var confirmQty = GetDeviceConfirmQuantity(device);
                        var realQty = GetDeviceRealQuantity(device);

                        DeviceQuantity staticDevice = new DeviceQuantity
                        {
                            bu = "MBDI",
                            cft = "NVIDIA",
                            factory = "F06",
                            floor = 2,
                            typeEquipmentName = device.DeviceName,
                            typeEquipment = GetDeviceType(device),
                            quantityOff = realQty,
                            quantityOn = confirmQty - realQty,
                        };
                        list.Add(staticDevice);
                    }
                    return Json(list, JsonRequestBehavior.AllowGet);
                }
            }
            catch (Exception ex)
            {
                return Json($"Exception: {ex.Message}", JsonRequestBehavior.AllowGet);
            }
        }


        /* OTHER */
        private string GetDeviceLocation(Device device)
        {
            using (ToolingRoomEntities db = new ToolingRoomEntities())
            {
                var warehouseName = db.Warehouses.FirstOrDefault(w => w.Id == device.IdWareHouse)?.WarehouseName;
                var locationList = device.DeviceWarehouseLayouts
                                                      .Select(d =>
                                                      {
                                                          string layout = "";

                                                          if (!string.IsNullOrEmpty(warehouseName))
                                                              layout += $"Warehoue {warehouseName}";

                                                          if (!string.IsNullOrEmpty(d.WarehouseLayout.Line))
                                                              layout += $" - {d.WarehouseLayout.Line}";

                                                          if (!string.IsNullOrEmpty(d.WarehouseLayout.Floor))
                                                              layout += $" - {d.WarehouseLayout.Floor}";

                                                          if (!string.IsNullOrEmpty(d.WarehouseLayout.Cell))
                                                              layout += $" - {d.WarehouseLayout.Cell}";

                                                          return $"[{layout}]";
                                                      })
                                                     .ToList();

                return string.Join(", ", locationList);
            }
        }
        private int GetDeviceMinQty(Device device)
        {
            using (ToolingRoomEntities db = new ToolingRoomEntities())
            {
                var devices = db.Devices.Where(d => d.DeviceCode == device.DeviceCode).ToList();

                int minQty = devices.Max(d => d.MinQty.Value);
                double buffer = devices.Max(d => d.Buffer.Value);
                int confirmQty = devices.Sum(d => d.QtyConfirm.Value);

                return (minQty > 0) ? minQty : (buffer > 0) ? (int)(buffer * confirmQty) : 0;
            }
        }
        private string GetDeviceType(Device device)
        {
            if (device.Type == "Fixture")
            {
                return "fixture";
            }
            else if (device.Type == "Static")
            {
                return "fixedAsset";
            }
            else if (device.Type == "Dynamic")
            {
                return "consume";
            }
            else
            {
                return "na";
            }
        }
        private int GetDeviceConfirmQuantity(Device device)
        {
            using (ToolingRoomEntities db = new ToolingRoomEntities())
            {
                var devices = db.Devices.Where(d => d.DeviceCode == device.DeviceCode).Select(d => d.Id).ToList();
                var totalConfirmQty = 0;
                foreach (var deviceId in devices)
                {
                    totalConfirmQty += db.Devices.Where(d => d.Id == deviceId).Sum(d => d.QtyConfirm) ?? 0;
                }

                return totalConfirmQty;
            }
        }
        private int GetDeviceRealQuantity(Device device)
        {
            using (ToolingRoomEntities db = new ToolingRoomEntities())
            {
                var devices = db.Devices.Where(d => d.DeviceCode == device.DeviceCode).Select(d => d.Id).ToList();
                var totalRealQty = 0;
                foreach (var deviceId in devices)
                {
                    totalRealQty += db.Devices.Where(d => d.Id == deviceId).Sum(d => d.RealQty) ?? 0;
                }

                return totalRealQty;
            }
        }
        
    }

    /* API CLASS*/

    public class StaticDevice
    {
        public string bu { get; set; }
        public string cft { get; set; }
        public string factory { get; set; }
        public int floor { get; set; }
        public string location { get; set; }
        public string typeEquipmentName { get; set; }
        public string parameter { get; set; }
        public string inOutStore { get; set; }// (1 in, 0 out)// thiết trong hay ngoài kho
        public string status { get; set; } // OK, NG, PHE,
        public string equipmentCode { get; set; }
        public string probationCode { get; set; }//mã quản chế
        public string brand { get; set; }
        public int safeNumber { get; set; }
        public string typeAsset { get; set; } //(自 Công ty or 客 khách hàng)
        public string price { get; set; }
        public string currencyName { get; set; }
        public string createDate { get; set; } //(yyyy/MM/dd)
        public string typeEquipment { get; set; } // (fixedAsset, fixture, tools)
    }
    public class DynamicDevice
    {
        public string bu { get; set; }
        public string cft { get; set; }
        public string factory { get; set; }
        public string floor { get; set; }
        public string material { get; set; }
        public string typeEquipmentName { get; set; }
        public string parameter { get; set; }
        public string safeNumber { get; set; }
        public string brand { get; set; }
        public string price { get; set; }
        public string currencyName { get; set; }
        public string location { get; set; }
        public string typeEquipment { get; set; } //(consume, sparePart)
        public string quantity { get; set; }
    }
    public class TypeQuantity
    {
        public string bu { get; set; }
        public string cft { get; set; }
        public string factory { get; set; }
        public int floor { get; set; }
        public string typeEquipment { get; set; } // (fixedAsset, fixture, tools, consume, sparePart)
        public int quantityOff { get; set; }// số lượng trong kho
        public int quantityOn { get; set; } // số lượng ngoài kho
    }
    public class DeviceQuantity
    {
        public string bu { get; set; }
        public string cft { get; set; }
        public string factory { get; set; }
        public int floor { get; set; }
        public string typeEquipmentName { get; set; }
        public string typeEquipment { get; set; } //(fixedAsset, fixture, tools, consume, sparePart)
        public int quantityOff { get; set; }
        public int quantityOn { get; set; }
    }
    public class ExportedDeviceStatistics
    {
        public string bu { get; set; }
        public string cft { get; set; }
        public string factory { get; set; }
        public int floor { get; set; }
        public int qtyType { get; set; }
        public string typeEquipmentName { get; set; }
    }
    public class DeviceUsageDetail
    {
        public string bu { get; set; }
        public string cft { get; set; }
        public string factory { get; set; }
        public int floor { get; set; }
        public string material { get; set; }
        public string typeEquipmentName { get; set; }
        public string parameter { get; set; }
        public string brand { get; set; }
        public string price { get; set; }
        public string currencyName { get; set; }
        public string location { get; set; }
        public string typeEquipment { get; set; } //(consume)
        public int safeQty { get; set; }
        public int quantity { get; set; }
    }
}