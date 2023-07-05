using Model.EF;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace ToolingRoomManagement.Models
{
    public class Device_BackModel
    {
        public Input input { get; set; }
        public Device device { get; set; }
        public string manager_name { get; set; }
    }
}