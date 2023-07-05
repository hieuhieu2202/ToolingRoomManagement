using Model.Dao;
using Model.EF;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using ToolingRoomManagement.Models;

namespace ToolingRoomManagement.Areas.Admin.Controllers
{
    public class InputController : Controller
    {
        // GET: Admin/Input
        ToolingRoomDbContext context = new ToolingRoomDbContext();
        public ActionResult Index()
        {
            return View();
        }
        public ActionResult Create_Input(InputModel input)
        {
            var id = input.id;
            var device_id = input.device_id;
            var order_code = input.order_code;
            var quantity = input.quantity;
            var kind_of_device = input.kind_of_device;

            var session = (ToolingRoomManagement.Common.UserLogin)Session[ToolingRoomManagement.Common.CommonConstants.USER_SESSION];
            int input_by = Int32.Parse(session.UserID.ToString());
            int input_id = 0;
            var data = (from dt in context.Devices
                        where dt.id == device_id && dt.kind_of_device == kind_of_device
                        select dt).FirstOrDefault();
            
            if (data != null)
            {
                if (input.id.HasValue && input.id > 0)
                {

                }
                else
                {
                    input_id = new Input_Dao().Insert(device_id, quantity, input_by, order_code,"Nhập kho");
                }
                if (input_id > 0)
                {

                    var update_device = (from dt in context.Devices
                                         where dt.id == device_id && dt.kind_of_device == kind_of_device
                                         select dt).FirstOrDefault();
                    if (update_device == null) return Json("Khong co ban ghi");
                    int id_history = new Edit_History_Device().Insert(0,update_device.code_device, (update_device.quantity) + "->" + (update_device.quantity + quantity), update_device.location, "Nhập TB vào kho");
                    update_device.quantity = update_device.quantity + quantity;
                    context.SaveChanges();
                    return Json("OK");
                }
                else
                {
                    return Json("Fail");
                }
            }
            else
            {
                return Json("Không có thết bị này trong kho! Vui lòng kiểm tra lại!");
            }
            
        }
    }
}