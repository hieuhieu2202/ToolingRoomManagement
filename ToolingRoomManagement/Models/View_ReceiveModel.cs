using Model.EF;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace ToolingRoomManagement.Models
{
    public class View_ReceiveModel
    {
        public ClipOutput clipOutput { get; set; }
        public string device_name { get; set; }
        public string code_device { get; set; }
        public string code_receive { get; set; }
        public string location { get; set; }
    }
}