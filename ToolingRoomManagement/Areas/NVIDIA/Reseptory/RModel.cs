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
    internal class RModel
    {
        /* GET */
        public static List<Entities.Model> GetModels()
        {
            using (ToolingRoomEntities dbContext = new ToolingRoomEntities())
            {
                dbContext.Configuration.LazyLoadingEnabled = false;

                var models = dbContext.Models.ToList();

                return models;
            }
        }
        public static Entities.Model GetModel(int IdModel)
        {
            using (ToolingRoomEntities dbContext = new ToolingRoomEntities())
            {
                dbContext.Configuration.LazyLoadingEnabled = false;

                var model = dbContext.Models.FirstOrDefault(m => m.Id == IdModel);
                if (model != null)
                {
                    return model;
                }
                else
                {
                    throw new Exception("Model does not exists.");
                }
            }
        }

        public static List<object> GetDataAndModels()
        {
            using (ToolingRoomEntities dbContext = new ToolingRoomEntities())
            {
                dbContext.Configuration.LazyLoadingEnabled = false;

                var modelDatas = new List<object>();

                foreach (var model in dbContext.Models.ToList())
                {
                    var totalDevice = dbContext.Devices.Where(d => d.IdModel == model.Id).Count();

                    object data = new
                    {
                        Model = model,
                        Total = new
                        {
                            Device = totalDevice,
                        }
                    };
                    modelDatas.Add(data);
                }

                return modelDatas;
            }
        }
        public static object GetDataAndModel(int IdModel)
        {
            using (ToolingRoomEntities dbContext = new ToolingRoomEntities())
            {
                dbContext.Configuration.LazyLoadingEnabled = false;

                var model = dbContext.Models.FirstOrDefault(m => m.Id == IdModel);
                if (model != null)
                {
                    var totalDevice = dbContext.Devices.Where(d => d.IdModel == model.Id).Count();

                    object modelData = new
                    {
                        Models = model,
                        Total = new
                        {
                            Device = totalDevice,
                        }
                    };

                    return modelData;
                }
                else
                {
                    throw new Exception("Model does not exists.");
                }
            }
        }

        public static List<object> GetDevicesAndModels()
        {
            using (ToolingRoomEntities dbContext = new ToolingRoomEntities())
            {
                dbContext.Configuration.LazyLoadingEnabled = false;

                var modelDatas = new List<object>();

                foreach (var model in dbContext.Models.ToList())
                {
                    var devices = dbContext.Devices.Where(d => d.IdModel == model.Id).ToList();

                    object data = new
                    {
                        Model = model,
                        Devices = devices
                    };
                    modelDatas.Add(data);
                }

                return modelDatas;
            }
        }
        public static object GetDevicesAndModel(int IdModel)
        {
            using (ToolingRoomEntities dbContext = new ToolingRoomEntities())
            {
                dbContext.Configuration.LazyLoadingEnabled = false;

                var model = dbContext.Models.FirstOrDefault(m => m.Id == IdModel);
                if (model != null)
                {
                    var devices = dbContext.Devices.Where(d => d.IdModel == model.Id).ToList();

                    object modelData = new
                    {
                        Model = model,
                        Devices = devices
                    };

                    return modelData;
                }
                else
                {
                    throw new Exception("Model does not exists.");
                }

            }
        }

        /* SET */
        public static Entities.Model CreateModel(Entities.Model model)
        {
            try
            {
                using (ToolingRoomEntities dbContext = new ToolingRoomEntities())
                {
                    dbContext.Configuration.LazyLoadingEnabled = false;

                    CreateValidate_Model(dbContext, model);

                    model.ModelName = model.ModelName.Trim().ToUpper();

                    dbContext.Models.Add(model);
                    dbContext.SaveChanges();

                    return model;
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }

        }
        public static Entities.Model UpdateModel(Entities.Model model)
        {
            try
            {
                using (ToolingRoomEntities dbContext = new ToolingRoomEntities())
                {
                    dbContext.Configuration.LazyLoadingEnabled = false;

                    UpdateValidate_Model(dbContext, model);

                    var dbModel = dbContext.Models.FirstOrDefault(m => m.Id == model.Id);
                    dbModel.ModelName = model.ModelName.Trim().ToUpper();

                    dbContext.Models.AddOrUpdate(dbModel);
                    dbContext.SaveChanges();

                    return dbModel;
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        public static Entities.Model DeleteModel(Entities.Model model)
        {
            try
            {
                using (ToolingRoomEntities dbContext = new ToolingRoomEntities())
                {
                    dbContext.Configuration.LazyLoadingEnabled = false;

                    var dbModel = dbContext.Models.FirstOrDefault(m => m.Id == model.Id);
                    if (dbModel != null)
                    {
                        dbContext.Models.Remove(dbModel);
                        dbContext.SaveChanges();
                        return dbModel;
                    }
                    else
                    {
                        throw new Exception("Model does not exists.");
                    }
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        /* VALIDATE */
        private static bool CreateValidate_Model(ToolingRoomEntities dbContext, Entities.Model model)
        {
            if (string.IsNullOrEmpty(model.ModelName))
            {
                throw new Exception("Model name name cannot be empty.");
            }

            model.ModelName = model.ModelName.Trim().ToUpper();
            if (dbContext.Models.Any(m => m.ModelName == model.ModelName))
            {
                throw new Exception("Model already exists.");
            }

            return true;
        }
        private static bool UpdateValidate_Model(ToolingRoomEntities dbContext, Entities.Model model)
        {
            var dbModel = dbContext.Models.FirstOrDefault(m => m.Id == model.Id);

            if (dbModel == null)
            {
                throw new Exception("Model does not exists.");
            }

            if (string.IsNullOrEmpty(model.ModelName))
            {
                throw new Exception("Model name cannot be empty.");
            }

            model.ModelName = model.ModelName.Trim().ToUpper();
            if (dbModel.ModelName != model.ModelName)
            {
                if (dbContext.Models.Any(m => m.ModelName == model.ModelName))
                {
                    throw new Exception("Model already exists.");
                }
            }

            return true;
        }
    }
}