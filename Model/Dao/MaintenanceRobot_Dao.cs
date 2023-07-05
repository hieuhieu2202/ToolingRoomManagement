using Model.EF;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Model.Dao
{
    public class MaintenanceRobot_Dao
    {
        ToolingRoomDbContext db = null;
        public MaintenanceRobot_Dao()
        {
            db = new ToolingRoomDbContext();
        }
        public List<MaintenanceRobot> listAllMaintenance()
        {
            return db.MaintenanceRobots.ToList();
        }
        public int Insert(string station_name,int issue_1, int issue_2, int issue_3, int issue_4, int issue_5, int issue_6, int issue_7, int issue_8, int issue_9, string note, int create_by, string create_by_name, string part)
        {
            MaintenanceRobot main = new MaintenanceRobot();
            main.station_name = station_name;
            main.issue_1 = issue_1;
            main.issue_2 = issue_2;
            main.issue_3 = issue_3;
            main.issue_4 = issue_4;
            main.issue_5 = issue_5;
            main.issue_6 = issue_6;
            main.issue_7 = issue_7;
            main.issue_8 = issue_8;
            main.issue_9 = issue_9;
            main.note = note;
            main.part = part;
            main.create_date = DateTime.Now;
            main.create_by = create_by;
            main.create_by_name = create_by_name;
            db.MaintenanceRobots.Add(main);
            db.SaveChanges();
            return main.id;
        }
        public bool Delete(int id)
        {
            try
            {
                var main = db.MaintenanceRobots.Find(id);
                db.MaintenanceRobots.Remove(main);
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
