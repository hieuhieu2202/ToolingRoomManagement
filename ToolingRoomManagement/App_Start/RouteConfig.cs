using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Routing;

namespace ToolingRoomManagement
{
    public class RouteConfig
    {
        public static void RegisterRoutes(RouteCollection routes)
        {
            routes.IgnoreRoute("{resource}.axd/{*pathInfo}");

            /* NIC */
            //routes.MapRoute(
            //    name: "Default",
            //    url: "{controller}/{action}/{id}",
            //    defaults: new { controller = "Home", action = "Index", id = UrlParameter.Optional }
            //);

            /* SWITCH */
            routes.MapRoute(
                name: "Default",
                url: "{area}/{controller}/{action}/{id}",
                defaults: new { area = "Admin", controller = "Login", action = "Login", id = UrlParameter.Optional }
            ).DataTokens = new RouteValueDictionary(new { area = "Admin" });
        }
    }
}
