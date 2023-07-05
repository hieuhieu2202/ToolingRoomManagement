using Model.EF;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace ToolingRoomManagement.Models
{
    public class DetailDevice_InputModel
    {
        public Input input { get; set; }
        public Device device { get; set; }
        public Receive receive { get; set; }
    }
}