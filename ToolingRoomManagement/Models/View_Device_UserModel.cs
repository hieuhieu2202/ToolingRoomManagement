using Model.EF;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace ToolingRoomManagement.Models
{
    public class View_Device_UserModel
    {
        public string username { get; set; }
        public Device device { get; set; }
    }
}