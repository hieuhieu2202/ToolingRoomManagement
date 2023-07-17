using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace ToolingRoomManagement.Areas.PurchaseOrderManager.Controllers
{
    public class DashBoardController : Controller
    {
        // GET: PurchaseOrderManager/DashBoard
        public ActionResult Index()
        {
            return View();
        }

        public JsonResult Top10RequestsNewest()
        {
            try
            {
                using (PurchaseOrderEntities db = new PurchaseOrderEntities())
                {
                    List<PurchaseOrderRequest> requests = db.PurchaseOrderRequests.OrderByDescending(r => r.CreatedDate).Take(10).ToList();

                    return Json(new { status = true, data = ConvertObjToJson(requests) });
                }
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message });
            }
            
        }
        public JsonResult NumRequests()
        {
            try
            {
                using (PurchaseOrderEntities db = new PurchaseOrderEntities())
                {
                    int number = db.PurchaseOrderRequests.ToList().Count;

                    return Json(new { status = true, data = number }, JsonRequestBehavior.AllowGet);
                }
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }
        public JsonResult NumItems()
        {
            try
            {
                using (PurchaseOrderEntities db = new PurchaseOrderEntities())
                {
                    int number = db.PurchaseOrderRequestItems.ToList().Count;

                    return Json(new { status = true, data = number }, JsonRequestBehavior.AllowGet);
                }
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }
        public JsonResult NumApproved()
        {
            try
            {
                using (PurchaseOrderEntities db = new PurchaseOrderEntities())
                {
                    int number = db.PurchaseOrderRequests.Where(r => r.Status != "询问价格 Hỏi giá").ToList().Count;

                    return Json(new { status = true, data = number }, JsonRequestBehavior.AllowGet);
                }
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }
        public JsonResult AllData()
        {
            try
            {
                using (PurchaseOrderEntities db = new PurchaseOrderEntities())
                {
                    var requests = db.PurchaseOrderRequests
                        .Select(r => new
                        {
                            r.Id,
                            r.RequestDepartment,
                            r.UseDepartment,
                            r.CostCode,
                            r.LegalEntity,
                            r.DeliveryLocation,
                            r.Requester,
                            r.RequesterPhoneNumber,
                            r.Approver,
                            r.Reviewer,
                            r.Status,
                            r.PlanDeliveryDate,
                            r.CreatedDate,
                            r.RequesterEmail
                        })
                        .ToList();

                    return Json(new { status = true, data = ConvertObjToJson(requests) }, JsonRequestBehavior.AllowGet);
                }
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }
        public JsonResult Top10Newest()
        {
            try
            {
                using (PurchaseOrderEntities db = new PurchaseOrderEntities())
                {
                    var requests = db.PurchaseOrderRequests
                        .Select(r => new
                        {
                            r.Id,
                            r.RequestDepartment,
                            r.UseDepartment,
                            r.CostCode,
                            r.LegalEntity,
                            r.DeliveryLocation,
                            r.Requester,
                            r.RequesterPhoneNumber,
                            r.Approver,
                            r.Reviewer,
                            r.Status,
                            r.PlanDeliveryDate,
                            r.CreatedDate,
                            r.RequesterEmail
                        })
                        .OrderByDescending(r => r.CreatedDate).Take(5).ToList();

                    return Json(new { status = true, data = ConvertObjToJson(requests) }, JsonRequestBehavior.AllowGet);
                }
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        private string ConvertObjToJson(object obj)
        {
            return JsonConvert.SerializeObject(obj, Formatting.Indented);
        }
    }
}