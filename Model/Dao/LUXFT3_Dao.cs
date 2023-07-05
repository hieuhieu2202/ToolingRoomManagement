using Model.EF;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Model.Dao
{
    public class LUXFT3_Dao
    {
        ToolingRoomDbContext db = null;
        public LUXFT3_Dao()
        {
            db = new ToolingRoomDbContext();
        }
        public int Insert(string model_name, string sn_lightbox, string LUX_1, string LUX_2, string LUX_3, string K_1, string K_2, string K_3, string create_by)
        {
            LUXFT3 ft3 = new LUXFT3();
            ft3.model_name = model_name;
            ft3.SN_lightbox = sn_lightbox;
            ft3.LUX_1 = LUX_1;
            ft3.LUX_2 = LUX_2;
            ft3.LUX_3 = LUX_3;
            ft3.K_1 = K_1;
            ft3.K_2 = K_2;
            ft3.K_3 = K_3;
            ft3.create_by = create_by;
            ft3.create_date = DateTime.Now;
            db.LUXFT3.Add(ft3);
            db.SaveChanges();
            return ft3.id;
        }
        public bool Delete(int id)
        {
            try
            {
                var ft3 = db.LUXFT3.Where(x => x.id == id).SingleOrDefault();
                db.LUXFT3.Remove(ft3);
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
