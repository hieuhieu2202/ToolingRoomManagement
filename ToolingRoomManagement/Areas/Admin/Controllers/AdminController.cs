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
    public class AdminController : Controller
    {
        const string DefaultLangCode = "en";
        // GET: Admin/Admin
        ToolingRoomDbContext context = new ToolingRoomDbContext();
        public ActionResult Index()
        {
            ViewBag.LangCode = Session["LANGUAGE"] ?? DefaultLangCode;
            var session = (ToolingRoomManagement.Common.UserLogin)Session[ToolingRoomManagement.Common.CommonConstants.USER_SESSION];
            int user_id = Int32.Parse(session.UserID.ToString());
            string create_by = session.UserName;
            ViewBag.listAllReceive = new Receive_Dao().listReceive_User_Id(user_id, session.GroupID);
            ViewBag.ListDevice_Manager = new Device_Dao().ListDevice_Manager();
            var device = new Device_Dao().ListAll_Devices();
            var model = from d in device
                        join u in context.Users on d.manager_id equals u.id
                        into tbl_device_user
                        from t in tbl_device_user//.DefaultIfEmpty()
                        select new Device_ManagerModel
                        {
                            user_name = t.fullname,
                            device = d
                        };

            ViewBag.listManager = new User_Dao().listUserManager();
            return View(model);
        }

        public ActionResult Receive_NotYetConfirm()
        {
            var session_log = (Common.UserLogin)Session[ToolingRoomManagement.Common.CommonConstants.USER_SESSION];
            if (session_log != null)
            {
                ViewBag.LangCode = Session["LANGUAGE"] ?? DefaultLangCode;
                var session = (ToolingRoomManagement.Common.UserLogin)Session[ToolingRoomManagement.Common.CommonConstants.USER_SESSION];
                int user_id = Int32.Parse(session.UserID.ToString());
                string create_by = session.UserName;
                ViewBag.listAllReceive = new Receive_Dao().listReceive_User_Id(user_id, session.GroupID);
                var model = new Receive_Dao().listReceive_Manager(user_id);
                List<User> user = context.Users.ToList();
                var data = from e in model
                           join d in user on e.create_by equals d.username
                           into tbl_receive_user
                           from p in tbl_receive_user.DefaultIfEmpty()
                           select new Receive_UserModel
                           {
                               fullname = p.fullname,
                               receive_id = e.id,
                               receive_name = e.receive_name,
                               create_date = e.create_date,
                               code_receive = e.code_receive,

                           };

                var json = new JavaScriptSerializer().Serialize(data);
                return View(data);
            }
            else
            {
                return RedirectToAction("Index", "Home");
            }

        }
        public ActionResult Receive_Transfer()
        {
            var session_log = (Common.UserLogin)Session[ToolingRoomManagement.Common.CommonConstants.USER_SESSION];
            if (session_log != null)
            {
                ViewBag.LangCode = Session["LANGUAGE"] ?? DefaultLangCode;
                var session = (ToolingRoomManagement.Common.UserLogin)Session[ToolingRoomManagement.Common.CommonConstants.USER_SESSION];
                int user_id = Int32.Parse(session.UserID.ToString());
                string create_by = session.UserName;
                ViewBag.listAllReceive = new Receive_Dao().listReceive_User_Id(user_id, session.GroupID);
                var model = new Receive_Dao().listReceive_Transfer(user_id);
                List<User> user = context.Users.ToList();
                var data = from e in model
                           join d in user on e.create_by equals d.username
                           into tbl_receive_user
                           from p in tbl_receive_user.DefaultIfEmpty()
                           select new Receive_UserModel
                           {
                               fullname = p.fullname,
                               receive_id = e.id,
                               receive_name = e.receive_name,
                               create_date = e.create_date,
                               add_manager_name = e.add_manager_name,
                               manager_name = e.manager_confirm,
                               code_receive = e.code_receive,
                           };

                var json = new JavaScriptSerializer().Serialize(data);
                return View(data);
            }
            else
            {
                return RedirectToAction("Index", "Home");
            }
        }
        public ActionResult UserPage()
        {
            var session_log = (Common.UserLogin)Session[ToolingRoomManagement.Common.CommonConstants.USER_SESSION];
            if (session_log != null)
            {
                ViewBag.LangCode = Session["LANGUAGE"] ?? DefaultLangCode;
                var session = (ToolingRoomManagement.Common.UserLogin)Session[ToolingRoomManagement.Common.CommonConstants.USER_SESSION];
                int user_id = Int32.Parse(session.UserID.ToString());
                string create_by = session.UserName;
                ViewBag.listAllReceive = new Receive_Dao().listReceive_User_Id(user_id, session.GroupID);
                ViewBag.listAllDevice = new Device_Dao().ListAll_Devices();
                ViewBag.ListAllManager = new User_Dao().listUserManager();
                var device = new Device_Dao().ListAll_Devices();
                ViewBag.listAllDevice = device;
                var model = from d in device
                            join u in context.Users on d.manager_id equals u.id
                            into tbl_device_user
                            from t in tbl_device_user//.DefaultIfEmpty()
                            select new Device_ManagerModel
                            {
                                user_name = t.fullname,
                                device = d
                            };

                ViewBag.listManager = new User_Dao().listUserManager();
                return View(model);
            }
            else
            {
                return RedirectToAction("Index", "Home");
            }
        }
        public ActionResult Confirm_Page()
        {
            var session_log = (Common.UserLogin)Session[ToolingRoomManagement.Common.CommonConstants.USER_SESSION];
            if (session_log != null)
            {
                ViewBag.LangCode = Session["LANGUAGE"] ?? DefaultLangCode;
                var session = (ToolingRoomManagement.Common.UserLogin)Session[ToolingRoomManagement.Common.CommonConstants.USER_SESSION];
                int user_id = Int32.Parse(session.UserID.ToString());
                string create_by = session.UserName;
                ViewBag.listAllReceive = new Receive_Dao().listReceive_User_Id(user_id, session.GroupID);
                var device = new Device_Dao().ListAll_Devices();
                ViewBag.listAllDevice = device;
                var model = from d in device
                            join u in context.Users on d.manager_id equals u.id
                            into tbl_device_user
                            from t in tbl_device_user//.DefaultIfEmpty()
                            select new Device_ManagerModel
                            {
                                user_name = t.fullname,
                                device = d
                            };
                ViewBag.listManager = new User_Dao().listUserManager();
                return View(model);
            }
            else
            {
                return RedirectToAction("Index", "Home");
            }
        }
        public ActionResult History_Edit()
        {
            var session_log = (Common.UserLogin)Session[ToolingRoomManagement.Common.CommonConstants.USER_SESSION];
            if (session_log != null)
            {
                ViewBag.LangCode = Session["LANGUAGE"] ?? DefaultLangCode;
                var session = (ToolingRoomManagement.Common.UserLogin)Session[ToolingRoomManagement.Common.CommonConstants.USER_SESSION];
                int user_id = Int32.Parse(session.UserID.ToString());
                string create_by = session.UserName;
                ViewBag.listAllReceive = new Receive_Dao().listReceive_User_Id(user_id, session.GroupID);
                ViewBag.ListDevice_Manager = new Device_Dao().ListDevice_Manager();
                ViewBag.listManager = new User_Dao().listUserManager();

                var his = new Edit_History_Device().List_History();
                var data = from d in his
                           join u in context.Devices on d.code_device equals u.code_device
                           into tbl_device_history
                           from t in tbl_device_history.DefaultIfEmpty()
                           where t.location == d.location
                           select new History_Edit_DeviceModel
                           {
                               device = t,
                               history = d,
                           };
                return View(data);
            }
            else
            {
                return RedirectToAction("Index", "Home");
            }
        }
        public ActionResult Receive_CThan()
        {
            var session_log = (Common.UserLogin)Session[ToolingRoomManagement.Common.CommonConstants.USER_SESSION];
            if (session_log != null)
            {
                var session = (ToolingRoomManagement.Common.UserLogin)Session[ToolingRoomManagement.Common.CommonConstants.USER_SESSION];
                int user_id = Int32.Parse(session.UserID.ToString());
                string create_by = session.UserName;
                ViewBag.LangCode = Session["LANGUAGE"] ?? DefaultLangCode;
                ViewBag.listAllReceive = new Receive_Dao().listReceive_User_Id(user_id, session.GroupID);
                ViewBag.listManager = new User_Dao().listUserManager();
                ViewBag.listAllDevice = new Device_Dao().ListAll_Devices();
                List<Receive> receive = context.Receives.ToList();
                List<ClipOutput> clip = context.ClipOutputs.ToList();
                List<Device> device = context.Devices.ToList();
                var model = new Receive_Dao().listReceive_CThan(user_id);
                return View(model);
            }
            else
            {
                return RedirectToAction("Index", "Home");
            }
        }
        public ActionResult Receive_CThan_Back()
        {
            var session_log = (Common.UserLogin)Session[ToolingRoomManagement.Common.CommonConstants.USER_SESSION];
            if (session_log != null)
            {
                ViewBag.listManager = new User_Dao().listUserManager();
                return View();
            }
            else
            {
                return RedirectToAction("Index", "Home");
            }
        }
        public ActionResult StaffPage()
        {
            var session_log = (Common.UserLogin)Session[ToolingRoomManagement.Common.CommonConstants.USER_SESSION];
            if (session_log != null)
            {
                ViewBag.LangCode = Session["LANGUAGE"] ?? DefaultLangCode;
                var session = (ToolingRoomManagement.Common.UserLogin)Session[ToolingRoomManagement.Common.CommonConstants.USER_SESSION];
                int user_id = Int32.Parse(session.UserID.ToString());
                string create_by = session.UserName;
                ViewBag.listAllReceive = new Receive_Dao().listReceive_User_Id(user_id, session.GroupID);

                var device = new Device_Dao().ListAll_Devices();
                ViewBag.listAllDevice = device;
                var model = from d in device
                            join u in context.Users on d.manager_id equals u.id
                            into tbl_device_user
                            from t in tbl_device_user//.DefaultIfEmpty()
                            select new Device_ManagerModel
                            {
                                user_name = t.fullname,
                                device = d
                            };

                ViewBag.listManager = new User_Dao().listUserManager();
                return View(model);
            }
            else
            {
                return RedirectToAction("Index", "Home");
            }
        }
        public ActionResult Receive_Check_Staff()
        {
            var session_log = (Common.UserLogin)Session[ToolingRoomManagement.Common.CommonConstants.USER_SESSION];
            if (session_log != null)
            {
                ViewBag.LangCode = Session["LANGUAGE"] ?? DefaultLangCode;
                var session = (ToolingRoomManagement.Common.UserLogin)Session[ToolingRoomManagement.Common.CommonConstants.USER_SESSION];
                int user_id = Int32.Parse(session.UserID.ToString());
                string create_by = session.UserName;

                ViewBag.listAllReceive = new Receive_Dao().listReceive_User_Id(user_id, session.GroupID);
                ViewBag.listManager = new User_Dao().listUserManager();
                ViewBag.listAllDevice = new Device_Dao().ListAll_Devices();
                List<Receive> receive = context.Receives.ToList();
                List<ClipOutput> clip = context.ClipOutputs.ToList();
                List<Device> device = context.Devices.ToList();
                var model = new Receive_Dao().listReceive_Back_Check();
                return View(model);
            }
            else
            {
                return RedirectToAction("Index", "Home");
            }
        }
        public string getAllDevice()
        {
            var device = new Device_Dao().ListAll_Devices();
            var json = JsonConvert.SerializeObject(device);
            return json;
        }
        public string getDevice_Manage()
        {
            var device = new Device_Dao().ListAll_Devices();
            var model = from d in device
                        join u in context.Users on d.manager_id equals u.id
                        into tbl_device_user
                        from t in tbl_device_user.DefaultIfEmpty()
                        select new Device_ManagerModel
                        {
                            user_name = t.fullname,
                            device = d
                        };
            var json = JsonConvert.SerializeObject(model);
            return json;
        }

        public ActionResult Receive_Staff()
        {
            var session_log = (Common.UserLogin)Session[ToolingRoomManagement.Common.CommonConstants.USER_SESSION];
            if (session_log != null)
            {
                ViewBag.LangCode = Session["LANGUAGE"] ?? DefaultLangCode;
                var session = (ToolingRoomManagement.Common.UserLogin)Session[ToolingRoomManagement.Common.CommonConstants.USER_SESSION];
                int user_id = Int32.Parse(session.UserID.ToString());
                string create_by = session.UserName;

                ViewBag.listAllReceive = new Receive_Dao().listReceive_User_Id(user_id, session.GroupID);
                ViewBag.listManager = new User_Dao().listUserManager();
                ViewBag.listAllDevice = new Device_Dao().ListAll_Devices();
                List<Receive> receive = context.Receives.ToList();
                List<ClipOutput> clip = context.ClipOutputs.ToList();
                List<Device> device = context.Devices.ToList();
                var model = new Receive_Dao().listReceive_Manager_OK();
                return View(model);
            }
            else
            {
                return RedirectToAction("Index", "Home");
            }
        }
        public ActionResult Receive_OutRoom()
        {
            var session_log = (Common.UserLogin)Session[ToolingRoomManagement.Common.CommonConstants.USER_SESSION];
            if (session_log != null)
            {
                ViewBag.LangCode = Session["LANGUAGE"] ?? DefaultLangCode;
                return View();
            }
            else
            {
                return RedirectToAction("Index", "Home");
            }
        }
        public ActionResult Receive_AThanOK_Staff()
        {
            var session_log = (Common.UserLogin)Session[ToolingRoomManagement.Common.CommonConstants.USER_SESSION];
            if (session_log != null)
            {
                //ViewBag.LangCode = Session["LANGUAGE"] ?? DefaultLangCode;
                //var session = (ToolingRoomManagement.Common.UserLogin)Session[ToolingRoomManagement.Common.CommonConstants.USER_SESSION];
                //int user_id = Int32.Parse(session.UserID.ToString());
                //string create_by = session.UserName;

                //ViewBag.listAllReceive = new Receive_Dao().listReceive_User_Id(user_id, session.GroupID);
                //ViewBag.listManager = new User_Dao().listUserManager();
                //ViewBag.listAllDevice = new Device_Dao().ListAll_Devices();
                //List<Receive> receive = context.Receives.ToList();
                //List<ClipOutput> clip = context.ClipOutputs.ToList();
                //List<Device> device = context.Devices.ToList();
                //var model = new Receive_Dao().listReceive_CThan_OK();
                //return View(model);
                return View();
            }
            else
            {
                return RedirectToAction("Index", "Home");
            }
        }
        public ActionResult Receive_CThan_NotYetConfirm()
        {
            var session_log = (Common.UserLogin)Session[ToolingRoomManagement.Common.CommonConstants.USER_SESSION];
            if (session_log != null)
            {
                ViewBag.listManager = new User_Dao().listUserManager();
                ViewBag.LangCode = Session["LANGUAGE"] ?? DefaultLangCode;
                return View();
            }
            else
            {
                return RedirectToAction("Index", "Home");
            }
        }
        public ActionResult Receive_User_NotYet()
        {
            var session_log = (Common.UserLogin)Session[ToolingRoomManagement.Common.CommonConstants.USER_SESSION];
            if (session_log != null)
            {
                ViewBag.LangCode = Session["LANGUAGE"] ?? DefaultLangCode;
                var session = (ToolingRoomManagement.Common.UserLogin)Session[ToolingRoomManagement.Common.CommonConstants.USER_SESSION];
                int user_id = Int32.Parse(session.UserID.ToString());
                string create_by = session.UserName;

                ViewBag.listManager = new User_Dao().listUserManager();
                ViewBag.listAllDevice = new Device_Dao().ListAll_Devices();
                ViewBag.listAllReceive = new Receive_Dao().listReceive_User_Id(user_id, session.GroupID);
                var model = new Receive_Dao().listReceive_User_NotYet(user_id);
                return View(model);
            }
            else
            {
                return RedirectToAction("Index", "Home");
            }
        }
        public ActionResult Receive_User()
        {
            var session_log = (Common.UserLogin)Session[ToolingRoomManagement.Common.CommonConstants.USER_SESSION];
            if (session_log != null)
            {
                ViewBag.LangCode = Session["LANGUAGE"] ?? DefaultLangCode;
                var session = (ToolingRoomManagement.Common.UserLogin)Session[ToolingRoomManagement.Common.CommonConstants.USER_SESSION];
                int user_id = Int32.Parse(session.UserID.ToString());
                string create_by = session.UserName;

                ViewBag.listAllReceive = new Receive_Dao().listReceive_User_Id(user_id, session.GroupID);
                ViewBag.listAllDevice = new Device_Dao().ListAll_Devices();
                var model = new Receive_Dao().listReceive_ManagerOK_User(user_id);
                return View(model);
            }
            else
            {
                return RedirectToAction("Index", "Home");
            }
        }
        public ActionResult Receive_AThanOK_User()
        {
            var session_log = (Common.UserLogin)Session[ToolingRoomManagement.Common.CommonConstants.USER_SESSION];
            if (session_log != null)
            {
                ViewBag.LangCode = Session["LANGUAGE"] ?? DefaultLangCode;
                var session = (ToolingRoomManagement.Common.UserLogin)Session[ToolingRoomManagement.Common.CommonConstants.USER_SESSION];
                int user_id = Int32.Parse(session.UserID.ToString());
                string create_by = session.UserName;

                ViewBag.listAllReceive = new Receive_Dao().listReceive_User_Id(user_id, session.GroupID);
                ViewBag.listAllDevice = new Device_Dao().ListAll_Devices();
                var model = new Receive_Dao().listReceive_CThanOK_User(user_id, session.GroupID);
                return View(model);
            }
            else
            {
                return RedirectToAction("Index", "Home");
            }
        }
        public ActionResult Receive_User_OK()
        {
            var session_log = (Common.UserLogin)Session[ToolingRoomManagement.Common.CommonConstants.USER_SESSION];
            if (session_log != null)
            {
                ViewBag.LangCode = Session["LANGUAGE"] ?? DefaultLangCode;
                var session = (ToolingRoomManagement.Common.UserLogin)Session[ToolingRoomManagement.Common.CommonConstants.USER_SESSION];
                int user_id = Int32.Parse(session.UserID.ToString());
                string create_by = session.UserName;

                ViewBag.listAllReceive = new Receive_Dao().listReceive_User_Id(user_id, session.GroupID);
                var model = new Receive_Dao().listReceive_User_OK(user_id);
                return View(model);
            }
            else
            {
                return RedirectToAction("Index", "Home");
            }
        }
        public ActionResult Receive_User_Back()
        {
            var session_log = (Common.UserLogin)Session[ToolingRoomManagement.Common.CommonConstants.USER_SESSION];
            if (session_log != null)
            {
                ViewBag.LangCode = Session["LANGUAGE"] ?? DefaultLangCode;
                var session = (ToolingRoomManagement.Common.UserLogin)Session[ToolingRoomManagement.Common.CommonConstants.USER_SESSION];
                int user_id = Int32.Parse(session.UserID.ToString());
                string create_by = session.UserName;
                ViewBag.listAllReceive = new Receive_Dao().listReceive_User_Id(user_id, session.GroupID);
                ViewBag.listAllDevice = new Device_Dao().ListAll_Devices();
                var model = new Receive_Dao().listReceive_Reject(int.Parse(session.GroupID.ToString()), user_id);
                return View(model);
            }
            else
            {
                return RedirectToAction("Index", "Home");
            }
        }
        //Đơn đợi lĩnh
        public ActionResult Receive_User_Get()
        {
            var session_log = (Common.UserLogin)Session[ToolingRoomManagement.Common.CommonConstants.USER_SESSION];
            if (session_log != null)
            {
                ViewBag.LangCode = Session["LANGUAGE"] ?? DefaultLangCode;
                var session = (ToolingRoomManagement.Common.UserLogin)Session[ToolingRoomManagement.Common.CommonConstants.USER_SESSION];
                int user_id = Int32.Parse(session.UserID.ToString());
                string create_by = session.UserName;
                ViewBag.listAllReceive = new Receive_Dao().listReceive_User_Id(user_id, session.GroupID);
                ViewBag.listAllDevice = new Device_Dao().ListAll_Devices();
                var model = new Receive_Dao().listOrder_OK(user_id);
                return View(model);
            }
            else
            {
                return RedirectToAction("Index", "Home");
            }
        }
        public ActionResult Receive_Complete()
        {
            var session_log = (Common.UserLogin)Session[ToolingRoomManagement.Common.CommonConstants.USER_SESSION];
            if (session_log != null)
            {
                ViewBag.LangCode = Session["LANGUAGE"] ?? DefaultLangCode;
                var session = (ToolingRoomManagement.Common.UserLogin)Session[ToolingRoomManagement.Common.CommonConstants.USER_SESSION];
                int user_id = Int32.Parse(session.UserID.ToString());
                string create_by = session.UserName;

                ViewBag.listAllReceive = new Receive_Dao().listReceive_User_Id(user_id, session.GroupID);
                var model = new Receive_Dao().listReceive_Staff_Complete(int.Parse(session.GroupID.ToString()), user_id);
                List<User> user = context.Users.ToList();
                var data = from e in model
                           join d in user on e.create_by equals d.username
                           into tbl_receive_user
                           from p in tbl_receive_user.DefaultIfEmpty()
                           select new Receive_UserModel
                           {
                               fullname = p.fullname,
                               receive_id = e.id,
                               receive_name = e.receive_name,
                               code_receive = e.code_receive,
                               create_date = e.create_date,
                               complete_date = e.complete_date,
                               add_manager_name = e.add_manager_name,
                               manager_name = e.manager_confirm,
                           };
                var json = new JavaScriptSerializer().Serialize(data);
                return View(data);
            }
            else
            {
                return RedirectToAction("Index", "Home");
            }
        }
        public ActionResult All_Output()
        {
            var session_log = (Common.UserLogin)Session[ToolingRoomManagement.Common.CommonConstants.USER_SESSION];
            if (session_log != null)
            {
                ViewBag.LangCode = Session["LANGUAGE"] ?? DefaultLangCode;
                var device = new Device_Dao().ListAll_Devices();
                ViewBag.listAllDevice = device;
                var session = (ToolingRoomManagement.Common.UserLogin)Session[ToolingRoomManagement.Common.CommonConstants.USER_SESSION];
                int user_id = Int32.Parse(session.UserID.ToString());
                string create_by = session.UserName;
                ViewBag.listAllReceive = new Receive_Dao().listReceive_User_Id(user_id, session.GroupID);
                var receive = new Receive_Dao().listAllReceive();
                var output = new Output_Dao().listAllOutput();
                var data = from o in output
                           join ro in receive on o.receive_id equals ro.id
                           into tbl_Output_Receive
                           from t in tbl_Output_Receive.DefaultIfEmpty()
                           join u in device on o.device_id equals u.id
                           into Output_R_U
                           from oru in Output_R_U.DefaultIfEmpty()
                           orderby oru.device_name
                           select new All_Output_Model
                           {
                               create_by = t.create_by,
                               output = o,
                               receive_code = t.code_receive,
                               device_code = oru.code_device,
                               device = oru,
                           };
                return View(data);
            }
            else
            {
                return RedirectToAction("Index", "Home");
            }
        }
        public ActionResult All_Input()
        {
            var session_log = (Common.UserLogin)Session[ToolingRoomManagement.Common.CommonConstants.USER_SESSION];
            if (session_log != null)
            {
                ViewBag.LangCode = Session["LANGUAGE"] ?? DefaultLangCode;
                var device = new Device_Dao().ListAll_Devices();
                ViewBag.listAllDevice = device;
                var session = (ToolingRoomManagement.Common.UserLogin)Session[ToolingRoomManagement.Common.CommonConstants.USER_SESSION];
                int user_id = Int32.Parse(session.UserID.ToString());
                string create_by = session.UserName;
                ViewBag.listAllReceive = new Receive_Dao().listReceive_User_Id(user_id, session.GroupID);
                var input = new Input_Dao().ListAllInput();
                var data = from o in input
                           join u in context.Devices on o.device_id equals u.id
                           into Output_R_U
                           from oru in Output_R_U.DefaultIfEmpty()
                           orderby oru.device_name
                           select new All_Input_Model
                           {
                               code_order = o.code_order,
                               username_input = o.username_input,
                               quantity = o.quantity,
                               date = o.input_date,
                               device = oru,
                               note = o.note,
                           };
                return View(data);
            }
            else
            {
                return RedirectToAction("Index", "Home");
            }
        }
        public ActionResult Test()
        {
            var session_log = (Common.UserLogin)Session[ToolingRoomManagement.Common.CommonConstants.USER_SESSION];
            if (session_log != null)
            {
                ViewBag.LangCode = Session["LANGUAGE"] ?? DefaultLangCode;
                var session = (ToolingRoomManagement.Common.UserLogin)Session[ToolingRoomManagement.Common.CommonConstants.USER_SESSION];
                int user_id = Int32.Parse(session.UserID.ToString());
                string create_by = session.UserName;

                ViewBag.listAllDevice = new Device_Dao().ListAll_Devices();
                ViewBag.listAllReceive = new Receive_Dao().listReceive_User_Id(user_id, session.GroupID);
                return View();
            }
            else
            {
                return RedirectToAction("Index", "Home");
            }
        }
        public ActionResult Golden_View()
        {
            var session_log = (Common.UserLogin)Session[ToolingRoomManagement.Common.CommonConstants.USER_SESSION];
            if (session_log != null)
            {
                ViewBag.LangCode = Session["LANGUAGE"] ?? DefaultLangCode;
                var model = new Golden_Dao().ListAllGolden();
                return View(model);
            }
            else
            {
                return RedirectToAction("Index", "Home");
            }
        }
        public ActionResult Golden_Edit()
        {
            var session_log = (Common.UserLogin)Session[ToolingRoomManagement.Common.CommonConstants.USER_SESSION];
            if (session_log != null)
            {
                ViewBag.LangCode = Session["LANGUAGE"] ?? DefaultLangCode;
                var model = new Golden_Dao().ListAllGolden();
                return View(model);
            }
            else
            {
                return RedirectToAction("Index", "Home");
            }
        }
        public ActionResult Fixture_View()
        {
            var session_log = (Common.UserLogin)Session[ToolingRoomManagement.Common.CommonConstants.USER_SESSION];
            if (session_log != null)
            {
                ViewBag.LangCode = Session["LANGUAGE"] ?? DefaultLangCode;
                var model = new Fixture_Dao().listAllFixture();
                return View(model);
            }
            else
            {
                return RedirectToAction("Index", "Home");
            }
        }
        public ActionResult Fixture_Edit()
        {
            var session_log = (Common.UserLogin)Session[ToolingRoomManagement.Common.CommonConstants.USER_SESSION];
            if (session_log != null)
            {
                ViewBag.LangCode = Session["LANGUAGE"] ?? DefaultLangCode;
                var model = new Fixture_Dao().listAllFixture();
                return View(model);
            }
            else
            {
                return RedirectToAction("Index", "Home");
            }
        }
        public ActionResult SheildingBox_View()
        {
            var session_log = (Common.UserLogin)Session[ToolingRoomManagement.Common.CommonConstants.USER_SESSION];
            if (session_log != null)
            {
                ViewBag.LangCode = Session["LANGUAGE"] ?? DefaultLangCode;
                var model = new SheildingBox_Dao().ListAllSheldingBox();
                return View(model);
            }
            else
            {
                return RedirectToAction("Index", "Home");
            }
        }
        public ActionResult SheildingBox_Edit()
        {
            var session_log = (Common.UserLogin)Session[ToolingRoomManagement.Common.CommonConstants.USER_SESSION];
            if (session_log != null)
            {
                ViewBag.LangCode = Session["LANGUAGE"] ?? DefaultLangCode;
                var model = new SheildingBox_Dao().ListAllSheldingBox();
                var ana = model.Where(a => a.Model_Name == "NAM");
                return View(model);
            }
            else
            {
                return RedirectToAction("Index", "Home");
            }
        }
        public ActionResult WeeklyCheckList()
        {
            var session_log = (Common.UserLogin)Session[ToolingRoomManagement.Common.CommonConstants.USER_SESSION];
            if (session_log != null)
            {
                ViewBag.LangCode = Session["LANGUAGE"] ?? DefaultLangCode;
                ViewBag.listAllStation = new Station_Dao().ListAllStation();
                List<Station> station = context.Stations.ToList();
                var model = new WeeklyCheckList_Dao().listAllWeeklyCheckList();
                var data = from w in model
                           join st in station on w.station_id equals st.id
                           into tbl_W_S
                           from ws in tbl_W_S.DefaultIfEmpty()
                           orderby w.create_date descending 
                           select new View_WeeklyCheckListModel
                           {
                               weekly = w,
                               station = ws,
                           };
                return View(data);
            }
            else
            {
                return RedirectToAction("Index", "Home");
            }
        }
        public ActionResult WeeklyCheckList_Edit()
        {
            var session_log = (Common.UserLogin)Session[ToolingRoomManagement.Common.CommonConstants.USER_SESSION];
            if (session_log != null)
            {
                var sessionPart = (ToolingRoomManagement.Common.SessionPart)Session[ToolingRoomManagement.Common.CommonConstants.SessionPart];
                ViewBag.LangCode = Session["LANGUAGE"] ?? DefaultLangCode;
                ViewBag.listAllStation = new Station_Dao().ListAllStation();
                List<Station> station = context.Stations.ToList();
                var model = new WeeklyCheckList_Dao().listAllWeeklyCheckList();
                var data = from w in model
                           join st in station on w.station_id equals st.id
                           into tbl_W_S
                           from ws in tbl_W_S.DefaultIfEmpty()
                           where w.part == sessionPart.part
                           orderby ws.station_name
                           select new View_WeeklyCheckListModel
                           {
                               weekly = w,
                               station = ws,
                           };
                return View(data);
            }
            else
            {
                return RedirectToAction("Index", "Home");
            }
        }
        public ActionResult Maintenance_Robot_View()
        {
            var session_log = (Common.UserLogin)Session[ToolingRoomManagement.Common.CommonConstants.USER_SESSION];
            if (session_log != null)
            {
                ViewBag.LangCode = Session["LANGUAGE"] ?? DefaultLangCode;
                List<Station_Robot> station = context.Station_Robot.ToList();
                ViewBag.listAllStation = new Station_Robot_Dao().listAllStation_Robot();
                var model = new MaintenanceRobot_Dao().listAllMaintenance();

                return View(model);
            }
            else
            {
                return RedirectToAction("Index", "Home");
            }
        }
        public ActionResult Maintenance_Robot_Edit()
        {
            var session_log = (Common.UserLogin)Session[ToolingRoomManagement.Common.CommonConstants.USER_SESSION];
            if (session_log != null)
            {
                ViewBag.LangCode = Session["LANGUAGE"] ?? DefaultLangCode;
                ViewBag.listAllStation = new Station_Robot_Dao().listAllStation_Robot();
                var model = new MaintenanceRobot_Dao().listAllMaintenance();
                List<Station_Robot> station = context.Station_Robot.ToList();

                return View(model);
            }
            else
            {
                return RedirectToAction("Index", "Home");
            }
        }
        public ActionResult OrderPurchase()
        {
            var session_log = (Common.UserLogin)Session[ToolingRoomManagement.Common.CommonConstants.USER_SESSION];
            if (session_log != null)
            {
                return View();
            }
            else
            {
                return RedirectToAction("Index", "Home");
            }
        }
        public ActionResult OrderPurchase_View()
        {
            var session_log = (Common.UserLogin)Session[ToolingRoomManagement.Common.CommonConstants.USER_SESSION];
            if (session_log != null)
            {
                var session = (ToolingRoomManagement.Common.UserLogin)Session[ToolingRoomManagement.Common.CommonConstants.USER_SESSION];
                var code_people = session.UserName;
                var model = new OrderPurchase_Dao().listAllOrderPurchase(code_people);
                return View(model);
            }
            else
            {
                return RedirectToAction("Index", "Home");
            }
        }
        public ActionResult OrderPurchase_OK()
        {
            var session_log = (Common.UserLogin)Session[ToolingRoomManagement.Common.CommonConstants.USER_SESSION];
            if (session_log != null)
            {
                var session = (ToolingRoomManagement.Common.UserLogin)Session[ToolingRoomManagement.Common.CommonConstants.USER_SESSION];
                var code_people = session.UserName;
                var model = new OrderPurchase_Dao().listAllOrderPurchase_OK(code_people);
                return View(model);
            }
            else
            {
                return RedirectToAction("Index", "Home");
            }
        }
        public ActionResult OrderPurchase_OK_Detail(int id)
        {
            var session_log = (Common.UserLogin)Session[ToolingRoomManagement.Common.CommonConstants.USER_SESSION];
            if (session_log != null)
            {
                var model = new OrderPurchase_Dao().orderPurchase(id);
                return View(model);
            }
            else
            {
                return RedirectToAction("Index", "Home");
            }
        }
        public ActionResult OrderPurchase_Detail(int id)
        {
            var session_log = (Common.UserLogin)Session[ToolingRoomManagement.Common.CommonConstants.USER_SESSION];
            if (session_log != null)
            {
                var model = new OrderPurchase_Dao().orderPurchase(id);
                return View(model);
            }
            else
            {
                return RedirectToAction("Index", "Home");
            }
        }
        public ActionResult OrderPurchase_Manager()
        {
            var session_log = (Common.UserLogin)Session[ToolingRoomManagement.Common.CommonConstants.USER_SESSION];
            if (session_log != null)
            {
                var session = (ToolingRoomManagement.Common.UserLogin)Session[ToolingRoomManagement.Common.CommonConstants.USER_SESSION];
                int user_id = Int32.Parse(session.UserID.ToString());
                var model = new OrderPurchase_Dao().list_OrderPurchase_Manager(user_id);
                return View(model);
            }
            else
            {
                return RedirectToAction("Index", "Home");
            }
        }
        public ActionResult OrderPurchase_Detail_Manager(int id)
        {
            var session_log = (Common.UserLogin)Session[ToolingRoomManagement.Common.CommonConstants.USER_SESSION];
            if (session_log != null)
            {
                var model = new OrderPurchase_Dao().orderPurchase(id);
                return View(model);
            }
            else
            {
                return RedirectToAction("Index", "Home");
            }
        }
        public ActionResult OrderPurchase_CThan()
        {
            var session_log = (Common.UserLogin)Session[ToolingRoomManagement.Common.CommonConstants.USER_SESSION];
            if (session_log != null)
            {
                var model = new OrderPurchase_Dao().list_OrderPurchase_CThan();
                return View(model);
            }
            else
            {
                return RedirectToAction("Index", "Home");
            }
        }
        public ActionResult OrderPurchase_Detail_CThan(int id)
        {
            var session_log = (Common.UserLogin)Session[ToolingRoomManagement.Common.CommonConstants.USER_SESSION];
            if (session_log != null)
            {
                var model = new OrderPurchase_Dao().orderPurchase(id);
                return View(model);
            }
            else
            {
                return RedirectToAction("Index", "Home");
            }
        }
        public ActionResult OrderPurchase_CThan_Checked()
        {
            var session_log = (Common.UserLogin)Session[ToolingRoomManagement.Common.CommonConstants.USER_SESSION];
            if (session_log != null)
            {
                var model = new OrderPurchase_Dao().list_OrderPurchase_CThan_Checked();
                return View(model);
            }
            else
            {
                return RedirectToAction("Index", "Home");
            }
        }
        public ActionResult OrderPurchase_CThan_Checked_Detail()
        {
            var session_log = (Common.UserLogin)Session[ToolingRoomManagement.Common.CommonConstants.USER_SESSION];
            if (session_log != null)
            {
                return View();
            }
            else
            {
                return RedirectToAction("Index", "Home");
            }
        }
        public ActionResult AiNiYo()
        {
            return View();
        }
        public ActionResult Receive_NotYet()
        {
            var session_log = (Common.UserLogin)Session[ToolingRoomManagement.Common.CommonConstants.USER_SESSION];
            if (session_log != null)
            {
                ViewBag.listManager = new User_Dao().listUserManager();
                return View();
            }
            else
            {
                return RedirectToAction("Index", "Home");
            }
        }
        public ActionResult Eit_QuantityLimit()
        {
            var session_log = (Common.UserLogin)Session[ToolingRoomManagement.Common.CommonConstants.USER_SESSION];
            if (session_log != null)
            {
                return View();
            }
            else
            {
                return RedirectToAction("Index", "Home");
            }
        }
        public ActionResult LUX_STATION()
        {
            var session_log = (Common.UserLogin)Session[ToolingRoomManagement.Common.CommonConstants.USER_SESSION];
            if (session_log != null)
            {
                return View();
            }
            else
            {
                return RedirectToAction("Index", "Home");
            }
        }
        public ActionResult EDIT_LUX_STATION()
        {
            var session_log = (Common.UserLogin)Session[ToolingRoomManagement.Common.CommonConstants.USER_SESSION];
            if (session_log != null)
            {
                return View();
            }
            else
            {
                return RedirectToAction("Index", "Home");
            }
        }
        public ActionResult EqipmentMaintainView()
        {
            return View();
        }
        public ActionResult EqipmentMaintainEdit()
        {
            return View();
        }

        /// <summary>
        /// Controller Lấy thông tin thiết bị theo ID:
        /// </summary>
        /// <param name="ID">ID thiết bị</param>
        /// <returns>Thiết bị</returns>
        /// Author: Ngo Canh Thin
        /// Date: 2023-04-24
        /// Reason: Lấy thiết bị để binding loại thiết bị
        public string GetByID(int ID)
        {
            var dao = new Device_Dao();
            var result = dao.GetByID(ID);
            return JsonConvert.SerializeObject(result);
        }
    }
}