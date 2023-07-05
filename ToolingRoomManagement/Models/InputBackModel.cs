using Model.EF;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace ToolingRoomManagement.Models
{
    public class InputBackModel
    {
        public string code_device { get; set; }
        public string SN_device { get; set; }
        public Receive receive { get; set; }
        public DeviceBackRoom deviceback { get; set; }
    }
}