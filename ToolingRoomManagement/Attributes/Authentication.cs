using System;
using System.CodeDom;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Data.Entity.Migrations;
using ToolingRoomManagement.Areas.NVIDIA.Entities;
using Entities = ToolingRoomManagement.Areas.NVIDIA.Entities;

namespace ToolingRoomManagement.Attributes
{
    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Method, Inherited = true, AllowMultiple = true)]
    public class Authentication : AuthorizeAttribute
    {
        public bool AllowAnonymous { get; set; } = false;
        protected override bool AuthorizeCore(HttpContextBase httpContext)
        {
            string currentUrl = httpContext.Request.CurrentExecutionFilePath.ToString();
            if (!AllowAnonymous)
            {
                Entities.User user = (Entities.User)HttpContext.Current.Session["SignSession"];
                if (user == null)
                {
                    return false;
                }
                else
                {
                    return true;
                }
            }
            else
            {
                return true;
            }
        }
        protected override void HandleUnauthorizedRequest(AuthorizationContext filterContext)
        {
            filterContext.Result = new RedirectResult("~/NVIDIA/Authentication/SignIn");
        }
        public override void OnAuthorization(AuthorizationContext filterContext)
        {
            base.OnAuthorization(filterContext);
        }
    }
}