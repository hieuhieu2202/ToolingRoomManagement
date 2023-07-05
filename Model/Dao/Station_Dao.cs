using Model.EF;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Model.Dao
{
    public class Station_Dao
    {
        ToolingRoomDbContext db = null;
        public Station_Dao()
        {
            db = new ToolingRoomDbContext();
        }
        public List<Station> ListAllStation()
        {
            return db.Stations.ToList();
        }
        public int Insert(string station_name)
        {
            Station st = new Station();
            st.station_name = station_name;
            db.Stations.Add(st);
            db.SaveChanges();
            return st.id;
        }
    }
}
