namespace Model.EF
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Data.Entity.Spatial;

    [Table("OrderPurchase")]
    public partial class OrderPurchase
    {
        public int id { get; set; }

        [StringLength(100)]
        public string people_name { get; set; }

        [StringLength(100)]
        public string part { get; set; }

        [StringLength(100)]
        public string code_people { get; set; }

        [StringLength(100)]
        public string phone { get; set; }

        public DateTime? create_date { get; set; }

        public DateTime? need_date { get; set; }

        public string guess_item { get; set; }

        public int? type_item { get; set; }

        [StringLength(500)]
        public string item_name { get; set; }

        [StringLength(500)]
        public string item_model { get; set; }

        [StringLength(500)]
        public string item_parameter { get; set; }

        [StringLength(50)]
        public string item_number { get; set; }

        public int? quantity { get; set; }

        public string purpose { get; set; }

        public string way_caculate { get; set; }

        public int? receiver_id { get; set; }

        [StringLength(100)]
        public string receiver_name { get; set; }

        public int? manager_id { get; set; }

        [StringLength(100)]
        public string manager_name { get; set; }

        public int? status { get; set; }

        public string note_manager { get; set; }

        public string note_receiver { get; set; }
    }
}
