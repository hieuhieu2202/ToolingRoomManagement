using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace ToolingRoomManagement.Models
{
    public class InputModel
    {
        public int? id { get; set; }
        public string order_code { get; set; }
        public float quantity { get; set; }
        public int device_id { get; set; }
        public int kind_of_device { get; set; }
        public string location { get; set; }

    }
}