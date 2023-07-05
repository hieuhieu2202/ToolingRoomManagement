using Model.EF;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace ToolingRoomManagement.Models
{
    public class detailReceiveCThan
    {
        public ClipOutput clipOutput { get; set; }
        public string device_name { get; set; }
        public double? quantity_in { get; set; }
        public string code_device { get; set; }
        public Device device { get; set; }
    }
}