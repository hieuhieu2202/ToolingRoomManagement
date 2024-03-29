using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Data.Entity.Migrations;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Configuration;
using ToolingRoomManagement.Areas.NVIDIA.Entities;
using ToolingRoomManagement.Areas.NVIDIA.Data;

namespace ToolingRoomManagement.Areas.NVIDIA.Reseptory
{
    internal class RUser
    {
        /* GET */
        public static List<User> GetUsers()
        {
            using(ToolingRoomEntities dbContext = new ToolingRoomEntities())
            {
                dbContext.Configuration.LazyLoadingEnabled = false;

                var users = dbContext.Users.Include(u => u.UserRoles.Select(ur => ur.Role))
                                           .Include(u => u.UserDepartments.Select(ud => ud.Department))
                                           .ToList();

                users.RemoveAt(0);

                return users;

            }
        }
        public static User GetUser(int IdUser)
        {
            using (ToolingRoomEntities dbContext = new ToolingRoomEntities())
            {
                dbContext.Configuration.LazyLoadingEnabled = false;

                var user = dbContext.Users.Include(u => u.UserRoles.Select(ur => ur.Role))
                                           .Include(u => u.UserDepartments.Select(ud => ud.Department))
                                           .FirstOrDefault(u => u.Id == IdUser);

                return user;

            }
        }
        public static async Task<string> GetUserInformation(string username)

        {
            try
            {
                string apiUrl = WebConfigurationManager.AppSettings["HR_API"];
                using (HttpClient client = new HttpClient())
                {
                    HttpResponseMessage response = await client.GetAsync($"{apiUrl}{username}");

                    if (response.IsSuccessStatusCode)
                    {
                        return await response.Content.ReadAsStringAsync();
                    }
                    else
                    {
                        throw new Exception("User does not exists.");
                    }
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        /* SET */
        public static User CreateUser(User user)
        {
            try
            {
                using(ToolingRoomEntities dbContext = new ToolingRoomEntities())
                {
                    dbContext.Configuration.LazyLoadingEnabled = false;

                    CreateValidate_User(dbContext, user);

                    user.Username = user.Username.Trim().ToUpper();
                    user.UserRoles.Add(new UserRole { IdUser = user.Id, IdRole = 7 }); // 7 = GUEST
                    dbContext.Users.Add(user);
                    dbContext.SaveChanges();

                    return user;
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }

        }
        public static User UpdateUser(User user)
        {
            try
            {
                using(ToolingRoomEntities dbContext = new ToolingRoomEntities())
                {
                    dbContext.Configuration.LazyLoadingEnabled = false;

                    user.Username = user.Username.Trim().ToUpper();
                    UpdateValidate_User(dbContext, user);

                    var dbUser = dbContext.Users.FirstOrDefault(u => u.Username == user.Username);

                    dbUser.Username = user.Username;                  
                    dbUser.Email = user.Email;
                    dbUser.VnName = user.VnName;
                    dbUser.CnName = user.CnName;
                    dbUser.EnName = user.EnName;
                    dbUser.Status = user.Status;
                    dbUser.CreatedDate = user.CreatedDate;

                    if ((user.Password != null || !string.IsNullOrEmpty(user.Password)) && dbUser.Password != user.Password)
                    {
                        dbUser.Password = user.Password;
                    }

                    dbContext.Users.AddOrUpdate(dbUser);
                    dbContext.SaveChanges();

                    return user;
                }               
            }
            catch (Exception ex)
            {
                throw ex; 
            }
        }
        public static User DeleteUser(User user)
        {
            try
            {
                using (ToolingRoomEntities dbContext = new ToolingRoomEntities())
                {
                    dbContext.Configuration.LazyLoadingEnabled = false;

                    var dbUser = dbContext.Users.FirstOrDefault(u => u.Id == user.Id);
                    var sessionUser = Data.Common.GetSessionUser();

                    if (dbUser != null && dbUser.Username != "admin" && user.Username != sessionUser.Username)
                    {
                        if(dbUser.Status == "DELETED")
                        {
                            dbContext.Users.Remove(dbUser);
                            dbContext.SaveChanges();
                            return null;
                        }
                        else
                        {
                            dbUser.Status = "DELETED";
                            dbContext.Users.AddOrUpdate(dbUser);
                            dbContext.SaveChanges();
                            return GetUser(dbUser.Id);
                        }                        

                        
                    }
                    else
                    {
                        throw new Exception("You can't delete this user.");
                    }
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        /* VALIDATE */
        private static bool CreateValidate_User(ToolingRoomEntities dbContext,  User user)
        {
            if (string.IsNullOrEmpty(user.Username) || user.Username.Length < 6)
            {
                throw new Exception ("Please double check your username.");
            }
            if (string.IsNullOrEmpty(user.Password) && user.Password.Length < 6)
            {
                throw new Exception("Please double check your password.");
            }
            if (string.IsNullOrEmpty(user.VnName) && string.IsNullOrEmpty(user.EnName) && string.IsNullOrEmpty(user.CnName))
            {
                throw new Exception("Please double check your name.");
            }

            // Kiểm tra user đã tồn tại chưa
            if(dbContext.Users.Any(u => u.Username == user.Username))
            {
                throw new Exception("User already exists.");
            }

            return true;
        }
        private static bool UpdateValidate_User(ToolingRoomEntities dbContext, User user)
        {
            user.Username = user.Username.Trim().ToUpper();
            var dbUser = dbContext.Users.FirstOrDefault(u => u.Username == user.Username);

            if (string.IsNullOrEmpty(user.Username) || user.Username.Length < 6)
            {
                throw new Exception("Please double check your username.");
            }

            if(!string.IsNullOrEmpty(user.Password) && dbUser.Password != user.Password)
            {
                if (user.Password.Length < 6)
                {
                    throw new Exception("Please double check your password.");
                }
            }           

            if (string.IsNullOrEmpty(user.VnName) && string.IsNullOrEmpty(user.EnName) && string.IsNullOrEmpty(user.CnName))
            {
                throw new Exception("Please double check your name.");
            }

            // Nếu thay đổi Card Id thì kiểm tra Card Id đó đã tồn tại chưa?
            if (dbUser.Username != user.Username && dbContext.Users.Any(u => u.Username == user.Username))
            {
                throw new Exception("User already exists.");
            }

            return true;
        }
    }
}