using Model.EF;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Model.Dao
{
    
    public class Device_Dao  
    {
        ToolingRoomDbContext db = null;
        public Device_Dao()
        {
            db = new ToolingRoomDbContext();
        }
        public List<Device> ListAll_Devices()
        {
            return db.Devices.OrderByDescending(x=>x.quantity).ToList();
        }
        public int check_CodeDevice(string code_device)
        {
            var result =  db.Devices.SingleOrDefault(x => x.code_device == code_device);
            if (result == null)
            {
                return 0;
            }
            else
            {
                return 1;
            }
        }
        public List<Device> ListDevice_Manager()
        {
            return db.Devices.OrderByDescending(x=>x.quantity).ToList();
        }
        public int Insert(string code_device,string device_name,int manager_id,float quantity,int gioihan,string price,string brand,string parameter,string unit,string produce_SN,string location,int kind_of_device,int create_by,string makiemke,string mahieuchuan,string imageTB,string noteTB,int status)     
        {
            Device device = new Device();
            
            device.code_device = code_device;
            device.device_name = device_name;
            device.manager_id = manager_id;
            device.quantity = quantity;
            device.gioihan = gioihan;
            device.price = "0";
            device.brand = brand;
            device.parameter = parameter;
            device.unit = "NA";
            device.produce_SN = produce_SN;
            device.location = location;
            device.status = status;
            device.kind_of_device = kind_of_device;
            device.tooling_member = create_by;
            device.create_date = DateTime.Now;
            device.makiemke = makiemke;
            device.calibration = mahieuchuan;
            device.image_TB = imageTB;
            device.note_status = noteTB;
            db.Devices.Add(device);
            db.SaveChanges();
            return device.id;
        }
        public bool Delete(int id)
        {
            try
            {
                var dev = db.Devices.Find(id);
                db.Devices.Remove(dev);
                db.SaveChanges();
                return true;
            }
            catch (Exception)
            {
                return false;
            }
        }

        /// <summary>
        /// Lấy thông tin thiết bị theo ID:
        /// </summary>
        /// <param name="ID">ID thiết bị</param>
        /// <returns>Thiết bị</returns>
        /// Author: Ngo Canh Thin
        /// Date: 2023-04-24
        /// Reason: Lấy thiết bị để binding loại thiết bị
        public Device GetByID(int ID)
        {
            try
            {
                var result = db.Devices.SingleOrDefault(x => x.id == ID);
                return result;
            }
            catch (Exception)
            {

                return null;
            }

        }

        /// <summary>
        /// Author: Ngo Canh Thin
        /// Date: 2023-04-27
        /// Reason: CRUD thiết bị bằng ajax thay vì dùng MVC
        /// </summary>
        public List<Device> GetByThin()
        {
            var devices = db.Devices.Select(s => s).OrderByDescending(s => s.update_date).ThenBy(s => s.create_date).ThenBy(s => s.quantity).ToList();
            return devices;
        }
        public int CreateByThin(Device data, long idUserLogin)
        {
            try
            {
                // kiểm tra trùng mã thiết bị
                if (checkExistDevice(data.code_device) == false)
                {
                    var temp = new Device();
                    temp.code_device = data.code_device.Trim();
                    temp.device_name = data.device_name.Trim();
                    temp.quantity = data.quantity;
                    temp.price = data.price;
                    temp.brand = data.brand.Trim();
                    temp.parameter = data.parameter.Trim();
                    temp.unit = data.unit.Trim();
                    temp.produce_SN = data.produce_SN;
                    temp.location = data.location.Trim();
                    temp.status = data.status;
                    temp.user_confirm = data.user_confirm;
                    temp.tooling_member = data.tooling_member;
                    temp.calibration = data.calibration;
                    temp.create_date = DateTime.Now;
                    temp.update_date = data.update_date;
                    temp.kind_of_device = data.kind_of_device;
                    temp.manager_id = data.manager_id;
                    //temp.id= data.id;
                    temp.gioihan = data.gioihan;
                    temp.makiemke = data.makiemke;
                    temp.note_status = data.note_status;
                    //temp.image_TB = data.image_TB;
                    temp.tooling_member = (int)idUserLogin;

                    db.Devices.Add(temp);
                    db.SaveChanges();
                    int id_history = new Edit_History_Device().Insert(temp.id, data.code_device, (0) + "->" + (data.quantity), data.location, "Nhập TB vào kho");
                    return temp.id;// thành công
                }
                else
                {
                    return 0;// trùng mã code;
                }
            }
            catch (Exception)
            {
                return -1;// server error;
                throw;
            }
        }

        public int EditByThin(Device data, long idUserLogin)
        {
            try
            {
                // lấy ra id thiết bị:
                var temp = db.Devices.FirstOrDefault(s => s.id == data.id);
                // kiểm tra trùng mã thiết bị
                var code = db.Devices.FirstOrDefault(s => s.code_device.Trim().ToUpper() == data.code_device.Trim().ToUpper());
                if (code.id == temp.id)
                {
                    // chính là thiết bị đó
                    temp.code_device = data.code_device.Trim();
                    temp.device_name = data.device_name.Trim();
                    temp.quantity = data.quantity;
                    temp.price = data.price;
                    temp.brand = data.brand.Trim();
                    temp.parameter = data.parameter.Trim();
                    temp.unit = data.unit.Trim();
                    temp.produce_SN = data.produce_SN;
                    temp.location = data.location.Trim();
                    temp.status = data.status;
                    temp.user_confirm = data.user_confirm;
                    temp.tooling_member = data.tooling_member;
                    temp.calibration = data.calibration;
                    temp.create_date = DateTime.Now;
                    temp.update_date = data.update_date;
                    temp.kind_of_device = data.kind_of_device;
                    temp.manager_id = data.manager_id;
                    //temp.id= data.id;
                    temp.gioihan = data.gioihan;
                    temp.makiemke = data.makiemke;
                    temp.note_status = data.note_status;
                    //temp.image_TB = data.image_TB;
                    temp.tooling_member = (int)idUserLogin;
                    db.SaveChanges();
                    int id_history = new Edit_History_Device().Insert(temp.id, data.code_device, (temp.quantity) + "->" + (data.quantity), data.location, "Thủy sửa");
                    return 1;// thành công
                }
                else
                {
                    return 0;// Mã thiết bị đã có:
                }
            }
            catch (Exception)
            {
                return -1;// server error;
            }
        }
        /// <summary>
        /// kiểm tra trùng mã thiết bị
        /// </summary>
        /// <param name="code_device">mã thiết bị</param>
        /// <returns>true: trùng | false: ko trùng</returns>
        public bool checkExistDevice(string code_device)
        {
            var check = db.Devices.FirstOrDefault(s => s.code_device.Trim().ToLower() == code_device.Trim().ToLower());
            if (check != null)
            {
                return true;// trùng mã thiết bị
            }
            return false;// ko trùng
        }
    }
}
