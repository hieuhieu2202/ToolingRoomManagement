using Model.EF;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Model.Dao
{
    public class LUXFT1_Dao
    {
        ToolingRoomDbContext db = null;
        public LUXFT1_Dao()
        {
            db = new ToolingRoomDbContext();
        }
        public int Inser(string model_name,string sn_lightbox,string LUX_2,string LUX_5,string LUX_10,string LUX_1000,string LUX_2000,string LUX_5000,string create_by)
        {
            LUXFT1 ft1 = new LUXFT1();
            ft1.model_name = model_name;
            ft1.SN_lightbox = sn_lightbox;
            ft1.LUX_2 = LUX_2;
            ft1.LUX_5 = LUX_5;
            ft1.LUX_10 = LUX_10;
            ft1.LUX_1000 = LUX_1000;
            ft1.LUX_2000 = LUX_2000;
            ft1.LUX_5000 = LUX_5000;
            ft1.create_by = create_by;
            ft1.create_date = DateTime.Now;
            db.LUXFT1.Add(ft1);
            db.SaveChanges();
            return ft1.id;
        }
        public bool Delete(int id)
        {
            try
            {
                var ft1 = db.LUXFT1.Where(x => x.id == id).SingleOrDefault();
                db.LUXFT1.Remove(ft1);
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
