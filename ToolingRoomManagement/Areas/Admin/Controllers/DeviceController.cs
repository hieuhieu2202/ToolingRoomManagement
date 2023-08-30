using Model.Dao;
using Model.EF;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Script.Serialization;
using ToolingRoomManagement.Models;

namespace ToolingRoomManagement.Areas.Admin.Controllers
{
    public class DeviceController : Controller
    {
        // GET: Admin/Device
        ToolingRoomDbContext context = new ToolingRoomDbContext();
        public ActionResult Index()
        {
            return View();
        }
        public ActionResult get_Device_Receive(int receive_id)
        {
            var data = new ClipOutput_Dao().ClipOutput_Receive(receive_id);
            List<Device> device = context.Devices.ToList();
            var data_ok = from d in data
                          join a in device on d.device_id equals a.id
                          into tbl_Clip_Device
                          from b in tbl_Clip_Device.DefaultIfEmpty()
                          select new View_ReceiveModel
                          {

                              device_name = b.device_name,
                              code_device = b.code_device,
                              location = b.location,
                              clipOutput = d,
                          };
            var json = new JavaScriptSerializer().Serialize(data_ok);
            return Json(json);
        }
        public ActionResult Check_Device(string code_device)
        {
            var result = new Device_Dao().check_CodeDevice(code_device);
            if (result == 0)
            {
                return Json("OK");
            }
            else
            {
                return Json("Mã thiết bị đã tồn tại trong kho!");
            }

        }
        public ActionResult CreateDevice(DeviceModel device)
        {
            var code_device = device.code_device;
            var device_name = device.device_name;
            var quantity = device.quantity;
            var gioihan = device.gioihan;
            var price = device.price;
            var brand = device.brand;
            var parameter = device.parameter;
            var unit = device.unit;
            var produce_SN = device.produce_SN;
            var location = device.location;
            var calibration = device.calibration;
            var update_date = device.update_date;
            var kind_of_device = device.kind_of_device;
            var manager_id = device.manager_id;
            var makiemke = device.makiemke;
            var status = device.status;
            var note_status = device.noteStatus;
            var id = 0;
            var session = (ToolingRoomManagement.Common.UserLogin)Session[ToolingRoomManagement.Common.CommonConstants.USER_SESSION];
            int create_by = Int32.Parse(session.UserID.ToString());
            double? quantity_bf = 0;
            var get_quantity = (from dt in context.Devices
                                where dt.code_device == device.code_device
                                select dt).FirstOrDefault();

            if (get_quantity != null)
            {
                quantity_bf = get_quantity.quantity;
            }

            var check = (from dt in context.Devices
                         where dt.code_device == device.code_device && dt.location == location
                         select dt).ToList();

            if (device.id.HasValue && device.id > 0)
            {
                int dem = 0;
                foreach (var item in check)
                {
                    dem++;
                }
                id = (from t in context.Devices
                      orderby t.id descending
                      select t.id).First();
                var dataUpdate = (from dt in context.Devices
                                  where dt.id == device.id
                                  select dt).FirstOrDefault();
                if (dataUpdate == null) return Json("Khong co ban ghi");
                dataUpdate.device_name = device_name;
                dataUpdate.quantity = quantity;
                dataUpdate.gioihan = gioihan;
                dataUpdate.price = price;
                dataUpdate.brand = brand;
                dataUpdate.parameter = parameter;
                dataUpdate.unit = unit;
                dataUpdate.produce_SN = produce_SN;
                dataUpdate.location = location;
                dataUpdate.calibration = calibration;
                dataUpdate.makiemke = makiemke;
                dataUpdate.status = status;
                dataUpdate.note_status = note_status;
                dataUpdate.code_device = device.code_device;// Thin sua 2023-04-26 de ma thiet bi sau khi bam sua
                if (update_date != null)
                {
                    dataUpdate.update_date = formatDate(update_date);
                }
                dataUpdate.kind_of_device = kind_of_device;
                dataUpdate.manager_id = manager_id;

                context.SaveChanges();
                if (quantity_bf != quantity)
                {
                    int id_history = new Edit_History_Device().Insert(0,code_device, quantity_bf + "->" + quantity, location, "Thuỷ Sửa");
                    return Json("OK");
                }
                else
                {
                    return Json("OK");
                }
            }
            else
            {
                if (code_device == null)
                {
                    var date_now = DateTime.Now.ToString("yyyy");
                    var result = "";
                    //var code_date = "";
                    try
                    {
                        result = (from t in context.Devices
                                  where t.code_device != null && t.code_device.Contains("FN")
                                  // where date_now.Any(x=>t.code_device.Contains(x))
                                  orderby t.code_device descending
                                  select t.code_device).First();
                        //code_date = result.Substring(1, 8);
                    }
                    catch
                    {

                    }
                    var code_new = "";
                    if (result != "")
                    {
                        var code_extension = int.Parse(result.ToString().Substring(2, 4));
                        if (code_extension >= 1 && code_extension < 9)
                        {
                            code_new = "FN" + "000" + (code_extension + 1);
                        }
                        else if (code_extension >= 9 && code_extension < 99)
                        {
                            code_new = "FN" + "00" + (code_extension + 1);
                        }
                        else if (code_extension >= 99 && code_extension < 999)
                        {
                            code_new = "FN" + "0" + (code_extension + 1);
                        }
                        else
                        {
                            code_new = "FN" + (code_extension + 1);
                        }
                    }
                    else
                    {
                        code_new = "FN" + "0001";
                    }
                    int device_id = new Device_Dao().Insert(code_new, device_name, manager_id, quantity, gioihan, price, brand, parameter, unit, produce_SN, location, kind_of_device, create_by, makiemke, calibration, null, note_status, status);
                    if (device_id > 0)
                    {
                        return Json("OK");
                    }
                    else
                    {
                        return Json("Insert Fail!");
                    }
                }
                else
                {
                    int dem = 0;
                    foreach (var item in check)
                    {
                        dem++;
                    }
                    if (dem == 0)
                    {
                        int device_id = new Device_Dao().Insert(code_device, device_name, manager_id, quantity, gioihan, price, brand, parameter, unit, produce_SN, location, kind_of_device, create_by, makiemke, calibration, null, note_status, status);
                        if (device_id > 0)
                        {
                            return Json("OK");
                        }
                        else
                        {
                            return Json("Insert Fail!");
                        }
                    }
                    else
                    {
                        return Json("Mã " + device.code_device + " đã tồn tại trong kho " + device.location);
                    }
                }


            }
        }
        public ActionResult Delete(int id)
        {
            new Device_Dao().Delete(id);
            return Json(new
            {
                status = true
            });
        }
        public string check_Quantity(int device_id, float quantity)
        {
            var data = (from dt in context.Devices
                        where dt.id == device_id
                        select dt).FirstOrDefault();
            int a = 0;
            if (quantity > data.quantity)
            {
                a = 0;
            }
            else
            {
                a = 1;
            }
            var json = JsonConvert.SerializeObject(a);
            return json;

        }
        public DateTime formatDate(string date)
        {

            return DateTime.ParseExact(date.Replace(" ", ""), "yyyy-MM-dd", null);

        }
        public string check_SN(string maSN)
        {
            try
            {
                var find = (from dt in context.Devices
                            where dt.produce_SN.Replace("\r\n", "") == maSN
                            select dt).SingleOrDefault();
                var device_name = find.device_name;
                var model = new checkSNModel();
                model.maSN = maSN;
                model.tenTB = find.device_name;
                model.maHC = find.calibration;
                model.model_TB = find.parameter;
                model.kho_TB = find.location;
                model.makiemke = find.makiemke;
                var json = new JavaScriptSerializer().Serialize(model);
                return json;
            }
            catch
            {
                return "NG";
            }
        }
        public string Find_TemKiemKe(string makiemke)
        {
            try
            {
                var find = (from dt in context.Devices
                            where dt.makiemke.Replace("\r\n", "") == makiemke
                            select dt).SingleOrDefault();
                if (find != null)
                {
                    return "Co";
                }
                else
                {
                    return "Khong";
                }
            }
            catch
            {
                return "Khong";
            }
        }
        public string Find_SN(string maSN)
        {
            try
            {
                var find = (from dt in context.Devices
                            where dt.produce_SN.Replace("\r\n", "") == maSN
                            select dt).SingleOrDefault();
                if (find != null)
                {
                    return "Co";
                }
                else
                {
                    return "Khong";
                }
            }
            catch
            {
                return "Khong";
            }
        }
        public string Find_MaHieuChuan(string mahieuchuan)
        {
            try
            {
                var find = (from dt in context.Devices
                            where dt.calibration.Replace("\r\n", "") == mahieuchuan
                            select dt).SingleOrDefault();
                if (find != null)
                {
                    return "Co";
                }
                else
                {
                    return "Khong";
                }
            }
            catch
            {
                return "Khong";
            }
        }
        public string Device_Back_Room(BackDeviceModel model)
        {
            var session = (ToolingRoomManagement.Common.UserLogin)Session[ToolingRoomManagement.Common.CommonConstants.USER_SESSION];
            int user_id = Int32.Parse(session.UserID.ToString());
            string create_by = session.UserName;
            var date_now = DateTime.Now.ToString("yyyyMMdd");
            var result = "";
            var code_date = "";
            var code_new = "";
            int device_id;
            var code_new1 = "";
            var listImage = "";
            var rs = "";
            if (model.receive_id == 0)
            {

                try
                {
                    result = (from t in context.Receives
                              where t.code_receive != null && t.code_receive.Contains("I" + date_now)
                              // where date_now.Any(x=>t.code_device.Contains(x))
                              orderby t.code_receive descending
                              select t.code_receive).First();
                    code_date = result.Substring(1, 8);
                }
                catch
                {
                }

                if (code_date == date_now)
                {
                    var code_extension = int.Parse(result.Substring(9, 4));
                    if (code_extension >= 1 && code_extension < 9)
                    {
                        code_new = "I" + code_date + "000" + (code_extension + 1);
                    }
                    else if (code_extension >= 9 && code_extension < 99)
                    {
                        code_new = "I" + code_date + "00" + (code_extension + 1);
                    }
                    else if (code_extension >= 99 && code_extension < 999)
                    {
                        code_new = "I" + code_date + "0" + (code_extension + 1);
                    }
                    else
                    {
                        code_new = "I" + code_date + (code_extension + 1);
                    }
                }
                else
                {
                    code_new = "I" + date_now + "0001";
                }

                int id_receive = new Receive_Dao().Insert(code_new, "Đơn trả TB " + model.tenTB + " về kho", model.quanly, create_by, null, model.quanly_id, user_id, 1, 2);

                if (id_receive > 0)
                {

                    try
                    {
                        rs = (from t in context.Devices
                              where t.code_device != null && t.code_device.Contains("FN")
                              // where date_now.Any(x=>t.code_device.Contains(x))
                              orderby t.code_device descending
                              select t.code_device).First();
                    }
                    catch
                    {
                        code_new1 = "FN" + date_now + "0001";
                        if (model.imageTB != null)
                        {
                            foreach (HttpPostedFileBase file in model.imageTB)
                            {
                                if (file != null)
                                {
                                    var fileImage = Guid.NewGuid() + "_" + file.FileName.Replace(",", "");
                                    file.SaveAs(Server.MapPath("/Data/Image/" + fileImage));
                                    listImage += ",{'file':'" + fileImage + "'}";
                                }
                            }
                            listImage = listImage.Substring(1);
                            listImage = JsonConvert.SerializeObject(JsonConvert.DeserializeObject<List<dynamic>>("[" + listImage + "]"));
                        }
                        else
                        {
                            listImage = "";
                        }
                        device_id = new DeviceBackRoom_Dao().Insert(code_new1, model.tenTB, model.quanly_id, 1, 0, "0", null, model.model_TB, null, model.maSN, model.kho_TB, model.statusTB, 1, user_id, model.makiemke, model.calibration, listImage, model.noteTB, id_receive, model.calibration, null);
                        if (device_id > 0)
                        {
                            return id_receive.ToString();
                        }
                        else
                        {
                            return "NG";
                        }
                    }
                    if (rs == "")
                    {
                        code_new1 = "FN" + date_now + "0001";
                        if (model.imageTB != null)
                        {
                            foreach (HttpPostedFileBase file in model.imageTB)
                            {
                                if (file != null)
                                {
                                    var fileImage = Guid.NewGuid() + "_" + file.FileName.Replace(",", "");
                                    file.SaveAs(Server.MapPath("/Data/Image/" + fileImage));
                                    listImage += ",{'file':'" + fileImage + "'}";
                                }
                            }
                            listImage = listImage.Substring(1);
                            listImage = JsonConvert.SerializeObject(JsonConvert.DeserializeObject<List<dynamic>>("[" + listImage + "]"));
                        }
                        else
                        {
                            listImage = "";
                        }
                        device_id = new DeviceBackRoom_Dao().Insert(code_new1, model.tenTB, model.quanly_id, 1, 0, "0", null, model.model_TB, null, model.maSN, model.kho_TB, model.statusTB, 1, user_id, model.makiemke, model.calibration, listImage, model.noteTB, id_receive, model.calibration, null);
                        if (device_id > 0)
                        {
                            return id_receive.ToString();
                        }
                        else
                        {
                            return "NG";
                        }
                    }
                    else
                    {
                        var code_extension1 = int.Parse(rs.Substring(2, 4));
                        if (code_extension1 >= 1 && code_extension1 <= 9)
                        {
                            code_new1 = "FN" + "000" + (code_extension1 + 1);
                        }
                        else if (code_extension1 > 9 && code_extension1 <= 99)
                        {
                            code_new1 = "FN" + "00" + (code_extension1 + 1);
                        }
                        else if (code_extension1 > 99 && code_extension1 <= 999)
                        {
                            code_new1 = "FN" + "0" + (code_extension1 + 1);
                        }
                        else
                        {
                            code_new1 = "FN" + (code_extension1 + 1);
                        }

                        if (model.imageTB != null)
                        {
                            foreach (HttpPostedFileBase file in model.imageTB)
                            {
                                if (file != null)
                                {
                                    var fileImage = Guid.NewGuid() + "_" + file.FileName.Replace(",", "");
                                    file.SaveAs(Server.MapPath("/Data/Image/" + fileImage));
                                    listImage += ",{'file':'" + fileImage + "'}";
                                }
                            }
                            listImage = listImage.Substring(1);
                            listImage = JsonConvert.SerializeObject(JsonConvert.DeserializeObject<List<dynamic>>("[" + listImage + "]"));
                        }
                        else
                        {
                            listImage = "";
                        }
                        device_id = new DeviceBackRoom_Dao().Insert(code_new1, model.tenTB, model.quanly_id, 1, 0, "0", null, model.model_TB, null, model.maSN, model.kho_TB, model.statusTB, 1, user_id, model.makiemke, model.calibration, listImage, model.noteTB, id_receive, model.calibration, null);
                        if (device_id > 0)
                        {
                            return id_receive.ToString();
                        }
                        else
                        {
                            return "NG";
                        }
                    }

                }
                else
                {
                    return "NG";
                }
            }
            else
            {

                    try
                    {
                        rs = (from t in context.Devices
                              where t.code_device != null && t.code_device.Contains("FN")
                              // where date_now.Any(x=>t.code_device.Contains(x))
                              orderby t.code_device descending
                              select t.code_device).First();
                    }
                    catch
                    {
                        code_new1 = "FN" + date_now + "0001";
                        if (model.imageTB != null)
                        {
                            foreach (HttpPostedFileBase file in model.imageTB)
                            {
                                if (file != null)
                                {
                                    var fileImage = Guid.NewGuid() + "_" + file.FileName.Replace(",", "");
                                    file.SaveAs(Server.MapPath("/Data/Image/" + fileImage));
                                    listImage += ",{'file':'" + fileImage + "'}";
                                }
                            }
                            listImage = listImage.Substring(1);
                            listImage = JsonConvert.SerializeObject(JsonConvert.DeserializeObject<List<dynamic>>("[" + listImage + "]"));
                        }
                        else
                        {
                            listImage = "";
                        }
                        device_id = new DeviceBackRoom_Dao().Insert(code_new1, model.tenTB, model.quanly_id, 1, 0, "0", null, model.model_TB, null, model.maSN, model.kho_TB, model.statusTB, 1, user_id, model.makiemke, model.calibration, listImage, model.noteTB, model.receive_id, model.calibration, null);
                        if (device_id > 0)
                        {
                            return model.receive_id.ToString();
                        }
                        else
                        {
                            return "NG";
                        }
                    }
                    if (rs == "")
                    {
                        code_new1 = "FN" + date_now + "0001";
                        if (model.imageTB != null)
                        {
                            foreach (HttpPostedFileBase file in model.imageTB)
                            {
                                if (file != null)
                                {
                                    var fileImage = Guid.NewGuid() + "_" + file.FileName.Replace(",", "");
                                    file.SaveAs(Server.MapPath("/Data/Image/" + fileImage));
                                    listImage += ",{'file':'" + fileImage + "'}";
                                }
                            }
                            listImage = listImage.Substring(1);
                            listImage = JsonConvert.SerializeObject(JsonConvert.DeserializeObject<List<dynamic>>("[" + listImage + "]"));
                        }
                        else
                        {
                            listImage = "";
                        }
                        device_id = new DeviceBackRoom_Dao().Insert(code_new1, model.tenTB, model.quanly_id, 1, 0, "0", null, model.model_TB, null, model.maSN, model.kho_TB, model.statusTB, 1, user_id, model.makiemke, model.calibration, listImage, model.noteTB, model.receive_id, model.calibration, null);
                        if (device_id > 0)
                        {
                            return model.receive_id.ToString();
                        }
                        else
                        {
                            return "NG";
                        }
                    }
                    else
                    {
                        var code_extension1 = int.Parse(rs.Substring(2, 4));
                        if (code_extension1 >= 1 && code_extension1 <= 9)
                        {
                            code_new1 = "FN" + "000" + (code_extension1 + 1);
                        }
                        else if (code_extension1 > 9 && code_extension1 <= 99)
                        {
                            code_new1 = "FN" + "00" + (code_extension1 + 1);
                        }
                        else if (code_extension1 > 99 && code_extension1 <= 999)
                        {
                            code_new1 = "FN" + "0" + (code_extension1 + 1);
                        }
                        else
                        {
                            code_new1 = "FN" + (code_extension1 + 1);
                        }

                        if (model.imageTB != null)
                        {
                            foreach (HttpPostedFileBase file in model.imageTB)
                            {
                                if (file != null)
                                {
                                    var fileImage = Guid.NewGuid() + "_" + file.FileName.Replace(",", "");
                                    file.SaveAs(Server.MapPath("/Data/Image/" + fileImage));
                                    listImage += ",{'file':'" + fileImage + "'}";
                                }
                            }
                            listImage = listImage.Substring(1);
                            listImage = JsonConvert.SerializeObject(JsonConvert.DeserializeObject<List<dynamic>>("[" + listImage + "]"));
                        }
                        else
                        {
                            listImage = "";
                        }
                        device_id = new DeviceBackRoom_Dao().Insert(code_new1, model.tenTB, model.quanly_id, 1, 0, "0", null, model.model_TB, null, model.maSN, model.kho_TB, model.statusTB, 1, user_id, model.makiemke, model.calibration, listImage, model.noteTB, model.receive_id, model.calibration, null);
                        if (device_id > 0)
                        {
                            return model.receive_id.ToString();
                        }
                        else
                        {
                            return "NG";
                        }
                }
            }
        }
        public string GetDataDetail_Device(int id)
        {
            List<Device> device = context.Devices.ToList();
            List<Output> output = context.Outputs.ToList();
            List<Input> input = context.Inputs.ToList();
            List<Receive> receive = context.Receives.ToList();
            var json1 = "";
            var json2 = "";
            var data_out = from d in output
                           join a in device on d.device_id equals a.id
                           into tbl_Output_Device
                           from b in tbl_Output_Device.DefaultIfEmpty()
                           where d.device_id == id
                           select new Detail_DeviceModel
                           {
                               output = d,
                               device = b,
                           };
            var data_1 = from d in data_out
                         join a in receive on d.output.receive_id equals a.id
                         into tbl_Data_Receie
                         from b in tbl_Data_Receie.DefaultIfEmpty()
                         select new Detail_DeviceModel
                         {
                             output = d.output,
                             receive = b,
                             device = d.device,
                         };
            var data_2 = from d in input
                         join a in device on d.device_id equals a.id
                         into tbl_Input_Device
                         from b in tbl_Input_Device.DefaultIfEmpty()
                         where d.device_id == id
                         join r in receive on d.code_order equals r.code_receive
                         into tbl_Input_Receive
                         from c in tbl_Input_Receive.DefaultIfEmpty()
                         select new DetailDevice_InputModel
                         {
                             input = d,
                             device = b,
                             receive = c
                         };
            json1 = new JavaScriptSerializer().Serialize(data_1);
            json2 = new JavaScriptSerializer().Serialize(data_2);

            var json = "[" + json1 + "," + json2 + "]";
            return json;
        }
        public string GetDetail_ReceiveBack(string code_order, int device_id)
        {
            List<Device> device = context.Devices.ToList();
            List<Input> input = context.Inputs.ToList();
            List<Receive> receive = context.Receives.ToList();
            var data = from d in input
                       join a in device on d.device_id equals a.id
                       into tbl_Input_Device
                       from b in tbl_Input_Device.DefaultIfEmpty()
                       where d.device_id == device_id
                       where d.code_order == code_order
                       join c in receive on d.code_order equals c.code_receive
                       into tbl_Input_Receive
                       from e in tbl_Input_Receive.DefaultIfEmpty()
                       select new DetailDevice_InputModel
                       {
                           input = d,
                           device = b,
                           receive = e
                       };
            var json = new JavaScriptSerializer().Serialize(data);
            return json;
        }
        public string get_DeviceBackRoom(int receive_id)
        {
            var data = new DeviceBackRoom_Dao().DeviceBackRoom(receive_id);

            var json = new JavaScriptSerializer().Serialize(data);
            return json;
        }
        public string GetDataEditLimit()
        {
            var session = (ToolingRoomManagement.Common.UserLogin)Session[ToolingRoomManagement.Common.CommonConstants.USER_SESSION];
            int manager_id = Int32.Parse(session.UserID.ToString());
            var result = new List<Device>();
            if (manager_id == 1048)
            {
                result = context.Devices.Where(x => x.location == "Arlo").ToList();
            }
            else if (manager_id == 1013)
            {
                result = context.Devices.Where(x => x.location == "Netgear").ToList();
            }
            else if (manager_id == 1014)
            {
                result = context.Devices.Where(x => x.location == "Auto").ToList();
            }
            else
            {
                result = null;
            }
            var json = "";
            if (result != null)
            {
                json = new JavaScriptSerializer().Serialize(result);

            }
            else
            {
                json = "";
            }
            return json;
        }
        public string EditLimit(int id, int limit)
        {
            var data = context.Devices.Where(x => x.id == id).SingleOrDefault();
            data.gioihan = limit;
            context.SaveChanges();
            return "OK";
        }
        public string getDataBackDevice(int receive_id)
        {
            var model = context.DeviceBackRooms.Where(x => x.receive_id == receive_id).ToList();
            var user = context.Users.ToList();
            var data = from m in model
                       join u in user on m.manager_id equals u.id
                       into tbl_data
                       from b in tbl_data.DefaultIfEmpty()
                       select new DeviceBackModel
                       {
                           username = b.username,
                           deviceBack = m,
                       };
            var json = new JavaScriptSerializer().Serialize(data);
            return json;
        }
        public string Update_DeviceBack(BackDeviceModel model)
        {
            try {
                var data_update = context.DeviceBackRooms.Where(x => x.id == model.back_id).FirstOrDefault();
                data_update.makiemke = model.makiemke;
                data_update.produce_SN = model.maSN;
                data_update.device_name = model.tenTB;
                data_update.parameter = model.model_TB;
                data_update.calibration = model.calibration;
                data_update.location = model.kho_TB;
                data_update.status = model.statusTB;
                var listImage = "";
                if (model.imageTB != null)
                {
                    foreach (HttpPostedFileBase file in model.imageTB)
                    {
                        if (file != null)
                        {
                            var fileImage = Guid.NewGuid() + "_" + file.FileName.Replace(",", "");
                            file.SaveAs(Server.MapPath("/Data/Image/" + fileImage));
                            listImage += ",{'file':'" + fileImage + "'}";
                        }
                    }
                    listImage = listImage.Substring(1);
                    listImage = JsonConvert.SerializeObject(JsonConvert.DeserializeObject<List<dynamic>>("[" + listImage + "]"));
                }
                else
                {
                    listImage = "";
                }
                data_update.image_TB = listImage;
                data_update.note_status = model.noteTB;
                data_update.manager_id = model.quanly_id;
                var data = context.Receives.Where(x => x.id == model.receive_id).FirstOrDefault();
                data.status = 1;
                context.SaveChanges();
                return data_update.receive_id.ToString();
            }
            catch
            {
                return "NG";
            }
            
        }
        public ActionResult DeleteDeviceBack(int id)
        {
            var model = context.DeviceBackRooms.Where(x => x.id == id).FirstOrDefault();
            context.DeviceBackRooms.Remove(model);
            context.SaveChanges();
            return Json(new
            {
                status = true
            });
        }

