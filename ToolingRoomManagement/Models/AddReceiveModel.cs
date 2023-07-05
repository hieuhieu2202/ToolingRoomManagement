using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace ToolingRoomManagement.Models
{
    public class AddReceiveModel
    {
        public int? id { get; set; }
        public string receive_name { get; set; }
        public int manager_id { get; set; }
        public string manager_name { get; set; }
        public string note { get; set; }
    }
}