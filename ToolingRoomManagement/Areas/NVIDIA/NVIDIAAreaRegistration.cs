using System.Web.Mvc;

namespace ToolingRoomManagement.Areas.NVIDIA
{
    public class NVIDIAAreaRegistration : AreaRegistration 
    {
        public override string AreaName 
        {
            get 
            {
                return "NVIDIA";
            }
        }

        public override void RegisterArea(AreaRegistrationContext context) 
        {
            context.MapRoute(
                "NVIDIA_default",
                "NVIDIA/{controller}/{action}/{id}",
                new { action = "Index", id = UrlParameter.Optional }
            );
        }
    }
}