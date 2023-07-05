namespace Model.EF
{
    using System;
    using System.Data.Entity;
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Linq;

    public partial class ToolingRoomDbContext : DbContext
    {
        public ToolingRoomDbContext()
            : base("name=ToolingRoomDbContext")
        {
        }

        public virtual DbSet<ClipOutput> ClipOutputs { get; set; }
        public virtual DbSet<DetailBorrow> DetailBorrows { get; set; }
        public virtual DbSet<DeviceBackRoom> DeviceBackRooms { get; set; }
        public virtual DbSet<Device> Devices { get; set; }
        public virtual DbSet<Fixture> Fixtures { get; set; }
        public virtual DbSet<Golden> Goldens { get; set; }
        public virtual DbSet<History_Device> History_Device { get; set; }
        public virtual DbSet<Input> Inputs { get; set; }
        public virtual DbSet<LineProduct> LineProducts { get; set; }
        public virtual DbSet<LUXFT1> LUXFT1 { get; set; }
        public virtual DbSet<LUXFT3> LUXFT3 { get; set; }
        public virtual DbSet<MaintenanceRobot> MaintenanceRobots { get; set; }
        public virtual DbSet<OrderPurchase> OrderPurchases { get; set; }
        public virtual DbSet<Output> Outputs { get; set; }
        public virtual DbSet<Part> Parts { get; set; }
        public virtual DbSet<Person> People { get; set; }
        public virtual DbSet<Receive> Receives { get; set; }
        public virtual DbSet<SheildingBox> SheildingBoxes { get; set; }
        public virtual DbSet<Station> Stations { get; set; }
        public virtual DbSet<Station_Robot> Station_Robot { get; set; }
        public virtual DbSet<Summary> Summaries { get; set; }
        public virtual DbSet<User> Users { get; set; }
        public virtual DbSet<WeeklyCheckList> WeeklyCheckLists { get; set; }

        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            modelBuilder.Entity<User>()
                .Property(e => e.phone)
                .IsFixedLength();
        }
    }
}
