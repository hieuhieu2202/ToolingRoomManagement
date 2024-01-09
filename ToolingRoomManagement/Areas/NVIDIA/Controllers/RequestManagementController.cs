using OfficeOpenXml;
using OfficeOpenXml.FormulaParsing.Excel.Functions.Math;
using OfficeOpenXml.Style;
using System;
using System.Collections.Generic;
using System.ComponentModel.Composition.Primitives;
using System.Data.Entity;
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
    public class RequestManagementController : Controller
    {
        private ToolingRoomEntities db = new ToolingRoomEntities();

        /* REQUEST MANAGEMENT */
        [HttpGet]
        public ActionResult RequestManagement()
        {
            return View();
        }

        [HttpGet]
        public JsonResult GetRequests()
        {
            try
            {
                var borrows = db.Borrows.Select(b => new {
                    Id = b.Id,
                    CreatedDate = b.DateBorrow,
                    Status = b.Status,
                    Type = b.Type,
                    DuaDate = b.DateDue,
                    Note = b.Note,
                    IdModel = b.IdModel,
                    IdStation = b.IdStation,
                    DeviceName = b.BorrowDevices.Select(d => d.Device.DeviceCode).ToList(),
                    User = b.User
                }).ToList();

                var returns = db.Returns.Select(r => new {
                    Id = r.Id,
                    CreatedDate = r.DateReturn,
                    ReturnDate = r.DateReturn,
                    Note = r.Note,
                    Status = r.Status,
                    Type = r.Type,
                    IdBorrow = r.IdBorrow,
                    DeviceName = r.ReturnDevices.Select(d => d.Device.DeviceCode).ToList(),
                    User = r.User
                }).ToList();

                var exports = db.Exports.Select(e => new {
                    Id = e.Id,
                    CreatedDate = e.CreatedDate,
                    Note = e.Note,
                    Status = e.Status,
                    Type = e.Type,
                    DeviceName = e.ExportDevices.Select(d => d.Device.DeviceCode).ToList(),
                    User = e.User
                }).ToList();

                return Json(new { status = true, borrows, returns, exports }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }
        public JsonResult GetRequest(int IdRequest, string Type)
        {
            try
            {
                switch (Type)
                {
                    case "Borrow":
                        {
                            var request = db.Borrows.FirstOrDefault(b => b.Id == IdRequest);
                            if (request != null)
                            {
                                return Json(new { status = true, request }, JsonRequestBehavior.AllowGet);
                            }
                            else
                            {
                                return Json(new { status = false, message = "Request does not exists." }, JsonRequestBehavior.AllowGet);
                            }
                        }
                    case "Return":
                        {
                            var request = db.Returns.FirstOrDefault(r => r.Id == IdRequest);
                            if (request != null)
                            {
                                return Json(new { status = true, request }, JsonRequestBehavior.AllowGet);
                            }
                            else
                            {
                                return Json(new { status = false, message = "Request does not exists." }, JsonRequestBehavior.AllowGet);
                            }
                        }
                    case "Export":
                        {
                            var request = db.Exports.FirstOrDefault(e => e.Id == IdRequest);
                            if (request != null)
                            {
                                return Json(new { status = true, request }, JsonRequestBehavior.AllowGet);
                            }
                            else
                            {
                                return Json(new { status = false, message = "Request does not exists." }, JsonRequestBehavior.AllowGet);
                            }
                        }
                    default:
                        {
                            return Json(new { status = false, message = "Request does not exists." }, JsonRequestBehavior.AllowGet);
                        }
                }
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }
        public JsonResult GetModelsAndStations()
        {
            try
            {
                var models = db.Models.ToList();
                var stations = db.Stations.ToList();

                return Json(new {status = true, models, stations}, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        /* SIGN MANAGEMENT */
        [HttpGet]
        public ActionResult SignManagement()
        {
            

            return View();
        }
        public ActionResult GetUserRequests()
        {
            try
            {
                Entities.User user = (Entities.User)Session["SignSession"];

                var borrows = db.Borrows.Where(b => b.UserBorrowSigns.Any(s => s.IdUser == user.Id)).Select(b => new {
                    Id = b.Id,
                    CreatedDate = b.DateBorrow,
                    Status = b.Status,
                    Type = b.Type,
                    DuaDate = b.DateDue,
                    Note = b.Note,
                    IdModel = b.IdModel,
                    IdStation = b.IdStation,
                    DeviceName = b.BorrowDevices.Select(d => d.Device.DeviceCode).ToList(),
                    UserSigns = b.UserBorrowSigns,
                    User = b.User
                }).ToList();

                var returns = db.Returns.Where(r => r.UserReturnSigns.Any(s => s.IdUser == user.Id)).Select(r => new {
                    Id = r.Id,
                    CreatedDate = r.DateReturn,
                    ReturnDate = r.DateReturn,
                    Note = r.Note,
                    Status = r.Status,
                    Type = r.Type,
                    IdBorrow = r.IdBorrow,
                    DeviceName = r.ReturnDevices.Select(d => d.Device.DeviceCode).ToList(),
                    UserSigns = r.UserReturnSigns,
                    User = r.User
                }).ToList();

                var exports = db.Exports.Where(e => e.UserExportSigns.Any(s => s.IdUser == user.Id)).Select(e => new {
                    Id = e.Id,
                    CreatedDate = e.CreatedDate,
                    Note = e.Note,
                    Status = e.Status,
                    Type = e.Type,
                    DeviceName = e.ExportDevices.Select(d => d.Device.DeviceCode).ToList(),
                    UserSigns = e.UserExportSigns,
                    User = e.User
                }).ToList();

                return Json(new { status = true, borrows, returns, exports }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        [HttpPost]
        public ActionResult Borrow_Approved(int IdRequest, int IdSign)
        {
            try
            {
                var request = db.Borrows.FirstOrDefault(b => b.Id == IdRequest);
                if(request != null)
                {
                    var userSign = request.UserBorrowSigns.FirstOrDefault(s => s.Status == "Pending");
                    if(userSign != null && userSign.Id == IdSign)
                    {
                        userSign.Status = "Approved";
                        userSign.DateSign = DateTime.Now;

                        if (userSign.SignOrder == (request.UserBorrowSigns.Count - 1)) // SignOrder start at 0
                        {
                            request.Status = "Approved";
                            foreach (var requestDevice in request.BorrowDevices)
                            {
                                requestDevice.Device.RealQty -= requestDevice.BorrowQuantity;
                                requestDevice.Device.Status = Data.Common.CheckStatus(requestDevice.Device);

                                db.Devices.AddOrUpdate(requestDevice.Device);
                            }

                            // SEND EMAIL
                            //Data.Common.SendApproveMail(borrow);
                        }
                        else
                        {
                            int nextSignOrder = (int)userSign.SignOrder + 1;
                            var nextUserSign = request.UserBorrowSigns.FirstOrDefault(u => u.SignOrder == nextSignOrder);
                            nextUserSign.Status = "Pending";

                            // SEND EMAIL
                            //Data.Common.SendSignMail(borrow);
                        }

                        db.SaveChanges();

                        return Json(new { status = true, request });
                    }
                    else
                    {
                        return Json(new { status = false, message = "Invalid sign." });
                    }
                }
                else
                {
                    return Json(new { status = false, message = "Request does not exists." });
                }
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message });
            }
        }
        public ActionResult Borrow_Rejected(int IdRequest, int IdSign, string Note)
        {
            try
            {
                var request = db.Borrows.FirstOrDefault(b => b.Id == IdRequest);
                if (request != null)
                {
                    var userSign = request.UserBorrowSigns.FirstOrDefault(u => u.Status == "Pending");
                    if (userSign != null &&  userSign.Id == IdSign)
                    {
                        request.Status = "Rejected";

                        userSign.Status = "Rejected";
                        userSign.DateSign = DateTime.Now;
                        userSign.Note = Note;
                        
                        // RETURN SYSTEM QUANTITY
                        foreach (var requestDevice in request.BorrowDevices)
                        {
                            requestDevice.Device.SysQuantity += requestDevice.BorrowQuantity;
                            requestDevice.Device.Status = Data.Common.CheckStatus(requestDevice.Device);
                        }

                        // CLOSE SIGN
                        foreach (var closeSign in request.UserBorrowSigns)
                        {
                            if (closeSign.SignOrder > userSign.SignOrder) closeSign.Status = "Closed";
                        }

                        // SEND EMAIL
                        //Data.Common.SendRejectMail(borrow);

                        db.SaveChanges();
                        return Json(new { status = true, request });
                    }
                    else
                    {
                        return Json(new { status = false, message = "Invalid sign." });
                    }
                }
                else
                {
                    return Json(new { status = false, message = "Request does not exists." });
                }
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message });
            }
        }
        public ActionResult Return_Approved(int IdRequest, int IdSign)
        {
            try
            {
                var request = db.Returns.FirstOrDefault(b => b.Id == IdRequest);
                if(request != null)
                {
                    var userSign = request.UserReturnSigns.FirstOrDefault(u => u.Status == "Pending");
                    if (userSign != null && userSign.Id == IdSign)
                    {
                        userSign.Status = "Approved";
                        userSign.DateSign = DateTime.Now;

                        if (userSign.SignOrder == request.UserReturnSigns.Count) // SignOrder start at 1
                        {
                            request.Status = "Approved";

                            // CALCULATE QUANTITY
                            foreach(var returnDevice in request.ReturnDevices)
                            {
                                if (!(returnDevice.IsNG ?? false) && !(returnDevice.IsSwap ?? false)) // Trả bình thường
                                {
                                    returnDevice.Device.RealQty = (returnDevice.Device.RealQty ?? 0) + returnDevice.ReturnQuantity;
                                    returnDevice.Device.SysQuantity = (returnDevice.Device.SysQuantity ?? 0) + returnDevice.ReturnQuantity;
                                }
                                else if ((returnDevice.IsNG ?? true) && !(returnDevice.IsSwap ?? false)) // Trả NG
                                {
                                    returnDevice.Device.NG_Qty = (returnDevice.Device.NG_Qty ?? 0) + returnDevice.ReturnQuantity;
                                }
                                else if (!(returnDevice.IsNG ?? false) && (returnDevice.IsSwap ?? false)) // Đổi mới
                                {
                                    if (returnDevice.ReturnQuantity > returnDevice.Device.RealQty)
                                    {
                                        throw new Exception("Please reject this return request as swapping is not allowed when the real quantity is greater than the swap quantity.");
                                    }
                                }
                                else // Trả NG và đổi mới => cộng NG_Qty và trừ thêm vào số lượng hiện tại
                                {
                                    if (returnDevice.ReturnQuantity > returnDevice.Device.RealQty)
                                    {
                                        throw new Exception("Please reject this return request as swapping is not allowed when the real quantity is greater than the swap quantity.");
                                    }

                                    returnDevice.Device.NG_Qty = (returnDevice.Device.NG_Qty ?? 0) + returnDevice.ReturnQuantity; // Trả NG

                                    returnDevice.Device.RealQty = (returnDevice.Device.RealQty ?? 0) - returnDevice.ReturnQuantity;         // Mượn mới
                                    returnDevice.Device.SysQuantity = (returnDevice.Device.SysQuantity ?? 0) - returnDevice.ReturnQuantity; // Mượn mới
                                }
                                db.Devices.AddOrUpdate(returnDevice.Device);
                            }
                        }
                        else
                        {
                            int nextSignOrder = (int)userSign.SignOrder + 1;
                            var nextUserSign = request.UserReturnSigns.FirstOrDefault(u => u.SignOrder == nextSignOrder);
                            nextUserSign.Status = "Pending";
                        }

                        db.Returns.AddOrUpdate(request);
                        db.SaveChanges();
                        return Json(new { status = true, request });
                    }
                    else
                    {
                        return Json(new { status = false, message = "Invalid sign." });
                    }
                }
                else
                {
                    return Json(new { status = false, message = "Request does not exists." });
                }
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message });
            }
        }
        public ActionResult Return_Rejected(int IdRequest, int IdSign, string Note)
        {
            try
            {
                var request = db.Returns.FirstOrDefault(b => b.Id == IdRequest);
                if (request != null)
                {
                    var userSign = request.UserReturnSigns.FirstOrDefault(u => u.Status == "Pending");
                    if (userSign != null && userSign.Id == IdSign)
                    {
                        request.Status = "Rejected";

                        userSign.Status = "Rejected";
                        userSign.DateSign = DateTime.Now;
                        userSign.Note = Note;
                        
                        // CLOSE SIGN
                        foreach (var closeSign in request.UserReturnSigns)
                        {
                            if (closeSign.SignOrder > userSign.SignOrder) closeSign.Status = "Closed";
                        }

                        // SEND EMAIL
                        //Data.Common.SendRejectMail(_return);

                        db.SaveChanges();
                        return Json(new { status = true, request });
                    }
                    else
                    {
                        return Json(new { status = false, message = "Invalid sign." });
                    }
                }
                else
                {
                    return Json(new { status = false, message = "Request does not exists." });
                }
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message });
            }
        }
        public ActionResult Export_Approved(int IdRequest, int IdSign)
        {
            try
            {
                var request = db.Exports.FirstOrDefault(e => e.Id == IdRequest);
                if(request != null)
                {
                    var userSign = request.UserExportSigns.FirstOrDefault(s => s.Status == "Pending");
                    if(userSign != null && userSign.Id == IdSign)
                    {
                        request.Status = "Approved";

                        userSign.Status = "Approved";
                        userSign.SignDate = DateTime.Now;

                        // REQUEST DONE
                        if(userSign.SignOrder == request.UserExportSigns.Count)
                        {
                            foreach(var requestDevice in request.ExportDevices)
                            {
                                if(request.Type == "Return NG")
                                {
                                    requestDevice.Device.NG_Qty = (requestDevice.Device.NG_Qty ?? 0) + requestDevice.ExportQuantity;
                                    requestDevice.Device.RealQty = (requestDevice.Device.RealQty ?? 0) - requestDevice.ExportQuantity;
                                    requestDevice.Device.SysQuantity = (requestDevice.Device.SysQuantity ?? 0) - requestDevice.ExportQuantity;
                                }
                                else if(request.Type == "Export")
                                {
                                    requestDevice.Device.RealQty = (requestDevice.Device.RealQty ?? 0) - requestDevice.ExportQuantity;
                                    requestDevice.Device.SysQuantity = (requestDevice.Device.SysQuantity ?? 0) - requestDevice.ExportQuantity;
                                    requestDevice.Device.QtyConfirm = (requestDevice.Device.QtyConfirm ?? 0) - requestDevice.ExportQuantity;
                                }
                                db.Devices.AddOrUpdate(requestDevice.Device);
                            }
                        }
                        // REQUEST SIGN NEXT
                        else
                        {
                            int nextSignOrder = (int)userSign.SignOrder + 1;
                            var nextUserSign = request.UserExportSigns.FirstOrDefault(u => u.SignOrder == nextSignOrder);
                            nextUserSign.Status = "Pending";

                            // SEND EMAIL
                            //Data.Common.SendSignMail(_return);
                        }

                        db.Exports.AddOrUpdate(request);
                        db.SaveChanges();
                        return Json(new { status = true, request });
                    }
                    else
                    {
                        return Json(new { status = false, message = "Invalid approval signature." });
                    }
                }
                else
                {
                    return Json(new { status = false, message = "Export request not found." });
                }
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message });
            }
        }
        public ActionResult Export_Rejected(int IdRequest, int IdSign, string Note)
        {
            try
            {
                var request = db.Exports.FirstOrDefault(e => e.Id == IdRequest);
                if (request != null)
                {
                    var userSign = request.UserExportSigns.FirstOrDefault(u => u.Status == "Pending");
                    if (userSign != null && userSign.Id == IdSign)
                    {
                        request.Status = "Rejected";

                        userSign.Status = "Rejected";
                        userSign.SignDate = DateTime.Now;
                        userSign.Note = Note;
                        
                        // CLOSE SIGN
                        foreach (var closeSign in request.UserExportSigns)
                        {
                            if (closeSign.SignOrder > userSign.SignOrder) closeSign.Status = "Closed";
                        }

                        // SEND EMAIL
                        //Data.Common.SendRejectMail(_return);

                        db.SaveChanges();
                        return Json(new { status = true, request });
                    }
                    else
                    {
                        return Json(new { status = false, message = "Invalid reject." });
                    }
                }
                else
                {
                    return Json(new { status = false, message = "Request does not exists." });
                }
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message });
            }
        }

        /* BORROW & TAKE DEVICE */
        [HttpGet]
        public ActionResult BorrowDevice()
        {
            return View();
        }
        [HttpGet]
        public ActionResult TakeDevice()
        {
            return View();
        }
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
                    foreach (var borrow in borrows)
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
                return Json(new { status = false, message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
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
                //Data.Common.SendSignMail(borrow);

                db.SaveChanges();

                return Json(new { status = true });
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message });
            }
        }
        public ActionResult TakeDevice(int[] IdDevices, int[] QtyDevices, int[] SignProcess, string UserBorrow, DateTime BorrowDate, string Model, string Station, string Note)
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

                if (borrow.Model == null)
                {
                    borrow.Model = model;
                }
                if (borrow.Station == null)
                {
                    borrow.Station = station;
                }

                // Send mail
                //Data.Common.SendSignMail(borrow);

                db.SaveChanges();

                return Json(new { status = true });
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

        /* RETURN DEVICE */
        [HttpGet]
        public ActionResult ReturnDevice()
        {
            return View();
        }
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

        /* EXPORT */
        public ActionResult ExportDeviceHistory()
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
    }
}