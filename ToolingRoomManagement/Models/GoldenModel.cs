using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace ToolingRoomManagement.Models
{
    public class GoldenModel
    {
        public int? id { get; set; }
        public string golden_name { get; set; }
        public string golden_mac { get; set; }
        public string model_name { get; set; }
        public string group_name { get; set; }
        public string create_date { get; set; }
        public string end_date { get; set; }
        public HttpPostedFileBase file_name { get; set; }
    }
}