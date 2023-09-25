using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Web;
using System.Web.Mvc;
using ToolingRoomManagement.Areas.NVIDIA.Entities;
using ToolingRoomManagement.Attributes;

namespace ToolingRoomManagement.Areas.NVIDIA.Controllers
{
    [Authentication]
    public class WarehouseController : Controller
    {
        ToolingRoomEntities db = new ToolingRoomEntities();

        // Management
        public ActionResult Management()
        {
            return View();
        }
        public JsonResult GetWarehouses()
        {
            try
            {
                db.Configuration.LazyLoadingEnabled = false;
                List<Entities.Warehouse> warehouses = db.Warehouses.ToList();

                foreach (var warehouse in warehouses)
                {
                    warehouse.User = db.Users.FirstOrDefault(u => u.Id == warehouse.IdUserManager);
                }

                return Json(new { status = true, warehouses = JsonSerializer.Serialize(warehouses) }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }
        public JsonResult GetUsers()
        {
            try
            {
                db.Configuration.LazyLoadingEnabled = false;
                List<Entities.User> users = db.Users.ToList();

                return Json(new { status = true, users = JsonSerializer.Serialize(users) }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }



        //Layouts
        public ActionResult Layout()
        {
            return View();
        }
        public JsonResult GetWarehouseLayouts()
        {
            try
            {
                db.Configuration.LazyLoadingEnabled = false;

                List<Entities.Warehouse> warehouses = db.Warehouses.ToList();
                foreach (var warehouse in warehouses)
                {
                    List<Entities.WarehouseLayout> warehouseLayouts = db.WarehouseLayouts.Where(wl => wl.IdWareHouse == warehouse.Id).ToList();
                    warehouse.WarehouseLayouts = warehouseLayouts;
                }

                return Json(new { status = true, warehouses }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        #region New node
        public JsonResult NewLine(int IdWarehouse, string LineName)
        {
            try
            {
                db.Configuration.LazyLoadingEnabled = false;

                WarehouseLayout layout = new WarehouseLayout
                {
                    IdWareHouse = IdWarehouse,
                    Line = LineName,
                };

                db.WarehouseLayouts.Add(layout);
                db.SaveChanges();

                return Json(new { status = true, layout });
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message });
            }
        }
        public JsonResult NewFloor(int IdWarehouse, string LineName, string FloorName)
        {
            try
            {
                db.Configuration.LazyLoadingEnabled = false;

                WarehouseLayout layout = new WarehouseLayout
                {
                    IdWareHouse = IdWarehouse,
                    Line = LineName,
                    Floor = FloorName,
                };

                db.WarehouseLayouts.Add(layout);
                db.SaveChanges();

                return Json(new { status = true, layout });
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message });
            }
        }
        public JsonResult NewCell(int IdWarehouse, string LineName, string FloorName, string CellName)
        {
            try
            {
                db.Configuration.LazyLoadingEnabled = false;

                WarehouseLayout layout = new WarehouseLayout
                {
                    IdWareHouse = IdWarehouse,
                    Line = LineName,
                    Floor = FloorName,
                    Cell = CellName
                };

                db.WarehouseLayouts.Add(layout);
                db.SaveChanges();

                return Json(new { status = true, layout });
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message });
            }
        }
        #endregion

        #region Rename Node
        public JsonResult RenameWarehouse(int Id, string NewName)
        {
            try
            {
                db.Configuration.LazyLoadingEnabled = false;

                Warehouse warehouse = db.Warehouses.FirstOrDefault(w => w.Id == Id);

                if (warehouse != null)
                {
                    warehouse.WarehouseName = NewName;

                    db.SaveChanges();

                    return Json(new { status = true });
                }
                else
                {
                    return Json(new { status = false, message = "Warehouse not found." });
                }
            }
            catch (Exception ex)
            {
                return Json(new {status = false, message = ex.Message});
            }
        }
        public JsonResult RenameLine(int IdWarehouse, string NewName, string OldName)
        {
            try
            {
                db.Configuration.LazyLoadingEnabled = false;

                // Check New Name
                if(db.WarehouseLayouts.Any(w => w.IdWareHouse == IdWarehouse && w.Line == NewName))
                    return Json(new { status = false, message = "Line name already exists." });

                // Check ok => Change Name
                var layouts = db.WarehouseLayouts.Where(w => w.IdWareHouse == IdWarehouse && w.Line == OldName).ToList();

                foreach (var layout in layouts)
                {
                    layout.Line = NewName;
                }
                db.SaveChanges();

                return Json(new { status = true });
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message });
            }
        }
        public JsonResult RenameFloor(int IdWarehouse, string LineName , string NewName, string OldName)
        {
            try
            {
                db.Configuration.LazyLoadingEnabled = false;

                // Check New Name
                if (db.WarehouseLayouts.Any(w => w.IdWareHouse == IdWarehouse && w.Line == LineName && w.Floor == NewName))
                    return Json(new { status = false, message = "Floor name already exists." });

                // Check ok => Change Name
                var layouts = db.WarehouseLayouts.Where(w => w.IdWareHouse == IdWarehouse && w.Line == LineName && w.Floor == OldName).ToList();

                foreach (var layout in layouts)
                {
                    layout.Floor = NewName;
                }
                db.SaveChanges();

                return Json(new { status = true });
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message });
            }
        }
        public JsonResult RenameCell(int IdWarehouse, string LineName, string FloorName, string NewName, string OldName)
        {
            try
            {
                db.Configuration.LazyLoadingEnabled = false;

                // Check New Name
                if (db.WarehouseLayouts.Any(w => w.IdWareHouse == IdWarehouse && w.Line == LineName && w.Floor == FloorName && w.Cell == NewName))
                    return Json(new { status = false, message = "Cell name already exists." });

                // Check ok => Change Name
                var layouts = db.WarehouseLayouts.Where(w => w.IdWareHouse == IdWarehouse && w.Line == LineName && w.Floor == FloorName && w.Cell == OldName).ToList();

                foreach (var layout in layouts)
                {
                    layout.Cell = NewName;
                }
                db.SaveChanges();

                return Json(new { status = true });
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message });
            }
        }
        #endregion

        #region Delete Node
        public JsonResult DeleteLine(int IdWarehouse, string LineName)
        {
            try
            {
                db.Configuration.LazyLoadingEnabled = false;

                List<WarehouseLayout> layouts = db.WarehouseLayouts.Where(l =>
                                                                          l.IdWareHouse == IdWarehouse &&
                                                                          l.Line == LineName).ToList();

                db.WarehouseLayouts.RemoveRange(layouts);
                db.SaveChanges();

                return Json(new { status = true });
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message });
            }
        }
        public JsonResult DeleteFloor(int IdWarehouse, string LineName, string FloorName)
        {
            try
            {
                db.Configuration.LazyLoadingEnabled = false;

                List<WarehouseLayout> layouts = db.WarehouseLayouts.Where(l =>
                                                                          l.IdWareHouse == IdWarehouse &&
                                                                          l.Line == LineName &&
                                                                          l.Floor == FloorName).ToList();

                db.WarehouseLayouts.RemoveRange(layouts);
                db.SaveChanges();

                return Json(new { status = true });
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message });
            }
        }
        public JsonResult DeleteCell(int IdWarehouse, string LineName, string FloorName, string CellName)
        {
            try
            {
                db.Configuration.LazyLoadingEnabled = false;

                List<WarehouseLayout> layouts = db.WarehouseLayouts.Where(l => 
                                                                          l.IdWareHouse == IdWarehouse &&
                                                                          l.Line == LineName &&
                                                                          l.Floor == FloorName &&
                                                                          l.Cell == CellName).ToList();

                db.WarehouseLayouts.RemoveRange(layouts);
                db.SaveChanges();

                return Json(new { status = true});
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message });
            }
        }
        #endregion

        #region Device Layout
        public JsonResult GetNodeDevices(int IdWarehouse, string LineName, string FloorName, string CellName)
        {
            try
            {
                WarehouseLayout layout = new WarehouseLayout();
                List<Entities.Device> devices = new List<Entities.Device>();
                if (string.IsNullOrEmpty(LineName) && string.IsNullOrEmpty(FloorName) && string.IsNullOrEmpty(CellName))
                {
                    devices = db.Devices.Where(d => d.IdWareHouse == IdWarehouse).ToList();
                }
                else
                {
                    layout = db.WarehouseLayouts.FirstOrDefault(wl =>
                                                                wl.IdWareHouse == IdWarehouse &&
                                                                ((string.IsNullOrEmpty(LineName) && wl.Line == null) || wl.Line == LineName) &&
                                                                ((string.IsNullOrEmpty(FloorName) && wl.Floor == null) || wl.Floor == FloorName) &&
                                                                ((string.IsNullOrEmpty(CellName) && wl.Cell == null) || wl.Cell == CellName));

                    List<DeviceWarehouseLayout> deviceWarehouseLayouts = db.DeviceWarehouseLayouts.Where(dwl => dwl.IdWarehouseLayout == layout.Id).ToList();

                    foreach(var item in deviceWarehouseLayouts)
                    {
                        Device device = db.Devices.FirstOrDefault(d => d.Id == item.IdDevice);
                        devices.Add(device);
                    }
                }
                

                return Json(new { status = true, devices });
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
                List<Entities.Device> devices = db.Devices.Where(d => d.IdWareHouse == IdWarehouse).ToList();

                return Json(new { status = true, devices });
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message });
            }
        }
        public JsonResult GetDevice(int IdDevice)
        {
            try
            {
                Entities.Device device = db.Devices.FirstOrDefault(d => d.Id == IdDevice);

                return Json(new { status = true, device });
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message });
            }
        }
        public JsonResult AddDeviceToLayout(int[] IdDevices, int IdWarehouse, string LineName, string FloorName, string CellName)
        {
            try
            {
                db.Configuration.LazyLoadingEnabled = false;

                WarehouseLayout layout = db.WarehouseLayouts.FirstOrDefault(w => w.IdWareHouse == IdWarehouse && w.Line == LineName && w.Floor == FloorName && w.Cell == CellName);

                if(layout != null)
                {
                    List<Entities.Device> devices = new List<Device>();
                    List<DeviceWarehouseLayout> deviceWarehouseLayouts = db.DeviceWarehouseLayouts.Where(wl => wl.IdWarehouseLayout == layout.Id).ToList();
                    db.DeviceWarehouseLayouts.RemoveRange(deviceWarehouseLayouts);

                    deviceWarehouseLayouts.Clear();

                    foreach (int IdDevice in IdDevices)
                    {
                        DeviceWarehouseLayout deviceWarehouseLayout = new DeviceWarehouseLayout
                        {
                            IdDevice = IdDevice,
                            IdWarehouseLayout = layout.Id
                        };

                        Entities.Device device = db.Devices.FirstOrDefault(d => d.Id == IdDevice);

                        deviceWarehouseLayouts.Add(deviceWarehouseLayout);
                        devices.Add(device);
                    }
                    db.DeviceWarehouseLayouts.AddRange(deviceWarehouseLayouts);

                    db.SaveChanges();



                    return Json(new { status = true, devices });
                }
                else
                {
                    return Json(new { status = false, message = "Layout not found." });
                }
                
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message });
            }
        }
        #endregion

    }
}