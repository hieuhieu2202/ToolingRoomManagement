namespace Model.EF
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Data.Entity.Spatial;

    [Table("DeviceBackRoom")]
    public partial class DeviceBackRoom
    {
        public int id { get; set; }

        [StringLength(255)]
        public string code_device { get; set; }

        [StringLength(255)]
        public string device_name { get; set; }

        public int? quantity { get; set; }

        [StringLength(255)]
        public string price { get; set; }

        [StringLength(255)]
        public string brand { get; set; }

        [StringLength(255)]
        public string parameter { get; set; }

        [StringLength(255)]
        public string unit { get; set; }

        [StringLength(255)]
        public string produce_SN { get; set; }

        [StringLength(255)]
        public string location { get; set; }

        public int? status { get; set; }

        public int? user_confirm { get; set; }

        public int? tooling_member { get; set; }

        [StringLength(255)]
        public string calibration { get; set; }

        public DateTime? create_date { get; set; }

        public DateTime? update_date { get; set; }

        public int? kind_of_device { get; set; }

        public int? manager_id { get; set; }

        public int? gioihan { get; set; }

        [StringLength(255)]
        public string makiemke { get; set; }

        public string note_status { get; set; }

        public string image_TB { get; set; }

        public int? receive_id { get; set; }

        [StringLength(50)]
        public string code_receive { get; set; }
    }
}
