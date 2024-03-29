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
    internal class RStation
    {
        /* GET */
        public static List<Station> GetStations()
        {
            using (ToolingRoomEntities dbContext = new ToolingRoomEntities())
            {
                dbContext.Configuration.LazyLoadingEnabled = false;

                var stations = dbContext.Stations.ToList();

                return stations;
            }
        }
        public static Station GetStation(int IdStation)
        {
            using (ToolingRoomEntities dbContext = new ToolingRoomEntities())
            {
                dbContext.Configuration.LazyLoadingEnabled = false;

                var station = dbContext.Stations.FirstOrDefault(p => p.Id == IdStation);
                if (station != null)
                {
                    return station;
                }
                else
                {
                    throw new Exception("Station does not exists.");
                }
            }
        }

        public static List<object> GetDataAndStations()
        {
            using (ToolingRoomEntities dbContext = new ToolingRoomEntities())
            {
                dbContext.Configuration.LazyLoadingEnabled = false;

                var stationDatas = new List<object>();

                foreach (var station in dbContext.Stations.ToList())
                {
                    var totalDevice = dbContext.Devices.Where(d => d.IdStation == station.Id).Count();

                    object data = new
                    {
                        Station = station,
                        Total = new
                        {
                            Device = totalDevice,
                        }
                    };
                    stationDatas.Add(data);
                }

                return stationDatas;
            }
        }
        public static object GetDataAndStation(int IdStation)
        {
            using (ToolingRoomEntities dbContext = new ToolingRoomEntities())
            {
                dbContext.Configuration.LazyLoadingEnabled = false;

                var station = dbContext.Stations.FirstOrDefault(s => s.Id == IdStation);
                if (station != null)
                {
                    var totalDevice = dbContext.Devices.Where(d => d.IdStation == station.Id).Count();

                    object stationData = new
                    {
                        Station = station,
                        Total = new
                        {
                            Device = totalDevice,
                        }
                    };

                    return stationData;
                }
                else
                {
                    throw new Exception("Station does not exists.");
                }
            }
        }

        public static List<object> GetDevicesAndStations()
        {
            using (ToolingRoomEntities dbContext = new ToolingRoomEntities())
            {
                dbContext.Configuration.LazyLoadingEnabled = false;

                var stationDatas = new List<object>();

                foreach (var station in dbContext.Stations.ToList())
                {
                    var devices = dbContext.Devices.Where(d => d.IdStation == station.Id).ToList();

                    object data = new
                    {
                        Station = station,
                        Devices = devices
                    };
                    stationDatas.Add(data);
                }

                return stationDatas;
            }
        }
        public static object GetDevicesAndStation(int IdStation)
        {
            using (ToolingRoomEntities dbContext = new ToolingRoomEntities())
            {
                dbContext.Configuration.LazyLoadingEnabled = false;

                var station = dbContext.Stations.FirstOrDefault(s => s.Id == IdStation);
                if (station != null)
                {
                    var devices = dbContext.Devices.Where(d => d.IdProduct == station.Id).ToList();

                    object productData = new
                    {
                        Station = station,
                        Devices = devices
                    };

                    return productData;
                }
                else
                {
                    throw new Exception("Station does not exists.");
                }

            }
        }

        /* SET */
        public static Station CreateStation(Station station)
        {
            try
            {
                using (ToolingRoomEntities dbContext = new ToolingRoomEntities())
                {
                    dbContext.Configuration.LazyLoadingEnabled = false;

                    CreateValidate_Station(dbContext, station);

                    station.StationName = station.StationName.Trim().ToUpper();

                    dbContext.Stations.Add(station);
                    dbContext.SaveChanges();

                    return station;
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }

        }
        public static Station UpdateStation(Station station)
        {
            try
            {
                using (ToolingRoomEntities dbContext = new ToolingRoomEntities())
                {
                    dbContext.Configuration.LazyLoadingEnabled = false;

                    UpdateValidate_Station(dbContext, station);

                    var dbStation = dbContext.Stations.FirstOrDefault(s => s.Id == station.Id);
                    dbStation.StationName = station.StationName.Trim().ToUpper();

                    dbContext.Stations.AddOrUpdate(dbStation);
                    dbContext.SaveChanges();

                    return dbStation;
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        public static Station DeleteStation(Station station)
        {
            try
            {
                using (ToolingRoomEntities dbContext = new ToolingRoomEntities())
                {
                    dbContext.Configuration.LazyLoadingEnabled = false;

                    var dbStation = dbContext.Stations.FirstOrDefault(s => s.Id == station.Id);
                    if (dbStation != null)
                    {
                        dbContext.Stations.Remove(dbStation);
                        dbContext.SaveChanges();
                        return dbStation;
                    }
                    else
                    {
                        throw new Exception("Station does not exists.");
                    }
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        /* VALIDATE */
        private static bool CreateValidate_Station(ToolingRoomEntities dbContext, Station station)
        {
            if (string.IsNullOrEmpty(station.StationName))
            {
                throw new Exception("Station name name cannot be empty.");
            }

            station.StationName = station.StationName.Trim().ToUpper();
            if (dbContext.Stations.Any(s => s.StationName == station.StationName))
            {
                throw new Exception("Station already exists.");
            }

            return true;
        }
        private static bool UpdateValidate_Station(ToolingRoomEntities dbContext, Station station)
        {
            var dbStation = dbContext.Stations.FirstOrDefault(s => s.Id == station.Id);

            if (dbStation == null)
            {
                throw new Exception("Station does not exists.");
            }

            if (string.IsNullOrEmpty(station.StationName))
            {
                throw new Exception("Station name cannot be empty.");
            }

            station.StationName = station.StationName.Trim().ToUpper();
            if (dbStation.StationName != station.StationName)
            {
                if (dbContext.Stations.Any(s => s.StationName == station.StationName))
                {
                    throw new Exception("Staion already exists.");
                }
            }

            return true;
        }
    }
}