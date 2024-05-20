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
    internal class RDevice
    {
        /* GET */
        public static object GetSimpleDevices()
        {
            using (ToolingRoomEntities context = new ToolingRoomEntities())
            {
                context.Configuration.LazyLoadingEnabled = false;

                var devices = context.Devices.Select(d => new
                {
                    d.Id,
                    d.DeviceCode,
                    d.DeviceName
                }).Where(d => d.DeviceCode != null && !string.IsNullOrEmpty(d.DeviceCode))
                .ToList();

                return devices;
            }
        }

        /* SET */

    }
}