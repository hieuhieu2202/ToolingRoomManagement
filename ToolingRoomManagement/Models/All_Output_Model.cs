using Model.EF;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace ToolingRoomManagement.Models
{
    public class All_Output_Model
    {
        public string create_by { get; set; }
        public string receive_code { get; set; }
        public string device_code { get; set; }
        public Device device { get; set; }
        public Output output { get; set; }
    }
}