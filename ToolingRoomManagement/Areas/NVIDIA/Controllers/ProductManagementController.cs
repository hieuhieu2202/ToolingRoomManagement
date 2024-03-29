using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using ToolingRoomManagement.Areas.NVIDIA.Entities;
using ToolingRoomManagement.Areas.NVIDIA.Reseptory;

namespace ToolingRoomManagement.Areas.NVIDIA.Controllers
{
    public class ProductManagementController : Controller
    {
        /* GET */
        public JsonResult GetProducts()
        {
            try
            {
                var result = RProduct.GetProducts();

                return Json(new { status = true, data = result }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }
        public JsonResult GetProduct(int IdProduct)
        {
            try
            {
                var result = RProduct.GetProduct(IdProduct);
                return Json(new { status = true, data = result }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        public JsonResult GetDataAndProducts()
        {
            try
            {
                var result = RProduct.GetDataAndProducts();

                return Json(new { status = true, data = result }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }
        public JsonResult GetDataAndProduct(int IdProduct)
        {
            try
            {
                var result = RProduct.GetDataAndProduct(IdProduct);
                return Json(new { status = true, data = result }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        public JsonResult GetDevicesAndProducts()
        {
            try
            {
                var result = RProduct.GetDevicesAndProducts();

                return Json(new { status = true, data = result }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }
        public JsonResult GetDevicesAndProduct(int IdProduct)
        {
            try
            {
                var result = RProduct.GetDevicesAndProduct(IdProduct);
                return Json(new { status = true, data = result }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        /* POST */
        public JsonResult CreateProduct(Product product)
        {
            try
            {
                var result = RProduct.CreateProduct(product);

                return Json(new { status = true, data = result }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }
        public JsonResult UpdateProduct(Product product)
        {
            try
            {
                var result = RProduct.UpdateProduct(product);

                return Json(new { status = true, data = result }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }
        public JsonResult DeleteProduct(int IdProduct)
        {
            try
            {
                var result = RProduct.DeleteProduct(new Product { Id = IdProduct});

                return Json(new { status = true, data = result }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }
    }
}