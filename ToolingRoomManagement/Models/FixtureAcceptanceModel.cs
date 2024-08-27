using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace ToolingRoomManagement.Models
{
    public class FixtureAcceptanceModel
    {
        public string Product { get; set; }
        public string Description { get; set; }
        public string Pn { get; set; }
        public string Revision { get; set; }
        public string Sn { get; set; }
        public string MfgDate { get; set; }
        public string MfgBy { get; set; }
        public string MfgOrigin { get; set; }
        public string Station { get; set; }
        public string SG { get; set; }
        public string MVT { get; set; }
        public string VV { get; set; }
        public string Result { get; set; }
    }
}