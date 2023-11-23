using Model.EF;
using OfficeOpenXml.FormulaParsing.Excel.Functions.Math;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Web.Mvc;
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

                List<Return> returns = new List<Return>();
                returns = db.Returns.OrderByDescending(r => r.DateReturn).ToList();

                return Json(new { status = true, borrows = borrows, returns }, JsonRequestBehavior.AllowGet);
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

                return Json(new { status = true, borrow = JsonSerializer.Serialize(borrow) }, JsonRequestBehavior.AllowGet);
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


            //// if admin
            //if(UserRoles.Count > 0)
            //{
            //    foreach (var userRole in UserRoles)
            //    {
            //        var role = db.Roles.FirstOrDefault(r => r.Id == userRole.IdRole);
            //        if (role.RoleName == "admin")
            //        {
            //            borrows = db.Borrows.OrderByDescending(b => b.Id).ToList();
            //            break;
            //        }
            //    }
            //} 

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

                    return Json(new { status = true, warehouse = JsonSerializer.Serialize(warehouse) });
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
                    //Data.Common.SendApproveMail(borrow);
                }
                else
                {
                    int nextSignOrder = (int)us.SignOrder + 1;
                    UserBorrowSign nextSign = borrow.UserBorrowSigns.FirstOrDefault(u => u.SignOrder == nextSignOrder);
                    nextSign.Status = "Pending";
                    // Send Mail
                    //Data.Common.SendSignMail(borrow);
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
                borrow = db.Borrows.FirstOrDefault(b => b.Id == IdBorrow);

                if (borrow != null)
                {
                    UserBorrowSign us = borrow.UserBorrowSigns.FirstOrDefault(u => u.Status == "Pending");

                    if (borrow.Type == "Borrow" || borrow.Type == "Take")
                    {
                        if (us.Id == IdSign)
                        {
                            us.Status = "Rejected";
                            us.DateSign = DateTime.Now;
                            us.Note = Note;

                            borrow.Status = "Rejected";

                            // return quantity
                            foreach (var borrowDevice in borrow.BorrowDevices)
                            {
                                borrowDevice.Device.SysQuantity += borrowDevice.BorrowQuantity;
                                borrowDevice.Device.Status = Data.Common.CheckStatus(borrowDevice.Device);
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
                    else // Type = "Return"
                    {
                        if (us.Id == IdSign)
                        {
                            us.Status = "Rejected";
                            us.DateSign = DateTime.Now;
                            us.Note = Note;

                            borrow.Status = "Rejected";

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
                            return Json(new { status = true, borrow = JsonSerializer.Serialize(borrow) });
                        }
                        else
                        {
                            return Json(new { status = false, message = "Sign not found." });
                        }
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

                return Json(new { status = true, borrows = JsonSerializer.Serialize(borrows) }, JsonRequestBehavior.AllowGet);
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
                db.Returns.Add(data);
                db.SaveChanges();

                return Json(new { status = true});
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message });
            }
        }
        public JsonResult GetReturn(int Id)
        {
            try
            {
                Return _return = db.Returns.FirstOrDefault(b => b.Id == Id);

                return Json(new { status = true, _return }, JsonRequestBehavior.AllowGet);
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