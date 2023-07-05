using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace ToolingRoomManagement.Common
{

    [Serializable]
    public class UserLogin
    {
        public long UserID { set; get; }
        public string UserName { set; get; }
        public string Fullname { get; set; }
        public int? GroupID { set; get; }
        public string Password { get; set; }
        public int? Part { get; set; }
    }
}