using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace ToolingRoomManagement.Models
{
    public class BackDeviceModel
    {
        public int receive_id { get; set; }
        public string makiemke { get; set; }
        public string maSN { get; set; }
        public string tenTB { get; set; }
        public string model_TB { get; set; }
        public string kho_TB { get; set; }
        public int statusTB { get; set; }
        public List<HttpPostedFileWrapper> imageTB { get; set; }
        public string quanly { get; set; }
        public string noteTB { get; set; }
        public int quanly_id { get; set; }
        public string calibration { get; set; }
        public int back_id { get; set; }
    }
}