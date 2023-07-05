using Model.Dao;
using Model.EF;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using ToolingRoomManagement.Models;

namespace ToolingRoomManagement.Controllers
{
    public class HomeController : Controller
    {
        const string DefaultLangCode = "en";
        // GET: Home
        ToolingRoomDbContext db = new ToolingRoomDbContext();
        public ActionResult Index()
        {
            ViewBag.LangCode = Session["LANGUAGE"] ?? DefaultLangCode;
            var listManager = new User_Dao().listUserManager();
            ViewBag.listManage = listManager;
            var model = new Device_Dao().ListAll_Devices();
            var data = from e in model
                       join d in listManager on e.manager_id equals d.id
                       into tbl_Device_user
                       from p in tbl_Device_user
                       select new View_Device_UserModel
                       {
                           username = p.fullname,
                           device = e,
                       };

            return View(data);
        }
        public ActionResult ChangeCulture(string id)
        {
            Session["LANGUAGE"] = id;
            return Redirect(Request.UrlReferrer.ToString());
        }
        public string get_DataByMonth()
        {
            var listDevice = new Device_Dao().ListAll_Devices();
            ViewBag.listDevice = listDevice;
            var output = new Output_Dao().listAllOutput();
            var data = (from e in output
                       join d in listDevice on e.device_id equals d.id
                       into tbl_Device_Output
                       from databyDevice in tbl_Device_Output.DefaultIfEmpty()
                       select new Device_OutputModel
                       {
                           device_name = databyDevice.device_name,
                           quantity = e != null && e.quantity_output.HasValue ? e.quantity_output : 0,
                           output_date = e != null && e.output_date.HasValue ? e.output_date.Value.ToString("yyyy/MM/dd HH:mm:ss") : "N/A"
                       }).ToList();

            var dataGroup = data.GroupBy(x => x.device_name).Select(j => j.First().device_name).ToList();

            var dataEmpty = listDevice.Where(x => dataGroup.Where(j=>j==x.device_name).Count()==0).Select(x=> new Device_OutputModel {
                device_name = x.device_name,
                quantity=0,
                output_date="N/A"
            }).ToList();
            var dataReSult = data.Union(dataEmpty);
            var json = JsonConvert.SerializeObject(dataReSult);
            return json;
        }
        public ActionResult Receive_By_Month()
        {
            ViewBag.LangCode = Session["LANGUAGE"] ?? DefaultLangCode;
            return View();
        }
        public ActionResult BorrowProduct()
        {
            ViewBag.LangCode = Session["LANGUAGE"] ?? DefaultLangCode;
            return View();
        }
    }
}