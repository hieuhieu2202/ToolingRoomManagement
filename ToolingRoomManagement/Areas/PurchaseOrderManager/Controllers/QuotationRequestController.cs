using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data.Entity.Validation;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;
using System.Web.UI.WebControls;
using ToolingRoomManagement.Attribute;

namespace ToolingRoomManagement.Areas.PurchaseOrderManager.Controllers
{
    [Authen(AllowAnonymous = false)]
    public class QuotationRequestController : Controller
    {
        // GET: PurchaseOrderManager/QuotationRequest
        public ActionResult Home()
        {
            return View();
        }

        // Get
        public JsonResult GetListPR()
        {
            using (PurchaseOrderEntities db = new PurchaseOrderEntities())
            {
                List<PurchaseOrderRequest> purchaseOrderRequests = db.PurchaseOrderRequests.ToList();
                return Json(new { status = true, data =  ConvertObjToJson(purchaseOrderRequests)}, JsonRequestBehavior.AllowGet);
            }

        }            
        public ActionResult GetFiles(string folderPath)
        {
            string[] files = Directory.GetFiles(folderPath);
            return Json(files, JsonRequestBehavior.AllowGet);
        }
        public JsonResult GetSinglePR(string id)
        {
            try
            {
                using(PurchaseOrderEntities db = new PurchaseOrderEntities())
                {
                    Guid Id = Guid.Parse(id);
                    PurchaseOrderRequest pur = db.PurchaseOrderRequests.FirstOrDefault(x => x.Id == Id);

                    return Json(new { status = true, data = ConvertObjToJson(pur) }, JsonRequestBehavior.AllowGet);
                }              
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        // POST (Save) - (Delete)
        public JsonResult NewPurchaseOrderRequest(
           PurchaseOrderRequest purchaseOrderRequest,
           List<PurchaseOrderRequestItem> purchaseOrderRequestItems,
           List<IEnumerable<HttpPostedFileBase>> itemImage,
           List<HttpPostedFileBase> po_files,
           List<HttpPostedFileBase> pr_files,
           List<HttpPostedFileBase> or_files)
        {
            using (PurchaseOrderEntities db = new PurchaseOrderEntities())
            {
                try
                {
                    // Head
                    Guid IdRequest = Guid.NewGuid();
                    purchaseOrderRequest.Id = IdRequest;
                    purchaseOrderRequest.CreatedDate = DateTime.Now;

                    db.PurchaseOrderRequests.Add(purchaseOrderRequest);

                    // Item
                    foreach (var item in purchaseOrderRequestItems)
                    {
                        item.Id = Guid.NewGuid();
                        item.IdRequest = IdRequest;

                        db.PurchaseOrderRequestItems.Add(item);
                    }
                    // Item Image
                    SaveItemImage(db, itemImage, purchaseOrderRequestItems);

                    // pr files
                    SaveFiles(db, pr_files, IdRequest, "PR");

                    // po files
                    SaveFiles(db, po_files, IdRequest, "PO");

                    // or files
                    SaveFiles(db, or_files, IdRequest, "OR");

                    db.SaveChanges();

                    return Json(new { status = true, data = ConvertObjToJson(purchaseOrderRequest) });
                }
                catch (Exception ex)
                {
                    return Json(new { status = false, message = ex.Message });
                }
            }
        }

        public JsonResult EditPurchaseOrderRequest(
            PurchaseOrderRequest purchaseOrderRequest,
           List<PurchaseOrderRequestItem> purchaseOrderRequestItems)
        {
            return Json(new { });
        }

        public JsonResult DeletePurchaseOrderRequest(string Id)
        {
            using(PurchaseOrderEntities db = new PurchaseOrderEntities())
            {
                try
                {
                    Guid rId = Guid.Parse(Id);
                    PurchaseOrderRequest request = db.PurchaseOrderRequests.FirstOrDefault(x => x.Id == rId);

                    foreach (PurchaseOrderRequestItem item in request.PurchaseOrderRequestItems)
                    {
                        foreach (PurchaseOrderRequestImage img in item.PurchaseOrderRequestImages)
                        {
                            if (Directory.Exists(img.Directory))
                            {
                                Directory.Delete(img.Directory, true);
                            }
                        }
                    }
                    foreach(PurchaseOrderRequestFile file in request.PurchaseOrderRequestFiles)
                    {
                        if (Directory.Exists(file.Path))
                        {
                            Directory.Delete(file.Path, true);
                        }
                    }

                    db.PurchaseOrderRequests.Remove(request);
                    db.SaveChanges();

                    return Json(new { status = true});
                }
                catch(Exception ex)
                {
                    return Json(new { status = false, message = ex.Message });
                }
            }
           
        }
        // Common
        private void SaveItemImage(PurchaseOrderEntities db, List<IEnumerable<HttpPostedFileBase>> itemImage, List<PurchaseOrderRequestItem> purchaseOrderRequestItems)
        {
            for (int i = 0; i < itemImage.Count; i++)
            {
                var files = itemImage[i];
                Guid folderName = Guid.NewGuid();
                string itemRootPath = Server.MapPath($"~/Areas/PurchaseOrderManager/Data/PurchaseOrderRequestItemImages/{folderName}");

                if (files.Count() > 0)
                {
                    // Create Item Image
                    PurchaseOrderRequestImage image = new PurchaseOrderRequestImage()
                    {
                        Id = folderName,
                        IdRequestItem = purchaseOrderRequestItems[i].Id,
                        ImageName = purchaseOrderRequestItems[i].ProductName,
                        Directory = itemRootPath
                    };
                    db.PurchaseOrderRequestImages.Add(image);

                    // Save Image
                    if (!Directory.Exists(itemRootPath)) Directory.CreateDirectory(itemRootPath);
                    foreach (var file in files)
                    {
                        if (file != null && file.ContentLength > 0)
                        {
                            string fileName = Path.GetFileName(file.FileName);
                            string savePath = Path.Combine(itemRootPath, fileName);
                            file.SaveAs(savePath);
                        }
                    }
                }
            }
        }
        private void SaveFiles(PurchaseOrderEntities db, List<HttpPostedFileBase> files, Guid IdRequest, string fileType)
        {
            if (files != null)
            {
                Guid files_Id = Guid.NewGuid();
                string filesRootPath = Server.MapPath($"~/Areas/PurchaseOrderManager/Data/PurchaseOrderRequestFiles/{fileType}_Files/{files_Id}");
                if (!Directory.Exists(filesRootPath)) Directory.CreateDirectory(filesRootPath);

                PurchaseOrderRequestFile pr = new PurchaseOrderRequestFile()
                {
                    Id = files_Id,
                    IdRequest = IdRequest,
                    Path = filesRootPath,
                    Type = fileType
                };
                db.PurchaseOrderRequestFiles.Add(pr);

                foreach (var file in files)
                {
                    if (file != null && file.ContentLength > 0)
                    {
                        string fileName = Path.GetFileName(file.FileName);
                        string savePath = Path.Combine(filesRootPath, fileName);
                        file.SaveAs(savePath);
                    }
                }
            }
        }
        private string ConvertObjToJson(object obj)
        {
            return JsonConvert.SerializeObject(obj, Formatting.Indented);
        }
    }
}