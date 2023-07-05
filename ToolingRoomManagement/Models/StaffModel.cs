using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace ToolingRoomManagement.Models
{
    public class StaffModel
    {
        public float quantity { get; set; }
        public int device_id { get; set; }
        public int receive_id { get; set; }
        public int clip_id { get; set; }
        public int type { get; set; }
        public string note { get; set; }
        public string ngaytra { get; set; }
    }
}