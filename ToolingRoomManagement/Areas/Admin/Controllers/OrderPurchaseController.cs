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
    public class OrderPurchaseController : Controller
    {
        // GET: Admin/OrderPurchase
        ToolingRoomDbContext context = new ToolingRoomDbContext();
        public ActionResult Index()
        {
            return View();
        }
        public string Create_OrderPurchase(OrderPurchaseModel model)
        {
            if(model.id.HasValue && model.id > 0)
            {
                var update = (from dt in context.OrderPurchases
                              where dt.id == model.id
                              select dt).FirstOrDefault();
                update.phone = model.phone;
                update.need_date = DateTime.Parse(model.need_date);
                update.type_item = model.type_item;
                update.item_name = model.item_name;
                update.item_model = model.item_model;
                update.item_parameter = model.item_parameter;
                update.item_number = model.item_number;
                update.quantity = model.quantity;
                update.purpose = model.purpose;
                update.way_caculate = model.way_caculate;
                update.manager_id = model.id;
                update.status = 1;
                context.SaveChanges();
                return "OK";
            }
            else
            {
                int id = new OrderPurchase_Dao().Insert(model.people_name, model.part, model.code_people, model.phone, DateTime.Parse(model.need_date), model.type_item, model.item_name, model.item_model, model.item_parameter, model.item_number, model.quantity, model.purpose, model.way_caculate, model.manager_id, model.manager_name);
                if (id > 0)
                {
                    return "OK";
                }
                else
                {
                    return "NG";
                }
            }
        }
        public string confirm_manager(int id)
        {
            var update = (from dt in context.OrderPurchases
                          where dt.id == id
                          select dt).FirstOrDefault();
            
            update.status = 2;
            update.receiver_id = 1009;
            update.receiver_name = "Nguyễn Thị Thản";
            context.SaveChanges();
            return "OK";
        }
        public string reject_manager(int id, string note)
        {
            var update = (from dt in context.OrderPurchases
                          where dt.id == id
                          select dt).FirstOrDefault();

            update.status = 3;
            update.note_manager = note;
            context.SaveChanges();
            return "OK";
        }
        public string confirm_CThan(int id)
        {
            var update = (from dt in context.OrderPurchases
                          where dt.id == id
                          select dt).FirstOrDefault();

            update.status = 4;
            
            context.SaveChanges();
            return "OK";
        }
        public string reject_CThan(int id, string note)
        {
            var update = (from dt in context.OrderPurchases
                          where dt.id == id
                          select dt).FirstOrDefault();

            update.status = 3;
            update.note_manager = note;
            context.SaveChanges();
            return "OK";
        }
    }
}