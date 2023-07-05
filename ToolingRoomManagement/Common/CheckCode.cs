using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace ToolingRoomManagement.Common
{
    [Serializable]
    public class CheckCode
    {
        public int check { get; set; }
        public string username_send { get; set; }
    }
}