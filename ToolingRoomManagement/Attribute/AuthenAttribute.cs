using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using ToolingRoomManagement.Areas.PurchaseOrderManager;

namespace ToolingRoomManagement.Attribute
{
    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Method, Inherited = true, AllowMultiple = true)]
    public class AuthenAttribute : AuthorizeAttribute
    {
        public bool AllowAnonymous { get; set; } // is Role

        // Authorization
        protected override bool AuthorizeCore(HttpContextBase httpContext)
        {
            if (AllowAnonymous)
            {
                return true;
            }
            else
            {               
                User AuthorizeOwner = (User)HttpContext.Current.Session["LoginUser"];
                if (AuthorizeOwner != null)
                {
                    return true;
                }
                else
                {
                    return false;
                }
            }
        }
        // Không được chấp nhận xử lý ở đây
        protected override void HandleUnauthorizedRequest(AuthorizationContext filterContext)
        {
            base.HandleUnauthorizedRequest(filterContext);
        }
        // Xử lý trươc và sau khi Authorization
        public override void OnAuthorization(AuthorizationContext filterContext)
        {
            // Trước xử lý ở đây
            base.OnAuthorization(filterContext);
            // Sau xử lý ở đây
        }
    }
}