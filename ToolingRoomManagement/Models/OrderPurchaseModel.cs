using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace ToolingRoomManagement.Models
{
    public class OrderPurchaseModel
    {
        public int? id { get; set; }
        public string people_name { get; set; }
        public string part { get; set; }
        public string code_people { get; set; }
        public string phone { get; set; }
        public string need_date { get; set; }
        public int type_item { get; set; }
        public string item_name { get; set; }
        public string item_model { get; set; }
        public string item_parameter { get; set; }
        public string item_number { get; set; }
        public int quantity { get; set; }
        public string purpose { get; set; }
        public string way_caculate { get; set; }
        public int manager_id { get; set; }
        public string manager_name { get; set; }
    }
}