using Model.EF;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace ToolingRoomManagement.Models
{
    public class DeviceBackModel
    {
        public string username { get; set; }
        public DeviceBackRoom deviceBack { get; set; } 
    }
}