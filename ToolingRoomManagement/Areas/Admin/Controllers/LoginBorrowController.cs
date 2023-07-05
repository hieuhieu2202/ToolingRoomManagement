using Model.Dao;
using Model.EF;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using ToolingRoomManagement.Common;
using ToolingRoomManagement.Models;

namespace ToolingRoomManagement.Areas.Admin.Controllers
{
    public class LoginBorrowController : Controller
    {
        const string DefaultLangCode = "en";
        // GET: Admin/BorrowProduct
        ToolingRoomDbContext context = new ToolingRoomDbContext();
        public ActionResult LoginPage()
        {
            ViewBag.LangCode = Session["LANGUAGE"] ?? DefaultLangCode;
            HttpCookie cookie = Request.Cookies["user_borrow"];
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
                    return RedirectToAction("ManagerUserBorrow", "BorrowProduct");
                }
                else if (user.role_id == 2)
                {
                    return RedirectToAction("UserBorrow", "BorrowProduct");
                }
                else if (user.role_id == 6)
                {
                    return RedirectToAction("AccountantPD", "BorrowProduct");
                }
                else if (user.role_id == 7)
                {
                    return RedirectToAction("ManagerPD", "BorrowProduct");
                }
                else if (user.role_id == 8)
                {
                    return RedirectToAction("LeaderManager", "BorrowProduct");
                }
                else if (user.role_id == 9)
                {
                    return RedirectToAction("ManagerPD1", "BorrowProduct");
                }
                else if (user.role_id == 10)
                {
                    return RedirectToAction("LeaderShift", "BorrowProduct");
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
                            where dt.code_people.Replace("\r\n", "") == code
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
                            HttpCookie cookie = new HttpCookie("user_borrow", model.UserName + "," + Encryptor.MD5Hash(model.Password) + ',' + user.fullname);
                            cookie.Expires = DateTime.Now.AddDays(7);
                            Response.SetCookie(cookie);
                            return RedirectToAction("ManagerUserBorrow", "BorrowProduct");
                        }
                        else if (user.role_id == 2)
                        {
                            HttpCookie cookie = new HttpCookie("user_borrow", model.UserName + "," + Encryptor.MD5Hash(model.Password) + ',' + user.fullname);
                            cookie.Expires = DateTime.Now.AddDays(7);
                            Response.SetCookie(cookie);
                            return RedirectToAction("UserBorrow", "BorrowProduct");
                        }
                        else if (user.role_id == 6)
                        {
                            HttpCookie cookie = new HttpCookie("user_borrow", model.UserName + "," + Encryptor.MD5Hash(model.Password) + ',' + user.fullname);
                            cookie.Expires = DateTime.Now.AddDays(7);
                            Response.SetCookie(cookie);
                            return RedirectToAction("AccountantPD", "BorrowProduct");
                        }
                        else if (user.role_id == 7)
                        {
                            HttpCookie cookie = new HttpCookie("user_borrow", model.UserName + "," + Encryptor.MD5Hash(model.Password) + ',' + user.fullname);
                            cookie.Expires = DateTime.Now.AddDays(7);
                            Response.SetCookie(cookie);
                            return RedirectToAction("ManagerPD", "BorrowProduct");
                        }
                        else if (user.role_id == 8)
                        {
                            HttpCookie cookie = new HttpCookie("user_borrow", model.UserName + "," + Encryptor.MD5Hash(model.Password) + ',' + user.fullname);
                            cookie.Expires = DateTime.Now.AddDays(7);
                            Response.SetCookie(cookie);
                            return RedirectToAction("LeaderManager", "BorrowProduct");
                        }
                        else if (user.role_id == 9)
                        {
                            HttpCookie cookie = new HttpCookie("user_borrow", model.UserName + "," + Encryptor.MD5Hash(model.Password) + ',' + user.fullname);
                            cookie.Expires = DateTime.Now.AddDays(7);
                            Response.SetCookie(cookie);
                            return RedirectToAction("ManagerPD1", "BorrowProduct");
                        }
                        else if (user.role_id == 10)
                        {
                            HttpCookie cookie = new HttpCookie("user_borrow", model.UserName + "," + Encryptor.MD5Hash(model.Password) + ',' + user.fullname);
                            cookie.Expires = DateTime.Now.AddDays(7);
                            Response.SetCookie(cookie);
                            return RedirectToAction("LeaderShift", "BorrowProduct");
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
            update.password = Encryptor.MD5Hash(pass);
            context.SaveChanges();

            if (Request.Cookies["user_borrow"] != null)
            {
                Response.Cookies["user_borrow"].Expires = DateTime.Now.AddDays(-1);
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
            if (update.password.Replace("\r\n", "").Trim() == Encryptor.MD5Hash(pass))
            {
                return "OK";
            }
            else
            {
                return "NG";
            }
        }
        public ActionResult Logout()
        {
            if (Request.Cookies["user_borrow"] != null)
            {
                Response.Cookies["user_borrow"].Expires = DateTime.Now.AddDays(-1);
                Response.Redirect("/Home/Index");
            }
            Session.Add(CommonConstants.USER_SESSION, null);
            return RedirectToAction("/Home/Index");
        }
    }
}