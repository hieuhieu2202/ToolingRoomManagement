using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Model.EF;
using ToolingRoomManagement.Models;
using ToolingRoomManagement.Common;
using Model.Dao;

namespace ToolingRoomManagement.Areas.Admin.Controllers
{
    public class LoginController : Controller
    {
        const string DefaultLangCode = "en";
        // GET: Admin/Login
        ToolingRoomDbContext context = new ToolingRoomDbContext();
        public ActionResult Index()
        {
            ViewBag.LangCode = Session["LANGUAGE"] ?? DefaultLangCode;
            HttpCookie cookie = Request.Cookies["user_tooling"];
            if (cookie != null)
            {

                string username = cookie.Value.Split(',').First();
                string pass = cookie.Value.Split(',').Last();
                var dao = new User_Dao();
                var result = dao.Login(username, pass);
                //condi
                Session[CommonConstants.USER_SESSION] = null;
                var user = dao.GetByID(username);
                var userSession = new UserLogin();
                userSession.UserName = user.username;
                userSession.UserID = user.id;
                userSession.GroupID = user.role_id;
                userSession.Password = user.password;
                userSession.Fullname = user.fullname;
                userSession.Part = user.part_id;
                //userSession.ImgAvatar = user.img_user;
                Session.Add(CommonConstants.USER_SESSION, userSession);
                if (user.role_id == 1)
                {
                    return RedirectToAction("Index", "Admin");
                }
                else if (user.role_id == 2)
                {
                    return RedirectToAction("UserPage", "Admin");
                }
                else if (user.role_id == 3)
                {
                    return RedirectToAction("StaffPage", "Admin");
                }else if (user.role_id == 4)
                {
                    return RedirectToAction("Confirm_Page", "Admin");
                }

            }
            //ViewBag.listPart = new Part_Dao().listAllPart();
            return View();
        }
        public string getFullnameUser(string code)
        {
            try
            {
                var find = (from dt in context.People
                            where dt.code_people.Replace("\r\n","") == code
                            select dt).SingleOrDefault();
                var fullname = find.fullname;
                return fullname;
            }
            catch
            {
                return "NG";
            }
            
        }
        public ActionResult Login(LoginModel model)
        {

            Session[CommonConstants.USER_SESSION] = null;
            var dao = new User_Dao();
            if (model.Password != null)
            {
                var result = dao.Login(model.UserName, Encryptor.MD5Hash(model.Password));
                if (ModelState.IsValid)
                {
                    if (result == 1)
                    {
                        var user = dao.GetByID(model.UserName);
                        var userSession = new UserLogin();
                        userSession.UserName = user.username;
                        userSession.UserID = user.id;
                        userSession.GroupID = user.role_id;
                        userSession.Password = user.password;
                        userSession.Fullname = user.fullname;
                        //userSession.FullName = user.fullname;
                        //userSession.ImgAvatar = user.img_user;
                        Session.Add(CommonConstants.USER_SESSION, userSession);
                        if (user.role_id == 1)
                        {
                            HttpCookie cookie = new HttpCookie("user_tooling", model.UserName + "," + Encryptor.MD5Hash(model.Password) + ',' + user.fullname);
                            cookie.Expires = DateTime.Now.AddDays(7);
                            Response.SetCookie(cookie);
                            return RedirectToAction("Index", "Admin");
                        }
                        else if (user.role_id == 2)
                        {
                            HttpCookie cookie = new HttpCookie("user_tooling", model.UserName + "," + Encryptor.MD5Hash(model.Password) + ',' + user.fullname);
                            cookie.Expires = DateTime.Now.AddDays(7);
                            Response.SetCookie(cookie);
                            return RedirectToAction("UserPage", "Admin");
                        }else if (user.role_id == 3)
                        {
                            HttpCookie cookie = new HttpCookie("user_tooling", model.UserName + "," + Encryptor.MD5Hash(model.Password) + ',' + user.fullname);
                            cookie.Expires = DateTime.Now.AddDays(7);
                            Response.SetCookie(cookie);
                            return RedirectToAction("StaffPage", "Admin");
                        }
                        else if (user.role_id == 4)
                        {
                            HttpCookie cookie = new HttpCookie("user_tooling", model.UserName + "," + Encryptor.MD5Hash(model.Password) + ',' + user.fullname);
                            cookie.Expires = DateTime.Now.AddDays(7);
                            Response.SetCookie(cookie);
                            return RedirectToAction("Confirm_Page", "Admin");
                        }
                        else
                        {
                            ModelState.AddModelError("", "You do not have access to the site!");
                        }
                    }
                    else if (result == 0)
                    {
                        ModelState.AddModelError("", "Account does not exist!");
                    }
                    else if (result == -1)
                    {
                        ModelState.AddModelError("", "Password incorect!");
                    }
                }
            }
            else
            {
                ModelState.AddModelError("", "");
            }
            return View("Index");
        }
        public string ChangePassword(string pass)
        {
            var session = (ToolingRoomManagement.Common.UserLogin)Session[ToolingRoomManagement.Common.CommonConstants.USER_SESSION];
            int user_id = Int32.Parse(session.UserID.ToString());
            var update = (from dt in context.Users
                                  where dt.id == user_id
                                  select dt).FirstOrDefault();
            update.password =Encryptor.MD5Hash(pass);
            context.SaveChanges();

            if (Request.Cookies["user_tooling"] != null)
            {
                Response.Cookies["user_tooling"].Expires = DateTime.Now.AddDays(-1);
                return "OK";
            }
            Session.Add(CommonConstants.USER_SESSION, null);
            return "OK";
        }
        public string ChangeInformation()
        {
            return "";
        }
        public string checkPass(string pass)
        {
            var session = (ToolingRoomManagement.Common.UserLogin)Session[ToolingRoomManagement.Common.CommonConstants.USER_SESSION];
            int user_id = Int32.Parse(session.UserID.ToString());
            var update = (from dt in context.Users
                                  where dt.id == user_id
                                  select dt).FirstOrDefault();
            if (update.password.Replace("\r\n","").Trim() == Encryptor.MD5Hash(pass))
            {
                return "OK";
            }
            else
            {
                return "NG";
            }
        }
        public string LoginGolden(string user_name,string password)
        {
            var userSession = new SessionPart();
            var user = new User_Dao().GetByID(user_name);
            if (user != null)
            {
                if (user.password.Trim() == password.Trim())
                {
                    userSession.part = user_name;
                    Session.Add(CommonConstants.SessionPart, userSession);
                    return "OK";
                }
                else
                {
                    return "NG";
                }
            }
            else
            {
                return "Account Not Exist!";
            }
        }
        public ActionResult Logout_Golden()
        {
            Session.Add(CommonConstants.SessionPart, null);
            return RedirectToAction("/Admin/Admin/Golden_View");
        }
        public ActionResult Logout()
        {
            if (Request.Cookies["user_tooling"] != null)
            {
                Response.Cookies["user_tooling"].Expires = DateTime.Now.AddDays(-1);
                Response.Redirect("/Home/Index");
            }
            Session.Add(CommonConstants.USER_SESSION, null);
            return RedirectToAction("/Home/Index");
        }
    }
}