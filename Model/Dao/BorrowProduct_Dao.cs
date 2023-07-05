using Model.EF;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Model.Dao
{
    public class BorrowProduct_Dao
    {
        ToolingRoomDbContext db = null;
        public BorrowProduct_Dao()
        {
            db = new ToolingRoomDbContext();
        }
        public int InsertOrder(string codeOrder,int create_by_id, string create_by,int managerUs_id,string managerUs_username,string note,string date_borrow,string date_return,int accountantPD_id, string accountantPD_username,int managerPD_id,string managerPD_username,int aTin_id,string aTin_username,int aKhanh_id,string aKhanh_username)
        {
            var dateBorrow = DateTime.Parse(date_borrow);
            
            Summary obj = new Summary();
            obj.codeOrder = codeOrder;
            obj.create_by = create_by;
            obj.create_by_id = create_by_id;
            obj.managerUs_id = managerUs_id;
            obj.managerUs_username = managerUs_username;
            obj.note = note;
            obj.create_date = DateTime.Now;
            obj.date_borrow = dateBorrow;
            if (date_return != null)
            {
                var dateReturn = DateTime.Parse(date_return);
                obj.date_return = dateReturn;
            }
            obj.accountantPD_id = accountantPD_id;
            obj.accountantPD_username = accountantPD_username;
            obj.managerPD_id = managerPD_id;
            obj.managerPD_username = managerPD_username;
            obj.aTin_id = aTin_id;
            obj.aTin_username = aTin_username;
            obj.status = 1;
            obj.type_order = 1;
            obj.accountantPDBack_id = accountantPD_id;
            obj.accountantPDBack_username = accountantPD_username;
            obj.aKhanh_id = aKhanh_id;
            obj.aKhanh_username = aKhanh_username;
            db.Summaries.Add(obj);
            db.SaveChanges();
            return obj.id;
        }
        public int InsertOrderNight(string codeOrder, int create_by_id, string create_by, int managerUs_id, string managerUs_username, string note, string date_borrow, string date_return, int accountantPD_id, string accountantPD_username, int managerPD_id, string managerPD_username, int aTin_id, string aTin_username, int aKhanh_id, string aKhanh_username)
        {
            var dateBorrow = DateTime.Parse(date_borrow);

            Summary obj = new Summary();
            obj.codeOrder = codeOrder;
            obj.create_by = create_by;
            obj.create_by_id = create_by_id;
            obj.managerUs_id = managerUs_id;
            obj.managerUs_username = managerUs_username;
            obj.note = note;
            obj.create_date = DateTime.Now;
            obj.date_borrow = dateBorrow;
            if (date_return != null)
            {
                var dateReturn = DateTime.Parse(date_return);
                obj.date_return = dateReturn;
            }
            obj.accountantPD_id = accountantPD_id;
            obj.accountantPD_username = accountantPD_username;
            obj.managerPD_id = managerPD_id;
            obj.managerPD_username = managerPD_username;
            obj.aTin_id = aTin_id;
            obj.aTin_username = aTin_username;
            obj.status = 1;
            obj.type_order = 2;
            obj.leaderNightShift_username = "Tổ trưởng";
            obj.leaderNightBack_username = "Tổ trưởng";
            obj.accountantPDBack_id = accountantPD_id;
            obj.accountantPDBack_username = accountantPD_username;
            obj.aKhanh_id = aKhanh_id;
            obj.aKhanh_username = aKhanh_username;
            db.Summaries.Add(obj);
            db.SaveChanges();
            return obj.id;
        }
        public int InsertOrderNightOBA(string codeOrder, int create_by_id, string create_by, int managerUs_id, string managerUs_username, string note, string date_borrow, string date_return)
        {
            var dateBorrow = DateTime.Parse(date_borrow);

            Summary obj = new Summary();
            obj.codeOrder = codeOrder;
            obj.create_by = create_by;
            obj.create_by_id = create_by_id;
            obj.managerUs_id = managerUs_id;
            obj.managerUs_username = managerUs_username;
            obj.note = note;
            obj.create_date = DateTime.Now;
            obj.date_borrow = dateBorrow;
            if (date_return != null)
            {
                var dateReturn = DateTime.Parse(date_return);
                obj.date_return = dateReturn;
            }
            obj.status = 1;
            obj.type_order = 3;
            obj.leaderNightShift_username = "Tổ trưởng";
            obj.leaderNightBack_username = "Tổ trưởng";
            obj.accountantPDBack_username = "Kế toán PD";
            db.Summaries.Add(obj);
            db.SaveChanges();
            return obj.id;
        }


        public int InsertOrderDebt(string codeOrderDetb,string codeOrder,int order_id, int create_by_id, string create_by, int managerUs_id, string managerUs_username, string note, string date_borrow, string date_return, int accountantPD_id, string accountantPD_username, int managerPD_id, string managerPD_username, int aTin_id, string aTin_username, int aKhanh_id, string aKhanh_username)
        {
            var dateBorrow = DateTime.Parse(date_borrow);

            Summary obj = new Summary();
            obj.debt_order = codeOrder;
            obj.debt_order_id = order_id;
            obj.codeOrder = codeOrderDetb;
            obj.create_by = create_by;
            obj.create_by_id = create_by_id;
            obj.managerUs_id = managerUs_id;
            obj.managerUs_username = managerUs_username;
            obj.note = note;
            obj.create_date = DateTime.Now;
            obj.date_borrow = dateBorrow;
            if (date_return != null)
            {
                var dateReturn = DateTime.Parse(date_return);
                obj.date_return = dateReturn;
            }
            obj.accountantPD_id = accountantPD_id;
            obj.accountantPD_username = accountantPD_username;
            obj.managerPD_id = managerPD_id;
            obj.managerPD_username = managerPD_username;
            obj.aTin_id = aTin_id;
            obj.aTin_username = aTin_username;
            obj.status = 1;
            obj.accountantPDBack_id = accountantPD_id;
            obj.accountantPDBack_username = accountantPD_username;
            obj.aKhanh_id = aKhanh_id;
            obj.aKhanh_username = aKhanh_username;
            db.Summaries.Add(obj);
            db.SaveChanges();
            return obj.id;
        }
        public int InsertOrderForecast(string codeOrder, int create_by_id, string create_by, int managerUs_id, string managerUs_username, string note, string date_borrow, string accountantPD_username,int aTin_id, string aTin_username)
        {
            var dateBorrow = DateTime.Parse(date_borrow);

            Summary obj = new Summary();
            obj.codeOrder = codeOrder;
            obj.create_by = create_by;
            obj.create_by_id = create_by_id;
            obj.managerUs_id = managerUs_id;
            obj.managerUs_username = managerUs_username;
            obj.note = note;
            obj.create_date = DateTime.Now;
            obj.date_borrow = dateBorrow;
            obj.accountantPD_username = accountantPD_username;
            obj.aTin_id = aTin_id;
            obj.aTin_username = aTin_username;
            obj.status = 12;
            db.Summaries.Add(obj);
            db.SaveChanges();
            return obj.id;
        }
        public int InsertProduct(int summaryID,string productName,string productSN,int productQuantity,string productLine,string leaderLineCode,string leaderLineName)
        {
            DetailBorrow obj = new DetailBorrow();
            obj.summaryID = summaryID;
            obj.productName = productName;
            obj.productSN = productSN;
            obj.productQuantity = productQuantity;
            obj.productLine = productLine;
            obj.status_product = 1;
            obj.leaderLine_code = leaderLineCode;
            obj.leaderLine_name = leaderLineName;
            db.DetailBorrows.Add(obj);
            db.SaveChanges();
            return obj.id;
        }
        
    }
}
