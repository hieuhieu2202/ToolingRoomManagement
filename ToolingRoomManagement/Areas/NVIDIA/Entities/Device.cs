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
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2214:DoNotCallOverridableMethodsInConstructors")]
        public Device()
        {
            this.DeviceWarehouseLayouts = new HashSet<DeviceWarehouseLayout>();
            this.AlternativeDevices = new HashSet<AlternativeDevice>();
        }
    
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
        public string Specification { get; set; }
        public string Unit { get; set; }
        public string DeliveryTime { get; set; }
        public Nullable<int> SysQuantity { get; set; }
        public Nullable<int> MinQty { get; set; }
        public Nullable<int> POQty { get; set; }
        public string Type_BOM { get; set; }
        public Nullable<int> MOQ { get; set; }
        public Nullable<bool> isConsign { get; set; }
        public Nullable<int> NG_Qty { get; set; }
    
        public virtual Group Group { get; set; }
        public virtual Model Model { get; set; }
        public virtual Product Product { get; set; }
        public virtual Station Station { get; set; }
        public virtual Vendor Vendor { get; set; }
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
        public virtual ICollection<DeviceWarehouseLayout> DeviceWarehouseLayouts { get; set; }
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
        public virtual ICollection<AlternativeDevice> AlternativeDevices { get; set; }
        public virtual Warehouse Warehouse { get; set; }
    }
}
