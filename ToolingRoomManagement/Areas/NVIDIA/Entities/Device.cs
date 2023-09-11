//------------------------------------------------------------------------------
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
    using System.Collections.Generic;
    
    public partial class Device
    {
        public int Id { get; set; }
        public string DeviceCode { get; set; }
        public string DeviceName { get; set; }
        public Nullable<System.DateTime> DeviceDate { get; set; }
        public Nullable<double> Buffer { get; set; }
        public Nullable<int> Quantity { get; set; }
        public string Type { get; set; }
        public string Status { get; set; }
        public Nullable<int> IdWareHouse { get; set; }
        public Nullable<int> IdGroup { get; set; }
        public Nullable<int> IdVendor { get; set; }
        public Nullable<System.DateTime> CreatedDate { get; set; }
        public Nullable<int> IdProduct { get; set; }
        public Nullable<int> IdModel { get; set; }
        public Nullable<int> IdStation { get; set; }
        public string Relation { get; set; }
        public Nullable<int> LifeCycle { get; set; }
        public Nullable<double> Forcast { get; set; }
        public string ACC_KIT { get; set; }
        public Nullable<int> QtyConfirm { get; set; }
        public Nullable<int> RealQty { get; set; }
        public string ImagePath { get; set; }
    
        public virtual Group Group { get; set; }
        public virtual Model Model { get; set; }
        public virtual Product Product { get; set; }
        public virtual Station Station { get; set; }
        public virtual Vendor Vendor { get; set; }
    }
}
