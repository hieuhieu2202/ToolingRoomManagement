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
    
    public partial class Borrow
    {
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2214:DoNotCallOverridableMethodsInConstructors")]
        public Borrow()
        {
            this.BorrowDevices = new HashSet<BorrowDevice>();
            this.UserBorrowSigns = new HashSet<UserBorrowSign>();
        }
    
        public int Id { get; set; }
        public Nullable<System.DateTime> DateBorrow { get; set; }
        public Nullable<System.DateTime> DateReturn { get; set; }
        public string Status { get; set; }
        public string Type { get; set; }
        public Nullable<System.DateTime> DateDue { get; set; }
        public Nullable<int> IdUser { get; set; }
        public string Note { get; set; }
        public Nullable<int> IdModel { get; set; }
        public Nullable<int> IdStation { get; set; }

        public string DevicesName { get; set; }

        public virtual Model Model { get; set; }
        public virtual Station Station { get; set; }
        public virtual User User { get; set; }
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
        public virtual ICollection<BorrowDevice> BorrowDevices { get; set; }
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
        public virtual ICollection<UserBorrowSign> UserBorrowSigns { get; set; }
    }
}
