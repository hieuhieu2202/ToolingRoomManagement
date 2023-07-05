using Model.EF;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Model.Dao
{
    public class User_Dao
    {
        ToolingRoomDbContext db = null;
        public User_Dao()
        {
            db = new ToolingRoomDbContext();
        }
        public int Login(string username, string password)
        {
            var result = db.Users.SingleOrDefault(x => x.username == username);
            if (result == null)
            {
                return 0;
            }
            else
            {
                if (result.password.Trim() == password)
                {
                    return 1;
                }
                else
                    return -1;
            }
        }
        public User FindById(int id)
        {
            return db.Users.SingleOrDefault(x => x.id == id);
        }
        public User GetByID(string userName)
        {
            return db.Users.SingleOrDefault(x => x.username == userName);
        }
        public bool CheckUserName(string username)
        {
            return db.Users.Count(x => x.username == username) > 0;
        }
        public bool CheckEmail(string email)
        {
            return db.Users.Count(x => x.mail == email) > 0;
        }

        //Register
        public long Insert(User entity)
        {
            db.Users.Add(entity);
            entity.create_date = DateTime.Now;
            db.SaveChanges();
            return entity.id;
        }

        //List All User
        public List<User> listUserManager()
        {
            return db.Users.Where(x => x.role_id == 1 || x.role_id==4).ToList();
        }
    }
}
