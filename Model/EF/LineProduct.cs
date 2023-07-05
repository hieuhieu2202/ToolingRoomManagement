namespace Model.EF
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Data.Entity.Spatial;

    [Table("LineProduct")]
    public partial class LineProduct
    {
        public int id { get; set; }

        [StringLength(50)]
        public string lineName { get; set; }

        public DateTime? create_date { get; set; }
    }
}
