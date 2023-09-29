﻿using OfficeOpenXml.FormulaParsing.Excel.Functions.DateTime;
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

        //Get total devices
        public JsonResult GetDataChart1()
        {
            try
            {
                int totalDevice = 0;
                int thisWeekDevice = 0;
                int lastWeekDevice = 0;

                int[] thisWeekDevices = new int[7];
                string[] thisWeekDate = new string[7];

                var thisWeek = DateTime.Now.Date.AddDays(-7);
                var lastWeek = DateTime.Now.Date.AddDays(-14);

                totalDevice = db.Devices.Count();
                thisWeekDevice = db.Devices.Where(d => d.DeviceDate >= thisWeek).Count();
                lastWeekDevice = db.Devices.Where(d => d.DeviceDate >= lastWeek && d.DeviceDate < thisWeek).Count();

                for(int i = 1; i <= 7; i++)
                {
                    var date = thisWeek.AddDays(i);
                    var nextDate = date.AddDays(1);
                    int dateDevice = db.Devices.Where(d => d.DeviceDate >= date && d.DeviceDate < nextDate).Count();

                    thisWeekDevices[i - 1] = dateDevice;
                    thisWeekDate[i - 1] = date.ToString("MM-dd");
                }

                return Json(new { status = true, totalDevice, thisWeekDevice, lastWeekDevice, thisWeekDevices, thisWeekDate }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new {status = false, message = ex.Message}, JsonRequestBehavior.AllowGet);
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

                var thisWeek = DateTime.Now.Date.AddDays(-7);
                var lastWeek = DateTime.Now.Date.AddDays(-14);

                totalQuantity = (int)db.Devices.Sum(d => d.QtyConfirm);
                thisWeekQuantity = (int)db.Devices.Where(d => d.DeviceDate >= thisWeek).Sum(d => d.QtyConfirm);
                lastWeekQuantity = (int)db.Devices.Where(d => d.DeviceDate >= lastWeek && d.DeviceDate < thisWeek).Sum(d => d.QtyConfirm);

                for (int i = 1; i <= 7; i++)
                {
                    var date = thisWeek.AddDays(i);
                    var nextDate = date.AddDays(1);
                    int dateQuantity = db.Devices.Where(d => d.DeviceDate >= date && d.DeviceDate < nextDate).Sum(d => d.QtyConfirm) ?? 0;

                    arrWeekQuantity[i - 1] = dateQuantity;
                    arrWeekDate[i - 1] = date.ToString("MM-dd");
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

                var thisWeek = DateTime.Now.Date.AddDays(-7);
                var lastWeek = DateTime.Now.Date.AddDays(-14);

                totalUser = db.Users.Count();
                thisWeekUser = db.Users.Where(d => d.CreatedDate >= thisWeek).Count();
                lastWeekUser = db.Users.Where(d => d.CreatedDate >= lastWeek && d.CreatedDate < thisWeek).Count();

                for (int i = 1; i <= 7; i++)
                {
                    var date = thisWeek.AddDays(i);
                    var nextDate = date.AddDays(1);
                    int dateQuantity = db.Users.Where(d => d.CreatedDate >= date && d.CreatedDate < nextDate).Count();

                    arrWeekUser[i - 1] = dateQuantity;
                    arrWeekDate[i - 1] = date.ToString("MM-dd");
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

                var thisWeek = DateTime.Now.Date.AddDays(-7);
                var lastWeek = DateTime.Now.Date.AddDays(-14);

                totalBorrow = db.Borrows.Count();
                thisWeekBorrow = db.Borrows.Where(d => d.DateBorrow >= thisWeek).Count();
                lastWeekBorrow = db.Borrows.Where(d => d.DateBorrow >= lastWeek && d.DateBorrow < thisWeek).Count();

                for (int i = 1; i <= 7; i++)
                {
                    var date = thisWeek.AddDays(i);
                    var nextDate = date.AddDays(1);
                    int dateQuantity = db.Borrows.Where(d => d.DateBorrow >= date && d.DateBorrow < nextDate).Count();

                    arrWeekBorrow[i - 1] = dateQuantity;
                    arrWeekDate[i - 1] = date.ToString("MM-dd");
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

                var thisWeek = DateTime.Now.Date.AddDays(-7);
                var lastWeek = DateTime.Now.Date.AddDays(-14);

                totalApprove = db.Borrows.Where(d => d.Status == "Approved").Count();
                thisWeekApprove = db.Borrows.Where(d => d.DateBorrow >= thisWeek && d.Status == "Approved").Count();
                lastWeekApprove = db.Borrows.Where(d => d.DateBorrow >= lastWeek && d.DateBorrow < thisWeek && d.Status == "Approved").Count();

                for (int i = 1; i <= 7; i++)
                {
                    var date = thisWeek.AddDays(i);
                    var nextDate = date.AddDays(1);
                    int dateQuantity = db.Borrows.Where(d => d.DateBorrow >= date && d.DateBorrow < nextDate && d.Status == "Approved").Count();

                    arrWeekApprove[i - 1] = dateQuantity;
                    arrWeekDate[i - 1] = date.ToString("MM-dd");
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
                            for(int i = 1; i <= 7; i++)
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

                            for (int i = 1; i<=12; i++)
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

                                var Borrows = db.Borrows.Where(b => b.DateBorrow >= thisDate && b.DateBorrow < nextDate && b.Status == "Approved");
                                var borrowQty = 0;
                                var returnQty = 0;
                                foreach(var borrow in Borrows)
                                {
                                    var DeviceBorrows = borrow.BorrowDevices;
                                    foreach(var device in DeviceBorrows)
                                    {
                                        if(borrow.Type == "Borrow")
                                        {
                                            borrowQty += device.BorrowQuantity ?? 0;
                                        }
                                        else if(borrow.Type == "Return")
                                        {
                                            returnQty += device.BorrowQuantity ?? 0;
                                        }
                                    }

                                }

                                listBorrowQty.Add(borrowQty);
                                listReturnQty.Add(returnQty);
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
                                    }
                                }
                                listReturnQty.Add(returnQty);
                                listBorrowQty.Add(borrowQty);
                                listDate.Add(iFirstThisMonth.ToString("yyyy-MM"));
                            }
                            break;
                        }
                    default:
                        {
                            goto case "week";
                        }
                }
                return Json(new { status = true, listReturnQty = listReturnQty.ToArray(), listBorrowQty = listBorrowQty.ToArray(), listDate = listDate.ToArray() }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        public JsonResult GetDataChart78910()
        {
            try
            {
                int[] WeekApprove = new int[7];
                int[] WeekPending = new int[7];
                int[] WeekReject = new int[7];

                string[] listDate = new string[7];

                var thisWeek = DateTime.Now.Date.AddDays(-7);
                for (int i = 1; i <= 7; i++)
                {
                    var thisDate = thisWeek.AddDays(i);
                    var nextDate = thisDate.AddDays(1);
                    var thisDateBorrow = db.Borrows.Where(b => b.DateBorrow >= thisDate && b.DateBorrow < nextDate );

                    int approve = thisDateBorrow.Where(b => b.Status == "Approved").Count();
                    int pending = thisDateBorrow.Where(b => b.Status == "Pending").Count();
                    int reject = thisDateBorrow.Where(b => b.Status == "Rejected").Count();

                    WeekApprove[i - 1] = approve;
                    WeekPending[i - 1] = pending;
                    WeekReject[i - 1] = reject;
                    listDate[i - 1] = thisDate.ToString("MM-dd");
                }

                return Json(new { status = true, WeekApprove, WeekPending, WeekReject, listDate }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }
    }
}