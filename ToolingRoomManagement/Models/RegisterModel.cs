using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace ToolingRoomManagement.Models
{
    public class RegisterModel
    {
        [Key]
        public long ID { set; get; }

        [Display(Name = "Enter Fullname")]
        [Required(ErrorMessage = "Enter fullname")]
        public string fullName { set; get; }

        [Display(Name = "Enter username")]
        [Required(ErrorMessage = "Enter username")]
        public string UserName { set; get; }

        [Display(Name = "Enter phone")]
        public string Phone { set; get; }

        [Display(Name = "Enter password")]
        [StringLength(20, MinimumLength = 6, ErrorMessage = "Min length 6 keys")]
        [Required(ErrorMessage = "Enter password")]
        public string Password { set; get; }

        [Display(Name = "Xác nhận mật khẩu")]
        //[Compare("Password", ErrorMessage = "Xác nhận mật khẩu không đúng.")]
        public string ConfirmPassword { set; get; }

        [Required(ErrorMessage = "Select parrt")]
        [Display(Name = "Select Part")]
        public int PartID { set; get; }
    }
}