using Model.EF;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Model.Dao
{
    public class Fixture_Dao
    {
        ToolingRoomDbContext db = null;
        public Fixture_Dao()
        {
            db = new ToolingRoomDbContext();
        }
        public List<Fixture> listAllFixture()
        {
            return db.Fixtures.ToList();
        }
        public int Insert(string model_name,string group_name,string station_name,string calibration_date,string end_date,string file_name,string create_people,string part)
        {
            Fixture fix = new Fixture();
            fix.Model_Name = model_name;
            fix.Group_Name = group_name;
            fix.Station_Name = station_name;
            fix.Calibration_Date = calibration_date;
            fix.End_Date = end_date;
            fix.File_Name = file_name;
            fix.Create_People = create_people;
            fix.Part = part;
            db.Fixtures.Add(fix);
            db.SaveChanges();
            return fix.id;
        }
        public bool Delete(int id)
        {
            try
            {
                var fx = db.Fixtures.Find(id);
                db.Fixtures.Remove(fx);
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
