using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Drawing.Drawing2D;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Web;
using System.Web.Mvc;
using ToolingRoomManagement.Areas.NVIDIA.Entities;

namespace ToolingRoomManagement.Areas.API.Controllers
{
    public class ToolroomController : Controller
    {
        // GET: API/Toolroom

        public JsonResult GetListDataFixedAsset(string type = "")
        {
            try
            {              
                using (ToolingRoomEntities db = new ToolingRoomEntities())
                {
                    List<StaticDevice> list = new List<StaticDevice>();

                    var devices = new List<Device>();

                    type = type.ToLower();
                    if(type == null || string.IsNullOrEmpty(type))
                    {
                        devices = db.Devices
                                    .Where(d => (d.Type == "Fixture" || d.Type == "Static" || d.Type_BOM == "S") && d.Status != "Deleted" && d.DeviceCode != string.Empty && d.QtyConfirm > 0)
                                    .GroupBy(d => d.DeviceCode)
                                    .Select(group => group.FirstOrDefault())
                                    .ToList();
                    }
                    else if (type == "fixture")
                    {
                        devices = db.Devices
                                    .Where(d => (d.Type == "Fixture") && d.Status != "Deleted" && d.DeviceCode != string.Empty && d.QtyConfirm > 0)
                                    .GroupBy(d => d.DeviceCode)
                                    .Select(group => group.FirstOrDefault())
                                    .ToList();
                    }
                    else if(type == "fixedasset")
                    {
                        devices = db.Devices
                                    .Where(d => d.Type != "Fixture" && (d.Type == "Static" || d.Type_BOM == "S") && d.Status != "Deleted" && d.DeviceCode != string.Empty && d.QtyConfirm > 0)
                                    .GroupBy(d => d.DeviceCode)
                                    .Select(group => group.FirstOrDefault())
                                    .ToList();
                    }
                    else
                    {
                        return Json("", JsonRequestBehavior.AllowGet);
                    }


                    foreach (var device in devices)
                    {
                        if (device.QtyConfirm == device.RealQty)
                        {
                            // Trong kho
                            StaticDevice staticDevice = new StaticDevice
                            {
                                bu = "MBD",
                                cft = "NVIDIA",
                                factory = "F06",
                                floor = 2,
                                location = GetDeviceLocation(device) ?? "NA",
                                typeEquipmentName = device.DeviceName,
                                parameter = "NA",
                                inOutStore = 1,
                                quantity = device.QtyConfirm ?? 0,
                                unit = device.Unit,
                                status = (device.Status != "Lock") ? "OK" : "NG",
                                equipmentCode = GetDeviceCode(device),
                                probationCode = "NA",
                                brand = GetDeviceVendor(device),
                                safeNumber = GetDeviceMinQty(device),
                                typeAsset = device.isConsign == true ? "客 Khách hàng" : "自 Công ty",
                                price = "0",
                                currencyName = "VND",
                                createDate = device.CreatedDate?.ToString("yyyy/MM/dd"),
                                typeEquipment = GetDeviceType(device),
                            };
                            list.Add(staticDevice);
                        }
                        else
                        {
                            // Trong kho
                            StaticDevice InstaticDevice = new StaticDevice
                            {
                                bu = "MBD",
                                cft = "NVIDIA",
                                factory = "F06",
                                floor = 2,
                                location = GetDeviceLocation(device) ?? "NA",
                                typeEquipmentName = device.DeviceName,
                                parameter = "NA",
                                inOutStore = 1,
                                quantity = device.RealQty ?? 0,
                                unit = device.Unit,
                                status = (device.Status != "Lock") ? "OK" : "NG",
                                equipmentCode = GetDeviceCode(device),
                                probationCode = "NA",
                                brand = GetDeviceVendor(device),
                                safeNumber = GetDeviceMinQty(device),
                                typeAsset = device.isConsign == true ? "客 Khách hàng" : "自 Công ty",
                                price = "0",
                                currencyName = "VND",
                                createDate = device.CreatedDate?.ToString("yyyy/MM/dd"),
                                typeEquipment = GetDeviceType(device),
                            };
                            // Ngoài kho
                            StaticDevice OutstaticDevice = new StaticDevice
                            {
                                bu = "MBD",
                                cft = "NVIDIA",
                                factory = "F06",
                                floor = 2,
                                location = GetDeviceLocation(device) ?? "NA",
                                typeEquipmentName = device.DeviceName,
                                parameter = "NA",
                                inOutStore = 0,
                                quantity = device.QtyConfirm ?? 0 - device.RealQty ?? 0,
                                unit = device.Unit,
                                status = (device.Status != "Lock") ? "OK" : "NG",
                                equipmentCode = GetDeviceCode(device),
                                probationCode = "NA",
                                brand = GetDeviceVendor(device),
                                safeNumber = GetDeviceMinQty(device),
                                typeAsset = device.isConsign == true ? "客 Khách hàng" : "自 Công ty",
                                price = "0",
                                currencyName = "VND",
                                createDate = device.CreatedDate?.ToString("yyyy/MM/dd"),
                                typeEquipment = GetDeviceType(device),
                            };
                            list.Add(InstaticDevice); list.Add(OutstaticDevice);
                        }

                    }
                    return Json(list, JsonRequestBehavior.AllowGet);
                }
            }
            catch (Exception ex)
            {
                return Json($"Exception: {ex.Message}", JsonRequestBehavior.AllowGet);
            }
        }
        public JsonResult GetListDataConsume()
        {
            try
            {
                using (ToolingRoomEntities db = new ToolingRoomEntities())
                {
                    List<DynamicDevice> list = new List<DynamicDevice>();

                    var devices = db.Devices
                                    .Where(d => d.Type == "Dynamic" || d.Type_BOM == "D" && d.Status != "Deleted" && d.DeviceCode != string.Empty)
                                    .GroupBy(d => d.DeviceCode)
                                    .Select(group => group.FirstOrDefault())
                                    .ToList();

                    foreach (var device in devices)
                    {
                        DynamicDevice dynamicDevice = new DynamicDevice
                        {
                            bu = "MBD",
                            cft = "NVIDIA",
                            factory = "F06",
                            floor = 2,
                            material = GetDeviceCode(device),
                            typeEquipmentName = device.DeviceName,
                            parameter = "NA",
                            safeNumber = GetDeviceMinQty(device),
                            brand = GetDeviceVendor(device),
                            price = "0",
                            currencyName = "VND",
                            location = GetDeviceLocation(device) ?? "NA",
                            typeEquipment = GetDeviceType(device),
                            quantity = device.QtyConfirm ?? 0,
                            unit = GetDeviceUnit(device)
                        };
                        list.Add(dynamicDevice);
                    }
                    return Json(list, JsonRequestBehavior.AllowGet);
                }
            }
            catch (Exception ex)
            {
                return Json($"Exception: {ex.Message}", JsonRequestBehavior.AllowGet);
            }
        }
        public JsonResult GetQtyTypeEquipment()
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
                            typeEquipment = (type == "Fixture") ? "fixture" : (type == "Static") ? "fixedAsset" : (type == "Dynamic") ? "consume" : "NA",
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
        public JsonResult GetQuantityTypeEquipmentName()
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
                            bu = "MBD",
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
        public JsonResult GetQtyTypeConsumeByMonth()
        {
            try
            {
                using (ToolingRoomEntities db = new ToolingRoomEntities())
                {
                    List<ExportedQuantity> list = new List<ExportedQuantity>();

                    DateTime startDayOfMonth = new DateTime(DateTime.Now.Year, DateTime.Now.Month, 1);
                    var borrowOfMonth = db.Borrows.Where(b => b.DateBorrow >= startDayOfMonth).ToList();

                    foreach (var borrow in borrowOfMonth)
                    {
                        var borrowdevices = borrow.BorrowDevices.ToList();

                        foreach (var borrowdevice in borrowdevices)
                        {
                            var device = borrowdevice.Device;
                            if (device == null || device.Status == "Deleted") continue;
                            if (device.Type == "Fixture" || device.Type == "Static" || device.Type_BOM == "S") continue;

                            if (!list.Any(l => l.typeEquipmentName == device.DeviceName))
                            {
                                ExportedQuantity exportedQuantity = new ExportedQuantity
                                {
                                    bu = "MBD",
                                    cft = "NVIDIA",
                                    factory = "F06",
                                    floor = 2,
                                    qtyType = borrowdevice.BorrowQuantity ?? 0,
                                    typeEquipmentName = device.DeviceName,
                                };
                                list.Add(exportedQuantity);
                            }
                            else
                            {
                                list.FirstOrDefault(l => l.typeEquipmentName == device.DeviceName).qtyType += borrowdevice.BorrowQuantity ?? 0;
                            }
                        }
                    }

                    return Json(list, JsonRequestBehavior.AllowGet);
                }
            }
            catch (Exception ex)
            {
                return Json($"Exception: {ex.Message}", JsonRequestBehavior.AllowGet);
            }
        }
        public JsonResult GetListDataHistoryConsumeByMonth()
        {
            try
            {
                using (ToolingRoomEntities db = new ToolingRoomEntities())
                {
                    List<ExportedDetails> list = new List<ExportedDetails>();

                    DateTime startDate = DateTime.Now.AddDays(-30);
                    for (int i = 0; i < 30; i++)
                    {
                        var sDate = startDate.AddDays(i);
                        var eDate = startDate.AddDays(i + 1);

                        var borrows = db.Borrows.Where(b => b.DateBorrow >= sDate && b.DateBorrow <= eDate).ToList();

                        foreach (var borrow in borrows)
                        {
                            foreach (var borrowdevice in borrow.BorrowDevices)
                            {
                                var device = borrowdevice.Device;
                                if (device == null || (device.Type == "Fixture" || device.Type == "Static" || device.Type_BOM == "S")) continue;
                                var type = GetDeviceType(device);
                                if (type == "NA") continue;

                                ExportedDetails exportedDetails = new ExportedDetails
                                {
                                    bu = "MBD",
                                    cft = "NVIDIA",
                                    factory = "F06",
                                    floor = 2,
                                    material = device.DeviceCode,
                                    typeEquipmentName = device.DeviceName,
                                    parameter = "NA",
                                    brand = GetDeviceVendor(device),
                                    price = "0",
                                    currencyName = "VND",
                                    location = GetDeviceLocation(device) ?? "NA",
                                    typeEquipment = type,
                                    safeQty = GetDeviceMinQty(device),
                                    quantity = borrowdevice.BorrowQuantity ?? 0,
                                    outDate = borrow.DateBorrow?.ToString("yyyy/MM/dd"),
                                    unit = device.Unit
                                };

                                list.Add(exportedDetails);
                            }
                        }
                    }

                    return Json(list, JsonRequestBehavior.AllowGet);
                }
            }
            catch (Exception ex)
            {
                return Json($"Exception: {ex.Message}", JsonRequestBehavior.AllowGet);
            }
        }

