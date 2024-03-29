using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Data.Entity.Migrations;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Configuration;
using ToolingRoomManagement.Areas.NVIDIA.Entities;
using ToolingRoomManagement.Areas.NVIDIA.Data;

namespace ToolingRoomManagement.Areas.NVIDIA.Reseptory
{
    internal class RVendor
    {
        /* GET */
        public static List<Vendor> GetVendors()
        {
            using (ToolingRoomEntities dbContext = new ToolingRoomEntities())
            {
                dbContext.Configuration.LazyLoadingEnabled = false;

                var vendors = dbContext.Vendors.ToList();

                return vendors;
            }
        }
        public static Vendor GetVendor(int IdVendor)
        {
            using (ToolingRoomEntities dbContext = new ToolingRoomEntities())
            {
                dbContext.Configuration.LazyLoadingEnabled = false;

                var vendor = dbContext.Vendors.FirstOrDefault(v => v.Id == IdVendor);
                if (vendor != null)
                {
                    return vendor;
                }
                else
                {
                    throw new Exception("Vendor does not exists.");
                }
            }
        }

        public static List<object> GetDataAndVendors()
        {
            using (ToolingRoomEntities dbContext = new ToolingRoomEntities())
            {
                dbContext.Configuration.LazyLoadingEnabled = false;

                var vendorDatas = new List<object>();

                foreach (var vendor in dbContext.Vendors.ToList())
                {
                    var totalDevice = dbContext.Devices.Where(d => d.IdVendor == vendor.Id).Count();

                    object data = new
                    {
                        Vendor = vendor,
                        Total = new
                        {
                            Device = totalDevice,
                        }
                    };
                    vendorDatas.Add(data);
                }

                return vendorDatas;
            }
        }
        public static object GetDataAndVendor(int IdVendor)
        {
            using (ToolingRoomEntities dbContext = new ToolingRoomEntities())
            {
                dbContext.Configuration.LazyLoadingEnabled = false;

                var vendor = dbContext.Vendors.FirstOrDefault(v => v.Id == IdVendor);
                if (vendor != null)
                {
                    var totalDevice = dbContext.Devices.Where(d => d.IdVendor == vendor.Id).Count();

                    object vendorData = new
                    {
                        Vendor = vendor,
                        Total = new
                        {
                            Device = totalDevice,
                        }
                    };

                    return vendorData;
                }
                else
                {
                    throw new Exception("Vendor does not exists.");
                }
            }
        }

        public static List<object> GetDevicesAndVendors()
        {
            using (ToolingRoomEntities dbContext = new ToolingRoomEntities())
            {
                dbContext.Configuration.LazyLoadingEnabled = false;

                var vendorDatas = new List<object>();

                foreach (var vendor in dbContext.Vendors.ToList())
                {
                    var devices = dbContext.Devices.Where(d => d.IdStation == vendor.Id).ToList();

                    object data = new
                    {
                        Vendor = vendor,
                        Devices = devices
                    };
                    vendorDatas.Add(data);
                }

                return vendorDatas;
            }
        }
        public static object GetDevicesAndVendor(int IdVendor)
        {
            using (ToolingRoomEntities dbContext = new ToolingRoomEntities())
            {
                dbContext.Configuration.LazyLoadingEnabled = false;

                var vendor = dbContext.Vendors.FirstOrDefault(v => v.Id == IdVendor);
                if (vendor != null)
                {
                    var devices = dbContext.Devices.Where(d => d.IdProduct == vendor.Id).ToList();

                    object vendorData = new
                    {
                        Vendor = vendor,
                        Devices = devices
                    };

                    return vendorData;
                }
                else
                {
                    throw new Exception("Vendor does not exists.");
                }

            }
        }

        /* SET */
        public static Vendor CreateVendor(Vendor vendor)
        {
            try
            {
                using (ToolingRoomEntities dbContext = new ToolingRoomEntities())
                {
                    dbContext.Configuration.LazyLoadingEnabled = false;

                    CreateValidate_Vendor(dbContext, vendor);

                    vendor.VendorName = vendor.VendorName.Trim().ToUpper();

                    dbContext.Vendors.Add(vendor);
                    dbContext.SaveChanges();

                    return vendor;
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }

        }
        public static Vendor UpdateVendor(Vendor vendor)
        {
            try
            {
                using (ToolingRoomEntities dbContext = new ToolingRoomEntities())
                {
                    dbContext.Configuration.LazyLoadingEnabled = false;

                    UpdateValidate_Vendor(dbContext, vendor);

                    var dbVendor = dbContext.Vendors.FirstOrDefault(v => v.Id == vendor.Id);
                    dbVendor.VendorName = vendor.VendorName.Trim().ToUpper();

                    dbContext.Vendors.AddOrUpdate(dbVendor);
                    dbContext.SaveChanges();

                    return dbVendor;
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        public static Vendor DeleteVendor(Vendor vendor)
        {
            try
            {
                using (ToolingRoomEntities dbContext = new ToolingRoomEntities())
                {
                    dbContext.Configuration.LazyLoadingEnabled = false;

                    var dbVendor = dbContext.Vendors.FirstOrDefault(s => s.Id == vendor.Id);
                    if (dbVendor != null)
                    {
                        dbContext.Vendors.Remove(dbVendor);
                        dbContext.SaveChanges();
                        return dbVendor;
                    }
                    else
                    {
                        throw new Exception("Vendor does not exists.");
                    }
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        /* VALIDATE */
        private static bool CreateValidate_Vendor(ToolingRoomEntities dbContext, Vendor vendor)
        {
            if (string.IsNullOrEmpty(vendor.VendorName))
            {
                throw new Exception("Station name name cannot be empty.");
            }

            vendor.VendorName = vendor.VendorName.Trim().ToUpper();
            if (dbContext.Vendors.Any(v => v.VendorName == vendor.VendorName))
            {
                throw new Exception("Vendor already exists.");
            }

            return true;
        }
        private static bool UpdateValidate_Vendor(ToolingRoomEntities dbContext, Vendor vendor)
        {
            var dbVendor = dbContext.Vendors.FirstOrDefault(s => s.Id == vendor.Id);

            if (dbVendor == null)
            {
                throw new Exception("Vendor does not exists.");
            }

            if (string.IsNullOrEmpty(vendor.VendorName))
            {
                throw new Exception("Vendor name cannot be empty.");
            }

            vendor.VendorName = vendor.VendorName.Trim().ToUpper();
            if (dbVendor.VendorName != vendor.VendorName)
            {
                if (dbContext.Vendors.Any(s => s.VendorName == vendor.VendorName))
                {
                    throw new Exception("Vendor already exists.");
                }
            }

            return true;
        }
    }
}