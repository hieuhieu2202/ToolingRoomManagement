using Model.EF;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Model.Dao
{
    public class DeviceBackRoom_Dao
    {
        ToolingRoomDbContext db = null;
        public DeviceBackRoom_Dao()
        {
            db = new ToolingRoomDbContext();
        }
        public int Insert(string code_device, string device_name, int manager_id, int quantity, int gioihan, string price, string brand, string parameter, string unit, string produce_SN, string location,int status, int kind_of_device, int create_by,string makiemke,string mahieuchuan,string image_TB, string noteTB,int receive_id,string calibration,string code_receive)
        {
            DeviceBackRoom deviceback = new DeviceBackRoom();

            deviceback.code_device = code_device;
            deviceback.device_name = device_name;
            deviceback.manager_id = manager_id;
            deviceback.quantity = quantity;
            deviceback.gioihan = gioihan;
            deviceback.price = price;
            deviceback.brand = brand;
            deviceback.parameter = parameter;
            deviceback.unit = unit;
            deviceback.produce_SN = produce_SN;
            deviceback.location = location;
            deviceback.status = status;
            deviceback.kind_of_device = kind_of_device;
            deviceback.tooling_member = create_by;
            deviceback.create_date = DateTime.Now;
            deviceback.makiemke = makiemke;
            deviceback.calibration = mahieuchuan;
            deviceback.image_TB = image_TB;
            deviceback.note_status = noteTB;
            deviceback.receive_id = receive_id;
            deviceback.code_receive = code_receive;
            db.DeviceBackRooms.Add(deviceback);
            db.SaveChanges();
            return deviceback.id;
        }
        public DeviceBackRoom DeviceBackRoom(int receive_id)
        {
            return db.DeviceBackRooms.Where(x => x.receive_id == receive_id).SingleOrDefault();
        }
        public int Delete(string maSN)
        {
            try
            {
                var dev = db.DeviceBackRooms.Where(x=>x.produce_SN==maSN).SingleOrDefault();
                db.DeviceBackRooms.Remove(dev);
                db.SaveChanges();
                return 1;
            }
            catch (Exception)
            {
                return 0;
            }
        }
        public int Delete_(int id)
        {
            try
            {
                var dev = db.DeviceBackRooms.Where(x => x.id == id).SingleOrDefault();
                db.DeviceBackRooms.Remove(dev);
                db.SaveChanges();
                return 1;
            }
            catch (Exception)
            {
                return 0;
            }
        }
    }
}
