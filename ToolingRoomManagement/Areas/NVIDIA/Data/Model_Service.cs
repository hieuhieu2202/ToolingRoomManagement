using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace ToolingRoomManagement.Areas.NVIDIA.Data
{
    public class Model_Service
    {
        public class Sendmail
        {
            public string MailTo { get; set; }
            public string MailCC { get; set; }
            public string MailSubject { get; set; }
            public string MailContent { get; set; }
            public string MailType { get; set; }
        }
    }
}