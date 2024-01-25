using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using ToolingRoomManagement.Areas.NVIDIA.Entities;

namespace ToolingRoomManagement.Areas.NVIDIA.Controllers
{
    public class Common
    {
        public static User GetSessionUser()
        {
            return (User)HttpContext.Current.Session["SignSession"];
        }
    }
}