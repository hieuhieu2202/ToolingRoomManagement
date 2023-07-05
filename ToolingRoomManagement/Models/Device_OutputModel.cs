using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace ToolingRoomManagement.Models
{
    public class Device_OutputModel
    {
        public string device_name { get; set; }
        public double? quantity{ get; set; }
        public string output_date { get; set; }
    }
}