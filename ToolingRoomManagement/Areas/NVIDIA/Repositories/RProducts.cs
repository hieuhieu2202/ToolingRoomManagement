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

namespace ToolingRoomManagement.Areas.NVIDIA.Repositories
{
    internal class RProducts
    {
        /* GET */
        public static List<Product> GetProducts()
        {
            using (ToolingRoomEntities dbContext = new ToolingRoomEntities())
            {
                dbContext.Configuration.LazyLoadingEnabled = false;

                var products = dbContext.Products.ToList();

                return products;
            }
        }
        public static Product GetProduct(int IdProduct)
        {
            using (ToolingRoomEntities dbContext = new ToolingRoomEntities())
            {
                dbContext.Configuration.LazyLoadingEnabled = false;

                var product = dbContext.Products.FirstOrDefault(p => p.Id == IdProduct);
                if (product != null)
                {
                    return product;
                }
                else
                {
                    throw new Exception("Product does not exists.");
                }
            }
        }

        public static List<object> GetDataAndProducts()
        {
            using (ToolingRoomEntities dbContext = new ToolingRoomEntities())
            {
                dbContext.Configuration.LazyLoadingEnabled = false;

                var productDatas = new List<object>();

                foreach (var product in dbContext.Products.ToList())
                {
                    var totalDevice = dbContext.Devices.Where(d => d.IdProduct == product.Id).Count();

                    object data = new
                    {
                        Product = product,
                        Total = new
                        {
                            Device = totalDevice,
                        }
                    };
                    productDatas.Add(data);
                }

                return productDatas;
            }
        }
        public static object GetDataAndProduct(int IdProduct)
        {
            using (ToolingRoomEntities dbContext = new ToolingRoomEntities())
            {
                dbContext.Configuration.LazyLoadingEnabled = false;

                var product = dbContext.Products.FirstOrDefault(p => p.Id == IdProduct);
                if (product != null)
                {
                    var totalDevice = dbContext.Devices.Where(d => d.IdProduct == product.Id).Count();

                    object productData = new
                    {
                        Product = product,
                        Total = new
                        {
                            Device = totalDevice,
                        }
                    };

                    return productData;
                }
                else
                {
                    throw new Exception("Product does not exists.");
                }
            }
        }

        public static List<object> GetDevicesAndProducts()
        {
            using (ToolingRoomEntities dbContext = new ToolingRoomEntities())
            {
                dbContext.Configuration.LazyLoadingEnabled = false;

                var productDatas = new List<object>();

                foreach (var product in dbContext.Products.ToList())
                {
                    var devices = dbContext.Devices.Where(d => d.IdProduct == product.Id).ToList();

                    object data = new
                    {
                        Product = product,
                        Devices = devices
                    };
                    productDatas.Add(data);
                }

                return productDatas;
            }
        }
        public static object GetDevicesAndProduct(int IdProduct)
        {
            using (ToolingRoomEntities dbContext = new ToolingRoomEntities())
            {
                dbContext.Configuration.LazyLoadingEnabled = false;

                var product = dbContext.Products.FirstOrDefault(p => p.Id == IdProduct);
                if (product != null)
                {
                    var devices = dbContext.Devices.Where(d => d.IdProduct == product.Id).ToList();

                    object productData = new
                    {
                        Product = product,
                        Devices = devices
                    };

                    return productData;
                }
                else
                {
                    throw new Exception("Product does not exists.");
                }

            }
        }

        /* SET */
        public static object CreateProduct(Product product)
        {
            try
            {
                using (ToolingRoomEntities dbContext = new ToolingRoomEntities())
                {
                    dbContext.Configuration.LazyLoadingEnabled = false;

                    CreateValidate_Product(dbContext, product);

                    product.MTS = product.MTS.Trim().ToUpper();
                    product.ProductName = product.ProductName.Trim().ToUpper();

                    dbContext.Products.Add(product);
                    dbContext.SaveChanges();

                    return GetDataAndProduct(product.Id);
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }

        }
        public static object UpdateProduct(Product product)
        {
            try
            {
                using (ToolingRoomEntities dbContext = new ToolingRoomEntities())
                {
                    dbContext.Configuration.LazyLoadingEnabled = false;

                    UpdateValidate_Product(dbContext, product);

                    var dbProduct = dbContext.Products.FirstOrDefault(p => p.Id == product.Id);
                    if (!string.IsNullOrEmpty(product.MTS))
                    {
                        dbProduct.MTS = product.MTS.Trim().ToUpper();
                    }
                    else
                    {
                        dbProduct.MTS = null;
                    }
                    if(!string.IsNullOrEmpty(product.ProductName))
                    {
                        dbProduct.ProductName = product.ProductName.Trim().ToUpper();
                    }
                    else
                    {
                        dbProduct.ProductName = null;
                    }

                    dbContext.Products.AddOrUpdate(dbProduct);
                    dbContext.SaveChanges();

                    return GetDataAndProduct(dbProduct.Id);
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        public static Product DeleteProduct(Product product)
        {
            try
            {
                using (ToolingRoomEntities dbContext = new ToolingRoomEntities())
                {
                    dbContext.Configuration.LazyLoadingEnabled = false;

                    var dbProduct = dbContext.Products.FirstOrDefault(p => p.Id == product.Id);
                    if (dbProduct != null)
                    {
                        dbContext.Products.Remove(dbProduct);
                        dbContext.SaveChanges();
                        return dbProduct;
                    }
                    else
                    {
                        throw new Exception("Product does not exists.");
                    }
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        /* VALIDATE */
        private static bool CreateValidate_Product(ToolingRoomEntities dbContext, Product product)
        {
            if (string.IsNullOrEmpty(product.MTS) && string.IsNullOrEmpty(product.ProductName))
            {
                throw new Exception("MTS or Product name cannot be empty.");
            }

            if (!string.IsNullOrEmpty(product.MTS))
            {
                product.MTS = product.MTS.Trim().ToUpper();
                if (dbContext.Products.Any(p => p.MTS == product.MTS))
                {
                    throw new Exception("Product already exists.");
                }
            }
            if (!string.IsNullOrEmpty(product.ProductName))
            {
                product.ProductName = product.ProductName.Trim().ToUpper();
                if (dbContext.Products.Any(p => p.ProductName == product.ProductName))
                {
                    throw new Exception("Product already exists.");
                }
            }

            return true;
        }
        private static bool UpdateValidate_Product(ToolingRoomEntities dbContext, Product product)
        {
            var dbProduct = dbContext.Products.FirstOrDefault(p => p.Id == product.Id);

            if(dbProduct == null)
            {
                throw new Exception("Product does not exists.");
            }

            if (string.IsNullOrEmpty(product.MTS) && string.IsNullOrEmpty(product.ProductName))
            {
                throw new Exception("MTS or Product name cannot be empty.");
            }

            if (!string.IsNullOrEmpty(product.MTS) && dbProduct.MTS != product.MTS)
            {
                product.MTS = product.MTS.Trim().ToUpper();
                if (dbContext.Products.Any(p => p.MTS == product.MTS))
                {
                    throw new Exception("Product already exists.");
                }
            }
            if (!string.IsNullOrEmpty(product.ProductName) && dbProduct.ProductName != product.ProductName)
            {
                product.ProductName = product.ProductName.Trim().ToUpper();
                if (dbContext.Products.Any(p => p.ProductName == product.ProductName))
                {
                    throw new Exception("Product already exists.");
                }
            }

            return true;
        }
    }
}