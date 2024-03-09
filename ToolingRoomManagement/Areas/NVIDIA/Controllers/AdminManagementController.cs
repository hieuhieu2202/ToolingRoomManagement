using Newtonsoft.Json;
using System;
using System.Data.Entity.Migrations;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Configuration;
using System.Web.Mvc;
using ToolingRoomManagement.Areas.NVIDIA.Entities;
using ToolingRoomManagement.Attributes;

namespace ToolingRoomManagement.Areas.NVIDIA.Controllers
{
    public class AdminManagementController : Controller
    {
        ToolingRoomEntities db = new ToolingRoomEntities();

        // GET: NVIDIA/AdminManagement/UserManagement
        #region User Management
        public ActionResult UserManagement()
        {
            return View();
        }

        [HttpGet]
        [Authentication(Role = "admin")]
        public JsonResult GetUsers()
        {
            try
            {
                var users = db.Users.ToList();
                users.RemoveAt(0);
                return Json(new { status = true, users = JsonConvert.SerializeObject(users) }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new {status = false, message = ex.Message}, JsonRequestBehavior.AllowGet);
            }
        }
        public JsonResult GetUser(int Id)
        {
            try
            {
                var user = db.Users.FirstOrDefault(u => u.Id == Id);
                if(user != null)
                {
                    return Json(new { status = true, user = JsonConvert.SerializeObject(user) }, JsonRequestBehavior.AllowGet);
                }
                else
                {
                    return Json(new { status = false, message = "User does not exists." }, JsonRequestBehavior.AllowGet);
                }
                
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }
        public async Task<JsonResult> GetUserInformation(string username)
        {
            try
            {
                string apiUrl = WebConfigurationManager.AppSettings["HR_API"];
                using (HttpClient client = new HttpClient())
                {
                    HttpResponseMessage response = await client.GetAsync($"{apiUrl}{username}");

                    if (response.IsSuccessStatusCode)
                    {
                        string jsonResponse = await response.Content.ReadAsStringAsync();
                        return Json(new { status = true, data = jsonResponse }, JsonRequestBehavior.AllowGet);
                    }
                    else
                    {
                        return Json(new { status = false, message = response.StatusCode }, JsonRequestBehavior.AllowGet);
                    }
                }
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        [HttpPost]
        public JsonResult CreateUser(User user)
        {
            try
            {
                if (!db.Users.Any(u => u.Username == user.Username))
                {
                    var ValidateMessage = ValidateUser(user);
                    if (string.IsNullOrEmpty(ValidateMessage))
                    {
                        user.Username = user.Username.Trim().ToUpper();

                        db.Users.Add(user);
                        db.SaveChanges();

                        return Json(new { status = true, user = JsonConvert.SerializeObject(user) }, JsonRequestBehavior.AllowGet);
                    }
                    else
                    {
                        return Json(new { status = false, message = ValidateMessage }, JsonRequestBehavior.AllowGet);
                    }
                }
                else
                {
                    return Json(new { status = false, message = "User already exists." }, JsonRequestBehavior.AllowGet);
                }
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
            
        }
        public JsonResult UpdateUser(User user)
        {
            try
            {
                var updateUser = db.Users.FirstOrDefault(u => u.Username == user.Username);
                if (updateUser != null)
                {
                    var ValidateMessage = ValidateUser(user);

                    updateUser.Username = user.Username;
                    updateUser.Password = user.Password;
                    updateUser.Email = user.Email;
                    updateUser.VnName = user.VnName;
                    updateUser.CnName = user.CnName;
                    updateUser.EnName = user.EnName;
                    updateUser.Status = user.Status;
                    updateUser.CreatedDate = user.CreatedDate;

                   
                    if (string.IsNullOrEmpty(ValidateMessage))
                    {
                        db.Users.AddOrUpdate(updateUser);
                        db.SaveChanges();

                        return Json(new { status = true, user = JsonConvert.SerializeObject(updateUser) }, JsonRequestBehavior.AllowGet);
                    }
                    else
                    {
                        return Json(new { status = false, message = ValidateMessage }, JsonRequestBehavior.AllowGet);
                    }
                }
                else
                {
                    return Json(new { status = false, message = "User does not exists." }, JsonRequestBehavior.AllowGet);
                }
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message }, JsonRequestBehavior.AllowGet);
            }

        }
        public JsonResult DeleteUser(int Id)
        {
            try
            {
                var user = db.Users.FirstOrDefault(u => u.Id == Id);
                var sessionUser = Common.GetSessionUser();

                if (user != null && user.Username != "admin" && user.Username != sessionUser.Username)
                {
                    if(user.Status == "Deleted")
                    {
                        db.Users.Remove(user);
                        db.SaveChanges();

                        return Json(new { status = true, action = "Deleted" });
                    }
                    else
                    {
                        user.Status = "Deleted";
                        db.Users.AddOrUpdate(user);
                        db.SaveChanges();

                        return Json(new { status = true, user = JsonConvert.SerializeObject(user), action = "Hidden" });
                    }  
                }
                else
                {
                    return Json(new { status = false, message = "User does not exists." });
                }
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message });
            }
        }

        public string ValidateUser(User user)
        {
            if (user.Username == null || user.Username == string.Empty || user.Username.Length < 6)
            {
                return "Please double check your username.";
            }
            if (user.Password == null || user.Password == string.Empty || user.Password.Length < 6)
            {
                return "Please double check your password.";
            }
            if ((user.VnName == null || user.VnName == string.Empty) && (user.EnName == null || user.EnName == string.Empty) && (user.CnName == null || user.CnName == string.Empty))
            {
                return "Please double check your name.";
            }
            //if (DateTime.Now > user.LeaveDate)
            //{
            //    return "User not found.";
            //}

            return string.Empty;
        }
        #endregion

        // GET: NVIDIA/AdminManagement/UserRoleManagement
        #region Role Management
        [Authentication(Role = "admin")]
        public ActionResult RoleManagement()
        {
            return View();
        }

        [HttpGet]
        public JsonResult GetRoles()
        {
            try
            {
                var roles = db.Roles.ToList();
                return Json(new { status = true, roles }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }
        public JsonResult GetRoleUsers(int IdRole)
        {
            try
            {
                var users = db.Users.Where(u => u.UserRoles.Any(ur => ur.IdRole == IdRole)).ToList();
                return Json(new { status = true, users }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { status = false, message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }
        #endregion
    }
}