using Model.EF;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace ToolingRoomManagement.Models
{
    public class Receive_UserModel
    {
        public string fullname { get; set; }
        public int receive_id { get; set; }
        public string receive_name { get; set; }
        public string code_receive { get; set; }
        public DateTime? create_date { get; set; }
        public DateTime? complete_date { get; set; }
        public string add_manager_name { get; set; }
        public string manager_name { get; set; }
        public Receive receive { get; set; }
    }
}