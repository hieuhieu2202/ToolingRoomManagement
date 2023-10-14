﻿using System;
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

        /*** roduct ***/
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

        /*** Model + Station ***/
        public ActionResult ModelStation()
        {
            return View();
        }

        #region Model
        public JsonResult GetModels()
        {
            try
            {
                List<Entities.Model> models = db.Models.ToList();
                foreach (var model in models)
                {
                    model.DeviceCount = db.Devices.Where(d => d.IdModel == model.Id).Count();
                }

                return Json(new { status = true, models }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }
        public JsonResult GetModel(int Id)
        {
            try
            {
                if (db.Models.Any(p => p.Id == Id))
                {
                    Entities.Model model = db.Models.FirstOrDefault(p => p.Id == Id);
                    List<Entities.Device> devices = db.Devices.Where(d => d.IdModel == model.Id).ToList();

                    return Json(new { status = true, model, devices }, JsonRequestBehavior.AllowGet);
                }
                else
                {
                    return Json(new { status = false, message = "Model not found." }, JsonRequestBehavior.AllowGet);
                }
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message });
            }
        }
        public JsonResult CreateModel(Entities.Model model)
        {
            try
            {
                if (!db.Models.Any(p => p.ModelName == model.ModelName))
                {
                    db.Models.Add(model);
                    db.SaveChanges();

                    return Json(new { status = true, model });
                }
                else
                {
                    return Json(new { status = false, message = "Model allready exists." });
                }
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message });
            }
        }
        public JsonResult EditModel(Entities.Model model)
        {
            try
            {
                if (db.Models.Any(p => p.Id == model.Id))
                {
                    db.Models.AddOrUpdate(model);
                    db.SaveChanges();

                    return Json(new { status = true, model });
                }
                else
                {
                    return Json(new { status = false, message = "Model not found." });
                }
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message });
            }

        }
        public JsonResult DeleteModel(int Id)
        {
            try
            {
                if (db.Models.Any(p => p.Id == Id))
                {
                    Entities.Model model = db.Models.FirstOrDefault(p => p.Id == Id);
                    db.Models.Remove(model);
                    db.SaveChanges();

                    return Json(new { status = true });
                }
                else
                {
                    return Json(new { status = false, message = "Model not found." });
                }
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message });
            }

        }
        #endregion

        #region Station
        public JsonResult GetStations()
        {
            try
            {
                List<Entities.Station> stations = db.Stations.ToList();
                foreach (var station in stations)
                {
                    station.DeviceCount = db.Devices.Where(d => d.IdStation == station.Id).Count();
                }

                return Json(new { status = true, stations }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }
        public JsonResult GetStation(int Id)
        {
            try
            {
                if (db.Stations.Any(p => p.Id == Id))
                {
                    Entities.Station station = db.Stations.FirstOrDefault(p => p.Id == Id);
                    List<Entities.Device> devices = db.Devices.Where(d => d.IdStation == station.Id).ToList();

                    return Json(new { status = true, station, devices }, JsonRequestBehavior.AllowGet);
                }
                else
                {
                    return Json(new { status = false, message = "Station not found." }, JsonRequestBehavior.AllowGet);
                }
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message });
            }
        }
        public JsonResult CreateStation(Entities.Station station)
        {
            try
            {
                if (!db.Stations.Any(p => p.StationName == station.StationName))
                {
                    db.Stations.Add(station);
                    db.SaveChanges();

                    return Json(new { status = true, station });
                }
                else
                {
                    return Json(new { status = false, message = "Station allready exists." });
                }
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message });
            }
        }
        public JsonResult EditStation(Entities.Station station)
        {
            try
            {
                if (db.Stations.Any(p => p.Id == station.Id))
                {
                    db.Stations.AddOrUpdate(station);
                    db.SaveChanges();

                    return Json(new { status = true, station });
                }
                else
                {
                    return Json(new { status = false, message = "Station not found." });
                }
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message });
            }

        }
        public JsonResult DeleteStation(int Id)
        {
            try
            {
                if (db.Stations.Any(p => p.Id == Id))
                {
                    Entities.Station station = db.Stations.FirstOrDefault(p => p.Id == Id);
                    db.Stations.Remove(station);
                    db.SaveChanges();

                    return Json(new { status = true });
                }
                else
                {
                    return Json(new { status = false, message = "Station not found." });
                }
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message });
            }

        }
        #endregion

        /*** Group + Vendor ***/
        public ActionResult GroupVendor()
        {
            return View();
        }

        #region Group
        public JsonResult GetGroups()
        {
            try
            {
                List<Entities.Group> groups = db.Groups.ToList();
                foreach (var group in groups)
                {
                    group.DeviceCount = db.Devices.Where(d => d.IdGroup == group.Id).Count();
                }

                return Json(new { status = true, groups }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }
        public JsonResult GetGroup(int Id)
        {
            try
            {
                if (db.Groups.Any(p => p.Id == Id))
                {
                    Entities.Group group = db.Groups.FirstOrDefault(p => p.Id == Id);
                    List<Entities.Device> devices = db.Devices.Where(d => d.IdGroup == group.Id).ToList();

                    return Json(new { status = true, group, devices }, JsonRequestBehavior.AllowGet);
                }
                else
                {
                    return Json(new { status = false, message = "Group not found." }, JsonRequestBehavior.AllowGet);
                }
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message });
            }
        }
        public JsonResult CreateGroup(Entities.Group group)
        {
            try
            {
                if (!db.Groups.Any(p => p.GroupName == group.GroupName))
                {
                    db.Groups.Add(group);
                    db.SaveChanges();

                    return Json(new { status = true, group });
                }
                else
                {
                    return Json(new { status = false, message = "Group allready exists." });
                }
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message });
            }
        }
        public JsonResult EditGroup(Entities.Group group)
        {
            try
            {
                if (db.Groups.Any(p => p.Id == group.Id))
                {
                    db.Groups.AddOrUpdate(group);
                    db.SaveChanges();

                    return Json(new { status = true, group });
                }
                else
                {
                    return Json(new { status = false, message = "Group not found." });
                }
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message });
            }

        }
        public JsonResult DeleteGroup(int Id)
        {
            try
            {
                if (db.Groups.Any(p => p.Id == Id))
                {
                    Entities.Group group = db.Groups.FirstOrDefault(p => p.Id == Id);
                    db.Groups.Remove(group);
                    db.SaveChanges();

                    return Json(new { status = true });
                }
                else
                {
                    return Json(new { status = false, message = "Group not found." });
                }
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message });
            }

        }
        #endregion

        #region Vendor
        public JsonResult GetVendors()
        {
            try
            {
                List<Entities.Vendor> vendors = db.Vendors.ToList();
                foreach (var vendor in vendors)
                {
                    vendor.DeviceCount = db.Devices.Where(d => d.IdVendor == vendor.Id).Count();
                }

                return Json(new { status = true, vendors }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }
        public JsonResult GetVendor(int Id)
        {
            try
            {
                if (db.Vendors.Any(p => p.Id == Id))
                {
                    Entities.Vendor vendor = db.Vendors.FirstOrDefault(p => p.Id == Id);
                    List<Entities.Device> devices = db.Devices.Where(d => d.IdVendor == vendor.Id).ToList();

                    return Json(new { status = true, vendor, devices }, JsonRequestBehavior.AllowGet);
                }
                else
                {
                    return Json(new { status = false, message = "Vendor not found." }, JsonRequestBehavior.AllowGet);
                }
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message });
            }
        }
        public JsonResult CreateVendor(Entities.Vendor vendor)
        {
            try
            {
                if (!db.Vendors.Any(p => p.VendorName == vendor.VendorName))
                {
                    db.Vendors.Add(vendor);
                    db.SaveChanges();

                    return Json(new { status = true, vendor });
                }
                else
                {
                    return Json(new { status = false, message = "Vendor allready exists." });
                }
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message });
            }
        }
        public JsonResult EditVendor(Entities.Vendor vendor)
        {
            try
            {
                if (db.Vendors.Any(p => p.Id == vendor.Id))
                {
                    db.Vendors.AddOrUpdate(vendor);
                    db.SaveChanges();

                    return Json(new { status = true, vendor });
                }
                else
                {
                    return Json(new { status = false, message = "Vendor not found." });
                }
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message });
            }

        }
        public JsonResult DeleteVendor(int Id)
        {
            try
            {
                if (db.Vendors.Any(p => p.Id == Id))
                {
                    Entities.Vendor vendor = db.Vendors.FirstOrDefault(p => p.Id == Id);
                    db.Vendors.Remove(vendor);
                    db.SaveChanges();

                    return Json(new { status = true });
                }
                else
                {
                    return Json(new { status = false, message = "Vendor not found." });
                }
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message });
            }

        }
        #endregion
    }
}