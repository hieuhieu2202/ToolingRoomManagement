using Model.Dao;
using Model.EF;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using ToolingRoomManagement.Common;
using ToolingRoomManagement.Models;

namespace ToolingRoomManagement.Controllers
{
    public class RegisterController : Controller
    {
        // GET: Register
        public ActionResult Index()
        {
            return View();
        }
        public ActionResult Create_Account(RegisterModel model)
        {
            if (ModelState.IsValid)
            {
                var dao = new User_Dao();
                if (dao.CheckUserName(model.UserName))
                {
                    ModelState.AddModelError("", "Username already exist!");
                    return Json("NG");
                }
                else
                {
                    if (model.Password.Length >= 6)
                    {
                        if (model.Password == model.ConfirmPassword)
                        {
                            var user = new User();
                            user.fullname = model.fullName;
                            user.username = model.UserName;
                            user.phone = model.Phone;
                            user.part_id = model.PartID;
                            user.password = Encryptor.MD5Hash(model.Password.Trim());
                            user.create_date = DateTime.Now;
                            user.role_id = 2;
                            var result = dao.Insert(user);
                            if (result > 0)
                            {
                                ViewBag.Success = "Success";
                                model = new RegisterModel();
                                return Json("OK");
                            }
                            else
                            {
                                ModelState.AddModelError("", "Unsuccessful");
                                return Json("NOK");
                            }
                        }
                        else
                        {
                            ModelState.AddModelError("", "Confirm password incorect!");
                            return Json("NOK");
                        }
                    }
                    else
                    {
                        ModelState.AddModelError("", "Min length 6 keys");
                        return Json("NOK");
                    }
                }
            }
            else
            {
                return Json("NOK");
            }
            
        }
    }
}