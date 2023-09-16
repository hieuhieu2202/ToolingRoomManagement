using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Web.Mvc;
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
                Entities.User user = (Entities.User)Session["SignSession"];

                List<Borrow> borrows = db.Borrows.Where(b => b.IdUser == user.Id).ToList();

                return Json(new { status = true, borrows = JsonSerializer.Serialize(borrows) }, JsonRequestBehavior.AllowGet);
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
        public ActionResult GetUserBorrowSigns()
        {
            Entities.User user = (Entities.User)Session["SignSession"];

            List<Borrow> borrows = new List<Borrow>();
            List<UserBorrowSign> userBorrowSigns = db.UserBorrowSigns
                                                     .Where(u => u.IdUser == user.Id && u.Status != "Waitting" && u.Status != "Closed")
                                                     .OrderBy(u => u.SignOrder)
                                                     .ToList();
            foreach(var userBorrowSign in userBorrowSigns)
            {
                Borrow borrow = db.Borrows.FirstOrDefault(b => b.Id == userBorrowSign.IdBorrow);
                borrow.UserBorrowSigns = borrow.UserBorrowSigns.OrderBy(u => u.SignOrder).ToList();
                borrows.Add(borrow);
            }

            return Json(new {status = true, borrows = JsonSerializer.Serialize(borrows) });
        }
        public ActionResult Approve(int IdBorrow, int IdSign)
        {
            try
            {
                Borrow borrow = db.Borrows.FirstOrDefault(b => b.Id == IdBorrow);

                if(borrow != null)
                {
                    UserBorrowSign us = borrow.UserBorrowSigns.FirstOrDefault(u => u.Status == "Pending");
                    
                    if(us.Id == IdSign)
                    {
                        us.Status = "Approved";
                        us.DateSign = DateTime.Now;

                        if (us.SignOrder == (borrow.UserBorrowSigns.Count - 1))
                        {
                            borrow.Status = "Approved";
                            // Send Mail
                        }
                        else
                        {
                            int nextSignOrder = (int)us.SignOrder + 1;
                            UserBorrowSign nextSign = borrow.UserBorrowSigns.FirstOrDefault(u => u.SignOrder == nextSignOrder);
                            nextSign.Status = "Pending";
                            // Send Mail
                        }                       

                        db.SaveChanges();
                        return Json(new { status = true, borrow = JsonSerializer.Serialize(borrow) });
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
        public ActionResult Reject(int IdBorrow, int IdSign, string Note)
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
                        foreach(var borrowDevice in borrow.BorrowDevices)
                        {
                            borrowDevice.Device.RealQty += borrowDevice.BorrowQuantity;
                        }

                        // close sign
                        foreach(var sign in borrow.UserBorrowSigns)
                        {
                            if(sign.SignOrder > us.SignOrder)
                            {
                                sign.Status = "Closed";
                            }
                        }

                        // Send Mail


                        db.SaveChanges();
                        return Json(new { status = true, borrow = JsonSerializer.Serialize(borrow) });
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
        // Borrow
        [HttpGet]
        public ActionResult BorrowDevice()
        {
            return View();
        }

        [HttpPost]
        public ActionResult BorrowDevice(int[] IdDevices, int[] QtyDevices, int[] SignProcess, string UserBorrow, DateTime BorrowDate, DateTime? DueDate, string Note)
        {
            try
            {
                // Device
                Entities.Borrow borrow = new Entities.Borrow();
                borrow.DateBorrow = BorrowDate;
                if (DueDate != null)
                {
                    borrow.DateDue = DueDate;
                }
                borrow.Status = "Pending";
                borrow.Type = "Borrow";
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
                        if (device.RealQty - QtyDevices[i] >= 0)
                        {
                            device.RealQty -= QtyDevices[i]; // trừ vào số lượng thực tế
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

                // User <> Borrow => Sign
                List<Entities.UserBorrowSign> userBorrowSigns = new List<UserBorrowSign>();
                for (int i = 0; i < SignProcess.Length; i++)
                {
                    Entities.UserBorrowSign userBorrowSign = new Entities.UserBorrowSign
                    {
                        IdUser = SignProcess[i],
                        IdBorrow = borrow.Id,
                        SignOrder = i
                    };
                    if (i == 0) 
                    {
                        userBorrowSign.Status = "Pending";

                        // Send mail
                    }
                    else userBorrowSign.Status = "Waitting";
                    userBorrowSigns.Add(userBorrowSign);
                }
                
                db.UserBorrowSigns.AddRange(userBorrowSigns);

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

                if (IdWarehouse == 0)
                {
                    Entities.User user = (Entities.User)Session["SignSession"];
                    warehouse = db.Warehouses.FirstOrDefault(w => w.IdUserManager == user.Id);
                    if (warehouse == null)
                    {
                        warehouse = db.Warehouses.Take(1).FirstOrDefault();
                    }
                }
                return Json(new { status = true, warehouse });
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

        // Return
        [HttpGet]
        public ActionResult ReturnDevice()
        {
            return View();
        }
    }
}