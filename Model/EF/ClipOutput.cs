namespace Model.EF
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Data.Entity.Spatial;

    [Table("ClipOutput")]
    public partial class ClipOutput
    {
        public int id { get; set; }

        public int? receive_id { get; set; }

        public int? device_id { get; set; }

        public double? quantity { get; set; }

        public int? type { get; set; }

        public string note { get; set; }

        public DateTime? create_date { get; set; }

        [StringLength(50)]
        public string unit { get; set; }

        [StringLength(50)]
        public string location { get; set; }

        public DateTime? ngaytra { get; set; }
    }
}
