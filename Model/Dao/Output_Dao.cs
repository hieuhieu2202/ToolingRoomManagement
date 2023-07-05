using Model.EF;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Model.Dao
{
    public class Output_Dao
    {
        ToolingRoomDbContext db = null;
        public Output_Dao()
        {
            db = new ToolingRoomDbContext();
        }
        public List<Output> listAllOutput()
        {
            return db.Outputs.ToList();
        }
        public List<Output> Output_Receive(int receive_id)
        {
            return db.Outputs.Where(x => x.receive_id == receive_id).ToList();
        }
        public int Insert(float quantity,string output_by,int device_id,int receive_id,int type,string note,string ngaytra)
        {
            Output output = new Output();
            output.output_by = output_by;
            output.quantity_output = quantity;
            output.output_date = DateTime.Now;
            output.device_id = device_id;
            output.receive_id = receive_id;
            output.type = type;
            output.note = note;
            output.ngaytra = ngaytra;
            db.Outputs.Add(output);
            db.SaveChanges();
            return output.id;
        }
    }
}
