using Model.EF;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Model.Dao
{
    public class Edit_History_Device
    {
        ToolingRoomDbContext db = null;
        public Edit_History_Device()
        {
            db = new ToolingRoomDbContext();
        }
        public int Insert(int id_device, string code_device,string quantity_ba,string location,string note)
        {
            History_Device h = new History_Device();
            h.id_device = id_device;
            h.code_device = code_device;
            h.quantity = quantity_ba;
            h.create_date = DateTime.Now;
            h.location = location;
            h.note = note;
            db.History_Device.Add(h);
            db.SaveChanges();
            return h.id;
        }
        public List<History_Device> List_History()
        {
            return db.History_Device.ToList();
        }
    }
}
