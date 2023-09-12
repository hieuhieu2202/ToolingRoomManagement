using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace ToolingRoomManagement.Areas.NVIDIA.Data
{
    public class Common
    {
        // CheckStatus
        public static string CheckStatus(Entities.Device device)
        {
            if (device.RealQty == 0 || device.Quantity == 0)
                return "Locked";
            if (device.QtyConfirm == 0)
                return "Unconfirmed";
            

            if (device.RealQty <= device.Quantity * device.Buffer)
                return "Out Range";

            if (device.QtyConfirm < device.Quantity)
                return "Part Confirmed";
            if (device.Quantity == device.QtyConfirm)
                return "Confirmed";

            return "N/A";
        }
    }
}