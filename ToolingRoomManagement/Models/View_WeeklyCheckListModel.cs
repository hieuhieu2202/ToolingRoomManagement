using Model.EF;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace ToolingRoomManagement.Models
{
    public class View_WeeklyCheckListModel
    {
        public WeeklyCheckList weekly { get; set; }
        public Station station { get; set; }
    }
}