        public JsonResult GetOfflineEquipment(string type = "")
        {
            try
            {
                using (ToolingRoomEntities db = new ToolingRoomEntities())
                {
                    List<OfflineDevice> list = new List<OfflineDevice>();
                    var devices = new List<Device>();

                    type = type.ToLower();
                    if (type == null || string.IsNullOrEmpty(type))
                    {
                        devices = db.Devices
                                    .Where(d => d.Status != "Deleted" && d.RealQty > 0)
                                    .ToList();
                    }
                    else if (type == "fixture")
                    {
                        devices = db.Devices
                                    .Where(d => d.Type == "Fixture" && d.Status != "Deleted" && d.RealQty > 0)
                                    .ToList();
                    }
                    else if (type == "fixedasset")
                    {
                        devices = db.Devices
                                    .Where(d => d.Type != "Fixture" && (d.Type == "Static" || d.Type_BOM == "S") && d.Status != "Deleted" && d.RealQty > 0)
                                    .ToList();
                    }
                    else if(type == "consume")
                    {
                        devices = db.Devices
                                   .Where(d => (d.Type == "Dynamic" || d.Type_BOM == "D") && d.Status != "Deleted" && d.RealQty > 0)
                                   .ToList();
                    }
                    else
                    {
                        return Json("", JsonRequestBehavior.AllowGet);
                    }


                    foreach (var device in devices)
                    {
                        var deviceCode = GetDeviceCode(device);

                        var offlineDevice = list.FirstOrDefault(od => od.typeEquipmentCode == deviceCode);
                        if(offlineDevice == null)
                        {
                            offlineDevice = new OfflineDevice
                            {
                                bu = "MBD",
                                cft = "NVIDIA",
                                factory = "F06",
                                floor = 2,
                                typeEquipment = GetDeviceType(device),
                                typeEquipmentCode = GetDeviceCode(device),
                                typeEquipmentName = device.DeviceName,
                                location = GetDeviceLocation(device) ?? "NA",
                                quantityOff = device.RealQty ?? 0,
                            };
                            list.Add(offlineDevice);
                        }
                        else
                        {                     
                            offlineDevice.quantityOff += device.RealQty ?? 0;

                            var location = GetDeviceLocation(device);
                            if (location != null) offlineDevice.location += $", {location}";
                        }
                        
                    }
                    return Json(list, JsonRequestBehavior.AllowGet);
                }
            }
            catch (Exception ex)
            {
                return Json($"Exception: {ex.Message}", JsonRequestBehavior.AllowGet);
            }
        }
        public JsonResult GetOnlineEquipment(string type = "")
        {
            try
            {
                using (ToolingRoomEntities db = new ToolingRoomEntities())
                {
                    List<OnlineDevice> list = new List<OnlineDevice>();
                    type = type.ToLower();

                    foreach (var borrow in db.Borrows.Where(b => b.Model != null && b.Station != null))
                    {
                        foreach(var borrowDevice in  borrow.BorrowDevices.Where(bd => bd.Device != null)) 
                        {
                            var deviveType = GetDeviceType(borrowDevice.Device);
                            if (type != string.Empty && GetDeviceType(borrowDevice.Device).ToLower() != type) continue;

                            

                            var place = GetBorrowLocation(borrow);
                            var devicename = borrowDevice.Device.DeviceName;

                            var onlineDevice = list.FirstOrDefault(od => od.place == place && od.typeEquipmentName == devicename);

                            if(onlineDevice == null)
                            {
                                onlineDevice = new OnlineDevice
                                {
                                    bu = "MBD",
                                    cft = "NVIDIA",
                                    factory = "F06",
                                    floor = 2,
                                    typeEquipment = deviveType,
                                    typeEquipmentCode = GetDeviceCode(borrowDevice.Device),
                                    typeEquipmentName = devicename,
                                    place = place,
                                    quantityOn = borrowDevice.BorrowQuantity ?? 0,
                                };
                                list.Add(onlineDevice);
                            }
                            else
                            {
                                onlineDevice.quantityOn += borrowDevice.BorrowQuantity ?? 0;
                            }
                        }
                    }

                    return Json(list, JsonRequestBehavior.AllowGet);
                }
            }
            catch (Exception ex)
            {
                return Json($"Exception: {ex.Message}", JsonRequestBehavior.AllowGet);
            }
        }
        public JsonResult GetWarningEquipment(string type = "")
        {
            try
            {
                using (ToolingRoomEntities db = new ToolingRoomEntities())
                {
                    List<WarningDevice> list = new List<WarningDevice>();

                    var DeviceCodes = new List<string>();

                    type = type.ToLower();
                    if (type == null || string.IsNullOrEmpty(type))
                    {
                        DeviceCodes = db.Devices.Where(d => !string.IsNullOrEmpty(d.DeviceCode) &&
                                                       d.MinQty > 0 && (d.Type == "Fixture" || d.Type == "Static" || d.Type_BOM == "S") &&
                                                       d.Status != "Deleted").Select(d => d.DeviceCode).Distinct().ToList();
                    }
                    else if (type == "fixture")
                    {
                        DeviceCodes = db.Devices.Where(d => !string.IsNullOrEmpty(d.DeviceCode) &&
                                                       d.MinQty > 0 && d.Type == "Fixture" &&
                                                       d.Status != "Deleted").Select(d => d.DeviceCode).Distinct().ToList();
                    }
                    else if (type == "fixedasset")
                    {
                        DeviceCodes = db.Devices.Where(d => !string.IsNullOrEmpty(d.DeviceCode) &&
                                                       d.MinQty > 0 && d.Type != "Fixture" && (d.Type == "Static" || d.Type_BOM == "S") &&
                                                       d.Status != "Deleted").Select(d => d.DeviceCode).Distinct().ToList();
                    }
                    else
                    {
                        return Json("", JsonRequestBehavior.AllowGet);
                    }

                    

                    foreach(var DeviceCode in DeviceCodes)
                    {
                        var realQty = db.Devices.Where(d => d.DeviceCode == DeviceCode).Sum(d => d.RealQty) ?? 0;
                        var minQty = db.Devices.Where(d => d.DeviceCode == DeviceCode).Max(d => d.MinQty) ?? 0;
                        var safePrecent = Math.Round(((double) realQty / minQty) * 100, 2);

                        var device = db.Devices.FirstOrDefault(d => d.DeviceCode == DeviceCode);
                        if (minQty > 0 && (safePrecent < 50 || safePrecent > 150))
                        {
                            WarningDevice warningDevice = new WarningDevice
                            {
                                bu = "MBD",
                                cft = "NVIDIA",
                                factory = "F06",
                                floor = 2,
                                typeEquipmentName = device.DeviceName,
                                parameter = "NA",
                                inOutStore = 1,
                                qtyInstore = realQty,
                                unit = GetDeviceUnit(device),
                                status = "OK",
                                equipmentCode = GetDeviceCode(device),
                                probationCode = "NA",
                                brand = GetDeviceVendor(device),
                                safeNumber = minQty,
                                safePrecent = safePrecent,
                                typeAsset = device.isConsign == true ? "客 Khách hàng" : "自 Công ty",
                                price = "0",
                                currencyName = "VND",
                                typeEquipment = GetDeviceType(device),
                            };

                            list.Add(warningDevice);
                        }
                    }
                    return Json(list.OrderByDescending(d => d.safePrecent), JsonRequestBehavior.AllowGet);
                }
            }
            catch (Exception ex)
            {
                return Json($"Exception: {ex.Message}", JsonRequestBehavior.AllowGet);
            }
        }
        public JsonResult GetWarningEquipmentName(string type = "")
        {
            try
            {
                using (ToolingRoomEntities db = new ToolingRoomEntities())
                {
                    List<WarningDeviceName> list = new List<WarningDeviceName>();

                    var DeviceCodes = new List<string>();

                    type = type.ToLower();
                    if (type == null || string.IsNullOrEmpty(type))
                    {
                        DeviceCodes = db.Devices.Where(d => !string.IsNullOrEmpty(d.DeviceCode) &&
                                                       d.MinQty > 0 && (d.Type == "Fixture" || d.Type == "Static" || d.Type_BOM == "S") &&
                                                       d.Status != "Deleted").Select(d => d.DeviceCode).Distinct().ToList();
                    }
                    else if (type == "fixture")
                    {
                        DeviceCodes = db.Devices.Where(d => !string.IsNullOrEmpty(d.DeviceCode) &&
                                                       d.MinQty > 0 && d.Type == "Fixture" &&
                                                       d.Status != "Deleted").Select(d => d.DeviceCode).Distinct().ToList();
                    }
                    else if (type == "fixedasset")
                    {
                        DeviceCodes = db.Devices.Where(d => !string.IsNullOrEmpty(d.DeviceCode) &&
                                                       d.MinQty > 0 && d.Type != "Fixture" && (d.Type == "Static" || d.Type_BOM == "S") &&
                                                       d.Status != "Deleted").Select(d => d.DeviceCode).Distinct().ToList();
                    }
                    else
                    {
                        return Json("", JsonRequestBehavior.AllowGet);
                    }

                    foreach (var DeviceCode in DeviceCodes)
                    {
                        var devices = db.Devices.Where(d => d.DeviceCode == DeviceCode).ToList();

                        var realQty = devices.Sum(d => d.RealQty) ?? 0;
                        var minQty = devices.Max(d => d.MinQty) ?? 0;

                        var safePrecent = Math.Round(((double)realQty / minQty) * 100, 2);

                        var device = db.Devices.FirstOrDefault(d => d.DeviceCode == DeviceCode);

                        if (minQty > 0 && (safePrecent < 50 || safePrecent > 150))
                        {
                            WarningDeviceName warningDeviceName = new WarningDeviceName
                            {
                                bu = "MBD",
                                cft = "NVIDIA",
                                factory = "F06",
                                floor = 2,
                                typeEquipment = GetDeviceType(device),
                                typeEquipmentName = device.DeviceName,
                                quantity = realQty,
                                model = GetDeviceProductName(device),
                                safePrecent = safePrecent,
                            };

                            list.Add(warningDeviceName);
                        }
                    }
                    return Json(list.OrderByDescending(d => d.safePrecent), JsonRequestBehavior.AllowGet);
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

                                                          return layout;
                                                      })
                                                     .ToList();
                if (locationList.Count > 0)
                {
                    return string.Join(", ", locationList);
                }
                else return null;
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
            else if (device.Type != "Fixture" && (device.Type == "Static" || device.Type_BOM == "S"))
            {
                return "fixedAsset";
            }
            else if (device.Type == "Dynamic" || device.Type_BOM == "D")
            {
                return "consume";
            }
            else
            {
                return "NA";
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
        private string GetDeviceUnit(Device device)
        {
            if (device.Unit == null) return "NA";
            else if (device.Unit.Trim() == string.Empty) return "NA";
            else return device.Unit;
        }
        private string GetDeviceVendor(Device device)
        {
            return (device.Vendor != null) ? (device.Vendor.VendorName.Trim() != string.Empty) ? device.Vendor.VendorName : "NA" : "NA";
        }
        private string GetDeviceCode(Device device)
        {
            if (device.DeviceCode == null) return $"NVIDIA_{device.Id}";
            else if(device.DeviceCode == "null") return $"NVIDIA_{device.Id}";
            else if( device.DeviceCode == string.Empty) return $"NVIDIA_{device.Id}";
            else return device.DeviceCode ?? $"NVIDIA_{device.Id}";
        }
        private string GetBorrowLocation(Borrow borrow)
        {
            string location = "";
            if (borrow.Model != null && borrow.Station != null)
            {
                location = borrow.Model.ModelName + " - " + borrow.Station.StationName;
            }
            else if(borrow.Model != null && borrow.Station == null)
            {
                location = borrow.Model.ModelName;
            }
            else if (borrow.Model == null && borrow.Station != null)
            {
                location = borrow.Station.StationName;
            }
            else
            {
                location = "NA";
            }
            return location;
        }
        private string GetDeviceProductName(Device device)
        {
            if (device.Product == null) return "NA";
            else if (device.Product.ProductName == "null") return "NA";
            else if (device.Product.ProductName.Trim() == string.Empty) return "NA";
            else return device.Product.ProductName ?? "NA";
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
        public int inOutStore { get; set; }// (1 in, 0 out)// thiết trong hay ngoài kho
        public int quantity { get; set; }
        public string unit { get; set; }
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
        public int floor { get; set; }
        public string material { get; set; }
        public string typeEquipmentName { get; set; }
        public string parameter { get; set; }
        public int safeNumber { get; set; }
        public string brand { get; set; }
        public string price { get; set; }
        public string currencyName { get; set; }
        public string location { get; set; }
        public string typeEquipment { get; set; } //(consume, sparePart)
        public int quantity { get; set; }
        public string unit { get; set; }
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
    public class ExportedQuantity
    {
        public string bu { get; set; }
        public string cft { get; set; }
        public string factory { get; set; }
        public int floor { get; set; }
        public int qtyType { get; set; }
        public string typeEquipmentName { get; set; }
    }
    public class ExportedDetails
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
        public string outDate { get; set; }
        public string unit { get; set; }
    }


    public class OfflineDevice
    {
        public string bu { get; set; }
        public string cft { get; set; }
        public string factory { get; set; }
        public int floor { get; set; }
        public string typeEquipment { get; set; }
        public string typeEquipmentCode { get; set; }
        public string typeEquipmentName { get; set; }
        public string location { get; set; }
        public int quantityOff { get; set; }

    }
    public class OnlineDevice
    {
        public string bu { get; set; }
        public string cft { get; set; }
        public string factory { get; set; }
        public int floor { get; set; }
        public string typeEquipment { get; set; }
        public string typeEquipmentCode { get; set; }
        public string typeEquipmentName { get; set; }
        public string place { get; set; }
        public int quantityOn { get; set; }
    }
    public class WarningDevice
    {
        public string bu { get; set; }
        public string cft { get; set; }
        public string factory { get; set; }
        public int floor { get; set; }
        public string typeEquipmentName { get; set; }
        public string parameter { get; set; }
        public int inOutStore { get; set; } = 1;
        public int qtyInstore { get; set; }
        public string unit { get; set; }
        public string status { get; set; }
        public string equipmentCode { get; set; }
        public string probationCode { get; set; }
        public string brand { get; set; }
        public int safeNumber { get; set; }
        public double safePrecent { get; set; }
        public string typeAsset { get; set; } //(自 Công ty or 客 khách hàng)
        public string price { get; set; }
        public string currencyName { get; set; }
        public string typeEquipment { get; set; } // (fixedAsset, fixture, tools)       
    }
    public class WarningDeviceName
    {
        public string bu { get; set; }
        public string cft { get; set; }
        public string factory { get; set; }
        public int floor { get; set; }
        public string typeEquipment { get; set; }
        public string typeEquipmentName { get; set; }
        public string model { get; set; }
        public int quantity { get; set; }
        public double safePrecent { get; set; }

    }
}