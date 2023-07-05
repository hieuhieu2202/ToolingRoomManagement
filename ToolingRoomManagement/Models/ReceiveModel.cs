using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace ToolingRoomManagement.Models
{
    public class ReceiveModel
    {
        public int? id { get; set; }
        public int receive_id { get; set; }
        public int device_id { get; set; }
        public string location { get; set; }
        public float quantity { get; set; }
        public int type { get; set; }
        public int status { get; set; }
        public string note { get; set; }
        public string ngaytra { get; set; }
    }
}