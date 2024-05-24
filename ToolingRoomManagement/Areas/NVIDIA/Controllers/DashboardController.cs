using Model.EF;
using OfficeOpenXml.FormulaParsing.Excel.Functions.DateTime;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.InteropServices;
using System.Web;
using System.Web.Mvc;
using System.Web.Services.Description;
using ToolingRoomManagement.Areas.NVIDIA.Entities;
using ToolingRoomManagement.Attributes;

namespace ToolingRoomManagement.Areas.NVIDIA.Controllers
{
    public class DashboardController : Controller
    {
        // GET: NVIDIA/Dashboard
        ToolingRoomEntities db = new ToolingRoomEntities();

        public ActionResult Index()
        {
            return View();
        }

        // Get Chart Data
        public JsonResult GetDataChart1()
        {
            try
            {
                int thisWeekUser = 0;
                int lastWeekUser = 0;

                int[] arrWeekUser = new int[7];
                string[] arrWeekDate = new string[7];

                DateTime today = DateTime.Now.Date;
                var thisWeek = today.AddDays(((int)DayOfWeek.Monday - (int)today.DayOfWeek - 7) % 7);
                var lastWeek = thisWeek.AddDays(-7);

                thisWeekUser = db.Users.Where(d => d.LastSignIn >= thisWeek).Count();
                lastWeekUser = db.Users.Where(d => d.LastSignIn >= lastWeek && d.LastSignIn < thisWeek).Count();

                for (int i = 0; i < 7; i++)
                {
                    var date = thisWeek.AddDays(i);
                    var nextDate = date.AddDays(1);
                    int dateQuantity = db.Users.Where(d => d.LastSignIn >= date && d.LastSignIn < nextDate).Count();

                    arrWeekUser[i] = dateQuantity;
                    arrWeekDate[i] = date.ToString("MM-dd");
                }

                return Json(new { status = true, thisWeekUser, lastWeekUser, arrWeekUser, arrWeekDate }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }
        public JsonResult GetDataChart2()
        {
            try
            {
                int thisWeekDevice = 0;
                int lastWeekDevice = 0;

                int[] thisWeekDevices = new int[7];
                string[] thisWeekDate = new string[7];


                DateTime today = DateTime.Now.Date;
                var thisWeek = today.AddDays(((int)DayOfWeek.Monday - (int)today.DayOfWeek - 7) % 7);
                var lastWeek = thisWeek.AddDays(-7);

                thisWeekDevice = db.Devices.Where(d => d.CreatedDate >= thisWeek).Count();
                lastWeekDevice = db.Devices.Where(d => d.CreatedDate >= lastWeek && d.CreatedDate < thisWeek).Count();

                for (int i = 0; i < 7; i++)
                {
                    var date = thisWeek.AddDays(i);
                    var nextDate = date.AddDays(1);
                    int dateDevice = db.Devices.Where(d => d.CreatedDate >= date && d.CreatedDate < nextDate).Count();

                    thisWeekDevices[i] = dateDevice;
                    thisWeekDate[i] = date.ToString("MM-dd");
                }

                return Json(new { status = true, thisWeekDevice, lastWeekDevice, thisWeekDevices, thisWeekDate }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }
        public JsonResult GetDataChart3()
        {
            try
            {
                int thisWeekRequest = 0;
                int lastWeekRequest = 0;

                int[] arrWeekRequest = new int[7];
                string[] arrWeekDate = new string[7];

                DateTime today = DateTime.Now.Date;
                var thisWeek = today.AddDays(((int)DayOfWeek.Monday - (int)today.DayOfWeek - 7) % 7);
                var lastWeek = thisWeek.AddDays(-7);

                thisWeekRequest = db.Borrows.Where(d => d.DateBorrow >= thisWeek).Count() +
                                  db.Returns.Where(d => d.DateReturn >= thisWeek).Count() +
                                  db.Exports.Where(d => d.CreatedDate >= thisWeek).Count();

                lastWeekRequest = db.Borrows.Where(d => d.DateBorrow >= lastWeek && d.DateBorrow < thisWeek).Count() +
                                  db.Returns.Where(d => d.DateReturn >= lastWeek && d.DateReturn < thisWeek).Count() +
                                  db.Exports.Where(d => d.CreatedDate >= lastWeek && d.CreatedDate < thisWeek).Count();

                for (int i = 0; i < 7; i++)
                {
                    var date = thisWeek.AddDays(i);
                    var nextDate = date.AddDays(1);

                    int dateRequest = db.Borrows.Where(d => d.DateBorrow >= date && d.DateBorrow < nextDate).Count() +
                                      db.Returns.Where(d => d.DateReturn >= date && d.DateReturn < nextDate).Count() +
                                      db.Exports.Where(d => d.CreatedDate >= date && d.CreatedDate < nextDate).Count();

                    arrWeekRequest[i] = dateRequest;
                    arrWeekDate[i] = date.ToString("MM-dd");
                }

                return Json(new { status = true, thisWeekRequest, lastWeekRequest, arrWeekRequest, arrWeekDate }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }
        public JsonResult GetDataChart4()
        {
            try
            {
                int thisWeekAprovedRequest = 0;
                int lastWeekAprovedRequest = 0;

                int[] arrWeekApprovedRequest = new int[7];
                string[] arrWeekDate = new string[7];

                DateTime today = DateTime.Now.Date;
                var thisWeek = today.AddDays(((int)DayOfWeek.Monday - (int)today.DayOfWeek - 7) % 7);
                var lastWeek = thisWeek.AddDays(-7);

                thisWeekAprovedRequest = db.Borrows.Where(d => d.DateBorrow >= thisWeek  && d.Status == "Approved").Count() +
                                         db.Returns.Where(d => d.DateReturn >= thisWeek  && d.Status == "Approved").Count() +
                                         db.Exports.Where(d => d.CreatedDate >= thisWeek && d.Status == "Approved").Count();

                lastWeekAprovedRequest = db.Borrows.Where(d => d.DateBorrow >= lastWeek && d.DateBorrow < thisWeek   && d.Status == "Approved").Count() +
                                         db.Returns.Where(d => d.DateReturn >= lastWeek && d.DateReturn < thisWeek   && d.Status == "Approved").Count() +
                                         db.Exports.Where(d => d.CreatedDate >= lastWeek && d.CreatedDate < thisWeek && d.Status == "Approved").Count();

                for (int i = 0; i < 7; i++)
                {
                    var date = thisWeek.AddDays(i);
                    var nextDate = date.AddDays(1);

                    int dateRequest = db.Borrows.Where(d => d.DateBorrow >= date && d.DateBorrow < nextDate   && d.Status == "Approved").Count() +
                                      db.Returns.Where(d => d.DateReturn >= date && d.DateReturn < nextDate   && d.Status == "Approved").Count() +
                                      db.Exports.Where(d => d.CreatedDate >= date && d.CreatedDate < nextDate && d.Status == "Approved").Count();

                    arrWeekApprovedRequest[i] = dateRequest;
                    arrWeekDate[i] = date.ToString("MM-dd");
                }

                return Json(new { status = true, thisWeekAprovedRequest, lastWeekAprovedRequest, arrWeekApprovedRequest, arrWeekDate }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }
        public JsonResult GetDataChart5()
        {
            try
            {
                int thisWeekRejectedRequest = 0;
                int lastWeekRejectedRequest = 0;

                int[] arrWeekRejectedRequest = new int[7];
                string[] arrWeekDate = new string[7];

                DateTime today = DateTime.Now.Date;
                var thisWeek = today.AddDays(((int)DayOfWeek.Monday - (int)today.DayOfWeek - 7) % 7);
                var lastWeek = thisWeek.AddDays(-7);

                thisWeekRejectedRequest = db.Borrows.Where(d => d.DateBorrow >= thisWeek && d.Status == "Rejected").Count() +
                                         db.Returns.Where(d => d.DateReturn >= thisWeek && d.Status == "Rejected").Count() +
                                         db.Exports.Where(d => d.CreatedDate >= thisWeek && d.Status == "Rejected").Count();

                lastWeekRejectedRequest = db.Borrows.Where(d => d.DateBorrow >= lastWeek && d.DateBorrow < thisWeek && d.Status == "Rejected").Count() +
                                         db.Returns.Where(d => d.DateReturn >= lastWeek && d.DateReturn < thisWeek && d.Status == "Rejected").Count() +
                                         db.Exports.Where(d => d.CreatedDate >= lastWeek && d.CreatedDate < thisWeek && d.Status == "Rejected").Count();

                for (int i = 0; i < 7; i++)
                {
                    var date = thisWeek.AddDays(i);
                    var nextDate = date.AddDays(1);

                    int dateRequest = db.Borrows.Where(d => d.DateBorrow >= date && d.DateBorrow < nextDate && d.Status == "Rejected").Count() +
                                      db.Returns.Where(d => d.DateReturn >= date && d.DateReturn < nextDate && d.Status == "Rejected").Count() +
                                      db.Exports.Where(d => d.CreatedDate >= date && d.CreatedDate < nextDate && d.Status == "Rejected").Count();

                    arrWeekRejectedRequest[i] = dateRequest;
                    arrWeekDate[i] = date.ToString("MM-dd");
                }

                return Json(new { status = true, thisWeekRejectedRequest, lastWeekRejectedRequest, arrWeekRejectedRequest, arrWeekDate }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        public JsonResult GetDataChart6(string type)
        {
            try
            {
                List<int> listCountBorrow = new List<int>();
                List<string> listDate = new List<string>();

                switch (type.ToLower())
                {
                    case "week":
                        {
                            var thisWeek = DateTime.Now.Date.AddDays(-7);
                            for (int i = 1; i <= 7; i++)
                            {
                                var thisDate = thisWeek.AddDays(i);
                                var nextDate = thisDate.AddDays(1);
                                int thisDateBorrow = db.Borrows.Where(b => b.DateBorrow >= thisDate && b.DateBorrow < nextDate).Count();

                                listCountBorrow.Add(thisDateBorrow);
                                listDate.Add(thisDate.ToString("MM-dd"));
                            }
                            break;
                        }
                    case "month":
                        {
                            var thisMonth = new DateTime(DateTime.Now.Year - 1, DateTime.Now.Month, 1);
                            var lastDayOfMonth = thisMonth.AddMonths(1).AddDays(-1);

                            for (int i = 1; i <= 12; i++)
                            {
                                var iLastThisMonth = lastDayOfMonth.AddMonths(i);
                                var iFirstThisMonth = new DateTime(iLastThisMonth.Year, iLastThisMonth.Month, 1);

                                int countBorrow = db.Borrows.Where(b => b.DateBorrow >= iFirstThisMonth && b.DateBorrow <= iLastThisMonth).Count();

                                listCountBorrow.Add(countBorrow);
                                listDate.Add(iFirstThisMonth.ToString("yyyy-MM"));
                            }
                            break;
                        }
                    default:
                        {
                            goto case "week";
                        }
                }
                return Json(new { status = true, listCountBorrow = listCountBorrow.ToArray(), listDate = listDate.ToArray() }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }
        public JsonResult GetDataChart7(string type)
        {
            try
            {
                List<int> listReturnQty = new List<int>();
                List<int> listBorrowQty = new List<int>();
                List<int> listTakeQty = new List<int>();
                List<int> listReturnNgQty = new List<int>();
                List<int> listExportQty = new List<int>();

                List<string> listDate = new List<string>();

                switch (type.ToLower())
                {
                    case "week":
                        {
                            DateTime today = DateTime.Now.Date;
                            var thisWeek = today.AddDays(((int)DayOfWeek.Monday - (int)today.DayOfWeek - 7) % 7);

                            for (int i = 0; i < 7; i++)
                            {
                                var thisDate = thisWeek.AddDays(i);
                                var nextDate = thisDate.AddDays(1);

                                var Borrows = db.Borrows.Where(b => b.DateBorrow >= thisDate && b.DateBorrow < nextDate && b.Status == "Approved").ToList();
                                var Returns = db.Returns.Where(b => b.DateReturn >= thisDate && b.DateReturn < nextDate && b.Status == "Approved").ToList();
                                var Exports = db.Exports.Where(b => b.CreatedDate >= thisDate && b.CreatedDate < nextDate && b.Status == "Approved").ToList();

                                var borrowQty = 0;
                                var returnQty = 0;
                                var takeQty = 0;
                                var ngQty = 0;
                                var exportQty = 0;

                                foreach (var borrow in Borrows)
                                {
                                    var qty = borrow.BorrowDevices.Sum(b => b.BorrowQuantity) ?? 0;
                                    if (borrow.Type == "Borrow")
                                    {
                                        borrowQty += qty;
                                    }
                                    else if (borrow.Type == "Return")
                                    {
                                        returnQty += qty;
                                    }
                                    else if (borrow.Type == "Take")
                                    {
                                        takeQty += qty;
                                    }
                                }
                                foreach (var _return in Returns)
                                {
                                    returnQty += _return.ReturnDevices.Sum(r => r.ReturnQuantity) ?? 0;
                                }
                                foreach (var export in Exports)
                                {
                                    if (export.Type == "Return NG")
                                    {
                                        ngQty += export.ExportDevices.Sum(e => e.ExportQuantity) ?? 0;
                                    }
                                    else if (export.Type == "Export")
                                    {
                                        exportQty += export.ExportDevices.Sum(e => e.ExportQuantity) ?? 0;
                                    }
                                }

                                listBorrowQty.Add(borrowQty);
                                listReturnQty.Add(returnQty);
                                listTakeQty.Add(takeQty);
                                listReturnNgQty.Add(ngQty);
                                listExportQty.Add(exportQty);
                                listDate.Add(thisDate.ToString("MM-dd"));
                            }
                            break;
                        }
                    case "month":
                        {
                            var thisMonth = new DateTime(DateTime.Now.Year - 1, DateTime.Now.Month, 1);
                            var lastDayOfMonth = thisMonth.AddMonths(1).AddDays(-1);

                            for (int i = 1; i <= 12; i++)
                            {
                                var iLastThisMonth = lastDayOfMonth.AddMonths(i);
                                var iFirstThisMonth = new DateTime(iLastThisMonth.Year, iLastThisMonth.Month, 1);

                                var Borrows = db.Borrows.Where(b => b.DateBorrow >= iFirstThisMonth && b.DateBorrow <= iLastThisMonth && b.Status == "Approved");
                                var Returns = db.Returns.Where(b => b.DateReturn >= iFirstThisMonth && b.DateReturn <= iLastThisMonth && b.Status == "Approved");
                                var Exports = db.Exports.Where(b => b.CreatedDate >= iFirstThisMonth && b.CreatedDate <= iLastThisMonth && b.Status == "Approved");

                                var borrowQty = 0;
                                var returnQty = 0;
                                var takeQty = 0;
                                var ngQty = 0;
                                var exportQty = 0;

                                foreach (var borrow in Borrows)
                                {
                                    var qty = borrow.BorrowDevices.Sum(b => b.BorrowQuantity) ?? 0;
                                    if (borrow.Type == "Borrow")
                                    {
                                        borrowQty += qty;
                                    }
                                    else if (borrow.Type == "Return")
                                    {
                                        returnQty += qty;
                                    }
                                    else if (borrow.Type == "Take")
                                    {
                                        takeQty += qty;
                                    }
                                }
                                foreach (var _return in Returns)
                                {
                                    returnQty += _return.ReturnDevices.Sum(b => b.ReturnQuantity) ?? 0;                                  
                                }
                                foreach (var export in Exports)
                                {
                                    var qty = export.ExportDevices.Sum(b => b.ExportQuantity) ?? 0;
                                    if (export.Type == "Return NG")
                                    {
                                        ngQty += qty;
                                    }
                                    else if (export.Type == "Export")
                                    {
                                        exportQty += qty;
                                    }
                                }

                                if (returnQty > 0 || returnQty > 0 || takeQty > 0 || ngQty > 0 || exportQty > 0)
                                {
                                    listReturnQty.Add(returnQty);
                                    listBorrowQty.Add(borrowQty);
                                    listTakeQty.Add(takeQty);
                                    listReturnNgQty.Add(ngQty);
                                    listExportQty.Add(exportQty);

                                    listDate.Add(iFirstThisMonth.ToString("yyyy-MM"));
                                }
                                
                            }
                            break;
                        }
                    default:
                        {
                            goto case "week";
                        }
                }
                return Json(new { status = true, listTakeQty = listTakeQty.ToArray(), listBorrowQty = listBorrowQty.ToArray(), listReturnQty = listReturnQty.ToArray(), listDate = listDate.ToArray() }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }
        public JsonResult GetDataChart8910()
        {
            try
            {
                List<Borrow> borrows = db.Borrows.ToList();

                DateTime dateNow = DateTime.Now;
                Borrow newestBorrow = db.Borrows.OrderBy(b => b.DateBorrow).FirstOrDefault();

                TimeSpan difference = (dateNow - (DateTime)newestBorrow.DateBorrow);
                int rangeDay = difference.Days;

                int[] WeekApprove = new int[rangeDay];
                int[] WeekPending = new int[rangeDay];
                int[] WeekReject = new int[rangeDay];
                string[] listDate = new string[rangeDay];


                DateTime nextDate = (DateTime)newestBorrow.DateBorrow;
                for (int i = 0; i < rangeDay; i++)
                {
                    var thisDate = nextDate;
                    nextDate = nextDate.AddDays(1);

                    var thisDateBorrow = borrows.Where(b => b.DateBorrow >= thisDate && b.DateBorrow <= nextDate);

                    int approve = thisDateBorrow.Where(b => b.Status == "Approved").Count();
                    int pending = thisDateBorrow.Where(b => b.Status == "Pending").Count();
                    int reject = thisDateBorrow.Where(b => b.Status == "Rejected").Count();

                    WeekApprove[i] = approve;
                    WeekPending[i] = pending;
                    WeekReject[i] = reject;
                    listDate[i] = thisDate.ToString("MM-dd");
                }

                return Json(new { status = true, WeekApprove, WeekPending, WeekReject, listDate }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }
        public JsonResult GetDataChart11()
        {
            try
            {
                int Unconfirmed = db.Devices.Where(d => d.Status == "Unconfirmed").Count();
                int PartConfirmed = db.Devices.Where(d => d.Status == "Part Confirmed").Count();
                int Confirmed = db.Devices.Where(d => d.Status == "Confirmed").Count();
                int Locked = db.Devices.Where(d => d.Status == "Locked").Count();
                int OutRange = db.Devices.Where(d => d.Status == "Out Range").Count();

                return Json(new { status = true, Unconfirmed, PartConfirmed, Confirmed, Locked, OutRange }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }
        public JsonResult GetDataChart12()
        {
            try
            {
                var warehouses = db.Warehouses.ToList();


                int[] WarehouseDeviceCount = new int[warehouses.Count];
                string[] WarehouseDeviceName = new string[warehouses.Count];

                for (int i = 0; i < warehouses.Count; i++)
                {
                    var wh = warehouses[i];
                    WarehouseDeviceCount[i] = wh.Devices.Count;
                    WarehouseDeviceName[i] = wh.WarehouseName;
                }

                int TotalStatic = db.Devices.Where(d => d.Type == "Static" || d.Type_BOM == "S").Count();
                int TotalDynamic = db.Devices.Where(d => d.Type == "Dynamic" || d.Type_BOM == "D").Count();            
                int TotalFixture = db.Devices.Where(d => d.Type == "Fixture").Count();
                int TotalNA = db.Devices.Where(d => d.Type == "NA").Count();

                return Json(new { status = true, WarehouseDeviceCount, WarehouseDeviceName, TotalStatic, TotalDynamic, TotalFixture, TotalNA }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        // Get all model
        public JsonResult GetModels()
        {
            try
            {
                List<ModelsResult> ModelsResults = new List<ModelsResult>();

                foreach (Entities.Model model in db.Models.ToList())
                {
                    // Lấy model
                    ModelsResult modelsResult = new ModelsResult();
                    modelsResult.Model = model;

                    // Lấy các đơn mượn
                    List<Entities.Borrow> borrows = db.Borrows.Where(b => b.IdModel == model.Id && b.Status == "Approved").ToList();

                    // Tính số trạm theo đơn mượn
                    modelsResult.CountStation = borrows.Select(b => b.IdStation).Distinct().Count();

                    // Tính số thiết bị theo đơn mượn
                    List<Entities.Device> devices = new List<Entities.Device>();
                    foreach (Entities.Borrow borrow in borrows)
                    {
                        foreach (BorrowDevice borrowDevice in borrow.BorrowDevices)
                        {
                            Entities.Device device = borrowDevice.Device;
                            if (!devices.Any(d => d.Id == device.Id))
                            {
                                devices.Add(device);
                            }
                        }
                    }
                    modelsResult.CountDevice = devices.Count();

                    ModelsResults.Add(modelsResult);
                }

                return Json(new { status = true, ModelsResults }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }
        public JsonResult GetModelDetails(int Id)
        {
            try
            {
                List<ModelDetailsResult> ModelDetailsResults = new List<ModelDetailsResult>();

                List<Entities.Borrow> borrows = db.Borrows.Where(b => b.IdModel == Id && b.Status == "Approved").ToList();
                foreach (var borrow in borrows)
                {
                    ModelDetailsResult ModelDetailsResult = new ModelDetailsResult();
                    if (!ModelDetailsResults.Any(check => check.Station.Id == borrow.IdStation))
                    {
                        ModelDetailsResult.Station = borrow.Station;
                        ModelDetailsResult.Devices = new List<Entities.Device>();

                        ModelDetailsResults.Add(ModelDetailsResult);
                    }
                    else
                    {
                        ModelDetailsResult = ModelDetailsResults.FirstOrDefault(check => check.Station.Id == borrow.IdStation);
                    }

                    foreach (var borrowDevice in borrow.BorrowDevices)
                    {
                        if (!ModelDetailsResult.Devices.Any(check => check.Id == borrowDevice.Device.Id))
                        {
                            ModelDetailsResult.Devices.Add(borrowDevice.Device);
                        }
                    }
                }

                return Json(new { status = true, ModelDetailsResults }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }
        public JsonResult GetStationDetails(int IdModel, int IdStation)
        {
            try
            {
                List<Entities.Borrow> borrows = db.Borrows.Where(b => b.IdModel == IdModel && b.IdStation == IdStation && b.Status == "Approved").ToList();

                List<StationDetailsResult> StationDetailsResults = new List<StationDetailsResult>();

                foreach (var borrow in borrows)
                {
                    foreach(var borrowDevice in borrow.BorrowDevices)
                    {
                        if(!StationDetailsResults.Any(d => d.Device.Id == borrowDevice.Device.Id))
                        {
                            StationDetailsResults.Add(new StationDetailsResult
                            {
                                Device = borrowDevice.Device,
                                Quantity = borrowDevice.BorrowQuantity ?? 0
                            });
                        }
                        else
                        {
                            StationDetailsResult StationDetailsResult = StationDetailsResults.FirstOrDefault(d => d.Device.Id == borrowDevice.Device.Id);
                            StationDetailsResult.Quantity += borrowDevice.BorrowQuantity ?? 0;
                        }
                    }
                }

                return Json(new { status = true , StationDetailsResults }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }

    }
    public class ModelsResult
    {
        public Entities.Model Model { get; set; }
        public int CountStation { get; set; }
        public int CountDevice { get; set; }
    }
    public class ModelDetailsResult
    {
        public Entities.Station Station { get; set; }
        public List<Entities.Device> Devices { get; set; }
    }
    public class StationDetailsResult
    {
        public Entities.Device Device { get; set; }
        public int Quantity { get; set; }
    }
}