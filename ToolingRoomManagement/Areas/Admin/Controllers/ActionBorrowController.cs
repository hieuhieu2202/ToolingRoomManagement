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
    public class ActionBorrowController : Controller
    {
        ToolingRoomDbContext context = new ToolingRoomDbContext();
        // GET: Admin/ActionBorrow
        public string InsertOrderProduct(OrderBorrowModel model)
        {
            if (model.order_id == 0)
            {
                var session = (ToolingRoomManagement.Common.UserLogin)Session[ToolingRoomManagement.Common.CommonConstants.USER_SESSION];
                string create_by = session.UserName + "-" + session.Fullname;

                var date_now = DateTime.Now.ToString("yyyyMMdd");
                var result = "";
                var codeOrder = "";
                var code_date = "";
                try
                {
                    result = (from t in context.Summaries
                              where t.codeOrder != null && t.codeOrder.Contains("OD" + date_now)
                              orderby t.codeOrder descending
                              select t.codeOrder).First();
                    if (result != null)
                    {
                        code_date = result.Substring(2, 8);
                    }
                }
                catch
                {

                }
                if (code_date == date_now && code_date != "")
                {
                    var code_extension = int.Parse(result.ToString().Substring(10, 4));
                    if (code_extension >= 1 && code_extension < 9)
                    {
                        codeOrder = "OD" + code_date + "000" + (code_extension + 1);
                    }
                    else if (code_extension >= 9 && code_extension < 99)
                    {
                        codeOrder = "OD" + code_date + "00" + (code_extension + 1);
                    }
                    else if (code_extension >= 99 && code_extension < 999)
                    {
                        codeOrder = "OD" + code_date + "0" + (code_extension + 1);
                    }
                    else
                    {
                        codeOrder = "OD" + code_date + (code_extension + 1);
                    }
                }
                else
                {
                    codeOrder = "OD" + date_now + "0001";
                }
                var acc = "Kế toán PD";
                //var accountant = context.Users.Where(x => x.role_id == 6).ToList();
                //if (accountant.Count != 0)
                //{
                //    foreach (var item in accountant)
                //    {
                //        acc += "/" + item.username + "-" + item.fullname;
                //    }
                //}
                var managerPD = context.Users.Where(x => x.role_id == 7).FirstOrDefault();
                var managerPD1 = context.Users.Where(x => x.role_id == 9).FirstOrDefault();
                var aTin = context.Users.Where(x => x.role_id == 8).FirstOrDefault();
                int order_id = new BorrowProduct_Dao().InsertOrder(codeOrder, int.Parse(session.UserID.ToString()), create_by, model.managerUs_id, model.managerUsFull, model.noteOrder, model.dateBorrow, model.dateReturn, 0, acc, managerPD.id, managerPD.username + "-" + managerPD.fullname, aTin.id, aTin.username + "-" + aTin.fullname, managerPD1.id, managerPD1.username + "-" + managerPD1.fullname);
                if (order_id > 0)
                {
                    var update = context.Summaries.Where(x => x.id == order_id).SingleOrDefault();
                    update.status = 1;
                    context.SaveChanges();
                    int product_id = new BorrowProduct_Dao().InsertProduct(order_id, model.productName, model.productSN, model.productQuantity, model.productLine, model.leaderLineCode, model.leaderLineName);
                    if (product_id > 0)
                    {
                        return order_id + "_" + codeOrder;
                    }
                    else
                    {
                        return "ProductNG";
                    }
                }
                else
                {
                    return "OrderNG";
                }
            }
            else
            {
                int product_id = new BorrowProduct_Dao().InsertProduct(model.order_id, model.productName, model.productSN, model.productQuantity, model.productLine, model.leaderLineCode, model.leaderLineName);
                if (product_id > 0)
                {
                    return "ProductOK";
                }
                else
                {
                    return "ProductNG";
                }
            }
        }
        public string InsertOrderProductNight(OrderBorrowModel model)
        {
            if (model.order_id == 0)
            {
                var session = (ToolingRoomManagement.Common.UserLogin)Session[ToolingRoomManagement.Common.CommonConstants.USER_SESSION];
                string create_by = session.UserName + "-" + session.Fullname;

                var date_now = DateTime.Now.ToString("yyyyMMdd");
                var result = "";
                var codeOrder = "";
                var code_date = "";
                try
                {
                    result = (from t in context.Summaries
                              where t.codeOrder != null && t.codeOrder.Contains("OD" + date_now)
                              orderby t.codeOrder descending
                              select t.codeOrder).First();
                    if (result != null)
                    {
                        code_date = result.Substring(2, 8);
                    }
                }
                catch
                {

                }
                if (code_date == date_now && code_date != "")
                {
                    var code_extension = int.Parse(result.ToString().Substring(10, 4));
                    if (code_extension >= 1 && code_extension < 9)
                    {
                        codeOrder = "OD" + code_date + "000" + (code_extension + 1);
                    }
                    else if (code_extension >= 9 && code_extension < 99)
                    {
                        codeOrder = "OD" + code_date + "00" + (code_extension + 1);
                    }
                    else if (code_extension >= 99 && code_extension < 999)
                    {
                        codeOrder = "OD" + code_date + "0" + (code_extension + 1);
                    }
                    else
                    {
                        codeOrder = "OD" + code_date + (code_extension + 1);
                    }
                }
                else
                {
                    codeOrder = "OD" + date_now + "0001";
                }

                var acc = "Kế toán PD";
                //var accountant = context.Users.Where(x => x.role_id == 6).ToList();
                //if (accountant.Count != 0)
                //{
                //    foreach (var item in accountant)
                //    {
                //        acc += "/" + item.username + "-" + item.fullname;
                //    }
                //}
                var managerPD = context.Users.Where(x => x.role_id == 7).FirstOrDefault();
                var managerPD1 = context.Users.Where(x => x.role_id == 9).FirstOrDefault();
                var aTin = context.Users.Where(x => x.role_id == 8).FirstOrDefault();
                int order_id = new BorrowProduct_Dao().InsertOrderNight(codeOrder, int.Parse(session.UserID.ToString()), create_by, model.managerUs_id, model.managerUsFull, model.noteOrder, model.dateBorrow, model.dateReturn, 0, acc, managerPD.id, managerPD.username + "-" + managerPD.fullname, aTin.id, aTin.username + "-" + aTin.fullname, managerPD1.id, managerPD1.username + "-" + managerPD1.fullname);
                if (order_id > 0)
                {
                    var update = context.Summaries.Where(x => x.id == order_id).SingleOrDefault();
                    update.status = 1;
                    context.SaveChanges();
                    int product_id = new BorrowProduct_Dao().InsertProduct(order_id, model.productName, model.productSN, model.productQuantity, model.productLine, model.leaderLineCode, model.leaderLineName);
                    if (product_id > 0)
                    {
                        return order_id + "_" + codeOrder;
                    }
                    else
                    {
                        return "ProductNG";
                    }
                }
                else
                {
                    return "OrderNG";
                }
            }
            else
            {
                int product_id = new BorrowProduct_Dao().InsertProduct(model.order_id, model.productName, model.productSN, model.productQuantity, model.productLine, model.leaderLineCode, model.leaderLineName);
                if (product_id > 0)
                {
                    return "ProductOK";
                }
                else
                {
                    return "ProductNG";
                }
            }
        }
        public string InsertOrderProductOBANight(OrderBorrowModel model)
        {
            if (model.order_id == 0)
            {
                var session = (ToolingRoomManagement.Common.UserLogin)Session[ToolingRoomManagement.Common.CommonConstants.USER_SESSION];
                string create_by = session.UserName + "-" + session.Fullname;

                var date_now = DateTime.Now.ToString("yyyyMMdd");
                var result = "";
                var codeOrder = "";
                var code_date = "";
                try
                {
                    result = (from t in context.Summaries
                              where t.codeOrder != null && t.codeOrder.Contains("OD" + date_now)
                              orderby t.codeOrder descending
                              select t.codeOrder).First();
                    if (result != null)
                    {
                        code_date = result.Substring(2, 8);
                    }
                }
                catch
                {

                }
                if (code_date == date_now && code_date != "")
                {
                    var code_extension = int.Parse(result.ToString().Substring(10, 4));
                    if (code_extension >= 1 && code_extension < 9)
                    {
                        codeOrder = "OD" + code_date + "000" + (code_extension + 1);
                    }
                    else if (code_extension >= 9 && code_extension < 99)
                    {
                        codeOrder = "OD" + code_date + "00" + (code_extension + 1);
                    }
                    else if (code_extension >= 99 && code_extension < 999)
                    {
                        codeOrder = "OD" + code_date + "0" + (code_extension + 1);
                    }
                    else
                    {
                        codeOrder = "OD" + code_date + (code_extension + 1);
                    }
                }
                else
                {
                    codeOrder = "OD" + date_now + "0001";
                }

                var acc = "Kế toán PD";
                //var accountant = context.Users.Where(x => x.role_id == 6).ToList();
                //if (accountant.Count != 0)
                //{
                //    foreach (var item in accountant)
                //    {
                //        acc += "/" + item.username + "-" + item.fullname;
                //    }
                ////}
                //var managerPD = context.Users.Where(x => x.role_id == 7).FirstOrDefault();
                //var managerPD1 = context.Users.Where(x => x.role_id == 9).FirstOrDefault();
                //var aTin = context.Users.Where(x => x.role_id == 8).FirstOrDefault();
                int order_id = new BorrowProduct_Dao().InsertOrderNightOBA(codeOrder, int.Parse(session.UserID.ToString()), create_by, model.managerUs_id, model.managerUsFull, model.noteOrder, model.dateBorrow, model.dateReturn);
                if (order_id > 0)
                {
                    var update = context.Summaries.Where(x => x.id == order_id).SingleOrDefault();
                    update.status = 1;
                    context.SaveChanges();
                    int product_id = new BorrowProduct_Dao().InsertProduct(order_id, model.productName, model.productSN, model.productQuantity, model.productLine, model.leaderLineCode, model.leaderLineName);
                    if (product_id > 0)
                    {
                        return order_id + "_" + codeOrder;
                    }
                    else
                    {
                        return "ProductNG";
                    }
                }
                else
                {
                    return "OrderNG";
                }
            }
            else
            {
                int product_id = new BorrowProduct_Dao().InsertProduct(model.order_id, model.productName, model.productSN, model.productQuantity, model.productLine, model.leaderLineCode, model.leaderLineName);
                if (product_id > 0)
                {
                    return "ProductOK";
                }
                else
                {
                    return "ProductNG";
                }
            }
        }
        public string InsertOrderDebt(OrderBorrowModel model)
        {
            if (model.orderDebt_id == 0)
            {
                var session = (ToolingRoomManagement.Common.UserLogin)Session[ToolingRoomManagement.Common.CommonConstants.USER_SESSION];
                string create_by = session.UserName + "-" + session.Fullname;

                var date_now = DateTime.Now.ToString("yyyyMMdd");
                var result = "";
                var codeOrder = "";
                var code_date = "";
                try
                {
                    result = (from t in context.Summaries
                              where t.codeOrder != null && t.codeOrder.Contains("OD" + date_now)
                              orderby t.codeOrder descending
                              select t.codeOrder).First();
                    if (result != null)
                    {
                        code_date = result.Substring(2, 8);
                    }
                }
                catch
                {

                }
                if (code_date == date_now && code_date != "")
                {
                    var code_extension = int.Parse(result.ToString().Substring(10, 4));
                    if (code_extension >= 1 && code_extension < 9)
                    {
                        codeOrder = "OD" + code_date + "000" + (code_extension + 1);
                    }
                    else if (code_extension >= 9 && code_extension < 99)
                    {
                        codeOrder = "OD" + code_date + "00" + (code_extension + 1);
                    }
                    else if (code_extension >= 99 && code_extension < 999)
                    {
                        codeOrder = "OD" + code_date + "0" + (code_extension + 1);
                    }
                    else
                    {
                        codeOrder = "OD" + code_date + (code_extension + 1);
                    }
                }
                else
                {
                    codeOrder = "OD" + date_now + "0001";
                }
                var accountant = context.Users.Where(x => x.role_id == 6).ToList();
                var acc = "Kế toán PD";
                //if (accountant.Count != 0)
                //{
                //    foreach (var item in accountant)
                //    {
                //        acc += "/" + item.username + "-" + item.fullname;
                //    }
                //}
                var managerPD = context.Users.Where(x => x.role_id == 7).FirstOrDefault();
                var managerPD1 = context.Users.Where(x => x.role_id == 9).FirstOrDefault();
                var aTin = context.Users.Where(x => x.role_id == 8).FirstOrDefault();

                int order_id = new BorrowProduct_Dao().InsertOrderDebt(codeOrder, model.order_code, model.order_id, int.Parse(session.UserID.ToString()), create_by, model.managerUs_id, model.managerUsFull, model.noteOrder, model.dateBorrow, model.dateReturn, 0, acc, managerPD.id, managerPD.username + "-" + managerPD.fullname, aTin.id, aTin.username + "-" + aTin.fullname, managerPD1.id, managerPD1.username + "-" + managerPD1.fullname);

                if (order_id > 0)
                {
                    var order = context.Summaries.Where(x => x.id == model.order_id).FirstOrDefault();
                    order.compensation_order = codeOrder;
                    order.compensation_order_id = order_id;
                    order.status = 15;
                    var update = context.Summaries.Where(x => x.id == order_id).SingleOrDefault();
                    update.status = 1;
                    context.SaveChanges();
                    int product_id = new BorrowProduct_Dao().InsertProduct(order_id, model.productName, model.productSN, model.productQuantity, model.productLine, model.leaderLineCode, model.leaderLineName);
                    if (product_id > 0)
                    {
                        return order_id + "_" + codeOrder;
                    }
                    else
                    {
                        return "ProductNG";
                    }
                }
                else
                {
                    return "OrderNG";
                }
            }
            else
            {
                int product_id = new BorrowProduct_Dao().InsertProduct(model.orderDebt_id, model.productName, model.productSN, model.productQuantity, model.productLine, model.leaderLineCode, model.leaderLineName);
                if (product_id > 0)
                {
                    return "ProductOK";
                }
                else
                {
                    return "ProductNG";
                }
            }
        }
        public string InsertOrderForecast(OrderForecastModel model)
        {
            if (model.order_id == 0)
            {
                var session = (ToolingRoomManagement.Common.UserLogin)Session[ToolingRoomManagement.Common.CommonConstants.USER_SESSION];
                string create_by = session.UserName + "-" + session.Fullname;

                var date_now = DateTime.Now.ToString("yyyyMMdd");
                var result = "";
                var codeOrder = "";
                var code_date = "";
                try
                {
                    result = (from t in context.Summaries
                              where t.codeOrder != null && t.codeOrder.Contains("FC" + date_now)
                              orderby t.codeOrder descending
                              select t.codeOrder).First();
                    if (result != null)
                    {
                        code_date = result.Substring(2, 8);
                    }
                }
                catch
                {

                }
                if (code_date == date_now && code_date != "")
                {
                    var code_extension = int.Parse(result.ToString().Substring(10, 4));
                    if (code_extension >= 1 && code_extension < 9)
                    {
                        codeOrder = "FC" + code_date + "000" + (code_extension + 1);
                    }
                    else if (code_extension >= 9 && code_extension < 99)
                    {
                        codeOrder = "FC" + code_date + "00" + (code_extension + 1);
                    }
                    else if (code_extension >= 99 && code_extension < 999)
                    {
                        codeOrder = "FC" + code_date + "0" + (code_extension + 1);
                    }
                    else
                    {
                        codeOrder = "FC" + code_date + (code_extension + 1);
                    }
                }
                else
                {
                    codeOrder = "FC" + date_now + "0001";
                }
                var aTin = context.Users.Where(x => x.role_id == 8).FirstOrDefault();
                int order_id = new BorrowProduct_Dao().InsertOrderForecast(codeOrder, int.Parse(model.user_id), model.userName, model.managerUs_id, model.managerUsFull, model.noteOrder, model.dateBorrow, create_by, aTin.id, aTin.username + "-" + aTin.fullname);
                if (order_id > 0)
                {
                    var update = context.Summaries.Where(x => x.id == order_id).SingleOrDefault();
                    update.status = 12;
                    context.SaveChanges();
                    int product_id = new BorrowProduct_Dao().InsertProduct(order_id, model.productName, null, model.productQuantity, model.productLine, model.leaderLineCode, model.leaderLineName);
                    if (product_id > 0)
                    {
                        return order_id + "_" + codeOrder;
                    }
                    else
                    {
                        return "ProductNG";
                    }
                }
                else
                {
                    return "OrderNG";
                }
            }
            else
            {
                int product_id = new BorrowProduct_Dao().InsertProduct(model.order_id, model.productName, null, model.productQuantity, model.productLine, model.leaderLineCode, model.leaderLineName);
                if (product_id > 0)
                {
                    return "ProductOK";
                }
                else
                {
                    return "ProductNG";
                }
            }
        }
        public string UpdateOrder(OrderBorrowModel model)
        {
            try
            {
                var dateBorrow = DateTime.Parse(model.dateBorrow);
                var dateReturn = DateTime.Parse(model.dateReturn);
                var data_update = context.Summaries.Where(x => x.id == model.order_id).SingleOrDefault();
                data_update.managerUs_id = model.managerUs_id;
                data_update.managerUs_username = model.managerUsFull;
                data_update.date_borrow = dateBorrow;
                data_update.date_return = dateReturn;
                data_update.note = model.noteOrder;
                data_update.create_date = DateTime.Now;
                data_update.time_managerUs_cf = null;
                data_update.time_accountantPD_cf = null;
                data_update.time_managerPD_cf = null;
                data_update.time_aTin_cf = null;
                data_update.status = 1;
                context.SaveChanges();
                return "OK";
            }
            catch
            {
                return "NG";
            }

        }
        public string UpdateOrderForecast(OrderForecastModel model)
        {
            try
            {
                var dateBorrow = DateTime.Parse(model.dateBorrow);
                var data_update = context.Summaries.Where(x => x.id == model.order_id).SingleOrDefault();
                data_update.managerUs_id = model.managerUs_id;
                data_update.managerUs_username = model.managerUsFull;
                data_update.date_borrow = dateBorrow;
                data_update.note = model.noteOrder;
                data_update.create_date = DateTime.Now;
                data_update.time_aTin_cf = null;
                data_update.status = 12;
                context.SaveChanges();
                return "OK";
            }
            catch
            {
                return "NG";
            }
        }
        public string ReturnProduct(int id)
        {
            try
            {
                var data_update = context.DetailBorrows.Where(x => x.id == id).SingleOrDefault();
                data_update.status_product = 2;
                context.SaveChanges();
                return "OK";
            }
            catch
            {
                return "NG";
            }
        }
        public string ManagerUsConfirmOrder(int id)
        {
            try
            {
                var data_update = context.Summaries.Where(x => x.id == id).SingleOrDefault();
                data_update.status = 2;
                data_update.time_managerUs_cf = DateTime.Now;
                context.SaveChanges();
                return "OK";
            }
            catch
            {
                return "NG";
            }
        }
        public string ManagerUsConfirmOrderNight(int id)
        {
            try
            {
                var data_update = context.Summaries.Where(x => x.id == id).SingleOrDefault();
                data_update.status = 12;
                data_update.time_managerUs_cf = DateTime.Now;
                context.SaveChanges();
                return "OK";
            }
            catch
            {
                return "NG";
            }
        }
        public string ManagerUsRejectOrderOBANight(int id, string noteReject)
        {
            try
            {
                var data_update = context.Summaries.Where(x => x.id == id).SingleOrDefault();
                data_update.status = 3;
                data_update.note_Manager = noteReject;
                data_update.time_managerUs_cf = DateTime.Now;
                context.SaveChanges();
                return "OK";
            }
            catch
            {
                return "NG";
            }
        }
        public string AccountantPDConfirmOrder(int id)
        {
            var session = (ToolingRoomManagement.Common.UserLogin)Session[ToolingRoomManagement.Common.CommonConstants.USER_SESSION];
            try
            {
                var data_update = context.Summaries.Where(x => x.id == id).SingleOrDefault();
                data_update.status = 11;
                data_update.accountantPD_username = session.UserName + "-" + session.Fullname;
                data_update.time_accountantPD_cf = DateTime.Now;
                context.SaveChanges();
                return "OK";
            }
            catch
            {
                return "NG";
            }
        }
        public string AccountantPDRejectOrder(int id, string noteReject)
        {
            var session = (ToolingRoomManagement.Common.UserLogin)Session[ToolingRoomManagement.Common.CommonConstants.USER_SESSION];
            try
            {
                var data_update = context.Summaries.Where(x => x.id == id).SingleOrDefault();
                data_update.status = 5;
                data_update.accountantPD_username = session.UserName + "-" + session.Fullname;
                data_update.note_accountantPD = noteReject;
                data_update.time_accountantPD_cf = DateTime.Now;
                context.SaveChanges();
                return "OK";
            }
            catch
            {
                return "NG";
            }
        }
        public string AKhanhConfirmOrder(int id)
        {
            var session = (ToolingRoomManagement.Common.UserLogin)Session[ToolingRoomManagement.Common.CommonConstants.USER_SESSION];
            try
            {
                var data_update = context.Summaries.Where(x => x.id == id).SingleOrDefault();
                data_update.status = 3;
                data_update.time_aKhanh_cf = DateTime.Now;
                context.SaveChanges();
                return "OK";
            }
            catch
            {
                return "NG";
            }
        }
        public string AKhanhRejectOrder(int id, string noteReject)
        {
            var session = (ToolingRoomManagement.Common.UserLogin)Session[ToolingRoomManagement.Common.CommonConstants.USER_SESSION];
            try
            {
                var data_update = context.Summaries.Where(x => x.id == id).SingleOrDefault();
                data_update.status = 5;
                data_update.note_aKhanh = noteReject;
                data_update.time_aKhanh_cf = DateTime.Now;
                context.SaveChanges();
                return "OK";
            }
            catch
            {
                return "NG";
            }
        }
        public string ManagerPDConfirmOrder(int id)
        {
            try
            {
                var data_update = context.Summaries.Where(x => x.id == id).SingleOrDefault();
                data_update.status = 4;
                data_update.time_managerPD_cf = DateTime.Now;
                context.SaveChanges();
                return "OK";
            }
            catch
            {
                return "NG";
            }
        }

        public string ManagerPDRejectOrder(int id, string noteReject)
        {
            try
            {
                var data_update = context.Summaries.Where(x => x.id == id).SingleOrDefault();
                data_update.status = 5;
                data_update.note_managerPD = noteReject;
                data_update.time_managerPD_cf = DateTime.Now;
                context.SaveChanges();
                return "OK";
            }
            catch
            {
                return "NG";
            }
        }
        public string LeaderPDRejectOrder(int id, string noteReject)
        {
            try
            {
                var data_update = context.Summaries.Where(x => x.id == id).SingleOrDefault();
                data_update.status = 5;
                data_update.note_aTin = noteReject;
                data_update.time_aTin_cf = DateTime.Now;
                context.SaveChanges();
                return "OK";
            }
            catch
            {
                return "NG";
            }
        }
        public string LeaderPDConfirmOrder(int id)
        {
            try
            {
                var data_update = context.Summaries.Where(x => x.id == id).SingleOrDefault();
                data_update.status = 6;
                data_update.time_aTin_cf = DateTime.Now;
                context.SaveChanges();
                return "OK";
            }
            catch
            {
                return "NG";
            }
        }
        public string ReturnOrder(int id)
        {
            var accountant = context.Users.Where(x => x.role_id == 6).ToList();
            var acc = "Kế toán PD";
            
            var session = (ToolingRoomManagement.Common.UserLogin)Session[ToolingRoomManagement.Common.CommonConstants.USER_SESSION];
            try
            {
                var data_update = context.Summaries.Where(x => x.id == id).SingleOrDefault();
                data_update.status = 7;
                data_update.accountantPDBack_username = acc;
                context.SaveChanges();
                return "OK";
            }
            catch
            {
                return "NG";
            }
        }
        public string AccountantPDConfirmReturn(int id)
        {
            var session = (ToolingRoomManagement.Common.UserLogin)Session[ToolingRoomManagement.Common.CommonConstants.USER_SESSION];
            try
            {
                var data_update = context.Summaries.Where(x => x.id == id).SingleOrDefault();
                var productInOrder = context.DetailBorrows.Where(x => x.status_product == 1 && x.summaryID == id).ToList();
                var product2 = context.DetailBorrows.Where(x => x.status_product == 2 && x.summaryID == id).ToList();
                if (productInOrder.Count == 0)
                {
                    foreach (var item in product2)
                    {
                        item.status_product = 3;
                        item.date_return = DateTime.Now;
                    }
                    data_update.status = 8;
                }
                else
                {
                    foreach (var item in product2)
                    {
                        item.status_product = 3;
                        item.date_return = DateTime.Now;
                    }
                    data_update.status = 10;
                }

                data_update.accountantPDBack_username = session.UserName + "-" + session.Fullname;
                data_update.note_back_accountantPD = null;
                data_update.time_accountantPDBack_cf = DateTime.Now;
                context.SaveChanges();
                return "OK";
            }
            catch
            {
                return "NG";
            }
        }
        public string AccountantPDConfirmReturnOBA(int id)
        {
            var session = (ToolingRoomManagement.Common.UserLogin)Session[ToolingRoomManagement.Common.CommonConstants.USER_SESSION];
            try
            {
                var data_update = context.Summaries.Where(x => x.id == id).SingleOrDefault();
                var productInOrder = context.DetailBorrows.Where(x => x.status_product == 1 && x.summaryID == id).ToList();
                var product2 = context.DetailBorrows.Where(x => x.status_product == 2 && x.summaryID == id).ToList();
                foreach (var item in product2)
                {
                    item.status_product = 3;
                    item.date_return = DateTime.Now;
                }
                data_update.status = 6;
                data_update.accountantPDBack_username = session.UserName + "-" + session.Fullname;
                data_update.note_back_accountantPD = null;
                data_update.time_accountantPDBack_cf = DateTime.Now;
                context.SaveChanges();
                return "OK";
            }
            catch
            {
                return "NG";
            }
        }
        public string AccountantPDRejectOrderReturn(int id, string noteReject)
        {
            var session = (ToolingRoomManagement.Common.UserLogin)Session[ToolingRoomManagement.Common.CommonConstants.USER_SESSION];
            try
            {
                var data_update = context.Summaries.Where(x => x.id == id).SingleOrDefault();
                var product2 = context.DetailBorrows.Where(x => x.status_product == 2 && x.summaryID == id).ToList();
                foreach (var item in product2)
                {
                    item.status_product = 1;
                }
                data_update.status = 9;
                data_update.accountantPDBack_username = session.UserName + "-" + session.Fullname;
                data_update.note_back_accountantPD = noteReject;
                data_update.time_accountantPDBack_cf = DateTime.Now;
                context.SaveChanges();
                return "OK";
            }
            catch
            {
                return "NG";
            }
        }
        public string AccountantPDRejectOrderReturnOBA(int id, string noteReject)
        {
            var session = (ToolingRoomManagement.Common.UserLogin)Session[ToolingRoomManagement.Common.CommonConstants.USER_SESSION];
            try
            {
                var data_update = context.Summaries.Where(x => x.id == id).SingleOrDefault();
                var product2 = context.DetailBorrows.Where(x => x.status_product == 2 && x.summaryID == id).ToList();
                foreach (var item in product2)
                {
                    item.status_product = 1;
                }
                data_update.status = 7;
                data_update.accountantPDBack_username = session.UserName + "-" + session.Fullname;
                data_update.note_back_accountantPD = noteReject;
                data_update.time_accountantPDBack_cf = DateTime.Now;
                context.SaveChanges();
                return "OK";
            }
            catch
            {
                return "NG";
            }
        }
        public ActionResult DeleteProduct(int id)
        {
            var model = context.DetailBorrows.Where(x => x.id == id).FirstOrDefault();
            context.DetailBorrows.Remove(model);
            context.SaveChanges();
            return Json(new
            {
                status = true
            });
        }
        public ActionResult DeleteOrder(int id)
        {
            var model = context.Summaries.Where(x => x.id == id).FirstOrDefault();
            context.Summaries.Remove(model);
            context.SaveChanges();
            return Json(new
            {
                status = true
            });
        }
        public string LeaderPDRejectOrderForecast(int id, string noteReject)
        {
            try
            {
                var data_update = context.Summaries.Where(x => x.id == id).SingleOrDefault();
                data_update.status = 14;
                data_update.note_aTin = noteReject;
                data_update.time_aTin_cf = DateTime.Now;
                context.SaveChanges();
                return "OK";
            }
            catch
            {
                return "NG";
            }
        }
        public string LeaderPDConfirmOrderForecast(int id)
        {
            try
            {
                var data_update = context.Summaries.Where(x => x.id == id).SingleOrDefault();
                data_update.status = 13;
                data_update.time_aTin_cf = DateTime.Now;
                context.SaveChanges();
                return "OK";
            }
            catch
            {
                return "NG";
            }
        }
        public string LeaderShiftConfirmOrder(int id)
        {
            var session = (ToolingRoomManagement.Common.UserLogin)Session[ToolingRoomManagement.Common.CommonConstants.USER_SESSION];
            try
            {
                var data_update = context.Summaries.Where(x => x.id == id).SingleOrDefault();
                data_update.status = 2;
                data_update.leaderNightShift_username = session.UserName + "-" + session.Fullname;
                data_update.leaderNightShift_id = int.Parse(session.UserID.ToString());
                data_update.time_leaderNightShift_cf = DateTime.Now;
                context.SaveChanges();
                return "OK";
            }
            catch
            {
                return "NG";
            }
        }
        public string LeaderShiftConfirmOrderBack(int id)
        {
            var session = (ToolingRoomManagement.Common.UserLogin)Session[ToolingRoomManagement.Common.CommonConstants.USER_SESSION];
            try
            {
                var data_update = context.Summaries.Where(x => x.id == id).SingleOrDefault();
                data_update.status = 5;
                data_update.leaderNightShift_username = session.UserName + "-" + session.Fullname;
                data_update.leaderNightShift_id = int.Parse(session.UserID.ToString());
                data_update.leaderNightBack_username = session.UserName + "-" + session.Fullname;
                data_update.leaderNightBack_id = int.Parse(session.UserID.ToString());
                data_update.time_leaderNightBack_cf = DateTime.Now;
                context.SaveChanges();
                return "OK";
            }
            catch
            {
                return "NG";
            }
        }
        public string LeaderShiftRejectOrder(int id, string noteReject)
        {
            var session = (ToolingRoomManagement.Common.UserLogin)Session[ToolingRoomManagement.Common.CommonConstants.USER_SESSION];
            try
            {
                var data_update = context.Summaries.Where(x => x.id == id).SingleOrDefault();
                data_update.status = 3;
                data_update.note_leaderNightShift = noteReject;
                data_update.time_leaderNightShift_cf = DateTime.Now;
                context.SaveChanges();
                return "OK";
            }
            catch
            {
                return "NG";
            }
        }
        public string LeaderShiftRejectOrderBack(int id, string noteReject)
        {
            var session = (ToolingRoomManagement.Common.UserLogin)Session[ToolingRoomManagement.Common.CommonConstants.USER_SESSION];
            try
            {
                var data_update = context.Summaries.Where(x => x.id == id).SingleOrDefault();
                
                var product2 = context.DetailBorrows.Where(x => x.status_product == 2 && x.summaryID == id).ToList();
                foreach (var item in product2)
                {
                    item.status_product = 1;
                }
                data_update.status = 7;
                data_update.leaderNightBack_username = session.UserName + "-" + session.Fullname;
                data_update.leaderNightBack_id = int.Parse(session.UserID.ToString());
                data_update.note_leaderNightBack = noteReject;
                data_update.time_leaderNightBack_cf = DateTime.Now;
                context.SaveChanges();
                return "OK";
            }
            catch
            {
                return "NG";
            }
        }
        public string ReturnOrderOBA(int id)
        {
            var accountant = context.Users.Where(x => x.role_id == 6).ToList();
            var acc = "Kế toán PD";

            var session = (ToolingRoomManagement.Common.UserLogin)Session[ToolingRoomManagement.Common.CommonConstants.USER_SESSION];
            try
            {
                var data_update = context.Summaries.Where(x => x.id == id).SingleOrDefault();
                //var product2 = context.DetailBorrows.Where(x => x.status_product == 1 && x.summaryID == id).ToList();
                //foreach (var item in product2)
                //{
                //    item.status_product = 2;
                //}
                data_update.status = 4;
                data_update.accountantPDBack_username = acc;
                context.SaveChanges();
                return "OK";
            }
            catch
            {
                return "NG";
            }
        }
    }
}