        /// <summary>
        /// Author: Ngo Canh Thin
        /// Date: 2023-04-27
        /// Reason: CRUD thiết bị bằng ajax thay vì dùng MVC thuần
        /// </summary>

        #region Ajax
        // Tạo mới thiết bị
        public int CreateByThin(Device data)
        {
            try
            {
                var userLogin = (ToolingRoomManagement.Common.UserLogin)Session[ToolingRoomManagement.Common.CommonConstants.USER_SESSION];
                var dao = new Device_Dao();
                var result = dao.CreateByThin(data, userLogin.UserID);

                return result;
            }
            catch (Exception)
            {

                return -1;
            }
        }

        // Sửa thông tin thiết bị
        public int EditByThin(Device data)
        {
            try
            {
                var userLogin = (ToolingRoomManagement.Common.UserLogin)Session[ToolingRoomManagement.Common.CommonConstants.USER_SESSION];
                var dao = new Device_Dao();
                var result = dao.EditByThin(data, userLogin.UserID);

                return result;
            }
            catch (Exception)
            {

                return -1;
            }
        }

        // Lấy tất cả thiết bị
        public string GetByThin()
        {
            try
            {
                var dao = new Device_Dao();
                var result = dao.GetByThin();
                if (result != null)
                {
                    return JsonConvert.SerializeObject(result);
                }
                else
                {
                    return "";
                }

            }
            catch (Exception)
            {

                return "";
            }

        }

        // Lấy 1 thiết bị
        public string GetByIdByThin(int id)
        {
            try
            {
                var dao = new Device_Dao();
                var result = dao.GetByID(id);
                if (result != null)
                {
                    return JsonConvert.SerializeObject(result);
                }
                else
                {
                    return "";
                }

            }
            catch (Exception)
            {

                return "";
            }

        }
        #endregion
    }
}