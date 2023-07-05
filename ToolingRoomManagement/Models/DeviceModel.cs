using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace ToolingRoomManagement.Models
{
    public class DeviceModel
    {
        public int? id { get; set; }
        public string code_device { get; set; }
        public string device_name { get; set;}  
        public float quantity { get; set; }
        public int gioihan { get; set; }
        public string price { get; set; }
        public string brand { get; set; }
        public string parameter { get; set; }
        public string unit { get; set; }
        public string produce_SN { get; set; }
        public string location { get; set; }
        public string calibration { get; set; }
        public string update_date { get; set; }
        public int kind_of_device { get; set; }
        public int manager_id { get; set; }
        public string makiemke { get; set; }
        public int status { get; set; }
        public string noteStatus { get; set; }
    }
}