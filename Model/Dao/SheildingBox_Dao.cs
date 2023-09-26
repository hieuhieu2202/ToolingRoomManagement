using Model.EF;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Model.Dao
{
    public class SheildingBox_Dao
    {
        ToolingRoomDbContext db = null;
        public SheildingBox_Dao()
        {
            db = new ToolingRoomDbContext();
        }
        public List<SheildingBox> ListAllSheldingBox()
        {
            return db.SheildingBoxes.ToList();
        }
        public List<SheildingBox> ListAllSheildingBox(string part)
        {
            return db.SheildingBoxes.Where(x => x.Part.ToUpper() == part.ToUpper()).ToList();
        }
        public int Insert(string model_name, string group_name, string station_name, string sheildingbox_mac, string calibration_date, string end_date, string create_people, string part,string file_name)
        {
            SheildingBox she= new SheildingBox();
            she.Model_Name = model_name;
            she.Group_Name = group_name;
            she.Station_Name = station_name;
            she.Calibration_Date = calibration_date;
            she.End_Date = end_date;
            she.Mac = sheildingbox_mac;
            she.Create_People = create_people;
            she.Part = part;
            she.File_Name = file_name;
            db.SheildingBoxes.Add(she);
            db.SaveChanges();
            return she.id;
        }
        public bool Delete(int id)
        {
            try
            {
                var sh = db.SheildingBoxes.Find(id);
                db.SheildingBoxes.Remove(sh);
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
