namespace Model.EF
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Data.Entity.Spatial;

    [Table("MaintenanceRobot")]
    public partial class MaintenanceRobot
    {
        public int id { get; set; }

        public int? station_id { get; set; }

        public int? issue_1 { get; set; }

        public int? issue_2 { get; set; }

        public int? issue_3 { get; set; }

        public int? issue_4 { get; set; }

        public int? issue_5 { get; set; }

        public int? issue_6 { get; set; }

        public int? issue_7 { get; set; }

        public int? issue_8 { get; set; }

        public int? issue_9 { get; set; }

        public string note { get; set; }

        public DateTime? create_date { get; set; }

        public int? create_by { get; set; }

        [StringLength(100)]
        public string create_by_name { get; set; }

        [StringLength(50)]
        public string part { get; set; }

        [StringLength(100)]
        public string station_name { get; set; }
    }
}
