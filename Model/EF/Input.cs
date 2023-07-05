namespace Model.EF
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Data.Entity.Spatial;

    [Table("Input")]
    public partial class Input
    {
        public int id { get; set; }

        public double? quantity { get; set; }

        public int? device_id { get; set; }

        public DateTime? input_date { get; set; }

        public int? input_by { get; set; }

        [StringLength(100)]
        public string code_order { get; set; }

        [StringLength(50)]
        public string username_input { get; set; }

        [StringLength(50)]
        public string location { get; set; }

        public string note { get; set; }

        public int? receive_id { get; set; }
    }
}
