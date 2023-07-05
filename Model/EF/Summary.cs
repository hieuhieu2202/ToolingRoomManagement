namespace Model.EF
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Data.Entity.Spatial;

    [Table("Summary")]
    public partial class Summary
    {
        public int id { get; set; }

        [StringLength(100)]
        public string codeOrder { get; set; }

        public int? status { get; set; }

        public DateTime? create_date { get; set; }

        [StringLength(100)]
        public string create_by { get; set; }

        public int? managerUs_id { get; set; }

        [StringLength(100)]
        public string managerUs_username { get; set; }

        public string note { get; set; }

        public string note_Manager { get; set; }

        public int? accountantPD_id { get; set; }

        [StringLength(100)]
        public string accountantPD_username { get; set; }

        public int? managerPD_id { get; set; }

        [StringLength(100)]
        public string managerPD_username { get; set; }

        public int? aTin_id { get; set; }

        [StringLength(100)]
        public string aTin_username { get; set; }

        public DateTime? time_managerUs_cf { get; set; }

        public DateTime? time_accountantPD_cf { get; set; }

        public DateTime? time_managerPD_cf { get; set; }

        public DateTime? time_aTin_cf { get; set; }

        public string note_accountantPD { get; set; }

        public string note_managerPD { get; set; }

        public string note_aTin { get; set; }

        public DateTime? date_borrow { get; set; }

        public DateTime? date_return { get; set; }

        public int? create_by_id { get; set; }

        public string note_back_accountantPD { get; set; }

        public int? accountantPDBack_id { get; set; }

        [StringLength(100)]
        public string accountantPDBack_username { get; set; }

        public DateTime? time_accountantPDBack_cf { get; set; }

        public int? aKhanh_id { get; set; }

        [StringLength(100)]
        public string aKhanh_username { get; set; }

        public DateTime? time_aKhanh_cf { get; set; }

        public string note_aKhanh { get; set; }

        [StringLength(100)]
        public string compensation_order { get; set; }

        public int? compensation_order_id { get; set; }

        [StringLength(100)]
        public string debt_order { get; set; }

        public int? debt_order_id { get; set; }

        public int? type_order { get; set; }

        [StringLength(100)]
        public string leaderNightShift_username { get; set; }

        public int? leaderNightShift_id { get; set; }

        public string note_leaderNightShift { get; set; }

        public DateTime? time_leaderNightShift_cf { get; set; }

        [StringLength(100)]
        public string leaderNightBack_username { get; set; }

        public int? leaderNightBack_id { get; set; }

        public DateTime? time_leaderNightBack_cf { get; set; }

        public string note_leaderNightBack { get; set; }
    }
}
