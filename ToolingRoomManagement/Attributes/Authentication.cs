using System;
using System.CodeDom;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Data.Entity.Migrations;
using ToolingRoomManagement.Areas.NVIDIA.Entities;
using Entities = ToolingRoomManagement.Areas.NVIDIA.Entities;
using Model.EF;

namespace ToolingRoomManagement.Attributes
{
    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Method, Inherited = true, AllowMultiple = true)]
    public class Authentication : AuthorizeAttribute
    {
        public bool AllowAnonymous { get; set; } = false;
        public string Role { get; set; } = null;

        protected override bool AuthorizeCore(HttpContextBase httpContext)
        {
            Entities.User user = (Entities.User)HttpContext.Current.Session["SignSession"];
            string NextUrl = httpContext.Request.RawUrl.ToString();
            var IsAjax = IsAjaxRequest(httpContext.Request);
           
            if (!AllowAnonymous)
            {
                if (user != null)
                {
                    if (Role != null)
                    {
                        if (user.UserRoles.Any(ur => ur.Role.RoleName == Role) || user.UserRoles.Any(ur => ur.Role.Id == 1))
                        {
                            HttpContext.Current.Session["PrevUrl"] = NextUrl;
                            return true;
                        }
                        else
                        {
                            return false;
                        }
                    }
                    else
                    {
                        HttpContext.Current.Session["PrevUrl"] = NextUrl;
                        return true;
                    }
                    
                }
                else
                {
                    return false;
                }
            }
            else
            {
                HttpContext.Current.Session["PrevUrl"] = NextUrl;
                return true;
            }
        }
        protected override void HandleUnauthorizedRequest(AuthorizationContext filterContext)
        {
            string PrevUrl = HttpContext.Current.Session["PrevUrl"]?.ToString();
            if (PrevUrl != null)
            {
                filterContext.Result = new RedirectResult(PrevUrl);
            }
            else
            {
                filterContext.Result = new RedirectResult("~/NVIDIA/Dashboard/Index");
            }
           
        }
        public override void OnAuthorization(AuthorizationContext filterContext)
        {
            base.OnAuthorization(filterContext);
        }

        public static bool IsAjaxRequest(HttpRequestBase request)
        {
            if (request == null)
            {
                throw new ArgumentNullException("request");
            }

            if (request.Headers != null)
            {
                return request.Headers["X-Requested-With"] == "XMLHttpRequest";
            }

            return false;
        }
    }
}