namespace Model.EF1
{
    using System;
    using System.Data.Entity;
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Linq;

    public partial class HRDbContext : DbContext
    {
        public HRDbContext()
            : base("name=HRDbContext")
        {
        }

        public virtual DbSet<Record> Records { get; set; }

        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
        }
    }
}
