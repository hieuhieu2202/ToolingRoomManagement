using Model.EF;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Model.Dao
{
    public class Receive_Dao
    {
        ToolingRoomDbContext db = null;
        public Receive_Dao()
        {
            db = new ToolingRoomDbContext();
        }
        public List<Receive> listAllReceive()
        {
            return db.Receives.ToList();
        }
        public List<Receive> listAllReceive_Back(int role,int user_id)
        {
            if(role==1)
            {
                return db.Receives.Where(x => x.receive_type == 2 && x.manager_id == user_id).ToList();
            }
            else if (role == 4 || role == 3)
            {
                return db.Receives.Where(x => x.receive_type == 2).ToList();
            }
            else
            {
                return db.Receives.Where(x => x.receive_type == 2 && x.user_create_id== user_id).ToList();
            }
            
        }
        public List<Receive> listAllReceive_Get()
        {
            return db.Receives.Where(x => x.receive_type == 1).ToList();
        }
        public List<Receive> listAllReceiveManager_Get(int user_id)
        {
            return db.Receives.Where(x => x.receive_type == 1 && x.manager_id==user_id || x.receive_type == 1&&x.add_manager==user_id).ToList();
        }
        public List<Receive> listAllReceiveManager_Back(int user_id)
        {
            return db.Receives.Where(x => x.receive_type == 2 && x.manager_id == user_id|| x.receive_type == 2 && x.add_manager == user_id).ToList();
        }
        public List<Receive> listReceive_User_Id(int user_id, int? role)
        {
            if (role == 1 || role == 3 || role==4)
            {
                return db.Receives.ToList();
            }
            else
            {
                return db.Receives.Where(x => x.user_create_id == user_id).ToList();
            }

        }
        
        public Receive Select_Receive(int id)
        {
            return db.Receives.SingleOrDefault(x => x.id == id);
        }
        public int Insert(string code_receive,string receive_name,string manager_confirm,string create_by,string note,int manager_id,int user_id, int status, int type_receive)
        {
            Receive receive = new Receive();
            receive.code_receive = code_receive;
            receive.receive_name = receive_name;
            receive.manager_confirm = manager_confirm;
            receive.create_by = create_by;
            receive.create_date = DateTime.Now;
            receive.note = note;
            receive.status = status;
            receive.manager_id = manager_id;
            receive.user_create_id = user_id;
            receive.receive_type = type_receive;
            db.Receives.Add(receive);
            db.SaveChanges();
            return receive.id;
        }
        public bool Delete(int id)
        {
            try
            {
                var re = db.Receives.Find(id);
                db.Receives.Remove(re);
                db.SaveChanges();
                return true;
            }
            catch (Exception)
            {
                return false;
            }
        }
        public List<Receive> listReceive_Manager(int manager_id)
        {
            return db.Receives.Where(x => x.status == 1 && x.manager_id == manager_id ).ToList();
        }
        public List<Receive> listReceive_Transfer(int manager_id)
        {
            return db.Receives.Where(x => x.status == 6 && x.add_manager == manager_id).ToList();
        }
        public List<Receive> listReceive_Manager_OK()
        {
            return db.Receives.Where(x => x.status == 2).ToList();
        }
        public List<Receive> listReceive_CThan_OK()
        {
            return db.Receives.Where(x => x.status == 5).ToList();
        }
        public List<Receive> listReceive_Back_Check()
        {
            return db.Receives.Where(x => x.status == 7).ToList();
        }
        public List<Receive> listReceive_CThan(int user_id)
        {
            return db.Receives.Where(x => x.status == 2).ToList();
        }
        public List<Receive> listReceive_CThan_Check(int user_id)
        {
            return db.Receives.Where(x => x.manager_id == user_id && x.receive_type==1).ToList();
        }
        
        public List<Receive> listReceive_ManagerOK_User(int user_id)
        {
            return db.Receives.Where(x => x.user_create_id == user_id && x.status == 2).ToList();
        }
        public List<Receive> listReceive_CThanOK_User(int user_id,int? role)
        {
            if (role == 1 || role == 3)
            {
                return db.Receives.Where( x=>x.status == 2).ToList();
            }
            else
            {
                return db.Receives.Where(x => x.user_create_id == user_id && x.status == 2).ToList();
            }
        }
        public List<Receive> listReceive_User_OK(int user_id)
        {
            return db.Receives.Where(x => x.user_create_id == user_id && x.status == 4).ToList();
        }

        //Đơn đợi lĩnh
        public List<Receive> listOrder_OK(int user_id)
        {
            return db.Receives.Where(x => x.status == 5 && x.user_create_id==user_id).ToList();
        }
        public List<Receive> listReceive_Staff_Complete(int role,int user_id)
        {
            if (role == 1 )
            {
                return db.Receives.Where(x => x.status == 4 && x.receive_type == 1&&x.manager_id==user_id).ToList();
            }else if (role == 4 || role == 3)
            {
                return db.Receives.Where(x => x.status == 4 && x.receive_type == 1).ToList();
            }
            else
            {
                return db.Receives.Where(x => x.status == 4 && x.receive_type == 1 && x.user_create_id==user_id).ToList();
            }
        }
        public List<Receive> listReceive_User_NotYet(int user_id)
        {
            return db.Receives.Where(x => x.status == 1 && x.user_create_id == user_id || x.status==6 && x.user_create_id==user_id).ToList();
        }
        public List<Receive> listReceive_Reject(int role,int user_id)
        {
            if (role == 1 )
            {
                return db.Receives.Where(x => x.status == 3 && x.receive_type == 1 && x.manager_id == user_id).ToList();
            }else if(role == 4 || role == 3)
            {
                return db.Receives.Where(x => x.status == 3 && x.receive_type == 1).ToList();
            }
            else
            {
                return db.Receives.Where(x => x.status == 3 && x.user_create_id==user_id && x.receive_type == 1).ToList();
            }
        }
        public List<Receive> listReceive_Wait(int role, int user_id)
        {
            if (role == 1 )
            {
                return db.Receives.Where(x => x.status == 1 || x.status == 2 || x.status == 5 || x.status == 6).ToList().Where(x => x.receive_type == 1 && x.manager_id == user_id).ToList();
            }else if(role == 4 || role == 3)
            {
                return db.Receives.Where(x => x.status == 1 || x.status == 2 || x.status == 5 || x.status == 6).ToList().Where(x => x.receive_type == 1).ToList();
            }
            else
            {
                return db.Receives.Where(x => x.user_create_id == user_id && x.receive_type == 1).ToList().Where(x=> x.status == 1 || x.status == 2 || x.status == 5 || x.status == 6).ToList();
            }
        }

    }
}
