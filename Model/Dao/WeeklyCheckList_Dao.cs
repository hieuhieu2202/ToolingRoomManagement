using Model.EF;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Model.Dao
{
    public class WeeklyCheckList_Dao
    {
        ToolingRoomDbContext db = null;

        public WeeklyCheckList_Dao()
        {
            db = new ToolingRoomDbContext();
        }
        public List<WeeklyCheckList> listAllWeeklyCheckList()
        {
            return db.WeeklyCheckLists.ToList();
        }
        public int Insert(int station_id, string sheildingbox_mac,int issue_1, int issue_2, int issue_3, int issue_4, int issue_5, int issue_6, int issue_7,int issue_8, string note,int create_by,string create_by_name,string part)
        {
            WeeklyCheckList weekly = new WeeklyCheckList();
            weekly.station_id = station_id;
            weekly.sheilding_mac = sheildingbox_mac;
            weekly.issue_1 = issue_1;
            weekly.issue_2 = issue_2;
            weekly.issue_3 = issue_3;
            weekly.issue_4 = issue_4;
            weekly.issue_5 = issue_5;
            weekly.issue_6 = issue_6;
            weekly.issue_7 = issue_7;
            weekly.issue_8 = issue_8;
            weekly.note = note;
            weekly.part = part;
            weekly.create_date = DateTime.Now;
            weekly.create_by = create_by;
            weekly.create_by_name = create_by_name;
            db.WeeklyCheckLists.Add(weekly);
            db.SaveChanges();
            return weekly.id;
        }
        public bool Delete(int id)
        {
            try
            {
                var week= db.WeeklyCheckLists.Find(id);
                db.WeeklyCheckLists.Remove(week);
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
