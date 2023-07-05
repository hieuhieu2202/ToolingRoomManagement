using Model.EF;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Model.Dao
{
    public class Station_Robot_Dao
    {
        ToolingRoomDbContext db = null;
        public Station_Robot_Dao()
        {
            db = new ToolingRoomDbContext();
        }
        public List<Station_Robot> listAllStation_Robot()
        {
            return db.Station_Robot.ToList();
        }
        public int Insert(string station_name)
        {
            Station_Robot st = new Station_Robot();
            st.station_name = station_name;
            st.create_date = DateTime.Now;
            db.Station_Robot.Add(st);
            db.SaveChanges();
            return st.id;
        }
    }
}
