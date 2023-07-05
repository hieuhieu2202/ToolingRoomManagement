namespace Model.EF
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Data.Entity.Spatial;

    [Table("Output")]
    public partial class Output
    {
        public int id { get; set; }

        [StringLength(50)]
        public string output_by { get; set; }

        public DateTime? output_date { get; set; }

        public int? device_id { get; set; }

        public int? receive_id { get; set; }

        public string note { get; set; }

        public int? type { get; set; }

        [StringLength(50)]
        public string unit { get; set; }

        public double? quantity_output { get; set; }

        [StringLength(50)]
        public string location { get; set; }

        [StringLength(100)]
        public string ngaytra { get; set; }
    }
}
