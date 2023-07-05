using Model.EF;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace ToolingRoomManagement.Models
{
    public class Detail_ReceiveModel
    {
        public Device device { get; set; }
        public Receive receive { get; set; }
        public Output output { get; set; }
    }
}