using Model.EF;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Model.Dao
{
    public class Golden_Dao
    {
        ToolingRoomDbContext db = null;
        public Golden_Dao()
        {
            db = new ToolingRoomDbContext();
        }
        public List<Golden> ListAllGolden()
        {
            return db.Goldens.ToList();
        }
        public List<Golden> ListAllGolden(string part)
        {
            return db.Goldens.Where(x=>x.Part==part).ToList();
        }
        public int Insert(string golden_name,string golden_mac,string model_name,string group_name,string create_date,string end_date,string file_name,string part,string create_by)
        {
            Golden golden = new Golden();
            golden.Golden_Name = golden_name;
            golden.Mac = golden_mac;
            golden.Model_Name = model_name;
            golden.Group_Name = group_name;
            golden.Create_Date = create_date;
            golden.End_Date = end_date;
            golden.File_Name = file_name;
            golden.Part = part;
            golden.Create_People = create_by;
            db.Goldens.Add(golden);
            db.SaveChanges();
            return golden.id;
        }
        public bool Delete(int id)
        {
            try
            {
                var go = db.Goldens.Find(id);
                db.Goldens.Remove(go);
                db.SaveChanges();
                return true;
            }
            catch (Exception)
            {
                return false;
            }
        }
    }
}
