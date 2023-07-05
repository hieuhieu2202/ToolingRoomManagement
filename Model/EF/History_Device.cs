namespace Model.EF
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Data.Entity.Spatial;

    public partial class History_Device
    {
        public int id { get; set; }
        public int id_device { get; set; }

        [StringLength(255)]
        public string code_device { get; set; }

        [StringLength(255)]
        public string quantity { get; set; }

        public DateTime? create_date { get; set; }

        [StringLength(50)]
        public string location { get; set; }

        [StringLength(500)]
        public string note { get; set; }
    }
}
