using Model.EF;
using Model.EF1;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace ToolingRoomManagement.Areas.Admin.Controllers
{
    public class GetDataController : Controller
    {
        // GET: Admin/GetData
        ToolingRoomDbContext context = new ToolingRoomDbContext();
        HRDbContext context1 = new HRDbContext();
        public string checkUser(string username)
        {
            var check = context.Users.Where(x => x.username == username).ToList();
            var modal = context1.Records.Where(x => x.EMPLOYEE_ID == username).FirstOrDefault();
            if (modal == null)
            {
                return "NG";
            }
            else
            {
                if (check.Count() != 0)
                {
                    return "NGC";
                }
                else
                {
                    return modal.FULLNAME;
                }
            }

        }
        public string checkUser1(string username)
        {
            var check = context.Users.Where(x => x.username == username).FirstOrDefault();
            if (check != null)
            {
                return check.fullname + "-" + check.id;
            }
            else
            {
                return "NGN";
            }

        }
        public string checkUser2(string username)
        {
            var modal = context1.Records.Where(x => x.EMPLOYEE_ID == username).FirstOrDefault();
            if (modal == null)
            {
                return "NG";
            }
            else
            {
                return modal.FULLNAME;
            }

        }
        public string getDataLine()
        {
            var model = context.LineProducts.ToList();
            var json = JsonConvert.SerializeObject(model);
            return json;
        }
        public string getDataManager()
        {
            var model = context.Users.Where(x => x.role_id == 1).ToList();
            var json = JsonConvert.SerializeObject(model);
            return json;
        }
        public string getProductInOrder(int id)
        {
            var model = context.DetailBorrows.Where(x => x.summaryID == id).ToList();
            var json = JsonConvert.SerializeObject(model);
            return json;
        }

        public string listOrderByUser(int number)
        {
            var json = "";
            var session = (ToolingRoomManagement.Common.UserLogin)Session[ToolingRoomManagement.Common.CommonConstants.USER_SESSION];
            if (number == 100)
            {
                //status=1,2,3,4
                var model = context.Summaries.Where(x => x.status == 1 && x.create_by_id == session.UserID && x.type_order == 1 || x.status == 2 && x.create_by_id == session.UserID && x.type_order == 1 || x.status == 3 && x.create_by_id == session.UserID && x.type_order == 1 || x.status == 4 && x.create_by_id == session.UserID && x.type_order==1 || x.status == 11 && x.create_by_id == session.UserID && x.type_order == 1).OrderByDescending(x => x.create_date).ToList();
                json = JsonConvert.SerializeObject(model);
            }
            else if (number == 3)
            {
                //status=5
                var model = context.Summaries.Where(x => x.status == 5 && x.create_by_id == session.UserID && x.type_order == 1).OrderByDescending(x => x.create_date).ToList();
                json = JsonConvert.SerializeObject(model);
            }
            else if (number == 4)
            {
                //status=6
                var model = context.Summaries.Where(x => x.status == 6 && x.create_by_id == session.UserID && x.type_order == 1 || x.status == 10 && x.create_by_id == session.UserID && x.type_order == 1).OrderByDescending(x => x.create_date).ToList();
                json = JsonConvert.SerializeObject(model);
            }
            else if (number == 5)
            {
                //status=7
                var model = context.Summaries.Where(x => x.status == 7 && x.create_by_id == session.UserID && x.type_order == 1).OrderByDescending(x => x.create_date).ToList();
                json = JsonConvert.SerializeObject(model);
            }
            else if (number == 6)
            {
                //status=9
                var model = context.Summaries.Where(x => x.status == 9 && x.create_by_id == session.UserID && x.type_order == 1).OrderByDescending(x => x.create_date).ToList();
                json = JsonConvert.SerializeObject(model);
            }
            else if (number == 7)
            {
                //status=8
                var model = context.Summaries.Where(x => x.status == 8 && x.create_by_id == session.UserID && x.type_order == 1).OrderByDescending(x => x.create_date).ToList();
                json = JsonConvert.SerializeObject(model);
            }
            return json;
        }
        public string listOrderByUserOBA(int number)
        {
            var json = "";
            var session = (ToolingRoomManagement.Common.UserLogin)Session[ToolingRoomManagement.Common.CommonConstants.USER_SESSION];
            if (number == 100)
            {
                //status=1,12
                var model = context.Summaries.Where(x => x.status == 1 && x.create_by_id == session.UserID && x.type_order == 3 || x.status == 12 && x.create_by_id == session.UserID && x.type_order == 3).OrderByDescending(x => x.create_date).ToList();
                json = JsonConvert.SerializeObject(model);
            }
            else if (number == 3)
            {
                //status=3
                var model = context.Summaries.Where(x => x.status == 3 && x.create_by_id == session.UserID && x.type_order == 3).OrderByDescending(x => x.create_date).ToList();
                json = JsonConvert.SerializeObject(model);
            }
            else if (number == 2)
            {
                //status=6
                var model = context.Summaries.Where(x => x.status == 2 && x.create_by_id == session.UserID && x.type_order == 3).OrderByDescending(x => x.create_date).ToList();
                json = JsonConvert.SerializeObject(model);
            }
            else if (number == 5)
            {
                //status=4,5
                var model = context.Summaries.Where(x => x.status == 4 && x.create_by_id == session.UserID && x.type_order == 3 || x.status == 5 && x.create_by_id == session.UserID && x.type_order == 3).OrderByDescending(x => x.create_date).ToList();
                json = JsonConvert.SerializeObject(model);
            }
            else if (number == 6)
            {
                //status=9
                var model = context.Summaries.Where(x => x.status == 7 && x.create_by_id == session.UserID && x.type_order == 3).OrderByDescending(x => x.create_date).ToList();
                json = JsonConvert.SerializeObject(model);
            }
            else if (number == 7)
            {
                //status=8
                var model = context.Summaries.Where(x => x.status == 6 && x.create_by_id == session.UserID && x.type_order == 3).OrderByDescending(x => x.create_date).ToList();
                json = JsonConvert.SerializeObject(model);
            }
            return json;
        }
        public string listOrderByUserNight(int number)
        {
            var json = "";
            var session = (ToolingRoomManagement.Common.UserLogin)Session[ToolingRoomManagement.Common.CommonConstants.USER_SESSION];
            if (number == 100)
            {
                //status=1,2,3,4
                var model = context.Summaries.Where(x => x.status == 1 && x.create_by_id == session.UserID && x.type_order == 2 || x.status == 2 && x.create_by_id == session.UserID && x.type_order == 2 || x.status == 3 && x.create_by_id == session.UserID && x.type_order == 2 || x.status == 4 && x.create_by_id == session.UserID && x.type_order == 2|| x.status == 11 && x.create_by_id == session.UserID && x.type_order == 2 || x.status == 12 && x.create_by_id == session.UserID && x.type_order == 2).OrderByDescending(x => x.create_date).ToList();
                json = JsonConvert.SerializeObject(model);
            }
            else if (number == 3)
            {
                //status=5
                var model = context.Summaries.Where(x => x.status == 5 && x.create_by_id == session.UserID && x.type_order == 2).OrderByDescending(x => x.create_date).ToList();
                json = JsonConvert.SerializeObject(model);
            }
            else if (number == 4)
            {
                //status=6
                var model = context.Summaries.Where(x => x.status == 6 && x.create_by_id == session.UserID && x.type_order == 2 || x.status == 10 && x.create_by_id == session.UserID && x.type_order == 2).OrderByDescending(x => x.create_date).ToList();
                json = JsonConvert.SerializeObject(model);
            }
            else if (number == 5)
            {
                //status=7
                var model = context.Summaries.Where(x => x.status == 7 && x.create_by_id == session.UserID && x.type_order == 2).OrderByDescending(x => x.create_date).ToList();
                json = JsonConvert.SerializeObject(model);
            }
            else if (number == 6)
            {
                //status=9
                var model = context.Summaries.Where(x => x.status == 9 && x.create_by_id == session.UserID && x.type_order == 2).OrderByDescending(x => x.create_date).ToList();
                json = JsonConvert.SerializeObject(model);
            }
            else if (number == 7)
            {
                //status=8
                var model = context.Summaries.Where(x => x.status == 8 && x.create_by_id == session.UserID && x.type_order == 2).OrderByDescending(x => x.create_date).ToList();
                json = JsonConvert.SerializeObject(model);
            }
            return json;
        }
        public string listOrderByMVIDIA(int number)
        {
            var json = "";
            var session = (ToolingRoomManagement.Common.UserLogin)Session[ToolingRoomManagement.Common.CommonConstants.USER_SESSION];
            if (number == 100)
            {
                //status=1,2,3,4
                var model = context.Summaries.Where(x => x.status == 1 && x.create_by_id == session.UserID && x.type_order == 4 || x.status == 2 && x.create_by_id == session.UserID && x.type_order == 4 || x.status == 3 && x.create_by_id == session.UserID && x.type_order == 4 || x.status == 4 && x.create_by_id == session.UserID && x.type_order == 4 || x.status == 11 && x.create_by_id == session.UserID && x.type_order == 4).OrderByDescending(x => x.create_date).ToList();
                json = JsonConvert.SerializeObject(model);
            }
            else if (number == 3)
            {
                //status=5
                var model = context.Summaries.Where(x => x.status == 5 && x.create_by_id == session.UserID && x.type_order == 4).OrderByDescending(x => x.create_date).ToList();
                json = JsonConvert.SerializeObject(model);
            }
            else if (number == 4)
            {
                //status=6
                var model = context.Summaries.Where(x => x.status == 6 && x.create_by_id == session.UserID && x.type_order == 4 || x.status == 10 && x.create_by_id == session.UserID && x.type_order == 4).OrderByDescending(x => x.create_date).ToList();
                json = JsonConvert.SerializeObject(model);
            }
            else if (number == 5)
            {
                //status=7
                var model = context.Summaries.Where(x => x.status == 7 && x.create_by_id == session.UserID && x.type_order == 4).OrderByDescending(x => x.create_date).ToList();
                json = JsonConvert.SerializeObject(model);
            }
            else if (number == 6)
            {
                //status=9
                var model = context.Summaries.Where(x => x.status == 9 && x.create_by_id == session.UserID && x.type_order == 4).OrderByDescending(x => x.create_date).ToList();
                json = JsonConvert.SerializeObject(model);
            }
            else if (number == 7)
            {
                //status=8
                var model = context.Summaries.Where(x => (x.status == 8 || x.status == 10) && x.create_by_id == session.UserID && x.type_order == 4).OrderByDescending(x => x.create_date).ToList();
                json = JsonConvert.SerializeObject(model);
            }
            return json;
        }
        public string listOrderByManagerUs(int number,int shift)
        {
            var json = "";
            var session = (ToolingRoomManagement.Common.UserLogin)Session[ToolingRoomManagement.Common.CommonConstants.USER_SESSION];
            if (shift == 1)
            {
                
                if (number == 100)
                {
                    //status=1
                    var model = context.Summaries.Where(x => x.status == 1 && x.managerUs_id == session.UserID && x.type_order==1).OrderByDescending(x=>x.create_date).ToList();
                    json = JsonConvert.SerializeObject(model);
                }
                else if (number == 1)
                {
                    //status!=1 && status!=5
                    var model = context.Summaries.Where(x => x.status != 1 && x.status != 5 && x.managerUs_id == session.UserID && x.type_order == 1).OrderByDescending(x => x.create_date).ToList();
                    json = JsonConvert.SerializeObject(model);
                }
                else if (number == 2)
                {
                    //status=5
                    var model = context.Summaries.Where(x => x.status == 5 && x.managerUs_id == session.UserID && x.type_order == 1).OrderByDescending(x => x.create_date).ToList();
                    json = JsonConvert.SerializeObject(model);
                }
            }else if (shift == 2)
            {
                if (number == 100)
                {
                    //status=1
                    var model = context.Summaries.Where(x => x.status == 1 && x.managerUs_id == session.UserID && x.type_order == 2).OrderByDescending(x => x.create_date).ToList();
                    json = JsonConvert.SerializeObject(model);
                }
                else if (number == 1)
                {
                    //status!=1 && status!=5
                    var model = context.Summaries.Where(x => x.status != 1 && x.status != 5 && x.managerUs_id == session.UserID && x.type_order == 2).OrderByDescending(x => x.create_date).ToList();
                    json = JsonConvert.SerializeObject(model);
                }
                else if (number == 2)
                {
                    //status=5
                    var model = context.Summaries.Where(x => x.status == 5 && x.managerUs_id == session.UserID && x.type_order == 2).OrderByDescending(x => x.create_date).ToList();
                    json = JsonConvert.SerializeObject(model);
                }
            }
            else if (shift == 3)
            {
                if (number == 100)
                {
                    //status=1
                    var model = context.Summaries.Where(x => x.status == 1 && x.managerUs_id == session.UserID && x.type_order == 3).OrderByDescending(x => x.create_date).ToList();
                    json = JsonConvert.SerializeObject(model);
                }
                else if (number == 1)
                {
                    //status!=1 && status!=5
                    var model = context.Summaries.Where(x => x.status != 1 && x.status != 3 && x.managerUs_id == session.UserID && x.type_order == 3).OrderByDescending(x => x.create_date).ToList();
                    json = JsonConvert.SerializeObject(model);
                }
                else if (number == 2)
                {
                    //status=5
                    var model = context.Summaries.Where(x => x.status == 3 && x.managerUs_id == session.UserID && x.type_order == 3).OrderByDescending(x => x.create_date).ToList();
                    json = JsonConvert.SerializeObject(model);
                }
            }
            else if (shift == 4)
            {
                if (number == 100)
                {
                    //status=1
                    var model = context.Summaries.Where(x => x.status == 1 && x.managerUs_id == session.UserID && x.type_order == 4).OrderByDescending(x => x.create_date).ToList();
                    json = JsonConvert.SerializeObject(model);
                }
                else if (number == 1)
                {
                    //status!=1 && status!=5
                    var model = context.Summaries.Where(x => x.status != 1 && x.status != 3 && x.managerUs_id == session.UserID && x.type_order == 4).OrderByDescending(x => x.create_date).ToList();
                    json = JsonConvert.SerializeObject(model);
                }
                else if (number == 2)
                {
                    //status=5
                    var model = context.Summaries.Where(x => x.status == 3 && x.managerUs_id == session.UserID && x.type_order == 4).OrderByDescending(x => x.create_date).ToList();
                    json = JsonConvert.SerializeObject(model);
                }
            }
            return json;
        }
        public string listOrderByAccountantPD(int number,int shift)
        {
            var json = "";
            var session = (ToolingRoomManagement.Common.UserLogin)Session[ToolingRoomManagement.Common.CommonConstants.USER_SESSION];
            if (shift == 1)
            {
                if (number == 100)
                {
                    //status=2 || status=7
                    var model = context.Summaries.Where(x => x.status == 2 &&x.type_order==1 || x.status == 7 && x.type_order == 1).OrderByDescending(x => x.create_date).ToList();
                    json = JsonConvert.SerializeObject(model);
                }
                else if (number == 1)
                {
                    //status!=1 && status!=2 && status!=7
                    var model = context.Summaries.Where(x => x.status != 1 && x.status != 2 && x.status != 7 && x.status != 5 && x.status != 9 && x.type_order == 1).OrderByDescending(x => x.create_date).ToList();
                    json = JsonConvert.SerializeObject(model);
                }
                else if (number == 2)
                {
                    //status=5
                    var model = context.Summaries.Where(x => x.status == 5 && x.type_order == 1 || x.status == 9 && x.type_order == 1).OrderByDescending(x => x.create_date).ToList();
                    json = JsonConvert.SerializeObject(model);
                }
                else if (number == 3)
                {
                    //status=5
                    var model = context.Summaries.Where(x => x.status != 8 && x.type_order == 1).OrderByDescending(x => x.create_date).ToList();
                    json = JsonConvert.SerializeObject(model);
                }
            } else if (shift == 2)
            {
                if (number == 100)
                {
                    //status=2 || status=7
                    var model = context.Summaries.Where(x => x.status == 2 && x.type_order == 2 || x.status == 7 && x.type_order == 2).OrderByDescending(x => x.create_date).ToList();
                    json = JsonConvert.SerializeObject(model);
                }
                else if (number == 1)
                {
                    //status!=1 && status!=2 && status!=7
                    var model = context.Summaries.Where(x => x.status != 1 && x.status != 2 && x.status != 7 && x.status != 5 && x.status != 9 && x.status != 12 && x.type_order == 2).OrderByDescending(x => x.create_date).ToList();
                    json = JsonConvert.SerializeObject(model);
                }
                else if (number == 2)
                {
                    //status=5
                    var model = context.Summaries.Where(x => x.status == 5 && x.type_order == 2 || x.status == 9 && x.type_order == 2).OrderByDescending(x => x.create_date).ToList();
                    json = JsonConvert.SerializeObject(model);
                }
                else if (number == 3)
                {
                    //status=5
                    var model = context.Summaries.Where(x => x.status != 8 && x.type_order == 2).OrderByDescending(x => x.create_date).ToList();
                    json = JsonConvert.SerializeObject(model);
                }
            }
            else if (shift == 3)
            {
                if (number == 100)
                {
                    //status=2 || status=7
                    var model = context.Summaries.Where(x => x.status == 5 && x.type_order==3).OrderByDescending(x => x.create_date).ToList();
                    json = JsonConvert.SerializeObject(model);
                }
                else if (number == 1)
                {
                    //status!=1 && status!=2 && status!=7
                    var model = context.Summaries.Where(x => x.status == 6 && x.type_order == 3).OrderByDescending(x => x.create_date).ToList();
                    json = JsonConvert.SerializeObject(model);
                }
                else if (number == 2)
                {
                    //status=5
                    var model = context.Summaries.Where(x => x.status == 7 && x.type_order == 3).OrderByDescending(x => x.create_date).ToList();
                    json = JsonConvert.SerializeObject(model);
                }
                else if (number == 3)
                {
                    //status=5
                    var model = context.Summaries.Where(x => x.status !=6 && x.type_order == 3).OrderByDescending(x => x.create_date).ToList();
                    json = JsonConvert.SerializeObject(model);
                }
            } else if (shift == 4)
            {
                if (number == 100)
                {
                    //status=2 || status=7
                    var model = context.Summaries.Where(x => (x.status == 2 || x.status == 7) && x.type_order == 4).OrderByDescending(x => x.create_date).ToList();
                    json = JsonConvert.SerializeObject(model);
                }
                else if (number == 1)
                {
                    //status!=1 && status!=2 && status!=7
                    var model = context.Summaries.Where(x => (x.status != 1 && x.status != 2 && x.status != 7 && x.status != 5 && x.status != 9) && x.type_order == 4).OrderByDescending(x => x.create_date).ToList();
                    json = JsonConvert.SerializeObject(model);
                }
                else if (number == 2)
                {
                    //status=5
                    var model = context.Summaries.Where(x => (x.status == 5 || x.status == 9) && x.type_order == 4).OrderByDescending(x => x.create_date).ToList();
                    json = JsonConvert.SerializeObject(model);
                }
                else if (number == 3)
                {
                    //status=5
                    var model = context.Summaries.Where(x => x.status != 8 && x.type_order == 4).OrderByDescending(x => x.create_date).ToList();
                    json = JsonConvert.SerializeObject(model);
                }
            }
            return json;
        }
        public string listOrderByManagerPD1(int number,int shift)
        {
            var json = "";
            var session = (ToolingRoomManagement.Common.UserLogin)Session[ToolingRoomManagement.Common.CommonConstants.USER_SESSION];
            if (shift == 1)
            {
                if (number == 100)
                {
                    //status=3
                    var model = context.Summaries.Where(x => x.status == 11 && x.type_order==1).OrderByDescending(x => x.create_date).ToList();
                    json = JsonConvert.SerializeObject(model);
                }
                else if (number == 1)
                {
                    //status!=3 && status!=5
                    var model = context.Summaries.Where(x => x.status != 1 && x.status != 2  && x.status != 5 && x.status != 11 && x.status != 12 && x.type_order == 1).OrderByDescending(x => x.create_date).ToList();
                    json = JsonConvert.SerializeObject(model);
                }
                else if (number == 2)
                {
                    //status=5
                    var model = context.Summaries.Where(x => x.status == 5 && x.type_order == 1).OrderByDescending(x => x.create_date).ToList();
                    json = JsonConvert.SerializeObject(model);
                }
            }else if (shift == 2)
            {
                if (number == 100)
                {
                    //status=3
                    var model = context.Summaries.Where(x => x.status == 11 && x.type_order == 2).OrderByDescending(x => x.create_date).ToList();
                    json = JsonConvert.SerializeObject(model);
                }
                else if (number == 1)
                {
                    //status!=3 && status!=5
                    var model = context.Summaries.Where(x => x.status != 1 && x.status != 2  && x.status != 5 && x.status != 11 && x.status != 12 && x.type_order == 2).OrderByDescending(x => x.create_date).ToList();
                    json = JsonConvert.SerializeObject(model);
                }
                else if (number == 2)
                {
                    //status=5
                    var model = context.Summaries.Where(x => x.status == 5 && x.type_order == 2).OrderByDescending(x => x.create_date).ToList();
                    json = JsonConvert.SerializeObject(model);
                }
            }
            else if (shift == 3)
            {
                var model = context.Summaries.Where(x => x.type_order == 3).OrderByDescending(x => x.create_date).ToList();
                json = JsonConvert.SerializeObject(model);
            } else if (shift == 4)
            {
                if (number == 100)
                {
                    //status=3
                    var model = context.Summaries.Where(x => x.status == 11 && x.type_order == 4).OrderByDescending(x => x.create_date).ToList();
                    json = JsonConvert.SerializeObject(model);
                }
                else if (number == 1)
                {
                    //status!=3 && status!=5
                    var model = context.Summaries.Where(x => x.status != 1 && x.status != 2 && x.status != 5 && x.status != 11 && x.status != 12 && x.type_order == 4).OrderByDescending(x => x.create_date).ToList();
                    json = JsonConvert.SerializeObject(model);
                }
                else if (number == 2)
                {
                    //status=5
                    var model = context.Summaries.Where(x => x.status == 5 && x.type_order == 4).OrderByDescending(x => x.create_date).ToList();
                    json = JsonConvert.SerializeObject(model);
                }
            }

            return json;
        }
        public string listOrderByManagerPD(int number, int shift)
        {
            var json = "";
            var session = (ToolingRoomManagement.Common.UserLogin)Session[ToolingRoomManagement.Common.CommonConstants.USER_SESSION];
            if (shift == 1)
            {
                if (number == 100)
                {
                    //status=3
                    var model = context.Summaries.Where(x => x.status == 3 && x.type_order == 1).OrderByDescending(x => x.create_date).ToList();
                    json = JsonConvert.SerializeObject(model);
                }
                else if (number == 1)
                {
                    //status!=3 && status!=5
                    var model = context.Summaries.Where(x => x.status != 1 && x.status != 2 && x.status != 3 && x.status != 5 && x.type_order == 1).OrderByDescending(x => x.create_date).ToList();
                    json = JsonConvert.SerializeObject(model);
                }
                else if (number == 2)
                {
                    //status=5
                    var model = context.Summaries.Where(x => x.status == 5 && x.type_order == 1).OrderByDescending(x => x.create_date).ToList();
                    json = JsonConvert.SerializeObject(model);
                }
            }
            else if (shift == 2)
            {
                if (number == 100)
                {
                    //status=3
                    var model = context.Summaries.Where(x => x.status == 3 && x.type_order == 2).OrderByDescending(x => x.create_date).ToList();
                    json = JsonConvert.SerializeObject(model);
                }
                else if (number == 1)
                {
                    //status!=3 && status!=5
                    var model = context.Summaries.Where(x => x.status != 1 && x.status != 2 && x.status != 3 && x.status != 5 && x.status != 12 && x.type_order == 2).OrderByDescending(x => x.create_date).ToList();
                    json = JsonConvert.SerializeObject(model);
                }
                else if (number == 2)
                {
                    //status=5
                    var model = context.Summaries.Where(x => x.status == 5 && x.type_order == 2).OrderByDescending(x => x.create_date).ToList();
                    json = JsonConvert.SerializeObject(model);
                }
            }
            else if (shift == 3)
            {
                var model = context.Summaries.Where(x => x.type_order == 3).OrderByDescending(x => x.create_date).ToList();
                json = JsonConvert.SerializeObject(model);
            }
            else if (shift == 4)
            {
                if (number == 100)
                {
                    //status=3
                    var model = context.Summaries.Where(x => x.status == 3 && x.type_order == 4).OrderByDescending(x => x.create_date).ToList();
                    json = JsonConvert.SerializeObject(model);
                }
                else if (number == 1)
                {
                    //status!=3 && status!=5
                    var model = context.Summaries.Where(x => x.status != 1 && x.status != 2 && x.status != 3 && x.status != 5 && x.type_order == 4).OrderByDescending(x => x.create_date).ToList();
                    json = JsonConvert.SerializeObject(model);
                }
                else if (number == 2)
                {
                    //status=5
                    var model = context.Summaries.Where(x => x.status == 5 && x.type_order == 4).OrderByDescending(x => x.create_date).ToList();
                    json = JsonConvert.SerializeObject(model);
                }
            }
            return json;
        }
        public string listOrderByLeaderPD(int number,int shift)
        {
            var json = "";
            var session = (ToolingRoomManagement.Common.UserLogin)Session[ToolingRoomManagement.Common.CommonConstants.USER_SESSION];
            if (shift == 1)
            {
               
                if (number == 100)
                {
                    //status=4
                    var model = context.Summaries.Where(x => x.status == 4 && x.aTin_id == session.UserID &&x.type_order==1).OrderByDescending(x => x.create_date).ToList();
                    json = JsonConvert.SerializeObject(model);
                }
                else if (number == 1)
                {
                    //status!=3 && status!=5
                    var model = context.Summaries.Where(x => x.status != 1 && x.status != 2 && x.status != 3 && x.status != 4 && x.status != 5 && x.status != 11 && x.status != 12 && x.aTin_id == session.UserID && x.type_order == 1).OrderByDescending(x => x.create_date).ToList();
                    json = JsonConvert.SerializeObject(model);
                }
                else if (number == 2)
                {
                    //status=5
                    var model = context.Summaries.Where(x => x.status == 5 && x.aTin_id == session.UserID && x.type_order == 1).OrderByDescending(x => x.create_date).ToList();
                    json = JsonConvert.SerializeObject(model);
                }
                else if (number == 3)
                {
                    var model = context.Summaries.Where(x => x.status != 8 && x.type_order == 1).OrderByDescending(x => x.create_date).ToList();
                    json = JsonConvert.SerializeObject(model);
                }
            }else if (shift == 2)
            {
                if (number == 100)
                {
                    //status=4
                    var model = context.Summaries.Where(x => x.status == 4 && x.aTin_id == session.UserID && x.type_order == 2).OrderByDescending(x => x.create_date).ToList();
                    json = JsonConvert.SerializeObject(model);
                }
                else if (number == 1)
                {
                    //status!=3 && status!=5
                    var model = context.Summaries.Where(x => x.status != 1 && x.status != 2 && x.status != 3 && x.status != 4 && x.status != 5 && x.aTin_id == session.UserID && x.type_order == 2).OrderByDescending(x => x.create_date).ToList();
                    json = JsonConvert.SerializeObject(model);
                }
                else if (number == 2)
                {
                    //status=5
                    var model = context.Summaries.Where(x => x.status == 5 && x.aTin_id == session.UserID && x.type_order == 2).OrderByDescending(x => x.create_date).ToList();
                    json = JsonConvert.SerializeObject(model);
                }
                else if (number == 3)
                {
                    var model = context.Summaries.Where(x => x.status != 8 && x.type_order == 2).OrderByDescending(x => x.create_date).ToList();
                    json = JsonConvert.SerializeObject(model);
                }
            }
            else if (shift == 3)
            {
                var model = context.Summaries.Where(x => x.type_order == 3).OrderByDescending(x => x.create_date).ToList();
                json = JsonConvert.SerializeObject(model);
            }
            else if (shift == 4)
            {

                if (number == 100)
                {
                    //status=4
                    var model = context.Summaries.Where(x => x.status == 4 && x.aTin_id == session.UserID && x.type_order == 4).OrderByDescending(x => x.create_date).ToList();
                    json = JsonConvert.SerializeObject(model);
                }
                else if (number == 1)
                {
                    //status!=3 && status!=5
                    var model = context.Summaries.Where(x => x.status != 1 && x.status != 2 && x.status != 3 && x.status != 4 && x.status != 5 && x.status != 11 && x.status != 12 && x.aTin_id == session.UserID && x.type_order == 4).OrderByDescending(x => x.create_date).ToList();
                    json = JsonConvert.SerializeObject(model);
                }
                else if (number == 2)
                {
                    //status=5
                    var model = context.Summaries.Where(x => x.status == 5 && x.aTin_id == session.UserID && x.type_order == 4).OrderByDescending(x => x.create_date).ToList();
                    json = JsonConvert.SerializeObject(model);
                }
                else if (number == 3)
                {
                    var model = context.Summaries.Where(x => x.status != 8 && x.type_order == 4).OrderByDescending(x => x.create_date).ToList();
                    json = JsonConvert.SerializeObject(model);
                }
            }
            return json;
        }
        public string listOrderByLeaderShift(int number,int shift)
        {
            var json = "";
            var session = (ToolingRoomManagement.Common.UserLogin)Session[ToolingRoomManagement.Common.CommonConstants.USER_SESSION];
            if (shift == 1)
            {
                if (number == 100)
                {
                    //status=4
                    var model = context.Summaries.Where(x => x.status==12 && x.type_order == 2).OrderByDescending(x => x.create_date).ToList();
                    json = JsonConvert.SerializeObject(model);
                }
                else if (number == 1)
                {
                    //status!=3 && status!=5
                    var model = context.Summaries.Where(x => x.status != 1&&x.status!=12&& x.status!=5 &&x.type_order==2).OrderByDescending(x => x.create_date).ToList();
                    json = JsonConvert.SerializeObject(model);
                }
                else if (number == 2)
                {
                    //status=5
                    var model = context.Summaries.Where(x => x.status == 5 && x.type_order == 2).OrderByDescending(x => x.create_date).ToList();
                    json = JsonConvert.SerializeObject(model);
                }
                else if (number == 3)
                {
                    var model = context.Summaries.Where(x => x.status !=8 && x.type_order == 2).OrderByDescending(x => x.create_date).ToList();
                    json = JsonConvert.SerializeObject(model);
                }
            }else if (shift == 2)
            {
                if (number == 100)
                {
                    //status=4
                    var model = context.Summaries.Where(x => x.status ==12 && x.type_order == 3 || x.status==4 && x.type_order == 3).OrderByDescending(x => x.create_date).ToList();
                    json = JsonConvert.SerializeObject(model);
                }
                else if (number == 1)
                {
                    //status!=3 && status!=5
                    var model = context.Summaries.Where(x=>x.status!=1&&x.status!=3&&x.status!=7 && x.status != 4 && x.status != 12 && x.type_order == 3).OrderByDescending(x => x.create_date).ToList();
                    json = JsonConvert.SerializeObject(model);
                }
                else if (number == 2)
                {
                    //status=5
                    var model = context.Summaries.Where(x => x.status == 3 && x.type_order == 3 || x.status == 7 && x.type_order == 3).OrderByDescending(x => x.create_date).ToList();
                    json = JsonConvert.SerializeObject(model);
                }
                else if (number == 3)
                {
                    var model = context.Summaries.Where(x => x.status != 6 && x.type_order == 3).OrderByDescending(x => x.create_date).ToList();
                    json = JsonConvert.SerializeObject(model);
                }
            }
            else if (shift == 4)
            {
                if (number == 100)
                {
                    //status=4
                    var model = context.Summaries.Where(x => x.status == 12 && x.type_order == 4).OrderByDescending(x => x.create_date).ToList();
                    json = JsonConvert.SerializeObject(model);
                }
                else if (number == 1)
                {
                    //status!=3 && status!=5
                    var model = context.Summaries.Where(x => x.status != 1 && x.status != 12 && x.status != 5 && x.type_order == 4).OrderByDescending(x => x.create_date).ToList();
                    json = JsonConvert.SerializeObject(model);
                }
                else if (number == 2)
                {
                    //status=5
                    var model = context.Summaries.Where(x => x.status == 5 && x.type_order == 4).OrderByDescending(x => x.create_date).ToList();
                    json = JsonConvert.SerializeObject(model);
                }
                else if (number == 3)
                {
                    var model = context.Summaries.Where(x => x.status != 8 && x.type_order == 4).OrderByDescending(x => x.create_date).ToList();
                    json = JsonConvert.SerializeObject(model);
                }
            }
            return json;
        }



        public string lisOderForecastUser(int number)
        {
            var json = "";
            var session = (ToolingRoomManagement.Common.UserLogin)Session[ToolingRoomManagement.Common.CommonConstants.USER_SESSION];
            if (number == 100)
            {
                var model = context.Summaries.Where(x => x.status == 12 && x.create_by_id == session.UserID).ToList();
                json = JsonConvert.SerializeObject(model);
            }
            else if (number == 1)
            {
                var model = context.Summaries.Where(x => x.status == 13 && x.create_by_id == session.UserID).ToList();
                json = JsonConvert.SerializeObject(model);
            }
            else if (number == 2)
            {
                var model = context.Summaries.Where(x => x.status == 14 && x.create_by_id == session.UserID).ToList();
                json = JsonConvert.SerializeObject(model);
            }
            else if (number == 3)
            {
                var model = context.Summaries.Where(x => x.status == 15 && x.create_by_id == session.UserID).ToList();
                json = JsonConvert.SerializeObject(model);
            }
            return json;
        }
       
        public string lisOderForecastPD(int number)
        {
            var json = "";
            if (number == 100)
            {
                var model = context.Summaries.Where(x => x.status == 12).ToList();
                json = JsonConvert.SerializeObject(model);
            }
            else if (number == 1)
            {
                var model = context.Summaries.Where(x => x.status == 13).ToList();
                json = JsonConvert.SerializeObject(model);
            }
            else if (number == 2)
            {
                var model = context.Summaries.Where(x => x.status == 14).ToList();
                json = JsonConvert.SerializeObject(model);
            }
            else if (number == 3)
            {
                var model = context.Summaries.Where(x => x.status == 15).ToList();
                json = JsonConvert.SerializeObject(model);
            }
            return json;
        }
        public string getProductAndOrder(int id)
        {
            var order = context.Summaries.Where(x => x.id == id).SingleOrDefault();
            var product = context.DetailBorrows.Where(x => x.summaryID == id).ToList();
            var jsonOrder = JsonConvert.SerializeObject(order);
            var jsonProduct = JsonConvert.SerializeObject(product);
            var js = "[" + jsonOrder + "," + jsonProduct + "]";
            return js;
        }
    }
}