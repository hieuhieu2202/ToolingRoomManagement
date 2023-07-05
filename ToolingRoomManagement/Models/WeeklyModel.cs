using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace ToolingRoomManagement.Models
{
    public class WeeklyModel
    {
        public int? id { get; set; }
        public int station_id { get; set; }
        public string sheilding_mac { get; set; }
        public int issue_1 { get; set; }
        public int issue_2 { get; set; }
        public int issue_3 { get; set; }
        public int issue_4 { get; set; }
        public int issue_5 { get; set; }
        public int issue_6 { get; set; }
        public int issue_7 { get; set; }
        public int issue_8 { get; set; }
        public string note { get; set; }
    }
}