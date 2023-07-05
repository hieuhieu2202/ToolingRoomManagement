using Model.Dao;
using Model.EF;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Script.Serialization;
using ToolingRoomManagement.Models;

namespace ToolingRoomManagement.Areas.Admin.Controllers
{
    public class ReceiveController : Controller
    {
        // GET: Admin/Receive
        ToolingRoomDbContext context = new ToolingRoomDbContext();
        public ActionResult Index()
        {
            return View();
        }
        public string get_ReceiveGet()
        {
            var session = (ToolingRoomManagement.Common.UserLogin)Session[ToolingRoomManagement.Common.CommonConstants.USER_SESSION];
            int user_id = Int32.Parse(session.UserID.ToString());
            string create_by = session.UserName;

            var data = new Receive_Dao().listReceive_User_Id(user_id, session.GroupID);
            var json = new JavaScriptSerializer().Serialize(data);
            return json;
        }
        public string get_ReceiveBack()
        {
            var session = (ToolingRoomManagement.Common.UserLogin)Session[ToolingRoomManagement.Common.CommonConstants.USER_SESSION];
            int user_id = Int32.Parse(session.UserID.ToString());
            string create_by = session.UserName;
            List<Input> input = context.Inputs.ToList();
            List<DeviceBackRoom> deviceback = context.DeviceBackRooms.ToList();
            List<Device> device = context.Devices.ToList();
            var data = new Receive_Dao().listReceive_User_Id(user_id, session.GroupID).Where(x=>x.code_receive.Contains("I")&& x.status==4);
            var data1 = new Receive_Dao().listReceive_User_Id(user_id, session.GroupID).Where(x => x.code_receive.Contains("I") && x.status != 4);
            var result = from d in data
                         join a in input on d.code_receive equals a.code_order
                         into tbl_Input_Receive
                         from b in tbl_Input_Receive.DefaultIfEmpty()
                         join de in device on b.device_id equals de.id
                         into tbl_Input_Receive_device
                         from c in tbl_Input_Receive_device.DefaultIfEmpty()
                         select new InputBackModel
                         {
                             code_device=c.code_device,
                             SN_device=c.produce_SN,
                             receive = d

                         };
            var result1 = from d in data1
                         join a in deviceback on d.id equals a.receive_id
                         into tbl_Input_Receive
                         from b in tbl_Input_Receive.DefaultIfEmpty()
                         select new InputBackModel
                         {
                             receive = d,
                             deviceback = b

                         };
            var json = new JavaScriptSerializer().Serialize(result);
            var json1 = new JavaScriptSerializer().Serialize(result1);
            var js = "[" + json + "," + json1 + "]";
            return js;
        }
        public string get_ReceiveBackDevice(int status)
        {
            var session = (ToolingRoomManagement.Common.UserLogin)Session[ToolingRoomManagement.Common.CommonConstants.USER_SESSION];
            int user_id = Int32.Parse(session.UserID.ToString());
            int role = Int32.Parse(session.GroupID.ToString());
            var json = "";
            if (status == 4)
            {
                var data = new Receive_Dao().listAllReceive_Back(role,user_id).Where(x=>x.status==4).OrderByDescending(x=>x.create_date).ToList();
                json = new JavaScriptSerializer().Serialize(data);
            }else if (status == 3)
            {
                var data = new Receive_Dao().listAllReceive_Back(role, user_id).Where(x => x.status == 3).OrderByDescending(x => x.create_date).ToList();
                json = new JavaScriptSerializer().Serialize(data);
            }
            else
            {
                var data = new Receive_Dao().listAllReceive_Back(role, user_id).Where(x => x.status != 3).ToList().Where(x => x.status != 4).ToList();
                json = new JavaScriptSerializer().Serialize(data.OrderByDescending(x => x.create_date));
            }
            return json;
        }
        public string get_ReceiveGetDevice()
        {
            var data = new Receive_Dao().listAllReceive_Get();
            var json = new JavaScriptSerializer().Serialize(data);
            return json;
        }
        public ActionResult Create_Receive(AddReceiveModel re)
        {
            int id_receive = 0;
            var id = re.id;
            var receive_name = re.receive_name;
            var manager_id = re.manager_id;
            var manager_confirm = re.manager_name;
            var note = re.note;
            if (re.id.HasValue && re.id > 0)
            {
                var update_receive = (from dt in context.Receives
                                      where dt.id == id
                                      select dt).FirstOrDefault();

                if (update_receive == null) return Json("Khong co ban ghi");

                update_receive.receive_name = receive_name;
                update_receive.note = note;
                update_receive.status = 1;
                update_receive.note_Thuy = null;
                update_receive.note_manager = null;
                update_receive.note_manager_back = null;
                update_receive.note_cThan = null;
                context.SaveChanges();
            }
            else
            {
                var date_now = DateTime.Now.ToString("yyyyMMdd");
                var result = "";
                var code_date = "";
                try
                {
                    result = (from t in context.Receives
                              where t.code_receive != null && t.code_receive.Contains(date_now)
                              // where date_now.Any(x=>t.code_device.Contains(x))
                              orderby t.code_receive descending
                              select t.code_receive).First();
                    code_date = result.Substring(1, 8);
                }
                catch
                {

                }
                var code_new = "";
                if (code_date == date_now)
                {
                    var code_extension = int.Parse(result.Substring(9, 4));
                    if (code_extension >= 1 && code_extension < 9)
                    {
                        code_new = "R" + code_date + "000" + (code_extension + 1);
                    }
                    else if (code_extension >= 9 && code_extension < 99)
                    {
                        code_new = "R" + code_date + "00" + (code_extension + 1);
                    }
                    else if (code_extension >= 99 && code_extension < 999)
                    {
                        code_new = "R" + code_date + "0" + (code_extension + 1);
                    }
                    else
                    {
                        code_new = "R" + code_date + (code_extension + 1);
                    }
                }
                else
                {
                    code_new = "R" + date_now + "0001";
                }
                var session = (ToolingRoomManagement.Common.UserLogin)Session[ToolingRoomManagement.Common.CommonConstants.USER_SESSION];
                int user_id = Int32.Parse(session.UserID.ToString());
                string create_by = session.UserName;
                id_receive = new Receive_Dao().Insert(code_new, receive_name, manager_confirm, create_by, note, manager_id, user_id, 1,1);
            }
            return Json(id_receive);
        }
        public string ReUpload(int id)
        {
            var update_receive = (from dt in context.Receives
                                  where dt.id == id
                                  select dt).FirstOrDefault();

            if (update_receive == null) return "Khong co ban ghi";

            update_receive.status = 1;
            update_receive.note_Thuy = null;
            update_receive.note_manager = null;
            update_receive.note_manager_back = null;
            update_receive.note_cThan = null;
            context.SaveChanges();
            return "OK";
        }
        public ActionResult Add_Device(ReceiveModel receive)
        {
            var receive_id = 0;
            if (receive.id.HasValue && receive.id > 0)
            {

            }
            else
            {
                receive_id = receive.receive_id;
                var device_id = receive.device_id;
                var quantity = receive.quantity;
                var unit = receive.type;
                var note = receive.note;
                var ngaytra = receive.ngaytra;

                var session = (ToolingRoomManagement.Common.UserLogin)Session[ToolingRoomManagement.Common.CommonConstants.USER_SESSION];
                int create_by = Int32.Parse(session.UserID.ToString());
                if (receive.status == 0)
                {

                    int id_ClipOutput = new ClipOutput_Dao().Insert(receive_id, device_id, quantity, unit, note, ngaytra);
                }
                else
                {
                    var update_receive = (from dt in context.Receives
                                          where dt.id == receive.receive_id
                                          select dt).FirstOrDefault();
                    update_receive.status = receive.status;
                    context.SaveChanges();

                    if (update_receive == null) return Json("Khong co ban ghi");
                    int id_ClipOutput = new ClipOutput_Dao().Insert(receive_id, device_id, quantity, unit, (note!=null? note.Replace("\n", ","):""), ngaytra);
                }

            }
            return Json(receive_id);
        }
        public ActionResult get_ClipOutput_Receive(int receive_id)
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
                              location = b.location,
                              clipOutput = d,

                          };
            var json = new JavaScriptSerializer().Serialize(data_ok);
            return Json(json);
        }
        public string get_Device_Back(int receive_id)
        {
            var data = new Input_Dao().Input_Back(receive_id);
            List<Device> device = context.Devices.ToList();
            List<User> user = context.Users.ToList();
            var data_ok = from d in data
                          join a in device on d.device_id equals a.id
                          into tbl_Clip_Device
                          from b in tbl_Clip_Device.DefaultIfEmpty()
                          join m in user on b.manager_id equals m.id
                          into tbl_Device_Manager
                          from c in tbl_Device_Manager.DefaultIfEmpty()
                          select new Device_BackModel
                          {
                              input = d,
                              device = b,
                              manager_name=c.fullname

                          };
            var json = new JavaScriptSerializer().Serialize(data_ok);
            return json;
        }
        public ActionResult detail_Receive_CThan(int receive_id)
        {
            var data = new ClipOutput_Dao().ClipOutput_Receive(receive_id);
            List<Device> device = context.Devices.ToList();
            var data_ok = from d in data
                          join a in device on d.device_id equals a.id
                          into tbl_Clip_Device
                          from b in tbl_Clip_Device.DefaultIfEmpty()
                          select new detailReceiveCThan
                          {
                              device_name = b.device_name,
                              quantity_in = b.quantity,
                              clipOutput = d,
                              device = b,
                          };
            var json = new JavaScriptSerializer().Serialize(data_ok);
            return Json(json);
        }
        public ActionResult get_Output_Receive(int receive_id)
        {
            var data = new Output_Dao().Output_Receive(receive_id);
            List<Device> device = context.Devices.ToList();
            var data_ok = from d in data
                          join a in device on d.device_id equals a.id
                          into tbl_Clip_Device
                          from b in tbl_Clip_Device.DefaultIfEmpty()
                          select new OutputModel
                          {
                              device_name = b.device_name,
                              location = b.location,
                              parameter=b.parameter,
                              output = d,
                          };
            var json = new JavaScriptSerializer().Serialize(data_ok);
            return Json(json);
        }
        public string get_Detail_Receive(int receive_id)
        {
            var data = new Output_Dao().Output_Receive(receive_id);
            List<Device> device = context.Devices.ToList();
            var receive = new Receive_Dao().Select_Receive(receive_id);
            var data_ok = from d in data
                          join a in device on d.device_id equals a.id
                          into tbl_Clip_Device
                          from b in tbl_Clip_Device.DefaultIfEmpty()
                          select new Detail_ReceiveModel
                          {
                              device = b,
                              output = d,
                          };
            var json1 = new JavaScriptSerializer().Serialize(data_ok);
            var json2 = new JavaScriptSerializer().Serialize(receive);
            var json = "[" + json1 + "," + json2 + "]";
            return json;
        }
        public ActionResult staff_Confirm(StaffModel staff)
        {
            var device_id = staff.device_id;
            var receive_id = staff.receive_id;
            var clip_id = staff.clip_id;
            var type = staff.type;
            var note = staff.note;
            var quantity = staff.quantity;
            var ngaytra = staff.ngaytra;

            var session = (ToolingRoomManagement.Common.UserLogin)Session[ToolingRoomManagement.Common.CommonConstants.USER_SESSION];
            string output_by = session.UserName.ToString();
            //Insert in dbo Output
            if (ngaytra != "")
            {
                int output = new Output_Dao().Insert(quantity, output_by, device_id, receive_id, type, note, ngaytra);
            }
            else
            {
                int output = new Output_Dao().Insert(quantity, output_by, device_id, receive_id, type, note, null);
            }




            var update_device = (from dt in context.Devices
                                 where dt.id == staff.device_id
                                 select dt).FirstOrDefault();
            if (update_device == null) return Json("Khong co ban ghi");

            int id_history = new Edit_History_Device().Insert(0,update_device.code_device, (update_device.quantity) + "->" + (update_device.quantity - quantity), update_device.location, "Phát TB");

            update_device.quantity = update_device.quantity - quantity;
            context.SaveChanges();

            //Delete in ClipOutput
            new ClipOutput_Dao().Delete(clip_id);

            //var update_receive = (from dt in context.Receives
            //                     where dt.id == staff.receive_id
            //                     select dt).FirstOrDefault();
            //if (update_receive == null) return Json("Khong co ban ghi");

            //update_receive.status = 3;
            //context.SaveChanges();
            return Json("OK");
        }
        public ActionResult Manage_Confirm(int id)
        {
            var update_receive = (from dt in context.Receives
                                  where dt.id == id
                                  select dt).FirstOrDefault();

            if (update_receive == null) return Json("Khong co ban ghi");
            update_receive.status = 2;
            update_receive.time_manager_cf = DateTime.Now;
            update_receive.note = null;
            context.SaveChanges();
            return Json("OK");

        }
        public ActionResult Manage_Confirm_Transfer(int id)
        {
            var update_receive = (from dt in context.Receives
                                  where dt.id == id
                                  select dt).FirstOrDefault();

            if (update_receive == null) return Json("Khong co ban ghi");
            update_receive.status = 5;
            update_receive.time_transfer_cf = DateTime.Now;
            context.SaveChanges();
            return Json("OK");

        }
        public ActionResult Manage_Confirm_Back(int id)
        {
            var update_receive = (from dt in context.Receives
                                  where dt.id == id
                                  select dt).FirstOrDefault();

            if (update_receive == null) return Json("Khong co ban ghi");
            update_receive.status = 7;
            update_receive.time_manager_cf_Back = DateTime.Now;
            context.SaveChanges();
            return Json("OK");
        }
        public ActionResult CThan_Confirm_Back(int id)
        {
            var update_receive = (from dt in context.Receives
                                  where dt.id == id
                                  select dt).FirstOrDefault();

            if (update_receive == null) return Json("Khong co ban ghi");
            update_receive.status = 5;
            update_receive.time_CThanConfirm = DateTime.Now;
            context.SaveChanges();
            return Json("OK");
        }
        public ActionResult Confirm_Check_OK(int id)
        {
            var update_receive = (from dt in context.Receives
                                  where dt.id == id
                                  select dt).FirstOrDefault();

            if (update_receive == null) return Json("Khong co ban ghi");
            update_receive.status = 2;
            update_receive.time_Thuy_cf = DateTime.Now;
            context.SaveChanges();
            return Json("OK");
        }

        public ActionResult Manage_Reject(int id, string note)
        {
            var update_receive = (from dt in context.Receives
                                  where dt.id == id
                                  select dt).FirstOrDefault();
            if (update_receive == null) return Json("Khong co ban ghi");
            if (update_receive.status == 1)
            {
                update_receive.note_manager = note;
            }
            else if (update_receive.status == 6)
            {

            }
            update_receive.status = 3;
            context.SaveChanges();
            return Json("OK");
        }
        public ActionResult Manage_Reject_Back(int id, string note)
        {
            var update_receive = (from dt in context.Receives
                                  where dt.id == id
                                  select dt).FirstOrDefault();
            if (update_receive == null) return Json("Khong co ban ghi");
            
            if (update_receive.status == 1)
            {
                update_receive.note_manager = note;
            }
            else if (update_receive.status == 6)
            {
                update_receive.note_transfer = note;
            }
            update_receive.status = 3;
            context.SaveChanges();
            return Json("OK");
        }
        public ActionResult CThan_Confirm(int id)
        {
            var update_receive = (from dt in context.Receives
                                  where dt.id == id
                                  select dt).FirstOrDefault();

            if (update_receive == null) return Json("Khong co ban ghi");
            update_receive.status = 5;
            update_receive.time_CThanConfirm = DateTime.Now;
            context.SaveChanges();
            return Json("OK");

        }
        public ActionResult CThan_Reject(int id, string note)
        {
            var update_receive = (from dt in context.Receives
                                  where dt.id == id
                                  select dt).FirstOrDefault();
            if (update_receive == null) return Json("Khong co ban ghi");
            update_receive.status = 3;
            update_receive.note_cThan = note;
            context.SaveChanges();
            return Json("OK");
        }
        public ActionResult Thuy_Reject(int id, string note)
        {
            var update_receive = (from dt in context.Receives
                                  where dt.id == id
                                  select dt).FirstOrDefault();
            if (update_receive == null) return Json("Khong co ban ghi");
            update_receive.status = 3;
            update_receive.note_Thuy = note;
            context.SaveChanges();
            return Json("OK");
        }

        public ActionResult Delete(int id)
        {
            new Receive_Dao().Delete(id);
            new ClipOutput_Dao().DeleteByReceive(id);
            return Json(new
            {
                status = true
            });
        }
        public ActionResult DeleteReceiveBack(int id)
        {
            new Receive_Dao().Delete(id);
            new DeviceBackRoom_Dao().Delete_(id);
            return Json(new
            {
                status = true
            });
        }
        public ActionResult Complete(int id)
        {
            var update_receive = (from dt in context.Receives
                                  where dt.id == id
                                  select dt).FirstOrDefault();

            if (update_receive == null) return Json("Khong co ban ghi");
            update_receive.status = 4;
            update_receive.complete_date = DateTime.Now;
            context.SaveChanges();
            return Json("OK");
        }
        public ActionResult Add_Manager_Confirm(Manager_AddModel add)
        {
            var update_receive = (from dt in context.Receives
                                  where dt.id == add.receive_id
                                  select dt).FirstOrDefault();

            if (update_receive == null) return Json("Khong co ban ghi");
            update_receive.status = 6;
            update_receive.add_manager = add.add_manager;
            update_receive.time_CThanConfirm = DateTime.Now;
            update_receive.add_manager_name = add.add_manager_name;
            context.SaveChanges();
            return Json("OK");
        }
        public string Insert_DeviceBack(int receive_id)
        {
            var session = (ToolingRoomManagement.Common.UserLogin)Session[ToolingRoomManagement.Common.CommonConstants.USER_SESSION];
            int input_by = Int32.Parse(session.UserID.ToString());
            var result = "";
            var issue = "";
            var data_check = context.DeviceBackRooms.Where(x => x.receive_id == receive_id).ToList();
            var dem = 0;
            if (data_check.Count != 0)
            {
                foreach(var item in data_check)
                {
                    dem++;
                    var device = (from dt in context.Devices
                                  where dt.produce_SN == item.produce_SN || dt.makiemke == item.makiemke
                                  select dt).FirstOrDefault();
                    var device_back = (from dt in context.DeviceBackRooms
                                       where dt.produce_SN == item.produce_SN || dt.makiemke == item.makiemke
                                       select dt).FirstOrDefault();
                    if (device != null)
                    {
                        device.quantity = device.quantity + 1;
                        context.SaveChanges();
                        return "OK";
                    }
                    else
                    {
                        try
                        {
                            result = (from t in context.Devices
                                      where t.code_device != null && t.code_device.Contains("FN")
                                      orderby t.code_device descending
                                      select t.code_device).First();
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
                        int device_id = new Device_Dao().Insert(code_new, device_back.device_name, int.Parse(device_back.manager_id.ToString()), int.Parse(device_back.quantity.ToString()), int.Parse(device_back.gioihan.ToString()), device_back.price, device_back.brand, device_back.parameter, device_back.unit, device_back.produce_SN, device_back.location, int.Parse(device_back.kind_of_device.ToString()), 0, device_back.makiemke, device_back.calibration, device_back.image_TB, device_back.note_status, int.Parse(device_back.status.ToString()));
                        //int delete = new DeviceBackRoom_Dao().Delete(maSN);
                        //if (device_id > 0 && delete == 1)
                        //{
                        //    var receive = (from dt in context.Receives
                        //                   where dt.id == device_back.receive_id
                        //                   select dt).FirstOrDefault();
                        //    int input_id = new Input_Dao().Insert_Back(device_id, int.Parse(device_back.quantity.ToString()), input_by, receive.code_receive, "Trả kho", device_back.receive_id);
                        //    if (input_id > 0)
                        //    {
                        //        receive.status = 4;
                        //        receive.complete_date = DateTime.Now;
                        //        context.SaveChanges();
                        //        return "OK";
                        //    }
                        //    else
                        //    {
                        //        return "OK";
                        //    }
                        //}
                        //else
                        //{
                        //    return "NG";
                        //}
                        if (device_id > 0)
                        {
                            var receive = (from dt in context.Receives
                                           where dt.id == device_back.receive_id
                                           select dt).FirstOrDefault();
                            int input_id = new Input_Dao().Insert_Back(device_id, int.Parse(device_back.quantity.ToString()), input_by, receive.code_receive, "Trả kho", device_back.receive_id);
                            if (input_id > 0)
                            {
                                receive.status = 4;
                                receive.complete_date = DateTime.Now;
                                context.SaveChanges();
                                issue = "OK";
                            }
                            else
                            {
                                issue = "NG";
                            }
                            
                        }
                        else
                        {
                            issue = dem.ToString();
                        }
                    }
                }
            }else
            {
                issue = "Ko có dữ liệu để thêm vào kho!";
            }
            return issue;
        }
        public DateTime formatDate(string date)
        {

            return DateTime.ParseExact(date.Replace(" ", ""), "yyyy-MM-dd", null);

        }
        public string getReceiveGet(int status,int numberPage)
        {
            var session = (ToolingRoomManagement.Common.UserLogin)Session[ToolingRoomManagement.Common.CommonConstants.USER_SESSION];
            int user_id = Int32.Parse(session.UserID.ToString());
            string create_by = session.UserName;
            List<User> user = context.Users.ToList();
            if (status == 4)
            {
                var model = new Receive_Dao().listReceive_Staff_Complete(int.Parse(session.GroupID.ToString()),user_id).OrderByDescending(x=>x.complete_date);
                var b = model.Count();
                var a = model.Count() / 100;
                var num = Int32.Parse(a.ToString());
                var da = model.Skip((numberPage-1)*100).Take(100);
                var data = from e in da
                           join d in user on e.create_by equals d.username
                           into tbl_receive_user
                           from p in tbl_receive_user.DefaultIfEmpty()
                           orderby e.create_date descending
                           select new Receive_UserModel
                           {
                               fullname = p.fullname,
                               receive = e,
                           };
                var json = new JavaScriptSerializer().Serialize(data);
                return json+"___"+(num+1);
            }
            else if(status==3)
            {
                var model = new Receive_Dao().listReceive_Reject(int.Parse(session.GroupID.ToString()), user_id);
                var data = from e in model
                           join d in user on e.create_by equals d.username
                           into tbl_receive_user
                           from p in tbl_receive_user.DefaultIfEmpty()
                           orderby e.create_date descending
                           select new Receive_UserModel
                           {
                               fullname = p.fullname,
                               receive = e,
                           };
                var json = new JavaScriptSerializer().Serialize(data);
                return json;
            }
            else
            {
                var model = new Receive_Dao().listReceive_Wait(int.Parse(session.GroupID.ToString()), user_id);
                var data = from e in model
                           join d in user on e.create_by equals d.username
                           into tbl_receive_user
                           from p in tbl_receive_user.DefaultIfEmpty()
                           orderby e.create_date descending
                           select new Receive_UserModel
                           {
                               fullname = p.fullname,
                               receive = e,
                           };
                var json = new JavaScriptSerializer().Serialize(data);
                return json;
            }
           
        }
        public string getReceiveManager_Get(int status)
        {
            var session = (ToolingRoomManagement.Common.UserLogin)Session[ToolingRoomManagement.Common.CommonConstants.USER_SESSION];
            int user_id = Int32.Parse(session.UserID.ToString());
            string create_by = session.UserName;
            List<User> user = context.Users.ToList();
            if (status == 4)
            {
                var model = new Receive_Dao().listAllReceiveManager_Get(user_id);

                var data = from e in model
                           join d in user on e.create_by equals d.username
                           into tbl_receive_user
                           from p in tbl_receive_user.DefaultIfEmpty()
                           where e.status == 2 || e.status==4 || status==5
                           orderby e.create_date descending
                           select new Receive_UserModel
                           {
                               fullname = p.fullname,
                               receive = e,
                           };
                var json = new JavaScriptSerializer().Serialize(data);
                return json;
            }
            else if (status == 3)
            {
                var model = new Receive_Dao().listAllReceiveManager_Get(user_id);
                var data = from e in model
                           join d in user on e.create_by equals d.username
                           into tbl_receive_user
                           from p in tbl_receive_user.DefaultIfEmpty()
                           where e.status==3
                           orderby e.create_date descending
                           select new Receive_UserModel
                           {
                               fullname = p.fullname,
                               receive = e,
                           };
                var json = new JavaScriptSerializer().Serialize(data);
                return json;
            }
            else
            {
                var model = new Receive_Dao().listAllReceiveManager_Get(user_id);
                var data = from e in model
                           join d in user on e.create_by equals d.username
                           into tbl_receive_user
                           from p in tbl_receive_user.DefaultIfEmpty()
                           where e.status==1 || e.status==6
                           orderby e.create_date descending
                           select new Receive_UserModel
                           {
                               fullname = p.fullname,
                               receive = e,
                           };
                var json = new JavaScriptSerializer().Serialize(data);
                return json;
            }

        }
        public string getReceiveManager_Back(int status)
        {
            var session = (ToolingRoomManagement.Common.UserLogin)Session[ToolingRoomManagement.Common.CommonConstants.USER_SESSION];
            int user_id = Int32.Parse(session.UserID.ToString());
            string create_by = session.UserName;
            List<User> user = context.Users.ToList();
            if (status == 4)
            {
                var model = new Receive_Dao().listAllReceiveManager_Back(user_id);

                var data = from e in model
                           join d in user on e.create_by equals d.username
                           into tbl_receive_user
                           from p in tbl_receive_user.DefaultIfEmpty()
                           where e.status == 2 || e.status == 4 || status == 5 || e.status==7
                           orderby e.create_date descending
                           select new Receive_UserModel
                           {
                               fullname = p.fullname,
                               receive = e,
                           };
                var json = new JavaScriptSerializer().Serialize(data);
                return json;
            }
            else if (status == 3)
            {
                var model = new Receive_Dao().listAllReceiveManager_Back(user_id);
                var data = from e in model
                           join d in user on e.create_by equals d.username
                           into tbl_receive_user
                           from p in tbl_receive_user.DefaultIfEmpty()
                           where e.status == 3
                           orderby e.create_date descending
                           select new Receive_UserModel
                           {
                               fullname = p.fullname,
                               receive = e,
                           };
                var json = new JavaScriptSerializer().Serialize(data);
                return json;
            }
            else
            {
                var model = new Receive_Dao().listAllReceiveManager_Back(user_id);
                var data = from e in model
                           join d in user on e.create_by equals d.username
                           into tbl_receive_user
                           from p in tbl_receive_user.DefaultIfEmpty()
                           where e.status == 1 || e.status == 6
                           orderby e.create_date descending
                           select new Receive_UserModel
                           {
                               fullname = p.fullname,
                               receive = e,
                           };
                var json = new JavaScriptSerializer().Serialize(data);
                return json;
            }

        }
        public string getDataReceive_CThan_IsManager(int status)
        {
            var session = (ToolingRoomManagement.Common.UserLogin)Session[ToolingRoomManagement.Common.CommonConstants.USER_SESSION];
            int user_id = Int32.Parse(session.UserID.ToString());
            
            string create_by = session.UserName;
            var model = new Receive_Dao().listReceive_CThan_Check(user_id);
            List<User> user = context.Users.ToList();
            var json = "";
            
            if (status == 4)
            {
                var data = from e in model
                           join d in user on e.create_by equals d.username
                           into tbl_receive_user
                           from p in tbl_receive_user.DefaultIfEmpty()
                           where e.status==4
                           select new Receive_UserModel
                           {
                               fullname = p.fullname,
                               receive=e

                           };
                json = new JavaScriptSerializer().Serialize(data);
            }
            else if (status == 3)
            {
                var data = from e in model
                           join d in user on e.create_by equals d.username
                           into tbl_receive_user
                           from p in tbl_receive_user.DefaultIfEmpty()
                           where e.status == 3
                           select new Receive_UserModel
                           {
                               fullname = p.fullname,
                               receive = e

                           };
                json = new JavaScriptSerializer().Serialize(data);
            }
            else
            {
                var data = from e in model
                           join d in user on e.create_by equals d.username
                           into tbl_receive_user
                           from p in tbl_receive_user.DefaultIfEmpty()
                           where e.status == 1 || status==2 || status==5 ||status==6
                           select new Receive_UserModel
                           {
                               fullname = p.fullname,
                               receive = e

                           };
                json = new JavaScriptSerializer().Serialize(data.OrderByDescending(x=>x.receive.create_date));
            }
            return json;
        }
        
    }
}