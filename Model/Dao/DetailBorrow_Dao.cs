using Model.EF;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Model.Dao
{
    public class DetailBorrow_Dao
    {
        ToolingRoomDbContext db = null;
        public DetailBorrow_Dao()
        {
            db = new ToolingRoomDbContext();
        }
        
    }
}
