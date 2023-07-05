namespace Model.EF
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Data.Entity.Spatial;

    [Table("Golden")]
    public partial class Golden
    {
        [StringLength(500)]
        public string Golden_Name { get; set; }

        [StringLength(500)]
        public string Model_Name { get; set; }

        [StringLength(500)]
        public string Group_Name { get; set; }

        [StringLength(255)]
        public string Create_Date { get; set; }

        [StringLength(255)]
        public string Update_Date { get; set; }

        [StringLength(255)]
        public string Create_People { get; set; }

        [StringLength(255)]
        public string Due_Date { get; set; }

        [StringLength(255)]
        public string Mac { get; set; }

        [StringLength(255)]
        public string End_Date { get; set; }

        [StringLength(255)]
        public string Part { get; set; }

        public string File_Name { get; set; }

        public int? Create_By { get; set; }

        public int id { get; set; }
    }
}
