using Model.EF;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace ToolingRoomManagement.Models
{
    public class Output_ReceiveModel
    {
        public string manager_name { get; set; }
        public string output_by { get; set; }
        public string create_by { get; set; }
        public Device device { get; set; }
    }
}