namespace Model.EF
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Data.Entity.Spatial;

    public partial class Station_Robot
    {
        public int id { get; set; }

        [StringLength(255)]
        public string station_name { get; set; }

        public DateTime? create_date { get; set; }
    }
}
