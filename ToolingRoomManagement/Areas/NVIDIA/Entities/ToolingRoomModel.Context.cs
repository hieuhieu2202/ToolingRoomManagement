﻿//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated from a template.
//
//     Manual changes to this file may cause unexpected behavior in your application.
//     Manual changes to this file will be overwritten if the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

namespace ToolingRoomManagement.Areas.NVIDIA.Entities
{
    using System;
    using System.Data.Entity;
    using System.Data.Entity.Infrastructure;
    
    public partial class ToolingRoomEntities : DbContext
    {
        public ToolingRoomEntities()
            : base("name=ToolingRoomEntities")
        {
        }
    
        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            throw new UnintentionalCodeFirstException();
        }
    
        public virtual DbSet<Product> Products { get; set; }
        public virtual DbSet<Group> Groups { get; set; }
        public virtual DbSet<Model> Models { get; set; }
        public virtual DbSet<Role> Roles { get; set; }
        public virtual DbSet<Station> Stations { get; set; }
        public virtual DbSet<User> Users { get; set; }
        public virtual DbSet<UserDepartment> UserDepartments { get; set; }
        public virtual DbSet<UserRole> UserRoles { get; set; }
        public virtual DbSet<Vendor> Vendors { get; set; }
        public virtual DbSet<Device> Devices { get; set; }
        public virtual DbSet<BorrowDevice> BorrowDevices { get; set; }
        public virtual DbSet<DeviceWarehouseLayout> DeviceWarehouseLayouts { get; set; }
        public virtual DbSet<UserBorrowSign> UserBorrowSigns { get; set; }
        public virtual DbSet<WarehouseLayout> WarehouseLayouts { get; set; }
        public virtual DbSet<Borrow> Borrows { get; set; }
        public virtual DbSet<HistoryUpdateDevice> HistoryUpdateDevices { get; set; }
        public virtual DbSet<Warehouse> Warehouses { get; set; }
        public virtual DbSet<DeviceUnconfirm> DeviceUnconfirms { get; set; }
        public virtual DbSet<Department> Departments { get; set; }
        public virtual DbSet<ReturnDevice> ReturnDevices { get; set; }
        public virtual DbSet<Return> Returns { get; set; }
        public virtual DbSet<UserReturnSign> UserReturnSigns { get; set; }
        public virtual DbSet<ComingDevice> ComingDevices { get; set; }
        public virtual DbSet<AlternativeDevice> AlternativeDevices { get; set; }
        public virtual DbSet<Export> Exports { get; set; }
        public virtual DbSet<ExportDevice> ExportDevices { get; set; }
        public virtual DbSet<UserExportSign> UserExportSigns { get; set; }
    }
}
