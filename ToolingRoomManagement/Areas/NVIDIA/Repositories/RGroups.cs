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
    internal class RGroups
    {
        /* GET */
        public static List<Group> GetGroups()
        {
            using (ToolingRoomEntities dbContext = new ToolingRoomEntities())
            {
                dbContext.Configuration.LazyLoadingEnabled = false;

                var groups = dbContext.Groups.ToList();

                return groups;
            }
        }
        public static Group GetGroup(int IdGroup)
        {
            using (ToolingRoomEntities dbContext = new ToolingRoomEntities())
            {
                dbContext.Configuration.LazyLoadingEnabled = false;

                var group = dbContext.Groups.FirstOrDefault(p => p.Id == IdGroup);
                if (group != null)
                {
                    return group;
                }
                else
                {
                    throw new Exception("Group does not exists.");
                }
            }
        }

        public static List<object> GetDataAndGroups()
        {
            using (ToolingRoomEntities dbContext = new ToolingRoomEntities())
            {
                dbContext.Configuration.LazyLoadingEnabled = false;

                var groupDatas = new List<object>();

                foreach (var group in dbContext.Groups.ToList())
                {
                    var totalDevice = dbContext.Devices.Where(d => d.IdGroup == group.Id).Count();

                    object data = new
                    {
                        Group = group,
                        Total = new
                        {
                            Device = totalDevice,
                        }
                    };
                    groupDatas.Add(data);
                }

                return groupDatas;
            }
        }
        public static object GetDataAndGroup(int IdGroup)
        {
            using (ToolingRoomEntities dbContext = new ToolingRoomEntities())
            {
                dbContext.Configuration.LazyLoadingEnabled = false;

                var group = dbContext.Groups.FirstOrDefault(g => g.Id == IdGroup);
                if (group != null)
                {
                    var totalDevice = dbContext.Devices.Where(d => d.IdGroup == group.Id).Count();

                    object groupData = new
                    {
                        Group = group,
                        Total = new
                        {
                            Device = totalDevice,
                        }
                    };

                    return groupData;
                }
                else
                {
                    throw new Exception("Group does not exists.");
                }
            }
        }

        public static List<object> GetDevicesAndGroups()
        {
            using (ToolingRoomEntities dbContext = new ToolingRoomEntities())
            {
                dbContext.Configuration.LazyLoadingEnabled = false;

                var groupDatas = new List<object>();

                foreach (var group in dbContext.Groups.ToList())
                {
                    var devices = dbContext.Devices.Where(d => d.IdGroup == group.Id).ToList();

                    object data = new
                    {
                        Group = group,
                        Devices = devices
                    };
                    groupDatas.Add(data);
                }

                return groupDatas;
            }
        }
        public static object GetDevicesAndGroup(int IdGroup)
        {
            using (ToolingRoomEntities dbContext = new ToolingRoomEntities())
            {
                dbContext.Configuration.LazyLoadingEnabled = false;

                var group = dbContext.Groups.FirstOrDefault(p => p.Id == IdGroup);
                if (group != null)
                {
                    var devices = dbContext.Devices.Where(d => d.IdGroup == group.Id).ToList();

                    object groupData = new
                    {
                        Group = group,
                        Devices = devices
                    };

                    return groupData;
                }
                else
                {
                    throw new Exception("Group does not exists.");
                }

            }
        }

        /* SET */
        public static Group CreateGroup(Group group)
        {
            try
            {
                using (ToolingRoomEntities dbContext = new ToolingRoomEntities())
                {
                    dbContext.Configuration.LazyLoadingEnabled = false;

                    CreateValidate_Group(dbContext, group);

                    group.GroupName = group.GroupName.Trim().ToUpper();

                    dbContext.Groups.Add(group);
                    dbContext.SaveChanges();

                    return group;
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }

        }
        public static Group UpdateGroup(Group group)
        {
            try
            {
                using (ToolingRoomEntities dbContext = new ToolingRoomEntities())
                {
                    dbContext.Configuration.LazyLoadingEnabled = false;

                    UpdateValidate_Group(dbContext, group);

                    var dbGroup = dbContext.Groups.FirstOrDefault(g => g.Id == group.Id);
                    dbGroup.GroupName = group.GroupName.Trim().ToUpper();

                    dbContext.Groups.AddOrUpdate(dbGroup);
                    dbContext.SaveChanges();

                    return dbGroup;
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        public static Group DeleteGroup(Group group)
        {
            try
            {
                using (ToolingRoomEntities dbContext = new ToolingRoomEntities())
                {
                    dbContext.Configuration.LazyLoadingEnabled = false;

                    var dbGroup = dbContext.Groups.FirstOrDefault(g => g.Id == group.Id);
                    if (dbGroup != null)
                    {
                        dbContext.Groups.Remove(dbGroup);
                        dbContext.SaveChanges();
                        return dbGroup;
                    }
                    else
                    {
                        throw new Exception("Group does not exists.");
                    }
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        /* VALIDATE */
        private static bool CreateValidate_Group(ToolingRoomEntities dbContext, Group group)
        {
            if (string.IsNullOrEmpty(group.GroupName))
            {
                throw new Exception("Group name name cannot be empty.");
            }

            group.GroupName = group.GroupName.Trim().ToUpper();
            if (dbContext.Groups.Any(g => g.GroupName == group.GroupName))
            {
                throw new Exception("Group already exists.");
            }

            return true;
        }
        private static bool UpdateValidate_Group(ToolingRoomEntities dbContext, Group group)
        {
            var dbGroup = dbContext.Groups.FirstOrDefault(g => g.Id == group.Id);

            if(dbGroup == null)
            {
                throw new Exception("Group does not exists.");
            }

            if (string.IsNullOrEmpty(group.GroupName))
            {
                throw new Exception("Group name cannot be empty.");
            }

            group.GroupName = group.GroupName.Trim().ToUpper();
            if (dbGroup.GroupName != group.GroupName)
            {
                if (dbContext.Groups.Any(g => g.GroupName == group.GroupName))
                {
                    throw new Exception("Group already exists.");
                }
            }

            return true;
        }
    }
}