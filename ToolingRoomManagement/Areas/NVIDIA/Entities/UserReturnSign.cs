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
    
    public partial class UserReturnSign
    {
        public int Id { get; set; }
        public Nullable<int> IdReturn { get; set; }
        public Nullable<System.DateTime> DateSign { get; set; }
        public Nullable<int> Note { get; set; }
        public Nullable<int> SignOrder { get; set; }
        public string Status { get; set; }
        public string Type { get; set; }
        public Nullable<int> IdUser { get; set; }
    
        public virtual User User { get; set; }
    }
}
