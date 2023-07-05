namespace Model.EF
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Data.Entity.Spatial;

    [Table("DetailBorrow")]
    public partial class DetailBorrow
    {
        public int id { get; set; }

        [StringLength(500)]
        public string productName { get; set; }

        [StringLength(500)]
        public string productSN { get; set; }

        public int? productQuantity { get; set; }

        [StringLength(50)]
        public string productLine { get; set; }

        public string reasonBorrow { get; set; }

        public int? summaryID { get; set; }

        public int? status_product { get; set; }

        public DateTime? date_return { get; set; }

        [StringLength(50)]
        public string leaderLine_code { get; set; }

        [StringLength(100)]
        public string leaderLine_name { get; set; }
    }
}
