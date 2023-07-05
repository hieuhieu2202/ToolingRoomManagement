using System.Web.Mvc;

namespace ToolingRoomManagement.Areas.PurchaseOrderManager
{
    public class PurchaseOrderManagerAreaRegistration : AreaRegistration 
    {
        public override string AreaName 
        {
            get 
            {
                return "PurchaseOrderManager";
            }
        }

        public override void RegisterArea(AreaRegistrationContext context) 
        {
            context.MapRoute(
                "PurchaseOrderManager_default",
                "PurchaseOrderManager/{controller}/{action}/{id}",
                new { action = "Index", id = UrlParameter.Optional }
            );
        }
    }
}