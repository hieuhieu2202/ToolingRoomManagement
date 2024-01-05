using Model.EF;
using OfficeOpenXml;
using OfficeOpenXml.FormulaParsing.Excel.Functions.Math;
using OfficeOpenXml.Style;
using System;
using System.Collections.Generic;
using System.Data.Entity.Migrations;
using System.IO;
using System.Linq;
using System.Text.Json;
using System.Web.Mvc;
using System.Web.Script.Serialization;
using ToolingRoomManagement.Areas.NVIDIA.Data;
using ToolingRoomManagement.Areas.NVIDIA.Entities;
using ToolingRoomManagement.Attributes;

namespace ToolingRoomManagement.Areas.NVIDIA.Controllers
{
    [Authentication]
    public class BorrowManagementController : Controller
    {
        private ToolingRoomEntities db = new ToolingRoomEntities();

        // BorrowManagement
        [HttpGet]
        public ActionResult BorrowManagement()
        {
            return View();
        }

        [HttpGet]
        public JsonResult GetUserBorrows()
        {
            try
            {
                List<Borrow> borrows = new List<Borrow>();
                borrows = db.Borrows.OrderByDescending(b => b.DateBorrow).ToList();
                foreach (Borrow b in borrows)
                {
                    b.DevicesName = string.Join(",", b.BorrowDevices.Where(bd => bd.Device != null).Select(bd => bd.Device.DeviceCode));
                    b.BorrowDevices.Clear();
                }

                List<Return> returns = new List<Return>();
                returns = db.Returns.OrderByDescending(r => r.DateReturn).ToList();
                foreach (Return r in returns)
                {
                    r.DevicesName = string.Join(",", r.ReturnDevices.Where(rd => rd.Device != null).Select(rd => rd.Device.DeviceCode));
                    r.ReturnDevices.Clear();
                }
                return Json(new { status = true, borrows, returns }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        [HttpGet]

        public JsonResult GetBorrow(int Id)
        {
            try
            {
                Borrow borrow = db.Borrows.FirstOrDefault(b => b.Id == Id);
                borrow.UserBorrowSigns = borrow.UserBorrowSigns.OrderBy(o => o.SignOrder).ToList();
                //borrow = CalculateBorrowQuantity(borrow);


                return Json(new { status = true, borrow }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        // Sign
        [HttpGet]
        public ActionResult Sign()
        {
            

            return View();
        }
        public ActionResult GetUserSigns()
        {
            Entities.User user = (Entities.User)Session["SignSession"];
            List<Entities.UserRole> UserRoles = db.UserRoles.Where(ur => ur.IdUser == user.Id).ToList();

            List<Borrow> borrows = db.Borrows.Where(b => b.UserBorrowSigns.FirstOrDefault(s => s.IdUser == user.Id).IdUser == user.Id ).OrderByDescending(b => b.Id).ToList();
            List<Return> returns = db.Returns.Where(b => b.UserReturnSigns.FirstOrDefault(s => s.IdUser == user.Id).IdUser == user.Id).OrderByDescending(b => b.Id).ToList();

            foreach (Borrow b in borrows)
            {
                b.DevicesName = string.Join(",", b.BorrowDevices.Where(bd => bd.Device != null).Select(bd => bd.Device.DeviceCode));
                b.BorrowDevices.Clear();
            }
            foreach (Return r in returns)
            {
                r.DevicesName = string.Join(",", r.ReturnDevices.Where(rd => rd.Device != null).Select(rd => rd.Device.DeviceCode));
                r.ReturnDevices.Clear();
            }

            return Json(new {status = true, borrows, returns });
        }
               
        // Borrow
        [HttpGet]
        public ActionResult BorrowDevice()
        {
            return View();
        }
        [HttpPost]
        public ActionResult BorrowDevice(int[] IdDevices, int[] QtyDevices, int[] SignProcess, string UserBorrow, DateTime BorrowDate, DateTime? DueDate,string Model, string Station, string Note)
        {
            try
            {
                // Model
                Entities.Model model = db.Models.FirstOrDefault(m => m.ModelName == Model);
                if (model == null)
                {
                    model = new Entities.Model
                    {
                        ModelName = Model
                    };
                    db.Models.Add(model);
                }
                // Station
                Entities.Station station = db.Stations.FirstOrDefault(m => m.StationName == Station);
                if (station == null)
                {
                    station = new Entities.Station
                    {
                        StationName = Station
                    };
                    db.Stations.Add(station);
                }

                // Device
                Entities.Borrow borrow = new Entities.Borrow();
                borrow.DateBorrow = BorrowDate;
                if (DueDate != null)
                {
                    borrow.DateDue = DueDate;
                }
                borrow.Status = "Pending";
                borrow.Type = "Borrow";
                borrow.IdModel = model.Id;
                borrow.IdStation = station.Id;
                borrow.Note = Note;
                borrow.IdUser = db.Users.FirstOrDefault(u => u.Username == UserBorrow).Id;
                db.Borrows.Add(borrow);

                // Borrow <> Device
                List<Entities.BorrowDevice> borrowDevices = new List<Entities.BorrowDevice>();
                for (int i = 0; i < IdDevices.Length; i++)
                {
                    int IdDevice = IdDevices[i];

                    Entities.Device device = db.Devices.FirstOrDefault(d => d.Id == IdDevice);

                    if (device != null)
                    {
                        if (device.SysQuantity - QtyDevices[i] >= 0)
                        {
                            device.SysQuantity -= QtyDevices[i]; // trừ vào số lượng ảo
                            Entities.BorrowDevice borrowDevice = new Entities.BorrowDevice
                            {
                                IdBorrow = borrow.Id,
                                IdDevice = IdDevices[i],
                                BorrowQuantity = QtyDevices[i],
                            };
                            borrowDevices.Add(borrowDevice);
                        }
                        else
                        {
                            return Json(new { status = false, message = "Please double check Quantity Borrow." });
                        }

                        device.Status = Data.Common.CheckStatus(device);
                    }
                    else
                    {
                        return Json(new { status = false, message = "Device is not found." });
                    }
                }
                db.BorrowDevices.AddRange(borrowDevices);
                borrow.BorrowDevices = borrowDevices;

                // User <> Borrow => Sign
                List<Entities.UserBorrowSign> userBorrowSigns = new List<UserBorrowSign>();
                for (int i = 0; i < SignProcess.Length; i++)
                {
                    Entities.UserBorrowSign userBorrowSign = new Entities.UserBorrowSign
                    {
                        IdUser = SignProcess[i],
                        IdBorrow = borrow.Id,
                        SignOrder = i,
                        Type = "Borrow"
                    };
                    if (i == 0) 
                    {
                        userBorrowSign.Status = "Pending";
                    }
                    else userBorrowSign.Status = "Waitting";

                    Entities.User signUser = db.Users.FirstOrDefault(u => u.Id == userBorrowSign.IdUser);
                    userBorrowSign.User = signUser;

                    userBorrowSigns.Add(userBorrowSign);
                }
                
                db.UserBorrowSigns.AddRange(userBorrowSigns);
                borrow.UserBorrowSigns = userBorrowSigns;

                borrow.Model = db.Models.FirstOrDefault(m => m.Id == borrow.IdModel);
                borrow.Station = db.Stations.FirstOrDefault(m => m.Id == borrow.IdStation);
                if (borrow.Model == null)
                {
                    borrow.Model = model;
                }
                if (borrow.Station == null)
                {
                    borrow.Station = station;
                }
                // Send mail
                Data.Common.SendSignMail(borrow);

                db.SaveChanges();

                return Json(new { status = true });
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

                if(warehouse != null)
                {
                    warehouse.UserDeputy1 = db.Users.FirstOrDefault(u => u.Id == warehouse.IdUserDeputy1);
                    warehouse.UserDeputy2 = db.Users.FirstOrDefault(u => u.Id == warehouse.IdUserDeputy2);

                    return Json(new { status = true, warehouse });
                }
                else
                {
                    return Json(new { status = false, message = "Warehouse not found." });
                }
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message });
            }
        }
        [HttpGet]
        public JsonResult GetUserAndRole()
        {
            try
            {
                var users = db.Users.ToList();
                var roles = db.Roles.Where(r => r.RoleName != "admin").ToList();
                foreach (var user in users)
                {
                    user.Password = string.Empty;
                }
                return Json(new { status = true, users, roles }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }
        public ActionResult Borrow_Approve(int IdBorrow, int IdSign)
        {
            try
            {
                Borrow borrow = db.Borrows.FirstOrDefault(b => b.Id == IdBorrow);
                if (borrow == null) return Json(new { status = false, message = "Borrow request not found." });
                UserBorrowSign userBorrowSign = borrow.UserBorrowSigns.FirstOrDefault(u => u.Status == "Pending");
                if (userBorrowSign == null) return Json(new { status = false, message = "No pending approval process found." });
                if (userBorrowSign.Id != IdSign) return Json(new { status = false, message = "Invalid approval signature." });

                userBorrowSign.Status = "Approved";
                userBorrowSign.DateSign = DateTime.Now;

                // check xem đơn được ký hoàn toàn
                if (userBorrowSign.SignOrder == (borrow.UserBorrowSigns.Count - 1))
                {
                    borrow.Status = "Approved";
                    // trừ vào số lượng thực tế 
                    foreach (var borrowDevice in borrow.BorrowDevices)
                    {
                        borrowDevice.Device.RealQty -= borrowDevice.BorrowQuantity;
                        borrowDevice.Device.Status = Data.Common.CheckStatus(borrowDevice.Device);
                    }
                    // Send Mail
                    Data.Common.SendApproveMail(borrow);
                }
                else
                {
                    int nextSignOrder = (int)userBorrowSign.SignOrder + 1;
                    UserBorrowSign nextSign = borrow.UserBorrowSigns.FirstOrDefault(u => u.SignOrder == nextSignOrder);
                    nextSign.Status = "Pending";
                    // Send Mail
                    Data.Common.SendSignMail(borrow);
                }

                db.SaveChanges();
                return Json(new { status = true, borrow });
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message });
            }
        }
        public ActionResult Borrow_Reject(int IdBorrow, int IdSign, string Note)
        {
            try
            {
                Borrow borrow = db.Borrows.FirstOrDefault(b => b.Id == IdBorrow);
                if (borrow != null)
                {
                    UserBorrowSign us = borrow.UserBorrowSigns.FirstOrDefault(u => u.Status == "Pending");
                    if (us.Id == IdSign)
                    {
                        us.Status = "Rejected";
                        us.DateSign = DateTime.Now;
                        us.Note = Note;
                        borrow.Status = "Rejected";

                        // return quantity
                        foreach (var borrowDevice in borrow.BorrowDevices)
                        {
                            var device = db.Devices.FirstOrDefault(d => d.Id == borrowDevice.Device.Id);
                            device.SysQuantity += borrowDevice.BorrowQuantity;
                            device.Status = Data.Common.CheckStatus(borrowDevice.Device);

                            db.Devices.AddOrUpdate(device);
                        }

                        // close sign
                        foreach (var sign in borrow.UserBorrowSigns)
                        {
                            if (sign.SignOrder > us.SignOrder)
                            {
                                sign.Status = "Closed";
                            }
                        }

                        // Send Mail
                        Data.Common.SendRejectMail(borrow);

                        db.SaveChanges();
                        return Json(new { status = true, borrow });
                    }
                    else
                    {
                        return Json(new { status = false, message = "Sign not found." });
                    }
                }
                else
                {
                    return Json(new { status = false, message = "Borrow request is empty." });
                }
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message });
            }
        }
        public ActionResult ExportBorrowHistory()
        {
            try
            {
                ExcelPackage.LicenseContext = OfficeOpenXml.LicenseContext.NonCommercial;
                using (var package = new ExcelPackage())
                {
                    var worksheet = package.Workbook.Worksheets.Add("Borrow History");

                    #region Header
                    worksheet.Cells["A1"].Value = "Date time";
                    worksheet.Cells["B1"].Value = "Engineer";
                    worksheet.Cells["C1"].Value = "Type";
                    worksheet.Cells["D1"].Value = "Warehouse";
                    worksheet.Cells["E1"].Value = "MTS";
                    worksheet.Cells["F1"].Value = "PN";
                    worksheet.Cells["G1"].Value = "Description";
                    worksheet.Cells["H1"].Value = "Quantity";
                    worksheet.Cells["I1"].Value = "Sign Process";

                    var headerStyle = worksheet.Cells["A1:I1"].Style;
                    headerStyle.Font.Bold = true;
                    headerStyle.Border.Top.Style = ExcelBorderStyle.Thin;
                    headerStyle.Border.Bottom.Style = ExcelBorderStyle.Thin;
                    headerStyle.Border.Left.Style = ExcelBorderStyle.Thin;
                    headerStyle.Border.Right.Style = ExcelBorderStyle.Thin;
                   

                    System.Drawing.Color headerBackgroundColor = System.Drawing.ColorTranslator.FromHtml("#00B050");
                    headerStyle.Fill.PatternType = ExcelFillStyle.Solid;
                    headerStyle.Fill.BackgroundColor.SetColor(headerBackgroundColor);
                    #endregion

                    var borrows = db.Borrows.Where(b => b.Status == "Approved").OrderBy(b => b.DateBorrow).ToList();
                    int index = 2;
                    int row = 1;
                    foreach(var borrow in borrows)
                    {
                        int indexNext = index + borrow.BorrowDevices.Count - 1;
                        worksheet.Cells[$"A{index}:A{indexNext}"].Merge = true;
                        worksheet.Cells[$"B{index}:B{indexNext}"].Merge = true;
                        worksheet.Cells[$"C{index}:C{indexNext}"].Merge = true;
                        worksheet.Cells[$"D{index}:D{indexNext}"].Merge = true;
                        worksheet.Cells[$"I{index}:I{indexNext}"].Merge = true;

                        if (row % 2 == 0)
                        {
                            var borrowStyle = worksheet.Cells[$"A{index}:I{indexNext}"].Style;
                            borrowStyle.Fill.PatternType = ExcelFillStyle.Solid;
                            borrowStyle.Fill.BackgroundColor.SetColor(System.Drawing.Color.LightGray);
                        }
                        row++;

                        worksheet.Cells[$"A{index}"].Value = borrow.DateBorrow?.ToString("yyyy-MM-dd HH:mm tt");
                        worksheet.Cells[$"B{index}"].Value = $"{borrow.User.Username}-{borrow.User.CnName}";
                        worksheet.Cells[$"C{index}"].Value = borrow.Type;

                        var IdWarehouse = borrow.BorrowDevices.ToList().First().Device.IdWareHouse;
                        var warehouse = db.Warehouses.FirstOrDefault(w => w.Id == IdWarehouse);
                        worksheet.Cells[$"D{index}"].Value = warehouse.WarehouseName;

                        string signprocess = "";
                        var userBorrowSign = borrow.UserBorrowSigns.ToList();
                        for (int i = 0; i < userBorrowSign.Count; i++)
                        {
                            signprocess += $"[{userBorrowSign[i].User.Username}-{userBorrowSign[i].User.CnName}]";
                            if (i < userBorrowSign.Count - 1)
                            {
                                signprocess += " => ";
                            }
                        }
                        worksheet.Cells[$"I{index}"].Value = signprocess;

                        foreach (var borrowdevice in borrow.BorrowDevices)
                        {
                            worksheet.Cells[$"E{index}"].Value = borrowdevice.Device?.Product?.MTS ?? "";
                            worksheet.Cells[$"F{index}"].Value = borrowdevice.Device?.DeviceCode ?? "";
                            worksheet.Cells[$"G{index}"].Value = borrowdevice.Device?.DeviceName ?? "";
                            worksheet.Cells[$"H{index}"].Value = borrowdevice.BorrowQuantity;

                            index++;
                        }

                    }

                    // Data style
                    #region Data Style
                    worksheet.Cells[worksheet.Dimension.Address].AutoFitColumns();

                    var dataStyle = worksheet.Cells[worksheet.Dimension.Address].Style;
                    
                    dataStyle.VerticalAlignment = ExcelVerticalAlignment.Center;

                    dataStyle.Border.Top.Style = ExcelBorderStyle.Thin;
                    dataStyle.Border.Bottom.Style = ExcelBorderStyle.Thin;
                    dataStyle.Border.Left.Style = ExcelBorderStyle.Thin;
                    dataStyle.Border.Right.Style = ExcelBorderStyle.Thin;

                    worksheet.Column(3).Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                    worksheet.Column(4).Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                    worksheet.Column(8).Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;

                    worksheet.Column(1).Width = 20;
                    worksheet.Column(2).Width = 20;
                    worksheet.Column(3).Width = 10;
                    worksheet.Column(9).Width = 60;

                   
                    #endregion
                    // Lưu tệp tin
                    #region Save File
                    var fileData = package.GetAsByteArray();
                    var fileName = "BorrowHistory.xlsx";
                    var folderPath = Server.MapPath("/Data/NewToolingroom/BorrowHistory");
                    if (!Directory.Exists(folderPath))
                    {   
                        Directory.CreateDirectory(folderPath);
                    }
                    var filePath = Path.Combine(folderPath, fileName);
                    System.IO.File.WriteAllBytes(filePath, fileData);
                    #endregion

                    // Trả về
                    var url = Url.Content("~/Data/NewToolingroom/BorrowHistory/" + fileName);
                    return Json(new { status = true, url, filename = "BorrowHistory.xlsx" }, JsonRequestBehavior.AllowGet);
                }
            }
            catch (Exception ex)
            {
                return Json(new {status = false, message = ex.Message}, JsonRequestBehavior.AllowGet);
            }
        }

        // Return
        [HttpGet]
        public ActionResult ReturnDevice()
        {
            return View();
        }
        [HttpGet]
        public JsonResult GetListBorrowRequests()
        {
            try
            {
                Entities.User user = (Entities.User)Session["SignSession"];
                List<Borrow> borrows = db.Borrows.Where(b => b.IdUser == user.Id && b.Status == "Approved" && (b.Type == "Borrow" || b.Type == "Take")).ToList();
                for (int i = 0; i < borrows.Count; i++)
                {
                    borrows[i].DevicesName = string.Join(",", borrows[i].BorrowDevices.Where(bd => bd.Device != null).Select(bd => bd.Device.DeviceCode));
                    borrows[i] = CalculateBorrowQuantity(borrows[i]);
                }

                return Json(new { status = true, borrows }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }
        [HttpPost]
        public ActionResult ReturnDevices(Return data)
        {
            try
            {
                if (data.ReturnDevices.Count == 0) return Json(new { status = false, message = "Please input return quantity." });

                var borrow = db.Borrows.FirstOrDefault(b => b.Id == data.IdBorrow);
                
                if (borrow != null)
                {
                    // Check Return Quantity
                    foreach (var returnDevice in data.ReturnDevices)
                    {
                        if (borrow.BorrowDevices.Any(br => br.IdDevice == returnDevice.IdDevice))
                        {
                            returnDevice.Device = db.Devices.FirstOrDefault(d => d.Id == returnDevice.IdDevice);

                            int totalReturnQty = db.Returns
                                            .Where(r => r.IdBorrow == data.IdBorrow && r.ReturnDevices.Any(rd => rd.IdDevice == returnDevice.IdDevice))
                                            .Sum(r => r.ReturnDevices.FirstOrDefault().ReturnQuantity) ?? 0;

                            int thisReturnQry = totalReturnQty + returnDevice.ReturnQuantity ?? 0;
                            int borrowedQuantity = borrow.BorrowDevices.FirstOrDefault(bd => bd.IdDevice == returnDevice.IdDevice).BorrowQuantity ?? 0;
                            if (thisReturnQry > borrowedQuantity) return Json(new { status = false, message = "Return quantity > Borrow quantity." });
                        }
                        else
                        {
                            return Json(new { status = false, message = "Please double check your request." });
                        }
                    }

                    data.User = db.Users.FirstOrDefault(u => u.Id == data.IdUser);
                    foreach (var userReturnSign in data.UserReturnSigns)
                    {
                        userReturnSign.User = db.Users.FirstOrDefault(u => u.Id == userReturnSign.IdUser);
                    }


                    //Data.Common.SendSignMail(data);

                    // Check Return All
                    db.Returns.Add(data);
                    db.SaveChanges();

                    

                    var borrowAfter = CalculateBorrowQuantity(borrow);


                    return Json(new { status = true, borrow = borrowAfter });
                }
                else
                {
                    return Json(new { status = false, message = "Borrow request not found." });
                }
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message });
            }
        }

        private Borrow CalculateBorrowQuantity(Borrow borrow)
        {
            List<BorrowDevice> borrowDevices = borrow.BorrowDevices.ToList();

            foreach (var borrowDevice in borrowDevices)
            {
                var returns = db.Returns.Where(r => r.IdBorrow == borrow.Id).ToList();

                int totalReturnQty = 0;
                foreach(var ireturn in returns)
                {
                    var returnDevice = ireturn.ReturnDevices.FirstOrDefault(rd => rd.IdDevice == borrowDevice.IdDevice);
                    if(returnDevice != null) totalReturnQty += returnDevice.ReturnQuantity ?? 0;
                }

                if(totalReturnQty == borrowDevice.BorrowQuantity)
                {
                    borrow.BorrowDevices.Remove(borrowDevice);
                }
                else
                {
                    borrowDevice.BorrowQuantity -= totalReturnQty;
                }
            }

            return borrow;
        }

        public JsonResult GetReturn(int Id)
        {
            try
            {
                Return _return = db.Returns.FirstOrDefault(b => b.Id == Id);
                _return.UserReturnSigns = _return.UserReturnSigns.OrderBy(o => o.SignOrder).ToList();

                return Json(new { status = true, _return }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }
        public ActionResult Return_Approve(int IdReturn, int IdSign)
        {
            try
            {
                Return _return = db.Returns.FirstOrDefault(b => b.Id == IdReturn);
                if (_return == null) return Json(new { status = false, message = "Return request not found." });
                UserReturnSign userReturnSign = _return.UserReturnSigns.FirstOrDefault(u => u.Status == "Pending");
                if (userReturnSign == null) return Json(new { status = false, message = "No pending approval process found." });
                if (userReturnSign.Id != IdSign) return Json(new { status = false, message = "Invalid approval signature." });

                userReturnSign.Status = "Approved";
                userReturnSign.DateSign = DateTime.Now;

                // check xem đơn được ký hoàn toàn
                if (userReturnSign.SignOrder == _return.UserReturnSigns.Count)
                {
                    _return.Status = "Approved";
                    foreach (var returnDevice in _return.ReturnDevices)
                    {         
                        if (returnDevice.Device.NG_Qty == null) returnDevice.Device.NG_Qty = 0;
                        if (returnDevice.Device.RealQty == null) returnDevice.Device.RealQty = 0;
                        if (returnDevice.Device.SysQuantity == null) returnDevice.Device.SysQuantity = 0;

                        if (returnDevice.IsNG == false && returnDevice.IsSwap == false) // Trả bình thường
                        {
                            returnDevice.Device.RealQty += returnDevice.ReturnQuantity;
                            returnDevice.Device.SysQuantity += returnDevice.ReturnQuantity;
                        }
                        else if (returnDevice.IsNG == true && returnDevice.IsSwap == false) // Trả NG
                        {
                            returnDevice.Device.NG_Qty += returnDevice.ReturnQuantity;
                        }
                        else if (returnDevice.IsNG == false && returnDevice.IsSwap == true) // Đổi mới
                        {
                            if(returnDevice.ReturnQuantity > returnDevice.Device.RealQty)
                            {
                                return Json(new { status = false, message = "Please reject this return request as swapping is not allowed when the real quantity is greater than the swap quantity." });
                            }
                        }
                        else // Trả NG và đổi mới => cộng NG_Qty và trừ thêm vào số lượng hiện tại
                        {
                            if (returnDevice.ReturnQuantity > returnDevice.Device.RealQty)
                            {
                                return Json(new { status = false, message = "Please reject this return request as swapping is not allowed when the real quantity is greater than the swap quantity." });
                            }

                            returnDevice.Device.NG_Qty += returnDevice.ReturnQuantity;

                            returnDevice.Device.RealQty -= returnDevice.ReturnQuantity;
                            returnDevice.Device.SysQuantity -= returnDevice.ReturnQuantity;
                        }

                        returnDevice.Device.Status = Data.Common.CheckStatus(returnDevice.Device);
                    }

                    //Data.Common.SendApproveMail(_return);
                }
                else
                {
                    int nextSignOrder = (int)userReturnSign.SignOrder + 1;
                    UserReturnSign nextSign = _return.UserReturnSigns.FirstOrDefault(u => u.SignOrder == nextSignOrder);
                    nextSign.Status = "Pending";

                    //Data.Common.SendSignMail(_return);
                }
                db.Returns.AddOrUpdate(_return);
                db.SaveChanges();
                return Json(new { status = true, _return });
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message });
            }
        }
        public ActionResult Return_Reject(int IdReturn, int IdSign, string Note)
        {
            try
            {
                Return _return = db.Returns.FirstOrDefault(b => b.Id == IdReturn);
                if (_return != null)
                {
                    UserReturnSign userReturnSign = _return.UserReturnSigns.FirstOrDefault(u => u.Status == "Pending");
                    if (userReturnSign.Id == IdSign)
                    {
                        userReturnSign.Status = "Rejected";
                        userReturnSign.DateSign = DateTime.Now;
                        userReturnSign.Note = Note;
                        _return.Status = "Rejected";                       

                        // close sign
                        foreach (var sign in _return.UserReturnSigns)
                        {
                            if (sign.SignOrder > userReturnSign.SignOrder)
                            {
                                sign.Status = "Closed";
                            }
                        }

                        //Data.Common.SendRejectMail(_return);

                        db.SaveChanges();
                        return Json(new { status = true, _return });
                    }
                    else
                    {
                        return Json(new { status = false, message = "Sign not found." });
                    }
                }
                else
                {
                    return Json(new { status = false, message = "Borrow request is empty." });
                }
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message });
            }
        }
        public ActionResult ExportReturnHistory()
        {
            try
            {
                ExcelPackage.LicenseContext = OfficeOpenXml.LicenseContext.NonCommercial;
                using (var package = new ExcelPackage())
                {
                    var worksheet = package.Workbook.Worksheets.Add("Return History");

                    #region Header
                    worksheet.Cells["A1"].Value = "Date time";
                    worksheet.Cells["B1"].Value = "Engineer";
                    worksheet.Cells["C1"].Value = "Type";
                    worksheet.Cells["D1"].Value = "Warehouse";
                    worksheet.Cells["E1"].Value = "MTS";
                    worksheet.Cells["F1"].Value = "PN";
                    worksheet.Cells["G1"].Value = "Description";
                    worksheet.Cells["H1"].Value = "Quantity";
                    worksheet.Cells["I1"].Value = "Status";
                    worksheet.Cells["J1"].Value = "Swap New";
                    worksheet.Cells["K1"].Value = "TE Leader";
                    worksheet.Cells["L1"].Value = "Received Person";

                    var headerStyle = worksheet.Cells["A1:L1"].Style;
                    headerStyle.Font.Bold = true;
                    headerStyle.Border.Top.Style = ExcelBorderStyle.Thin;
                    headerStyle.Border.Bottom.Style = ExcelBorderStyle.Thin;
                    headerStyle.Border.Left.Style = ExcelBorderStyle.Thin;
                    headerStyle.Border.Right.Style = ExcelBorderStyle.Thin;


                    System.Drawing.Color headerBackgroundColor = System.Drawing.ColorTranslator.FromHtml("#00B050");
                    headerStyle.Fill.PatternType = ExcelFillStyle.Solid;
                    headerStyle.Fill.BackgroundColor.SetColor(headerBackgroundColor);
                    #endregion

                    var returns = db.Returns.Where(r => r.Status == "Approved").OrderBy(b => b.DateReturn).ToList();
                    int index = 2;
                    int row = 1;
                    foreach (var _return in returns)
                    {
                        int indexNext = index + _return.ReturnDevices.Count - 1;
                        worksheet.Cells[$"A{index}:A{indexNext}"].Merge = true;
                        worksheet.Cells[$"B{index}:B{indexNext}"].Merge = true;
                        worksheet.Cells[$"C{index}:C{indexNext}"].Merge = true;
                        worksheet.Cells[$"D{index}:D{indexNext}"].Merge = true;
                        worksheet.Cells[$"K{index}:K{indexNext}"].Merge = true;
                        worksheet.Cells[$"L{index}:L{indexNext}"].Merge = true;

                        if (row % 2 == 0)
                        {
                            var borrowStyle = worksheet.Cells[$"A{index}:L{indexNext}"].Style;
                            borrowStyle.Fill.PatternType = ExcelFillStyle.Solid;
                            borrowStyle.Fill.BackgroundColor.SetColor(System.Drawing.Color.LightGray);
                        }
                        row++;

                        worksheet.Cells[$"A{index}"].Value = _return.DateReturn?.ToString("yyyy-MM-dd HH:mm tt");
                        worksheet.Cells[$"B{index}"].Value = $"{_return.User.Username}-{_return.User.CnName}";
                        worksheet.Cells[$"C{index}"].Value = _return.Type;
                        

                        var IdWarehouse = _return.ReturnDevices.ToList().First().Device.IdWareHouse;
                        var warehouse = db.Warehouses.FirstOrDefault(w => w.Id == IdWarehouse);
                        worksheet.Cells[$"D{index}"].Value = warehouse.WarehouseName;

                        #region Sign
                        var signs = _return.UserReturnSigns.ToList();
                        worksheet.Cells[$"K{index}"].Value = $"{signs[signs.Count - 2].User.Username}-{signs[signs.Count - 2].User.CnName}";
                        worksheet.Cells[$"L{index}"].Value = $"{signs[signs.Count - 1].User.Username}-{signs[signs.Count - 1].User.CnName}";
                        #endregion

                        foreach (var returndevice in _return.ReturnDevices)
                        {
                            worksheet.Cells[$"E{index}"].Value = returndevice.Device?.Product?.MTS ?? "";
                            worksheet.Cells[$"F{index}"].Value = returndevice.Device?.DeviceCode ?? "";
                            worksheet.Cells[$"G{index}"].Value = returndevice.Device?.DeviceName ?? "";
                            worksheet.Cells[$"H{index}"].Value = returndevice.ReturnQuantity;

                            #region Return NG
                            var returnStyle = worksheet.Cells[$"I{index}"].Style;
                            returnStyle.Font.Bold = true;

                            bool isNG = returndevice.IsNG ?? false;
                            if (isNG)
                            {
                                worksheet.Cells[$"I{index}"].Value = "NG";
                                returnStyle.Font.Color.SetColor(System.Drawing.Color.Red);
                            }
                            else
                            {
                                worksheet.Cells[$"I{index}"].Value = "OK";
                                returnStyle.Font.Color.SetColor(System.Drawing.Color.Green);
                            }
                            #endregion

                            #region Return Swap
                            var swapStyle = worksheet.Cells[$"J{index}"].Style;
                            swapStyle.Font.Bold = true;

                            bool isSwap = returndevice.IsSwap ?? false;
                            if (isSwap)
                            {
                                worksheet.Cells[$"J{index}"].Value = "Y";
                                swapStyle.Font.Color.SetColor(System.Drawing.Color.Red);
                            }
                            else
                            {                               
                                worksheet.Cells[$"J{index}"].Value = "N";
                                swapStyle.Font.Color.SetColor(System.Drawing.Color.Green);
                            }
                            #endregion

                            index++;
                        }
                    }

                    // Data style
                    #region Data Style
                    worksheet.Cells[worksheet.Dimension.Address].AutoFitColumns();

                    var dataStyle = worksheet.Cells[worksheet.Dimension.Address].Style;

                    dataStyle.VerticalAlignment = ExcelVerticalAlignment.Center;

                    dataStyle.Border.Top.Style = ExcelBorderStyle.Thin;
                    dataStyle.Border.Bottom.Style = ExcelBorderStyle.Thin;
                    dataStyle.Border.Left.Style = ExcelBorderStyle.Thin;
                    dataStyle.Border.Right.Style = ExcelBorderStyle.Thin;

                    worksheet.Column(3).Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                    worksheet.Column(4).Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                    worksheet.Column(8).Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                    worksheet.Column(9).Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                    worksheet.Column(10).Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;

                    worksheet.Column(1).Width = 20;
                    worksheet.Column(2).Width = 20;
                    worksheet.Column(3).Width = 10;

                    worksheet.Column(11).Width = 20;
                    worksheet.Column(12).Width = 20;


                    #endregion
                    // Lưu tệp tin
                    #region Save File
                    var fileData = package.GetAsByteArray();
                    var fileName = "ReturnHistory.xlsx";
                    var folderPath = Server.MapPath("/Data/NewToolingroom/ReturnHistory");
                    if (!Directory.Exists(folderPath))
                    {
                        Directory.CreateDirectory(folderPath);
                    }
                    var filePath = Path.Combine(folderPath, fileName);
                    System.IO.File.WriteAllBytes(filePath, fileData);
                    #endregion

                    // Trả về
                    var url = Url.Content("~/Data/NewToolingroom/ReturnHistory/" + fileName);
                    return Json(new { status = true, url, filename = "ReturnHistory.xlsx" }, JsonRequestBehavior.AllowGet);
                }
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        // Take
        [HttpGet]
        public ActionResult TakeDevice()
        {
            return View();
        }

        [HttpPost]
        public ActionResult TakeDevice(int[] IdDevices, int[] QtyDevices, int[] SignProcess, string UserBorrow, DateTime BorrowDate, string Model, string Station, string Note)
        {
            try
            {
                // Model
                Entities.Model model = db.Models.FirstOrDefault(m => m.ModelName == Model);
                if(model == null)
                {
                    model = new Entities.Model
                    {
                        ModelName = Model
                    };
                    db.Models.Add(model);
                }
                // Station
                Entities.Station station = db.Stations.FirstOrDefault(m => m.StationName == Station);
                if (station == null)
                {
                    station = new Entities.Station
                    {
                        StationName = Station
                    };
                    db.Stations.Add(station);
                }                

                // Device
                Entities.Borrow borrow = new Entities.Borrow();
                borrow.DateBorrow = BorrowDate;
                borrow.Status = "Pending";
                borrow.Type = "Take";
                borrow.IdModel = model.Id;
                borrow.IdStation = station.Id;
                borrow.Note = Note;
                borrow.IdUser = db.Users.FirstOrDefault(u => u.Username == UserBorrow).Id;
                db.Borrows.Add(borrow);

                // Borrow <> Device
                List<Entities.BorrowDevice> borrowDevices = new List<Entities.BorrowDevice>();
                for (int i = 0; i < IdDevices.Length; i++)
                {
                    int IdDevice = IdDevices[i];

                    Entities.Device device = db.Devices.FirstOrDefault(d => d.Id == IdDevice);

                    if (device != null)
                    {
                        if (device.SysQuantity - QtyDevices[i] >= 0)
                        {
                            device.SysQuantity -= QtyDevices[i]; // trừ vào số lượng ảo
                            Entities.BorrowDevice borrowDevice = new Entities.BorrowDevice
                            {
                                IdBorrow = borrow.Id,
                                IdDevice = IdDevices[i],
                                BorrowQuantity = QtyDevices[i],
                            };
                            borrowDevices.Add(borrowDevice);
                        }
                        else
                        {
                            return Json(new { status = false, message = "Please double check Quantity Borrow." });
                        }

                        device.Status = Data.Common.CheckStatus(device);
                    }
                    else
                    {
                        return Json(new { status = false, message = "Device is not found." });
                    }
                }
                db.BorrowDevices.AddRange(borrowDevices);
                borrow.BorrowDevices = borrowDevices;

                // User <> Borrow => Sign
                List<Entities.UserBorrowSign> userBorrowSigns = new List<UserBorrowSign>();
                for (int i = 0; i < SignProcess.Length; i++)
                {
                    Entities.UserBorrowSign userBorrowSign = new Entities.UserBorrowSign
                    {
                        IdUser = SignProcess[i],
                        IdBorrow = borrow.Id,
                        SignOrder = i,
                        Type = "Take"
                    };
                    if (i == 0)
                    {
                        userBorrowSign.Status = "Pending";
                    }
                    else userBorrowSign.Status = "Waitting";

                    Entities.User signUser = db.Users.FirstOrDefault(u => u.Id == userBorrowSign.IdUser);
                    userBorrowSign.User = signUser;

                    userBorrowSigns.Add(userBorrowSign);
                }

                db.UserBorrowSigns.AddRange(userBorrowSigns);
                borrow.UserBorrowSigns = userBorrowSigns;

                borrow.Model = db.Models.FirstOrDefault(m => m.Id == borrow.IdModel);
                borrow.Station = db.Stations.FirstOrDefault(m => m.Id == borrow.IdStation);

                if(borrow.Model == null)
                {
                    borrow.Model = model;
                }
                if(borrow.Station == null)
                {
                    borrow.Station = station;
                }

                // Send mail
                Data.Common.SendSignMail(borrow);

                db.SaveChanges();

                return Json(new { status = true });
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message });
            }
        }

    }
}