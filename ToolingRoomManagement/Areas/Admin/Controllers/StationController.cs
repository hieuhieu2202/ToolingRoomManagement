using Model.Dao;
using Model.EF;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace ToolingRoomManagement.Areas.Admin.Controllers
{
    public class StationController : Controller
    {
        // GET: Admin/Station
        ToolingRoomDbContext context = new ToolingRoomDbContext();
        public ActionResult Index()
        {
            return View();
        }
        public string getAllStation()
        {
            var list = new Station_Dao().ListAllStation();
            var json = JsonConvert.SerializeObject(list);
            return json;
        }
        public string Insert(int id,string station_name)
        {
            if (id > 0)
            {
                var update_data = (from dt in context.Stations
                                   where dt.id == id
                                   select dt).FirstOrDefault();

                if (update_data == null) return "Khong co ban ghi";
                update_data.station_name = station_name;
                context.SaveChanges();
                return "OK";
            }
            else
            {
                int id_station = new Station_Dao().Insert(station_name);
                if (id_station > 0)
                {
                    return "OK";
                }
                else
                {
                    return "NG";
                }
            }
        }
    }
}