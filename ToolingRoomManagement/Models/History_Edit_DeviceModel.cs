using Model.EF;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace ToolingRoomManagement.Models
{
    public class History_Edit_DeviceModel
    {
        public Device device { get; set; }
        public History_Device history { get; set; }
    }
}