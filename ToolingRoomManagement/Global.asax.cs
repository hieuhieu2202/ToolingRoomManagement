using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Routing;
using OfficeOpenXml;
namespace ToolingRoomManagement
{
    public class MvcApplication : System.Web.HttpApplication
    {
        protected void Application_Start()
        {
            ExcelPackage.LicenseContext = LicenseContext.NonCommercial;
            AreaRegistration.RegisterAllAreas();
            RouteConfig.RegisterRoutes(RouteTable.Routes);
        }
    }
}
