using Model.EF;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Model.Dao
{
    public class OrderPurchase_Dao
    {
        ToolingRoomDbContext db = null;
        public OrderPurchase_Dao()
        {
            db = new ToolingRoomDbContext();
        }
        public List<OrderPurchase> listAllOrderPurchase(string code_people)
        {
            return db.OrderPurchases.Where(x => x.code_people == code_people && x.status==1||x.status==2||x.status==3).ToList();
        }
        public List<OrderPurchase> listAllOrderPurchase_OK(string code_people)
        {
            return db.OrderPurchases.Where(x => x.code_people == code_people && x.status == 4).ToList();
        }
        public List<OrderPurchase> list_OrderPurchase_Manager(int id)
        {
            return db.OrderPurchases.Where(x => x.status == 1 && x.manager_id == id).ToList();
        }
        public List<OrderPurchase> list_OrderPurchase_CThan()
        {
            return db.OrderPurchases.Where(x => x.status == 2).ToList();
        }
        public List<OrderPurchase> list_OrderPurchase_CThan_Checked()
        {
            return db.OrderPurchases.Where(x => x.status == 4).ToList();
        }
        public OrderPurchase orderPurchase(int id)
        {
            return db.OrderPurchases.SingleOrDefault(x => x.id == id);
        }
        public int Insert(string people_name,string part,string code_people,string phone,DateTime need_date,int type_item,string item_name,string item_model,string item_parameter,string item_number,int quantity,string purpose,string way_caculate,int manager_id,string manager_name)
        {
            OrderPurchase or = new OrderPurchase();
            or.people_name = people_name;
            or.part = part;
            or.code_people = code_people;
            or.phone = phone;
            or.create_date = DateTime.Now;
            or.need_date = need_date;
            or.type_item = type_item;
            or.item_name = item_name;
            or.item_model = item_model;
            or.item_parameter = item_parameter;
            or.item_number = item_number;
            or.quantity = quantity;
            or.purpose = purpose;
            or.way_caculate = way_caculate;
            or.manager_id = manager_id;
            or.manager_name = manager_name;
            or.status = 1;
            db.OrderPurchases.Add(or);
            db.SaveChanges();
            return or.id;
        }
    }
}
