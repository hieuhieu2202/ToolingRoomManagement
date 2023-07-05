namespace Model.EF
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Data.Entity.Spatial;

    [Table("User")]
    public partial class User
    {
        public int id { get; set; }

        [StringLength(50)]
        public string username { get; set; }

        [StringLength(50)]
        public string fullname { get; set; }

        public int? part_id { get; set; }

        [StringLength(15)]
        public string phone { get; set; }

        [StringLength(100)]
        public string mail { get; set; }

        public int? role_id { get; set; }

        public DateTime? create_date { get; set; }

        [StringLength(100)]
        public string password { get; set; }

        [StringLength(50)]
        public string chinese_name { get; set; }
    }
}
