using System.Web.Mvc;

namespace ToolingRoomManagement.Areas.NVDIA
{
    public class NVDIAAreaRegistration : AreaRegistration 
    {
        public override string AreaName 
        {
            get 
            {
                return "NVDIA";
            }
        }

        public override void RegisterArea(AreaRegistrationContext context) 
        {
            context.MapRoute(
                "NVDIA_default",
                "NVDIA/{controller}/{action}/{id}",
                new { action = "Index", id = UrlParameter.Optional }
            );
        }
    }
}