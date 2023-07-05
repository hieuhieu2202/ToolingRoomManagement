using Model.EF;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace ToolingRoomManagement.Models
{
    public class OutputModel
    {
        public Output output { get; set; }
        public string device_name { get; set; }
        public string location { get; set; }
        public string parameter { get; set; }
    }
}