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
    
    public partial class Return
    {
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2214:DoNotCallOverridableMethodsInConstructors")]
        public Return()
        {
            this.ReturnDevices = new HashSet<ReturnDevice>();
            this.UserReturnSigns = new HashSet<UserReturnSign>();
        }
    
        public int Id { get; set; }
        public Nullable<System.DateTime> DateReturn { get; set; }
        public Nullable<int> IdUser { get; set; }
        public string Note { get; set; }
        public string Status { get; set; }
        public string Type { get; set; }
        public Nullable<int> IdBorrow { get; set; }
    
        public virtual User User { get; set; }
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
        public virtual ICollection<ReturnDevice> ReturnDevices { get; set; }
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
        public virtual ICollection<UserReturnSign> UserReturnSigns { get; set; }
        public virtual Borrow Borrow { get; set; }
    }
}
