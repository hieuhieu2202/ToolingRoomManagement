using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace ToolingRoomManagement.Models
{
    public class OrderForecastModel
    {
        public int order_id { get; set; }
        public string dateBorrow { get; set; }
        public string userName { get; set; }
        public string user_id { get; set; }
        public string noteOrder { get; set; }
        public int managerUs_id { get; set; }
        public string managerUsFull { get; set; }
        public string productName { get; set; }
        public int productQuantity { get; set; }
        public string productLine { get; set; }
        public string leaderLineCode { get; set; }
        public string leaderLineName { get; set; }
    }
}