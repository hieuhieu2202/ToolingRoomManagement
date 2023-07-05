using Model.EF;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace ToolingRoomManagement.Models
{
    public class Detail_DeviceModel
    {
        public Output output { get; set; }
        public Receive receive { get; set; }
        public Device device { get; set; }
    }
}