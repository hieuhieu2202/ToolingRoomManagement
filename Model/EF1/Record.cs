namespace Model.EF1
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Data.Entity.Spatial;

    [Table("Record")]
    public partial class Record
    {
        public long id { get; set; }

        [StringLength(200)]
        public string EMPLOYEE_ID { get; set; }

        [StringLength(500)]
        public string FULLNAME { get; set; }

        [StringLength(500)]
        public string FACTORY { get; set; }

        [StringLength(1000)]
        public string DEPARTMENT { get; set; }

        [StringLength(500)]
        public string SHIFT { get; set; }

        [StringLength(500)]
        public string STATUS { get; set; }

        public double? ABNORMAL_TIME { get; set; }

        [Column(TypeName = "date")]
        public DateTime? DATE { get; set; }

        [StringLength(500)]
        public string IN_WORK1 { get; set; }

        [StringLength(500)]
        public string SLEEP_WORK1 { get; set; }

        [StringLength(500)]
        public string IN_WORK2 { get; set; }

        [StringLength(500)]
        public string SLEEP_WORK2 { get; set; }

        [StringLength(500)]
        public string IN_OVERTIME { get; set; }

        [StringLength(500)]
        public string OUT_OVERTIME { get; set; }
    }
}
