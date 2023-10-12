using OfficeOpenXml.FormulaParsing.Excel.Functions.DateTime;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.InteropServices;
using System.Web;
using System.Web.Mvc;
using ToolingRoomManagement.Areas.NVIDIA.Entities;
using ToolingRoomManagement.Attributes;

namespace ToolingRoomManagement.Areas.NVIDIA.Controllers
{
    [Authentication]
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
                int totalDevice = 0;
                int thisWeekDevice = 0;
                int lastWeekDevice = 0;

                int[] thisWeekDevices = new int[7];
                string[] thisWeekDate = new string[7];


                DateTime today = DateTime.Now.Date;
                var thisWeek = today.AddDays(((int)DayOfWeek.Monday - (int)today.DayOfWeek - 7) % 7);
                var lastWeek = thisWeek.AddDays(-7);

                totalDevice = db.Devices.Count();
                thisWeekDevice = db.Devices.Where(d => d.DeviceDate >= thisWeek).Count();
                lastWeekDevice = db.Devices.Where(d => d.DeviceDate >= lastWeek && d.DeviceDate < thisWeek).Count();

                for (int i = 0; i < 7; i++)
                {
                    var date = thisWeek.AddDays(i);
                    var nextDate = date.AddDays(1);
                    int dateDevice = db.Devices.Where(d => d.DeviceDate >= date && d.DeviceDate < nextDate).Count();

                    thisWeekDevices[i] = dateDevice;
                    thisWeekDate[i] = date.ToString("MM-dd");
                }

                return Json(new { status = true, totalDevice, thisWeekDevice, lastWeekDevice, thisWeekDevices, thisWeekDate }, JsonRequestBehavior.AllowGet);
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
                int totalQuantity = 0;
                int thisWeekQuantity = 0;
                int lastWeekQuantity = 0;

                int[] arrWeekQuantity = new int[7];
                string[] arrWeekDate = new string[7];

                DateTime today = DateTime.Now.Date;
                var thisWeek = today.AddDays(((int)DayOfWeek.Monday - (int)today.DayOfWeek - 7) % 7);
                var lastWeek = thisWeek.AddDays(-7);

                // total borrow qty
                var totalBorrowAprroved = db.Borrows.Where(b => b.Type == "Borrow" || b.Type == "Take" && b.Status == "Approved").ToList();
                foreach (var borrow in totalBorrowAprroved)
                {
                    foreach (var borrowDevice in borrow.BorrowDevices)
                    {
                        totalQuantity += borrowDevice.BorrowQuantity ?? 0;
                    }

                }
                // this week borrow qty
                var thisWeekBorrowAprroved = totalBorrowAprroved.Where(b => b.DateBorrow >= thisWeek).ToList();
                foreach (var borrow in thisWeekBorrowAprroved)
                {
                    foreach (var borrowDevice in borrow.BorrowDevices)
                    {
                        thisWeekQuantity += borrowDevice.BorrowQuantity ?? 0;
                    }

                }
                // last week borrow qty
                var lastWeekBorrowAprroved = totalBorrowAprroved.Where(b => b.DateBorrow >= lastWeek && b.DateBorrow < thisWeek);
                foreach (var borrow in lastWeekBorrowAprroved)
                {
                    foreach (var borrowDevice in borrow.BorrowDevices)
                    {
                        lastWeekQuantity += borrowDevice.BorrowQuantity ?? 0;
                    }

                }

                // get borrow qty by day (this week)
                for (int i = 0; i < 7; i++)
                {
                    var date = thisWeek.AddDays(i);
                    var nextDate = date.AddDays(1);

                    int dateQuantity = 0;
                    var dateBorrows = totalBorrowAprroved.Where(b => b.DateBorrow >= date && b.DateBorrow < nextDate);
                    foreach (var borrow in dateBorrows)
                    {
                        foreach (var borrowDevice in borrow.BorrowDevices)
                        {
                            dateQuantity += borrowDevice.BorrowQuantity ?? 0;
                        }

                    }

                    arrWeekQuantity[i] = dateQuantity;
                    arrWeekDate[i] = date.ToString("MM-dd");
                }

                return Json(new { status = true, totalQuantity, thisWeekQuantity, lastWeekQuantity, arrWeekQuantity, arrWeekDate }, JsonRequestBehavior.AllowGet);
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
                int totalUser = 0;
                int thisWeekUser = 0;
                int lastWeekUser = 0;

                int[] arrWeekUser = new int[7];
                string[] arrWeekDate = new string[7];

                DateTime today = DateTime.Now.Date;
                var thisWeek = today.AddDays(((int)DayOfWeek.Monday - (int)today.DayOfWeek - 7) % 7);
                var lastWeek = thisWeek.AddDays(-7);

                totalUser = db.Users.Count();
                thisWeekUser = db.Users.Where(d => d.LastSignIn >= thisWeek).Count();
                lastWeekUser = db.Users.Where(d => d.LastSignIn >= lastWeek && d.LastSignIn < thisWeek).Count();

                for (int i = 0; i < 7; i++)
                {
                    var date = thisWeek.AddDays(i);
                    var nextDate = date.AddDays(1);
                    int dateQuantity = db.Users.Where(d => d.LastSignIn >= date && d.LastSignIn < nextDate).Count();

                    arrWeekUser[i ] = dateQuantity;
                    arrWeekDate[i] = date.ToString("MM-dd");
                }

                return Json(new { status = true, totalUser, thisWeekUser, lastWeekUser, arrWeekUser, arrWeekDate }, JsonRequestBehavior.AllowGet);
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
                int totalBorrow = 0;
                int thisWeekBorrow = 0;
                int lastWeekBorrow = 0;

