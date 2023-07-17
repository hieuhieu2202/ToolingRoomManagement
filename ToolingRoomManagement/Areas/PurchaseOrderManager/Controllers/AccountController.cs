using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using ToolingRoomManagement.Common;

namespace ToolingRoomManagement.Areas.PurchaseOrderManager.Controllers
{
    public class AccountController : Controller
    {
        // GET: PurchaseOrderManager/Account
        public ActionResult Index()
        {
            User user = (User)Session["LoginUser"];
            if(user != null)
            {
                return RedirectToAction("Home", "QuotationRequest", new { area = "PurchaseOrderManager" });
            }
            else
            {
                return View();
            }            
        }

        // Login
        public ActionResult Login(string CardId, string Password)
        {
            CardId = CardId.Trim().ToUpper();
            string ValidMessage = IsValidLogin(CardId, Password);

            if (ValidMessage == "Valid")
            {
                return Json(new { success = true, redirectTo = Url.Action("Index", "DashBoard", new { area = "PurchaseOrderManager" }) });
            }
            else
            {
                return Json(new { error = true, message = ValidMessage });
            }
        }

        // Valid
        private string IsValidLogin(string cardId, string password)
        {
            try
            {
                using(PurchaseOrderEntities db = new PurchaseOrderEntities())
                {
                    User owner = db.Users.FirstOrDefault(o => o.username == cardId);

                    if (string.IsNullOrEmpty(cardId) || cardId == "undefined")
                        return "Card ID is missing or invalid!";

                    if (cardId.Length != 8 || !cardId.All(char.IsLetterOrDigit))
                        return "Invalid Card ID format! Card ID should be 8 characters long and consist of letters and digits only.";

                    if (string.IsNullOrEmpty(password) || password == "undefined")
                        return "Password is missing or invalid!";

                    if (password.Length < 6 || password.Length > 20)
                        return "Invalid password length! Password should be between 6 and 20 characters.";

                    if (owner == null)
                        return "User does not exist!";

                    if (owner.password.Substring(0, 32) != Encryptor.MD5Hash(password))
                        return "Incorrect password!";

                    CreateSessionLogin(owner);

                    return "Valid";
                }             
            }
            catch (Exception ex)
            {
                return ex.Message;
            }
        }
        private void CreateSessionLogin(User owner)
        {
            Session["LoginUser"] = owner;
        }
    }
}