using Model.EF;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace ToolingRoomManagement.Models
{
    public class All_Input_Model
    {
        public string code_order { get; set; }
        public string username_input { get; set; }
        public double? quantity { get; set; }
        public DateTime? date { get; set; }
        public Device device { get; set; }
        public string note { get; set; }

    }
}