using System.Data.SqlClient;
using System.Collections.Generic;
using System.IO;
using ClosedXML.Excel;
using ToolingRoomManagement.Models;
using System.Linq;
using System.Configuration; // Thay thế bằng thư viện bạn sử dụng để đọc Excel

public class ExcelFileHandling
{
    public List<FixtureAcceptanceModel> ParseExcelFile(Stream stream)
    {
        var fixtures = new List<FixtureAcceptanceModel>();

        using (var workbook = new XLWorkbook(stream))
        {
            var worksheet = workbook.Worksheet(1);
            var rows = worksheet.RangeUsed().RowsUsed().Skip(1);

            foreach (var row in rows)
            {
                var fixture = new FixtureAcceptanceModel
                {
                    Product = row.Cell(1).GetValue<string>(),
                    Description = row.Cell(2).GetValue<string>(),
                    Pn = row.Cell(3).GetValue<string>(),
                    Revision = row.Cell(4).GetValue<string>(),
                    Sn = row.Cell(5).GetValue<string>(),
                    MfgDate = row.Cell(6).GetValue<string>(),
                    MfgBy = row.Cell(7).GetValue<string>(),
                    MfgOrigin = row.Cell(8).GetValue<string>(),
                    Station = row.Cell(9).GetValue<string>(),
                    SG = row.Cell(10).GetValue<string>(),
                    MVT = row.Cell(11).GetValue<string>(),
                    VV = row.Cell(12).GetValue<string>(),
                    Result = row.Cell(13).GetValue<string>()
                };

                fixtures.Add(fixture);
            }
        }

        return fixtures;
    }

    public void InsertFixturesIntoDatabase(List<FixtureAcceptanceModel> fixtures)
    {
        string connectionString = ConfigurationManager.ConnectionStrings["ToolingRoomDbContext"].ConnectionString;

        using (var connection = new SqlConnection(connectionString))
        {
            connection.Open();

            foreach (var fixture in fixtures)
            {
                var query = @"INSERT INTO FixtureAcceptance (Product, Description, Pn, Revision, Sn, MfgDate, MfgBy, MfgOrigin, Station, SG, MVT, VV, Result) 
                              VALUES (@Product, @Description, @Pn, @Revision, @Sn, @MfgDate, @MfgBy, @MfgOrigin, @Station, @SG, @MVT, @VV, @Result)";

                using (var command = new SqlCommand(query, connection))
                {
                    command.Parameters.AddWithValue("@Product", fixture.Product);
                    command.Parameters.AddWithValue("@Description", fixture.Description);
                    command.Parameters.AddWithValue("@Pn", fixture.Pn);
                    command.Parameters.AddWithValue("@Revision", fixture.Revision);
                    command.Parameters.AddWithValue("@Sn", fixture.Sn);
                    command.Parameters.AddWithValue("@MfgDate", fixture.MfgDate);
                    command.Parameters.AddWithValue("@MfgBy", fixture.MfgBy);
                    command.Parameters.AddWithValue("@MfgOrigin", fixture.MfgOrigin);
                    command.Parameters.AddWithValue("@Station", fixture.Station);
                    command.Parameters.AddWithValue("@SG", fixture.SG);
                    command.Parameters.AddWithValue("@MVT", fixture.MVT);
                    command.Parameters.AddWithValue("@VV", fixture.VV);
                    command.Parameters.AddWithValue("@Result", fixture.Result);

                    command.ExecuteNonQuery();
                }
            }
        }
    }
}
