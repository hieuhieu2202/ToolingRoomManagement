namespace Model.EF
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Data.Entity.Spatial;

    public partial class LUXFT1
    {
        public int id { get; set; }

        [StringLength(100)]
        public string model_name { get; set; }

        [StringLength(100)]
        public string SN_lightbox { get; set; }

        [StringLength(50)]
        public string LUX_2 { get; set; }

        [StringLength(50)]
        public string LUX_5 { get; set; }

        [StringLength(50)]
        public string LUX_10 { get; set; }

        [StringLength(50)]
        public string LUX_1000 { get; set; }

        [StringLength(50)]
        public string LUX_2000 { get; set; }

        [StringLength(50)]
        public string LUX_5000 { get; set; }

        public DateTime? create_date { get; set; }

        [StringLength(50)]
        public string create_by { get; set; }
    }
}
