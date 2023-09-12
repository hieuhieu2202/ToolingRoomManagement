using OfficeOpenXml.FormulaParsing.Excel.Functions.Math;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using ToolingRoomManagement.Areas.NVIDIA.Entities;

namespace ToolingRoomManagement.Areas.NVIDIA.Controllers
{
    public class BorrowManagementController : Controller
    {
        ToolingRoomEntities db = new ToolingRoomEntities();

        // GET: NVIDIA/BorrowManagement
        public ActionResult BorrowManagement()
        {
            return View();
        }
        
        public ActionResult ReturnDevice()
        {
            return View();
        }

        [HttpGet]
        public ActionResult BorrowDevice()
        {
            return View();
        }
        [HttpPost]
        public ActionResult BorrowDevice(int[] IdDevices, int[] QtyDevices, int[] SignProcess, string UserBorrow, DateTime BorrowDate, DateTime? DueDate)
        {
            try
            {
                // Device
                Entities.Borrow borrow = new Entities.Borrow();
                borrow.DateBorrow = BorrowDate;
                if(DueDate != null)
                {
                    borrow.DateDue = DueDate;
                }
                borrow.Status = "Pending";
                borrow.Type = "Borrow";
                borrow.IdUser = db.Users.FirstOrDefault(u => u.Username == UserBorrow).Id;
                db.Borrows.Add(borrow);


                // Borrow <> Device
                List<Entities.BorrowDevice> borrowDevices = new List<Entities.BorrowDevice>();
                for(int i = 0; i < IdDevices.Length; i++)
                {
                    int IdDevice = IdDevices[i];

                    Entities.Device device = db.Devices.FirstOrDefault(d => d.Id == IdDevice);

                    if(device != null)
                    {
                        if(device.RealQty - QtyDevices[i] >= 0)
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
                for (int i = 0; i< SignProcess.Length; i++)
                {
                    Entities.UserBorrowSign userBorrowSign = new Entities.UserBorrowSign
                    {
                        IdUser = SignProcess[i],
                        IdBorrow = borrow.Id,
                        SignOrder = i
                    };
                    userBorrowSigns.Add(userBorrowSign);
                }
                db.UserBorrowSigns.AddRange(userBorrowSigns);

                db.SaveChanges();

                return Json(new { status = true});
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
                foreach(var user in users)
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
    }
}