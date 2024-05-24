using Newtonsoft.Json;
using System;
using System.CodeDom;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Net.Http;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;
using System.Web.Security;
using System.Xml.Linq;
using ToolingRoomManagement.Areas.NVIDIA.Entities;

namespace ToolingRoomManagement.Areas.NVIDIA.Controllers
{
    public class AuthenticationController : Controller
    {        
        // GET: NVIDIA/Authentication

        // SignIn
        public ActionResult SignIn()
        {
            if (Request.Cookies["RememberSignIn"] != null)
            {
                string Username = Request.Cookies["RememberSignIn"]["Username"];
                string Password = Request.Cookies["RememberSignIn"]["Password"];
                
                using(var db = new ToolingRoomEntities())
                {
                    db.Configuration.LazyLoadingEnabled = false;

                    Entities.User user = db.Users.Include("UserRoles.Role")
                                                 .FirstOrDefault(u => u.Username == Username);

                    if (user != null && user.Status != "No Active")
                    {
                        if (HashValue(user.Password) == Password)
                        {
                            CreateCookieInfo(user);
                            CreateSession(user);

                            user.LastSignIn = DateTime.Now;
                            db.SaveChanges();

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
                using(var db = new ToolingRoomEntities())
                {
                    Entities.User user = db.Users.Include("UserRoles.Role")
                                                 .FirstOrDefault(u => u.Username == Username);
                    if (user != null && user.Status != "No Active")
                    {
                        if (user.Password == Password)
                        {
                            if (Remember)
                            {
                                CreateCookieRmb(user);
                            }
                            else
                            {
                                DeleteCookieRmb();
                            }
                            CreateCookieInfo(user);
                            CreateSession(user);

                            user.LastSignIn = DateTime.Now;
                            db.SaveChanges();

                            return Json(new { status = true, redirectTo = Url.Action("Index", "Dashboard", new { area = "NVIDIA" }) });
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
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message });
            }
        }

        public ActionResult Callback()
        {
            try
            {
                string code = Request.Params["code"];

                var handler = new JwtSecurityTokenHandler();
                var jwtSecurityToken = handler.ReadJwtToken(code);

                var username = jwtSecurityToken.Claims.FirstOrDefault(x => x.Type == "username").Value;
                Session["OauthCode"] = code;
                using(ToolingRoomEntities db = new ToolingRoomEntities())
                {
                    var user = db.Users.FirstOrDefault(u => u.Username == username);
                    if(user != null)
                    {
                        SignIn(user.Username, user.Password, true);
                        return RedirectToAction("Index", "Dashboard", "NVIDIA");
                    }
                    else
                    {
                        AddOrUpdateCookieValue("SmartOfficeMessage", "Please Sign Up and Contact us to Active your account.", 1);
                        return RedirectToAction("SignIn", "Authentication", "NVIDIA");
                    }
                    
                }
                
            }
            catch (Exception ex)
            {
                AddOrUpdateCookieValue("SmartOfficeMessage", ex.Message, 1);
                return RedirectToAction("SignIn", "Authentication", "NVIDIA");
            }
        }
        // SignOut
        [HttpPost]
        public JsonResult SignOut()
        {
            try
            {
                DeleteCookieRmb();
                DeleteSession();

                return Json(new { status = true, redirectTo = Url.Action("SignIn", "Authentication", new { area = "NVIDIA" }) });
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message });
            }
        }


        // SignUp
        public ActionResult SignUp()
        {
            return View();
        }
        [HttpPost]
        public async Task<ActionResult> SignUp(string Username, string Email, string CreatePassword, string ConfirmPassword, int Department)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(Username)) return Json(new { status = false, message = "Card ID is empty." });
                if (string.IsNullOrWhiteSpace(Email)) return Json(new { status = false, message = "Email is empty." });
                if (string.IsNullOrWhiteSpace(CreatePassword)) return Json(new { status = false, message = "Create Password is empty." });
                if (string.IsNullOrWhiteSpace(ConfirmPassword)) return Json(new { status = false, message = "Confirm Password is empty." });
                if (Department == 0) return Json(new { status = false, message = "Department is empty." });

                if(CreatePassword != ConfirmPassword) return Json(new { status = false, message = "Mismatched Create Password and Confirm Password." });

                var ApiData = await GetInfoUserAPI(Username);
                if (string.IsNullOrEmpty(ApiData) || string.IsNullOrWhiteSpace(ApiData)) return Json(new { error = true, message = "The Card ID does not exist in the HR system." });

                dynamic HrUser = JsonConvert.DeserializeObject(ApiData.ToString());

                Entities.User user = new Entities.User
                {
                    Username = Username,
                    Password = CreatePassword,
                    Email = Email,
                    CnName = HrUser.USER_NAME,
                    HireDate = HrUser.HIREDATE,
                    LeaveDate = HrUser.LEAVEDAY,
                    Status = "No Active",
                    CreatedDate = DateTime.Now
                };

                if(DateTime.Now >= user.LeaveDate)
                {
                    return Json(new { status = false, message = "User does not exist in the HR system." });
                }

                using(var db = new ToolingRoomEntities())
                {
                    if( db.Users.Any(u => u.Username == user.Username))
                    {
                        return Json(new { status = false, message = $"User {user.Username}  has been exists. <br/>If you forgot your password, please contact: <br/>[you-nan.ruan@mail.foxconn.com] (A-IOT Team)" });
                    }
                    else
                    {
                        db.Users.Add(user);
                        db.SaveChanges();
                    }
                }

                return Json(new { status = true, user, redirectTo = "/NVIDIA/Authentication/SignIn" });
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message });
            }
        }
        public JsonResult GetDepartments()
        {
            try
            {
                using(var db = new ToolingRoomEntities())
                {
                    List<Entities.Department> departments = db.Departments.ToList();

                    return Json(new { status = true, departments }, JsonRequestBehavior.AllowGet);
                }
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }
        private async Task<string> GetInfoUserAPI(string CardID)
        {
            try
            {
                HttpClient client = new HttpClient();
                string url = "http://10.224.69.100:8080/postman/api/hr/getEmpObj?id=" + CardID;
                HttpResponseMessage response = await client.GetAsync(url);
                response.EnsureSuccessStatusCode();

                if (response.Content.Headers.ContentLength > 2)
                {
                    var responseBody = await response.Content.ReadAsStringAsync();
                    return responseBody;
                }
                else
                {
                    return string.Empty;
                }
            }
            catch
            {
                return string.Empty;
            }
        }


        // Cookie Remember     
        private void CreateCookieRmb(Entities.User user)
        {
            HttpCookie rememberSignInCookie = new HttpCookie("RememberSignIn");

            rememberSignInCookie["Username"] = user.Username;
            rememberSignInCookie["Password"] = HashValue(user.Password);

            rememberSignInCookie.Expires = DateTime.Now.AddDays(15);

            Response.Cookies.Add(rememberSignInCookie);
        }
        private void DeleteCookieRmb()
        {
            Response.Cookies["RememberSignIn"].Expires = DateTime.Now.AddDays(-1);
        }
        // Cookie Info
        private void CreateCookieInfo(Entities.User user)
        {
            HttpCookie rememberSignInCookie = new HttpCookie("UserInfo");

            rememberSignInCookie["Id"] = user.Id.ToString();
            rememberSignInCookie["CardID"] = user.Username;
            rememberSignInCookie["VnName"] = user.VnName;
            rememberSignInCookie["CnName"] = user.CnName;
            rememberSignInCookie["EnName"] = user.EnName;

            rememberSignInCookie.Expires = DateTime.Now.AddDays(15);

            Response.Cookies.Add(rememberSignInCookie);
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
        public void AddOrUpdateCookieValue(string cookieName, string cookieValue, int expireDays)
        {
            if (!string.IsNullOrEmpty(cookieValue))
            {
                HttpCookie cookie = Request.Cookies[cookieName];

                if (cookie == null) cookie = new HttpCookie(cookieName);

                cookie.Value = cookieValue;
                cookie.Expires = DateTime.Now.AddDays(expireDays);
                Response.Cookies.Add(cookie);
            }
        }
    }
}