using System;
using System.Collections.Generic;
using System.Data.Entity.Migrations;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using ToolingRoomManagement.Areas.NVIDIA.Entities;

namespace ToolingRoomManagement.Areas.NVIDIA.Controllers
{
    public class InfoController : Controller
    {
        // GET: NVIDIA/Info
        private ToolingRoomEntities db = new ToolingRoomEntities();

        // Product
        public ActionResult Product()
        {
            return View();
        }
        public JsonResult GetProducts()
        {
            try
            {
                List<Entities.Product> products = db.Products.ToList();
                foreach(var  product in products)
                {
                    product.DeviceCount = db.Devices.Where(d => d.IdProduct == product.Id).Count();
                }

                return Json(new { status = true, products }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }
        public JsonResult GetProduct(int Id)
        {
            try
            {
                if (db.Products.Any(p => p.Id == Id))
                {
                    Entities.Product product = db.Products.FirstOrDefault(p => p.Id == Id);
                    List<Entities.Device> devices = db.Devices.Where(d => d.IdProduct == product.Id).ToList();

                    return Json(new { status = true , product, devices }, JsonRequestBehavior.AllowGet);
                }
                else
                {
                    return Json(new { status = false, message = "Product not found." }, JsonRequestBehavior.AllowGet);
                }
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message });
            }
        }
        public JsonResult CreateProduct(Entities.Product product)
        {
            try
            {
                if(!db.Products.Any(p => p.MTS == product.MTS || p.ProductName == product.ProductName))
                {
                    db.Products.Add(product);
                    db.SaveChanges();

                    return Json(new { status = true, product });
                }
                else
                {
                    return Json(new { status = false, message = "Product allready exists." });
                }  
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message });
            }
        }
        public JsonResult EditProduct(Entities.Product product)
        {
            try
            {
                if (db.Products.Any(p => p.Id == product.Id))
                {
                    db.Products.AddOrUpdate(product);
                    db.SaveChanges();

                    return Json(new { status = true, product });
                }
                else
                {
                    return Json(new { status = false, message = "Product not found." });
                }
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message });
            }
            
        }
        public JsonResult DeleteProduct(int Id)
        {
            try
            {
                if (db.Products.Any(p => p.Id == Id))
                {
                    Entities.Product product = db.Products.FirstOrDefault(p => p.Id == Id);
                    db.Products.Remove(product);
                    db.SaveChanges();

                    return Json(new { status = true });
                }
                else
                {
                    return Json(new { status = false, message = "Product not found." });
                }
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message });
            }
            
        }
    }
}