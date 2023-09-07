using System;
using System.CodeDom;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Web;
using System.Web.Mvc;
using ToolingRoomManagement.Areas.NVIDIA.Entities;

namespace ToolingRoomManagement.Areas.NVIDIA.Controllers
{
    public class AuthenticationController : Controller
    {        
        ToolingRoomEntities db = new ToolingRoomEntities();
        // GET: NVIDIA/Authentication
        public ActionResult Index()
        {
            return View();
        }

        // SignIn
        public ActionResult SignIn()
        {
            if (Request.Cookies["RememberSignIn"] != null)
            {
                string Username = Request.Cookies["RememberSignIn"]["Username"];
                string Password = Request.Cookies["RememberSignIn"]["Password"];

                Entities.User user = db.Users.FirstOrDefault(u => u.Username == Username);
                if (user != null)
                {
                    if (HashValue(user.Password) == Password)
                    {
                        //return RedirectByRole(user);

                        return Redirect(Url.Action("Index", "Dashboard", new { area = "NVIDIA" }));
                }
                    else
                    {
                        return View();
                    }
                }
                else
                {
                    return View();
                }
            }
            else
            {
                return View();
            }          
        }
        [HttpPost]
        public ActionResult SignIn(string Username, string Password, bool Remember) 
        {
            try
            {
                Entities.User user = db.Users.FirstOrDefault(u => u.Username == Username);
                if(user != null) 
                {
                    if(user.Password == Password)
                    {
                        if (Remember)
                        {
                            CreateCookie(user);
                        }
                        else
                        {
                            DeleteCookie();
                        }
                        CreateSession(user);
                        return RedirectByRole(user);
                    }
                    else
                    {
                        return Json(new { status = false, message = "Incorrect password." });
                    }                   
                }
                else
                {
                    return Json(new { status = false, message = "User does not exist." });
                }

            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message });
            }
        }


        // SignOut
        [HttpPost]
        public JsonResult SignOut()
        {
            try
            {
                DeleteCookie();
                DeleteSession();

                return Json(new { status = true, redirectTo = Url.Action("SignIn", "Authentication", new { area = "NVIDIA" }) });
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message });
            }
        }
        // Cookie
        private void CreateCookie(Entities.User user)
        {
            HttpCookie rememberSignInCookie = new HttpCookie("RememberSignIn");

            rememberSignInCookie["Username"] = user.Username;
            rememberSignInCookie["Password"] = HashValue(user.Password);

            rememberSignInCookie.Expires = DateTime.Now.AddDays(15);

            Response.Cookies.Add(rememberSignInCookie);
        }
        private void DeleteCookie()
        {
            Response.Cookies["RememberSignIn"].Expires = DateTime.Now.AddDays(-1);
        }
        // Session
        private void CreateSession(Entities.User user)
        {
            Session["SignSession"] = user;
        }
        private void DeleteSession()
        {
            Session.Remove("SignSession");
        }


        public ActionResult SignUp()
        {
            return View();
        }


        private JsonResult RedirectByRole(User user)
        {
            try
            {

                //if (AuthorizeRole.Admin)
                //    return Json(new { success = true, redirectTo = Url.Action("Index", "UserManager", new { area = "Admin" }) });
                //else
                //    return Json(new { success = true, redirectTo = Url.Action("Index", "Manager", new { area = "MCU" }) });
                return Json(new { status = true, redirectTo = Url.Action("Index", "Dashboard", new { area = "NVIDIA" }) }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message });
            }

        }

        // Other
        private string HashValue(string value)
        {
            using (SHA256 sha256 = SHA256.Create())
            {
                byte[] inputBytes = Encoding.UTF8.GetBytes(value);
                byte[] hashedBytes = sha256.ComputeHash(inputBytes);
                StringBuilder builder = new StringBuilder();
                for (int i = 0; i < hashedBytes.Length; i++)
                {
                    builder.Append(hashedBytes[i].ToString("x2"));
                }
                return builder.ToString();
            }
        }
    }
}