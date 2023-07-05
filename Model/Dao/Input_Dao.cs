using Model.EF;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Model.Dao
{
    public class Input_Dao
    {
        ToolingRoomDbContext db = null;
        public Input_Dao()
        {
            db = new ToolingRoomDbContext();
        }
        public List<Input> Input_Back(int receive_id)
        {
            var re = (from dt in db.Receives
                           where dt.id == receive_id
                           select dt).FirstOrDefault();
            return db.Inputs.Where(x => x.code_order == re.code_receive).ToList();
        }
        public int Insert(int device_id,float quantity,int input_by,string code_order,string note)
        {
            Input input = new Input();
            input.quantity = quantity;
            input.device_id = device_id;
            input.input_by = input_by;
            input.input_date = DateTime.Now;
            input.code_order = code_order;
            input.note = note;
            db.Inputs.Add(input);
            db.SaveChanges();
            return input.id;
        }
        public int Insert_Back(int device_id, float quantity, int input_by, string code_order, string note, int? receive_id)
        {
            Input input = new Input();
            input.quantity = quantity;
            input.device_id = device_id;
            input.input_by = input_by;
            input.input_date = DateTime.Now;
            input.code_order = code_order;
            input.note = note;
            input.receive_id = receive_id;
            db.Inputs.Add(input);
            db.SaveChanges();
            return input.id;
        }
        public List<Input> ListAllInput()
        {
            return db.Inputs.ToList();
        }
    }
}
