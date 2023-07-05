namespace Model.EF
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Data.Entity.Spatial;

    [Table("Receive")]
    public partial class Receive
    {
        public int id { get; set; }

        [StringLength(50)]
        public string code_receive { get; set; }

        [StringLength(50)]
        public string create_by { get; set; }

        public DateTime? create_date { get; set; }

        public int? status { get; set; }

        [StringLength(500)]
        public string note { get; set; }

        [StringLength(500)]
        public string note_manager { get; set; }

        [StringLength(50)]
        public string manager_confirm { get; set; }

        [StringLength(500)]
        public string receive_name { get; set; }

        public int? manager_id { get; set; }

        public int? user_create_id { get; set; }

        public string note_cThan { get; set; }

        public int? add_manager { get; set; }

        [StringLength(50)]
        public string add_manager_name { get; set; }

        public DateTime? complete_date { get; set; }

        public DateTime? time_manager_cf { get; set; }

        public DateTime? time_transfer_cf { get; set; }

        public DateTime? time_CThanConfirm { get; set; }

        public DateTime? time_Thuy_cf { get; set; }

        public string note_Thuy { get; set; }

        public DateTime? time_manager_cf_Back { get; set; }

        public string note_manager_back { get; set; }

        public int? receive_type { get; set; }

        public DateTime? time_thuy_check { get; set; }

        public string note_transfer { get; set; }
    }
}
