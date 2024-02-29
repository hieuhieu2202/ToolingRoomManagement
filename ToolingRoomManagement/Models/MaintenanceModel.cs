using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace ToolingRoomManagement.Models
{
    public class MaintenanceModel
    {
        public int? id { get; set; }
        public string station_name { get; set; }
        public int issue_1 { get; set; }
        public int issue_2 { get; set; }
        public int issue_3 { get; set; }
        public int issue_4 { get; set; }
        public int issue_5 { get; set; }
        public int issue_6 { get; set; }
        public int issue_7 { get; set; }
        public int issue_8 { get; set; }
        public int issue_9 { get; set; }
        public string note { get; set; }
        public DateTime create_date { get; set; }

    }
}