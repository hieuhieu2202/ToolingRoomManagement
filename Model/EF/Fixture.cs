namespace Model.EF
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Data.Entity.Spatial;

    [Table("Fixture")]
    public partial class Fixture
    {
        [StringLength(500)]
        public string Model_Name { get; set; }

        [StringLength(500)]
        public string Group_Name { get; set; }

        [StringLength(500)]
        public string Station_Name { get; set; }

        [StringLength(255)]
        public string Calibration_Date { get; set; }

        [StringLength(255)]
        public string End_Date { get; set; }

        [StringLength(255)]
        public string Part { get; set; }

        [StringLength(255)]
        public string Create_People { get; set; }

        public string File_Name { get; set; }

        public int id { get; set; }
    }
}