                int[] arrWeekBorrow = new int[7];
                string[] arrWeekDate = new string[7];

                DateTime today = DateTime.Now.Date;
                var thisWeek = today.AddDays(((int)DayOfWeek.Monday - (int)today.DayOfWeek - 7) % 7);
                var lastWeek = thisWeek.AddDays(-7);

                totalBorrow = db.Borrows.Count();
                thisWeekBorrow = db.Borrows.Where(d => d.DateBorrow >= thisWeek).Count();
                lastWeekBorrow = db.Borrows.Where(d => d.DateBorrow >= lastWeek && d.DateBorrow < thisWeek).Count();

                for (int i = 0; i < 7; i++)
                {
                    var date = thisWeek.AddDays(i);
                    var nextDate = date.AddDays(1);
                    int dateQuantity = db.Borrows.Where(d => d.DateBorrow >= date && d.DateBorrow < nextDate).Count();

                    arrWeekBorrow[i] = dateQuantity;
                    arrWeekDate[i] = date.ToString("MM-dd");
                }

                return Json(new { status = true, totalBorrow, thisWeekBorrow, lastWeekBorrow, arrWeekBorrow, arrWeekDate }, JsonRequestBehavior.AllowGet);
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
                int totalApprove = 0;
                int thisWeekApprove = 0;
                int lastWeekApprove = 0;

                int[] arrWeekApprove = new int[7];
                string[] arrWeekDate = new string[7];

                DateTime today = DateTime.Now.Date;
                var thisWeek = today.AddDays(((int)DayOfWeek.Monday - (int)today.DayOfWeek - 7) % 7);
                var lastWeek = thisWeek.AddDays(-7);

                totalApprove = db.Borrows.Where(d => d.Status == "Approved").Count();
                thisWeekApprove = db.Borrows.Where(d => d.DateBorrow >= thisWeek && d.Status == "Approved").Count();
                lastWeekApprove = db.Borrows.Where(d => d.DateBorrow >= lastWeek && d.DateBorrow < thisWeek && d.Status == "Approved").Count();

                for (int i = 0; i < 7; i++)
                {
                    var date = thisWeek.AddDays(i);
                    var nextDate = date.AddDays(1);
                    int dateQuantity = db.Borrows.Where(d => d.DateBorrow >= date && d.DateBorrow < nextDate && d.Status == "Approved").Count();

                    arrWeekApprove[i] = dateQuantity;
                    arrWeekDate[i] = date.ToString("MM-dd");
                }

                return Json(new { status = true, totalApprove, thisWeekApprove, lastWeekApprove, arrWeekApprove, arrWeekDate }, JsonRequestBehavior.AllowGet);
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
                                var borrowQty = 0;
                                var returnQty = 0;
                                var takeQty = 0;
                                foreach (var borrow in Borrows)
                                {
                                    var DeviceBorrows = borrow.BorrowDevices;
                                    foreach (var device in DeviceBorrows)
                                    {
                                        if (borrow.Type == "Borrow")
                                        {
                                            borrowQty += device.BorrowQuantity ?? 0;
                                        }
                                        else if (borrow.Type == "Return")
                                        {
                                            returnQty += device.BorrowQuantity ?? 0;
                                        }
                                        else if (borrow.Type == "Take")
                                        {
                                            takeQty += device.BorrowQuantity ?? 0;
                                        }
                                    }

                                }

                                listBorrowQty.Add(borrowQty);
                                listReturnQty.Add(returnQty);
                                listTakeQty.Add(takeQty);
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
                                var borrowQty = 0;
                                var returnQty = 0;
                                var takeQty = 0;
                                foreach (var borrow in Borrows)
                                {
                                    var DeviceBorrows = borrow.BorrowDevices;
                                    foreach (var device in DeviceBorrows)
                                    {
                                        if (borrow.Type == "Borrow")
                                        {
                                            borrowQty += device.BorrowQuantity ?? 0;
                                        }
                                        else if (borrow.Type == "Return")
                                        {
                                            returnQty += device.BorrowQuantity ?? 0;
                                        }
                                        else if (borrow.Type == "Take")
                                        {
                                            takeQty += device.BorrowQuantity ?? 0;
                                        }
                                    }
                                }
                                if(returnQty > 0 || returnQty > 0 || takeQty > 0)
                                {
                                    listReturnQty.Add(returnQty);
                                    listBorrowQty.Add(borrowQty);
                                    listTakeQty.Add(takeQty);
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
                string [] WarehouseDeviceName = new string[warehouses.Count];

                for (int i = 0; i < warehouses.Count; i++)
                {
                    var wh = warehouses[i];
                    WarehouseDeviceCount[i] = wh.Devices.Count;
                    WarehouseDeviceName[i] = wh.WarehouseName;
                }

                int TotalStatic = db.Devices.Where(d => d.Type == "S").Count();
                int TotalDynamic = db.Devices.Where(d => d.Type == "D").Count();
                int TotalConsign = db.Devices.Where(d => d.Type == "Consign").Count();
                int TotalFixture = db.Devices.Where(d => d.Type == "Fixture").Count();
                int TotalOrther = db.Devices.Count() - (TotalStatic + TotalDynamic + TotalConsign + TotalFixture);

                return Json(new { status = true, WarehouseDeviceCount, WarehouseDeviceName, TotalStatic, TotalDynamic, TotalConsign, TotalFixture, TotalOrther }, JsonRequestBehavior.AllowGet);
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