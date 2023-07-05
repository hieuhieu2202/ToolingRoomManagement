namespace Model.EF
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Data.Entity.Spatial;

    public partial class Person
    {
        public int id { get; set; }

        [StringLength(50)]
        public string code_people { get; set; }

        [StringLength(100)]
        public string fullname { get; set; }

        [StringLength(50)]
        public string part { get; set; }
    }
}
