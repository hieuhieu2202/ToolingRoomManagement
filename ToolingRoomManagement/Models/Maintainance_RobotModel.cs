using Model.EF;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace ToolingRoomManagement.Models
{
    public class Maintainance_RobotModel
    {
        public Station_Robot station_robot { get; set; }
        public MaintenanceRobot maintenanvce { get; set; }
    }
}