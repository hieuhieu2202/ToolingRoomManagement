using Model.EF;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Model.Dao
{
    public class ClipOutput_Dao
    {
        ToolingRoomDbContext db = null;
        public ClipOutput_Dao()
        {
            db = new ToolingRoomDbContext();
        }
        public List<ClipOutput> ClipOutput_Receive(int receive_id)
        {
            return db.ClipOutputs.Where(x => x.receive_id==receive_id).ToList();
        }
        public int Insert(int receive_id,int device_id,float quantity,int type,string note,string ngaytra)
        {
            ClipOutput clip = new ClipOutput();
            clip.receive_id = receive_id;
            clip.device_id = device_id;
            clip.quantity = quantity;
            clip.type = type;
            clip.note = note;
            clip.create_date = DateTime.Now;
            if (ngaytra !=null)
            {
                clip.ngaytra = formatDate(ngaytra);
            }
            
            db.ClipOutputs.Add(clip);
            db.SaveChanges();
            return clip.id;
        }
        public bool Delete(int id)
        {
            try
            {
                var pro = db.ClipOutputs.Find(id);
                db.ClipOutputs.Remove(pro);
                db.SaveChanges();
                return true;
            }
            catch (Exception)
            {
                return false;
            }
        }
        public bool DeleteByReceive(int receive_id)
        {
            try
            {
                var pro = db.ClipOutputs.Where(x=>x.receive_id==receive_id).ToList();
                if (pro != null)
                {
                    foreach(var item in pro)
                    {
                        db.ClipOutputs.Remove(item);
                    }
                } 
                db.SaveChanges();
                return true;
            }
            catch (Exception)
            {
                return false;
            }
        }
        public DateTime formatDate(string date)
        {

            return DateTime.ParseExact(date.Replace(" ", ""), "yyyy-MM-dd", null);

        }
    }
}
