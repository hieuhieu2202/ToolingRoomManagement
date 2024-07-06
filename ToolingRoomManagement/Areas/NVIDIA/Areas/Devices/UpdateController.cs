using OfficeOpenXml;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Data.Entity.Migrations;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using ToolingRoomManagement.Areas.NVIDIA.Entities;
using ToolingRoomManagement.Areas.NVIDIA.Repositories;
using ToolingRoomManagement.Attributes;

namespace ToolingRoomManagement.Areas.NVIDIA.Areas.Devices
{
    [Authentication(Roles = new[] { "CRUD" })]
    public class UpdateController : Controller
    {
        private readonly ToolingRoomEntities db = new ToolingRoomEntities();

        // GET: NVIDIA/Update
        
        public ActionResult UpdateBuffer(HttpPostedFileBase file)
        {
            try
            {
                ExcelPackage.LicenseContext = OfficeOpenXml.LicenseContext.NonCommercial;

                if (file != null && file.ContentLength > 0)
                {
                    string fileName = $"UpdateBuffer - {DateTime.Now.ToString("yyyy.MM.dd HH.mm.ss.ff")}.xlsx";
                    string folderPath = Server.MapPath("/Data/NewToolingroom");
                    string filePath = Path.Combine(folderPath, fileName);

                    #region Check Folder
                    if (!Directory.Exists(folderPath))
                    {
                        Directory.CreateDirectory(folderPath);
                    }
                    else
                    {
                        foreach (string fileii in Directory.GetFiles(folderPath))
                        {
                            System.IO.File.Delete(fileii);
                        }
                    }
                    #endregion
                    using (var package = new ExcelPackage(file.InputStream))
                    {
                        var worksheet = package.Workbook.Worksheets[0];
                        foreach (int row in Enumerable.Range(2, worksheet.Dimension.End.Row - 1))
                        {
                            var _PN = worksheet.Cells[row, 1].Value?.ToString();
                            double _Buffer = (double)Math.Round(double.Parse(worksheet.Cells[row, 2].Value?.ToString()), 2);

                            var devices = db.Devices.Where(d => d.DeviceCode.ToUpper().Trim() == _PN.ToUpper().Trim()).ToList();
                            foreach (var device in devices)
                            {
                                device.Buffer = _Buffer;
                                db.Devices.AddOrUpdate(device);
                            }
                        }
                        db.SaveChanges();

                        return Json(new { status = true });
                    }
                }
                else
                {
                    return Json(new { status = false, message = "File is empty" });
                }
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message });
            }
        }
        public ActionResult UpdateLimit(HttpPostedFileBase file)
        {
            try
            {
                ExcelPackage.LicenseContext = OfficeOpenXml.LicenseContext.NonCommercial;

                if (file != null && file.ContentLength > 0)
                {
                    string fileName = $"UpdateLimit - {DateTime.Now.ToString("yyyy.MM.dd HH.mm.ss.ff")}.xlsx";
                    string folderPath = Server.MapPath("/Data/NewToolingroom");
                    string filePath = Path.Combine(folderPath, fileName);

                    #region Check Folder
                    if (!Directory.Exists(folderPath))
                    {
                        Directory.CreateDirectory(folderPath);
                    }
                    else
                    {
                        foreach (string fileii in Directory.GetFiles(folderPath))
                        {
                            System.IO.File.Delete(fileii);
                        }
                    }
                    #endregion
                    using (var package = new ExcelPackage(file.InputStream))
                    {
                        var worksheet = package.Workbook.Worksheets[0];
                        foreach (int row in Enumerable.Range(2, worksheet.Dimension.End.Row - 1))
                        {
                            var _PN = worksheet.Cells[row, 1].Value?.ToString();
                            var _LifeCycle = int.Parse(worksheet.Cells[row, 2].Value?.ToString());

                            var devices = db.Devices.Where(d => d.DeviceCode.ToUpper().Trim() == _PN.ToUpper().Trim()).ToList();
                            foreach (var device in devices)
                            {
                                device.LifeCycle = _LifeCycle;
                                db.Devices.AddOrUpdate(device);
                            }
                        }
                        db.SaveChanges();

                        return Json(new { status = true });
                    }
                }
                else
                {
                    return Json(new { status = false, message = "File is empty" });
                }
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message });
            }
        }
        public ActionResult UpdateComingDevices(HttpPostedFileBase file)
        {
            try
            {
                ExcelPackage.LicenseContext = OfficeOpenXml.LicenseContext.NonCommercial;

                if (file != null && file.ContentLength > 0)
                {
                    string fileName = $"UpdateComingDevice - {DateTime.Now.ToString("yyyy.MM.dd HH.mm.ss.ff")}.xlsx";
                    string folderPath = Server.MapPath("/Data/NewToolingroom");
                    string filePath = Path.Combine(folderPath, fileName);

                    #region Check Folder
                    if (!Directory.Exists(folderPath))
                    {
                        Directory.CreateDirectory(folderPath);
                    }
                    else
                    {
                        foreach (string fileii in Directory.GetFiles(folderPath))
                        {
                            System.IO.File.Delete(fileii);
                        }
                    }
                    #endregion
                    using (var package = new ExcelPackage(file.InputStream))
                    {
                        var worksheet = package.Workbook.Worksheets[0];
                        foreach (int row in Enumerable.Range(2, worksheet.Dimension.End.Row - 1))
                        {
                            var _PN = worksheet.Cells[row, 1].Value?.ToString();
                            var __ComingQty = worksheet.Cells[row, 2].Value?.ToString();

                            int _ComingQty = 0;
                            if (__ComingQty != null)
                            {
                                _ComingQty = int.Parse(__ComingQty);
                            }
                            else
                            {
                                Debug.WriteLine($"PN: {_PN}, ComingQty = 0");
                                continue;
                            }

                            ComingDevice comingdevice = new ComingDevice();
                            comingdevice.Device = db.Devices.FirstOrDefault(d => d.DeviceCode.ToUpper().Trim() == _PN.ToUpper().Trim());

                            if (comingdevice.Device == null)
                            {
                                comingdevice.DeviceUnconfirm = db.DeviceUnconfirms.FirstOrDefault(d => d.DeviceCode.ToUpper().Trim() == _PN.ToUpper().Trim());
                                if (comingdevice.Device == null && comingdevice.DeviceUnconfirm == null)
                                {
                                    var __Des = worksheet.Cells[row, 3].Value?.ToString();
                                    if (!string.IsNullOrEmpty(__Des))
                                    {
                                        Device device = new Device
                                        {
                                            DeviceCode = _PN,
                                            DeviceName = __Des,
                                            DeviceDate = DateTime.Now,
                                            Buffer = 0,
                                            Quantity = 0,
                                            Type = "NA",
                                            Status = "Out Range",
                                            IdWareHouse = 1,
                                            IdGroup = 341,
                                            IdVendor = 350,
                                            CreatedDate = DateTime.Now,
                                            IdProduct = 368,
                                            IdModel = 339,
                                            IdStation = 323,
                                            Relation = "",
                                            LifeCycle = 0,
                                            Forcast = 0,
                                            QtyConfirm = 0,
                                            ACC_KIT = null,
                                            RealQty = 0,
                                            ImagePath = null,
                                            Specification = "",
                                            Unit = "",
                                            DeliveryTime = " Week",
                                            SysQuantity = 0,
                                            MinQty = 0,
                                            POQty = 0,
                                            Type_BOM = null,
                                            MOQ = 0,
                                            isConsign = false,
                                            NG_Qty = 0,
                                        };

                                        db.Devices.Add(device);
                                        comingdevice.Device = device;
                                    }
                                    else
                                    {
                                        Debug.WriteLine($"PN: {_PN}, Row: {row}");
                                        continue;
                                    }

                                }
                            }


                            if (comingdevice.Device != null)
                            {
                                comingdevice.IdDevice = comingdevice.Device.Id;
                            }
                            else if (comingdevice.DeviceUnconfirm != null)
                            {
                                comingdevice.IdDeviceUnconfirm = comingdevice.DeviceUnconfirm.Id;
                            }

                            comingdevice.ComingQty = _ComingQty;
                            comingdevice.DateCreated = comingdevice.ExpectedDate = DateTime.Now;
                            comingdevice.Type = comingdevice.Device != null ? comingdevice.Device.Type : comingdevice.DeviceUnconfirm.Type;
                            comingdevice.IsConsign = comingdevice.Device != null ? comingdevice.Device.isConsign : comingdevice.DeviceUnconfirm.isConsign;

                            db.ComingDevices.Add(comingdevice);
                        }
                        db.SaveChanges();

                        return Json(new { status = true });
                    }
                }
                else
                {
                    return Json(new { status = false, message = "File is empty" });
                }
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message });
            }
        }
        public ActionResult UpdateType(HttpPostedFileBase file)
        {
            try
            {
                ExcelPackage.LicenseContext = OfficeOpenXml.LicenseContext.NonCommercial;

                if (file != null && file.ContentLength > 0)
                {
                    string fileName = $"UpdateType - {DateTime.Now.ToString("yyyy.MM.dd HH.mm.ss.ff")}.xlsx";
                    string folderPath = Server.MapPath("/Data/NewToolingroom");
                    string filePath = Path.Combine(folderPath, fileName);

                    #region Check Folder
                    if (!Directory.Exists(folderPath))
                    {
                        Directory.CreateDirectory(folderPath);
                    }
                    else
                    {
                        foreach (string fileii in Directory.GetFiles(folderPath))
                        {
                            System.IO.File.Delete(fileii);
                        }
                    }
                    #endregion
                    using (var package = new ExcelPackage(file.InputStream))
                    {
                        var worksheet = package.Workbook.Worksheets[0];
                        foreach (int row in Enumerable.Range(2, worksheet.Dimension.End.Row - 1))
                        {
                            var _PN = worksheet.Cells[row, 1].Value?.ToString();
                            var _Type = worksheet.Cells[row, 2].Value?.ToString();

                            var devices = db.Devices.Where(d => d.DeviceCode.ToUpper().Trim() == _PN.ToUpper().Trim()).ToList();
                            foreach (var device in devices)
                            {
                                device.Type_BOM = _Type;
                                db.Devices.AddOrUpdate(device);
                            }
                        }
                        db.SaveChanges();

                        return Json(new { status = true });
                    }
                }
                else
                {
                    return Json(new { status = false, message = "File is empty" });
                }
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message });
            }
        }
        public ActionResult UpdateRelation(HttpPostedFileBase file)
        {
            try
            {
                ExcelPackage.LicenseContext = OfficeOpenXml.LicenseContext.NonCommercial;

                if (file != null && file.ContentLength > 0)
                {
                    string fileName = $"UpdateRelation - {DateTime.Now.ToString("yyyy.MM.dd HH.mm.ss.ff")}.xlsx";
                    string folderPath = Server.MapPath("/Data/NewToolingroom");
                    string filePath = Path.Combine(folderPath, fileName);

                    #region Check Folder
                    if (!Directory.Exists(folderPath))
                    {
                        Directory.CreateDirectory(folderPath);
                    }
                    else
                    {
                        foreach (string fileii in Directory.GetFiles(folderPath))
                        {
                            System.IO.File.Delete(fileii);
                        }
                    }
                    #endregion
                    using (var package = new ExcelPackage(file.InputStream))
                    {
                        var worksheet = package.Workbook.Worksheets[0];
                        foreach (int row in Enumerable.Range(2, worksheet.Dimension.End.Row - 1))
                        {
                            var _PN = worksheet.Cells[row, 1].Value?.ToString();
                            var _Relation = worksheet.Cells[row, 2].Value?.ToString();

                            var devices = db.Devices.Where(d => d.DeviceCode.ToUpper().Trim() == _PN.ToUpper().Trim()).ToList();
                            foreach (var device in devices)
                            {
                                device.Relation = _Relation;
                                db.Devices.AddOrUpdate(device);
                            }
                        }
                        db.SaveChanges();

                        return Json(new { status = true });
                    }
                }
                else
                {
                    return Json(new { status = false, message = "File is empty" });
                }
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message });
            }
        }
        public ActionResult UpdateOwner(HttpPostedFileBase file)
        {
            try
            {
                ExcelPackage.LicenseContext = OfficeOpenXml.LicenseContext.NonCommercial;

                if (file != null && file.ContentLength > 0)
                {
                    string fileName = $"UpdateOwner - {DateTime.Now.ToString("yyyy.MM.dd HH.mm.ss.ff")}.xlsx";
                    string folderPath = Server.MapPath("/Data/NewToolingroom");
                    string filePath = Path.Combine(folderPath, fileName);

                    #region Check Folder
                    if (!Directory.Exists(folderPath))
                    {
                        Directory.CreateDirectory(folderPath);
                    }
                    else
                    {
                        foreach (string fileii in Directory.GetFiles(folderPath))
                        {
                            System.IO.File.Delete(fileii);
                        }
                    }
                    #endregion
                    using (var package = new ExcelPackage(file.InputStream))
                    {
                        var worksheet = package.Workbook.Worksheets[0];
                        foreach (int row in Enumerable.Range(2, worksheet.Dimension.End.Row - 1))
                        {
                            var _PN = worksheet.Cells[row, 1].Value?.ToString();
                            var _Owner = worksheet.Cells[row, 2].Value?.ToString();

                            var devices = db.Devices.Where(d => d.DeviceCode.ToUpper().Trim() == _PN.ToUpper().Trim()).ToList();
                            foreach (var device in devices)
                            {
                                device.DeviceOwner = _Owner;
                                db.Devices.AddOrUpdate(device);
                            }
                        }
                        db.SaveChanges();

                        return Json(new { status = true });
                    }
                }
                else
                {
                    return Json(new { status = false, message = "File is empty" });
                }
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message });
            }
        }
        public ActionResult UpdateProduct(HttpPostedFileBase file)
        {
            try
            {
                ExcelPackage.LicenseContext = OfficeOpenXml.LicenseContext.NonCommercial;

                if (file != null && file.ContentLength > 0)
                {
                    string fileName = $"UpdateMTS - {DateTime.Now.ToString("yyyy.MM.dd HH.mm.ss.ff")}.xlsx";
                    string folderPath = Server.MapPath("/Data/NewToolingroom");
                    string filePath = Path.Combine(folderPath, fileName);

                    #region Check Folder
                    if (!Directory.Exists(folderPath))
                    {
                        Directory.CreateDirectory(folderPath);
                    }
                    else
                    {
                        foreach (string fileii in Directory.GetFiles(folderPath))
                        {
                            System.IO.File.Delete(fileii);
                        }
                    }
                    #endregion

                    using (var package = new ExcelPackage(file.InputStream))
                    {
                        var worksheet = package.Workbook.Worksheets[0];
                        foreach (int row in Enumerable.Range(2, worksheet.Dimension.End.Row - 1))
                        {
                            var _MTS = worksheet.Cells[row, 1].Value?.ToString();
                            var _Product = worksheet.Cells[row, 2].Value?.ToString();

                            var products = db.Products.Where(p => p.MTS.ToUpper().Trim() == _MTS.ToUpper().Trim()).ToList();

                            if (_MTS != null && products.Count > 0)
                            {
                                products.First().ProductName = _Product;
                                db.Products.AddOrUpdate(products.First());

                                for (int i = 1; i < products.Count; i++)
                                {
                                    var IdProduct = products[i].Id;
                                    var devices = db.Devices.Where(d => d.IdProduct == IdProduct).ToList();
                                    foreach (var device in devices)
                                    {
                                        device.IdProduct = products.First().Id;
                                        db.Devices.AddOrUpdate(device);
                                    }

                                    db.Products.Remove(products[i]);
                                    db.SaveChanges();
                                }
                            }
                            else
                            {
                                var product = new Product
                                {
                                    MTS = _MTS,
                                    ProductName = _Product,
                                };
                                db.Products.Add(product);
                                db.SaveChanges();
                            }
                        }


                        return Json(new { status = true });
                    }
                }
                else
                {
                    return Json(new { status = false, message = "File is empty" });
                }
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message });
            }
        }
        public ActionResult UpdateDescription(HttpPostedFileBase file)
        {
            try
            {
                ExcelPackage.LicenseContext = OfficeOpenXml.LicenseContext.NonCommercial;

                if (file != null && file.ContentLength > 0)
                {
                    string fileName = $"UpdateDescription - {DateTime.Now.ToString("yyyy.MM.dd HH.mm.ss.ff")}.xlsx";
                    string folderPath = Server.MapPath("/Data/NewToolingroom");
                    string filePath = Path.Combine(folderPath, fileName);

                    #region Check Folder
                    if (!Directory.Exists(folderPath))
                    {
                        Directory.CreateDirectory(folderPath);
                    }
                    else
                    {
                        foreach (string fileii in Directory.GetFiles(folderPath))
                        {
                            System.IO.File.Delete(fileii);
                        }
                    }
                    #endregion

                    using (var package = new ExcelPackage(file.InputStream))
                    {
                        var worksheet = package.Workbook.Worksheets[0];
                        foreach (int row in Enumerable.Range(2, worksheet.Dimension.End.Row - 1))
                        {
                            var _PN = worksheet.Cells[row, 1].Value?.ToString();
                            var _Desc = worksheet.Cells[row, 2].Value?.ToString();

                            var devices = db.Devices.Where(d => d.DeviceCode.ToUpper().Trim() == _PN.ToUpper().Trim()).ToList();

                            if (_PN != null && devices.Count > 0)
                            {
                                foreach (var device in devices)
                                {
                                    device.DeviceName = _Desc.Trim();
                                    db.Devices.AddOrUpdate(device);
                                }
                            }
                        }
                        db.SaveChanges();

                        return Json(new { status = true });
                    }
                }
                else
                {
                    return Json(new { status = false, message = "File is empty" });
                }
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message });
            }
        }
        public ActionResult UpdateGroupAndVendor(HttpPostedFileBase file)
        {
            try
            {
                ExcelPackage.LicenseContext = OfficeOpenXml.LicenseContext.NonCommercial;

                if (file != null && file.ContentLength > 0)
                {
                    string fileName = $"UpdateGroupVendor - {DateTime.Now.ToString("yyyy.MM.dd HH.mm.ss.ff")}.xlsx";
                    string folderPath = Server.MapPath("/Data/NewToolingroom");
                    string filePath = Path.Combine(folderPath, fileName);

                    #region Check Folder
                    if (!Directory.Exists(folderPath))
                    {
                        Directory.CreateDirectory(folderPath);
                    }
                    else
                    {
                        foreach (string fileii in Directory.GetFiles(folderPath))
                        {
                            System.IO.File.Delete(fileii);
                        }
                    }
                    #endregion

                    using (var package = new ExcelPackage(file.InputStream))
                    {
                        var worksheet = package.Workbook.Worksheets[0];
                        foreach (int row in Enumerable.Range(2, worksheet.Dimension.End.Row - 1))
                        {
                            var _PN = worksheet.Cells[row, 1].Value?.ToString();
                            var _Group = worksheet.Cells[row, 2].Value?.ToString();
                            var _Vendor = worksheet.Cells[row, 3].Value?.ToString();

                            var devices = db.Devices.Where(d => d.DeviceCode.ToUpper().Trim() == _PN.ToUpper().Trim()).ToList();

                            if (_PN != null && devices.Count > 0)
                            {
                                foreach (var device in devices)
                                {
                                    var group = db.Groups.FirstOrDefault(g => g.GroupName.ToUpper().Trim() == _Group.ToUpper().Trim());
                                    var vendor = db.Vendors.FirstOrDefault(g => g.VendorName.ToUpper().Trim() == _Vendor.ToUpper().Trim());

                                    if (group == null)
                                    {
                                        group = new Entities.Group
                                        {
                                            GroupName = _Group
                                        };
                                        db.Groups.Add(group);
                                    }
                                    else
                                    {
                                        group.GroupName = _Group.Trim();
                                        db.Groups.AddOrUpdate(group);
                                    }
                                    if (vendor == null)
                                    {
                                        vendor = new Vendor
                                        {
                                            VendorName = _Vendor
                                        };
                                        db.Vendors.Add(vendor);
                                    }
                                    else
                                    {
                                        vendor.VendorName = _Vendor.Trim();
                                        db.Vendors.AddOrUpdate(vendor);
                                    }

                                    device.IdGroup = group.Id;
                                    device.IdVendor = vendor.Id;
                                    db.Devices.AddOrUpdate(device);
                                }
                            }
                        }
                        db.SaveChanges();

                        return Json(new { status = true });
                    }
                }
                else
                {
                    return Json(new { status = false, message = "File is empty" });
                }
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message });
            }
        }
        public ActionResult UpdateMinQty(HttpPostedFileBase file)
        {
            try
            {
                ExcelPackage.LicenseContext = OfficeOpenXml.LicenseContext.NonCommercial;

                if (file != null && file.ContentLength > 0)
                {
                    string fileName = $"UpdateMinQty - {DateTime.Now.ToString("yyyy.MM.dd HH.mm.ss.ff")}.xlsx";
                    string folderPath = Server.MapPath("/Data/NewToolingroom");
                    string filePath = Path.Combine(folderPath, fileName);

                    #region Check Folder
                    if (!Directory.Exists(folderPath))
                    {
                        Directory.CreateDirectory(folderPath);
                    }
                    else
                    {
                        foreach (string fileii in Directory.GetFiles(folderPath))
                        {
                            System.IO.File.Delete(fileii);
                        }
                    }
                    #endregion

                    using (var package = new ExcelPackage(file.InputStream))
                    {
                        var worksheet = package.Workbook.Worksheets[0];
                        foreach (int row in Enumerable.Range(2, worksheet.Dimension.End.Row - 1))
                        {
                            var _PN = worksheet.Cells[row, 1].Value?.ToString();
                            var _MinQty = worksheet.Cells[row, 2].Value?.ToString();

                            var devices = db.Devices.Where(d => d.DeviceCode.ToUpper().Trim() == _PN.ToUpper().Trim()).ToList();

                            if (_PN != null && devices.Count > 0)
                            {
                                foreach (var device in devices)
                                {
                                    device.MinQty = int.Parse(_MinQty);
                                    db.Devices.AddOrUpdate(device);
                                }
                            }
                        }
                        db.SaveChanges();

                        return Json(new { status = true });
                    }
                }
                else
                {
                    return Json(new { status = false, message = "File is empty" });
                }
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message });
            }
        }
        public ActionResult UpdateDeviceProduct(HttpPostedFileBase file)
        {
            try
            {
                ExcelPackage.LicenseContext = OfficeOpenXml.LicenseContext.NonCommercial;

                if (file != null && file.ContentLength > 0)
                {
                    string fileName = $"UpdateDeviceProduct - {DateTime.Now.ToString("yyyy.MM.dd HH.mm.ss.ff")}.xlsx";
                    string folderPath = Server.MapPath("/Data/NewToolingroom");
                    string filePath = Path.Combine(folderPath, fileName);

                    #region Check Folder
                    if (!Directory.Exists(folderPath))
                    {
                        Directory.CreateDirectory(folderPath);
                    }
                    else
                    {
                        foreach (string fileii in Directory.GetFiles(folderPath))
                        {
                            System.IO.File.Delete(fileii);
                        }
                    }
                    #endregion

                    using (var package = new ExcelPackage(file.InputStream))
                    {
                        var worksheet = package.Workbook.Worksheets[0];
                        foreach (int row in Enumerable.Range(2, worksheet.Dimension.End.Row - 1))
                        {
                            var _PN = worksheet.Cells[row, 1].Value?.ToString();
                            var _MTS = worksheet.Cells[row, 2].Value?.ToString();
                            var _PRODUCT = worksheet.Cells[row, 3].Value?.ToString();

                            Debug.WriteLine(_MTS);

                            var devices = db.Devices.Where(d => d.DeviceCode.ToUpper().Trim() == _PN.ToUpper().Trim()).ToList();

                            var product = new Product();
                            if (_MTS != null)
                            {
                                product = db.Products.FirstOrDefault(p => p.MTS.ToUpper().Trim() == _MTS.ToUpper().Trim());
                            }

                            if (product == null && _PRODUCT != null)
                            {
                                product = db.Products.FirstOrDefault(p => p.ProductName.ToUpper().Trim() == _PRODUCT.ToUpper().Trim());
                            }

                            if (product.MTS == null && product.ProductName == null)
                            {
                                product = new Product
                                {
                                    ProductName = _PRODUCT,
                                    MTS = _MTS,
                                };
                                db.Products.Add(product);
                                db.SaveChanges();
                            }

                            if (_PN != null && devices.Count > 0)
                            {
                                foreach (var device in devices)
                                {
                                    device.IdProduct = product.Id;
                                    db.Devices.AddOrUpdate(device);
                                }
                            }
                        }
                        db.SaveChanges();

                        return Json(new { status = true });
                    }
                }
                else
                {
                    return Json(new { status = false, message = "File is empty" });
                }
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message });
            }
        }
        public ActionResult UpdateDeviceFile(HttpPostedFileBase file)
        {
            try
            {
                ExcelPackage.LicenseContext = OfficeOpenXml.LicenseContext.NonCommercial;

                if (file != null && file.ContentLength > 0)
                {
                    string fileName = $"UpdateDevice - {DateTime.Now.ToString("yyyy.MM.dd HH.mm.ss.ff")}.xlsx";
                    string folderPath = Server.MapPath("/Data/NewToolingroom");
                    string filePath = Path.Combine(folderPath, fileName);

                    #region Check Folder
                    if (!Directory.Exists(folderPath))
                    {
                        Directory.CreateDirectory(folderPath);
                    }
                    else
                    {
                        foreach (string fileii in Directory.GetFiles(folderPath))
                        {
                            System.IO.File.Delete(fileii);
                        }
                    }
                    #endregion

                    using (var package = new ExcelPackage(file.InputStream))
                    {
                        var worksheet = package.Workbook.Worksheets[0];
                        foreach (int row in Enumerable.Range(2, worksheet.Dimension.End.Row - 1))
                        {
                            var _MTS = worksheet.Cells[row, 1].Value?.ToString();
                            var _PRODUCT = worksheet.Cells[row, 2].Value?.ToString();
                            var _PN = worksheet.Cells[row, 3].Value?.ToString();
                            var _DESC = worksheet.Cells[row, 5].Value?.ToString();
                            var _GROUP = worksheet.Cells[row, 6].Value?.ToString();
                            var _VENDOR = worksheet.Cells[row, 7].Value?.ToString();
                            var _MINQTY = int.Parse(worksheet.Cells[row, 10].Value?.ToString());
                            var _RELATION = worksheet.Cells[row, 11].Value?.ToString();
                            var _LIMIT = int.Parse(worksheet.Cells[row, 12].Value?.ToString());
                            var _TYPE = worksheet.Cells[row, 13].Value?.ToString();
                            var _BUFFER = (double)Math.Round(double.Parse(worksheet.Cells[row, 14].Value?.ToString()), 2);

                            var product = new Product();
                            if (_MTS != null)
                            {
                                product = db.Products.FirstOrDefault(p => p.MTS == _MTS);
                            }
                            else if (_PRODUCT != null)
                            {
                                product = db.Products.FirstOrDefault(p => p.ProductName == _PRODUCT);
                            }
                            else
                            {
                                product = db.Products.FirstOrDefault(p => p.MTS == null);
                            }

                            var group = db.Groups.FirstOrDefault(g => g.GroupName == _GROUP);
                            var vendor = db.Vendors.FirstOrDefault(v => v.VendorName.ToUpper().Trim() == _VENDOR.ToUpper().Trim());

                            Debug.WriteLine(_PN);

                            var device = new Device
                            {
                                IdProduct = product.Id,
                                DeviceCode = _PN,
                                DeviceName = _DESC,
                                IdGroup = group.Id,
                                IdVendor = vendor.Id,
                                MinQty = _MINQTY,
                                Relation = _RELATION,
                                LifeCycle = _LIMIT,
                                Type_BOM = _TYPE,
                                Buffer = _BUFFER,

                                CreatedDate = DateTime.Now,
                                IdWareHouse = 1,
                                DeliveryTime = " Weel",

                                Quantity = 0,
                                QtyConfirm = 0,
                                RealQty = 0,
                                SysQuantity = 0
                            };

                            db.Devices.Add(device);
                        }
                        db.SaveChanges();

                        return Json(new { status = true });
                    }
                }
                else
                {
                    return Json(new { status = false, message = "File is empty" });
                }
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message });
            }
        }
        public ActionResult UpdatePurchaseRequest(HttpPostedFileBase file)
        {
            try
            {
                ExcelPackage.LicenseContext = OfficeOpenXml.LicenseContext.NonCommercial;

                if (file != null && file.ContentLength > 0)
                {
                    string fileName = $"UpdatePurchaseRequest - {DateTime.Now.ToString("yyyy.MM.dd HH.mm.ss.ff")}.xlsx";
                    string folderPath = Server.MapPath("/Data/NewToolingroom");
                    string filePath = Path.Combine(folderPath, fileName);

                    #region Check Folder
                    if (!Directory.Exists(folderPath))
                    {
                        Directory.CreateDirectory(folderPath);
                    }
                    else
                    {
                        foreach (string fileii in Directory.GetFiles(folderPath))
                        {
                            System.IO.File.Delete(fileii);
                        }
                    }
                    #endregion
                    using (var context = new ToolingRoomEntities())
                    using (var package = new ExcelPackage(file.InputStream))
                    {
                        var worksheet = package.Workbook.Worksheets[0];

                        var devices = context.DevicePRs.Include(dpr => dpr.Device).ToList();
                        foreach (var device in devices)
                        {
                            var d_pn = device.Device.DeviceCode.Trim().ToUpper();
                            var d_qty = device.Quantity;

                            for (int row = 2; row <= worksheet.Dimension.End.Row; row++)
                            {
                                var pr_pn = worksheet.Cells[row, 2].Text.Trim().ToUpper();
                                int.TryParse(worksheet.Cells[row, 3].Text, out int pr_qty);

                                if (d_pn == pr_pn && d_qty == pr_qty)
                                {
                                    device.PR_No = worksheet.Cells[row, 4].Text.Trim().ToUpper();
                                    device.PR_Quantity = d_qty;
                                    if (DateTime.TryParse(worksheet.Cells[row, 6].Text, out DateTime pr_date)) device.PR_CreatedDate = pr_date;

                                    device.PO_No = worksheet.Cells[row, 7].Text.Trim().ToUpper();
                                    if (DateTime.TryParse(worksheet.Cells[row, 8].Text, out DateTime po_date)) device.PO_CreatedDate = po_date;

                                    if (DateTime.TryParse(worksheet.Cells[row, 9].Text, out DateTime eta)) device.ETA_Date = eta;
                                    if (DateTime.TryParse(worksheet.Cells[row, 10].Text, out DateTime etd)) device.ETD_Date = etd;

                                    device.IdUserCreated = 17;

                                    context.DevicePRs.AddOrUpdate(device);

                                    break;
                                }
                            }
                        }

                        context.SaveChanges();

                        foreach (var purchaseRequest in context.PurchaseRequests)
                        {
                            RPurchases.CheckPurchaseRequestStatus(context, purchaseRequest);
                        }

                        context.SaveChanges();

                        return Json(new { status = true });
                    }
                }
                else
                {
                    return Json(new { status = false, message = "File is empty" });
                }
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message });
            }
        }

        private int CountComingDevice(string PN)
        {
            var comingDevices = db.ComingDevices.Where(d => d.Device.DeviceCode.ToUpper().Trim() == PN.ToUpper().Trim()).ToList();


            int count = 0;

            foreach (var comingDevice in comingDevices)
            {
                count += comingDevice.ComingQty ?? 0;
            }

            return count;
        }
        private int CountPRDevice(string PN)
        {
            var devices = db.DevicePRs
                .Where(d => d.Device.DeviceCode.ToUpper().Trim() == PN.ToUpper().Trim() && d.ETA_Date == null)
                .ToList();


            int count = 0;

            foreach (var device in devices)
            {
                count += device.PR_Quantity ?? 0;
            }

            return count;
        }
        private int CountAltPNQuantity(string sPN)
        {
            if (!string.IsNullOrEmpty(sPN.Trim()))
            {
                int Qty = 0;
                string[] PNs = sPN.Split(',');
                foreach (string PN in PNs)
                {
                    var devices = db.Devices.Where(d => d.DeviceCode == PN);
                    foreach (var device in devices)
                    {
                        Qty += device.QtyConfirm ?? 0;
                    }
                }
                return Qty;
            }
            else
            {
                return 0;
            }
        }
    }
}