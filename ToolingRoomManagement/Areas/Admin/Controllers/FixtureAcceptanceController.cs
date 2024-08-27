using Model.Dao;
using Model.EF;
using OfficeOpenXml;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Remoting.Contexts;
using System.Web;
using System.Web.Mvc;

namespace ToolingRoomManagement.Areas.Admin.Controllers
{
    public class FixtureAcceptanceController : Controller
    {
        private readonly FixtureAcceptanceDAO _fixtureAcceptanceDAO;

        public FixtureAcceptanceController()
        {
            var dbContext = new ToolingRoomDbContext();
            _fixtureAcceptanceDAO = new FixtureAcceptanceDAO(dbContext);
        }

        // GET: FixtureAcceptance
        public ActionResult Index()
        {
            var fixtureAcceptances = _fixtureAcceptanceDAO.GetAll();
            return View(fixtureAcceptances);
        }

        // GET: FixtureAcceptance/Upload
        public ActionResult Upload()
        {
            return View();
        }

        // POST: FixtureAcceptance/Upload
        [HttpPost]
        public ActionResult Upload(HttpPostedFileBase file)
        {
            if (file != null && file.ContentLength > 0)
            {
                var fixtureAcceptances = new List<FixtureAcceptance>();

                using (var package = new ExcelPackage(file.InputStream))
                {
                    var worksheet = package.Workbook.Worksheets[0];
                    int rowCount = worksheet.Dimension.Rows;

                    for (int row = 2; row <= rowCount; row++) // Bắt đầu từ hàng 2 giả sử hàng 1 là tiêu đề
                    {
                        var fixtureAcceptance = new FixtureAcceptance
                        {
                            Product = worksheet.Cells[row, 1].Text,
                            Description = worksheet.Cells[row, 2].Text,
                            Pn = worksheet.Cells[row, 3].Text,
                            Revision = worksheet.Cells[row, 4].Text,
                            Sn = worksheet.Cells[row, 5].Text,
                            MfgDate = worksheet.Cells[row, 6].Text,
                            MfgBy = worksheet.Cells[row, 7].Text,
                            MfgOrigin = worksheet.Cells[row, 8].Text,
                            Station = worksheet.Cells[row, 9].Text,
                            SG = worksheet.Cells[row, 10].Text,
                            MVT = worksheet.Cells[row, 11].Text,
                            VV = worksheet.Cells[row, 12].Text,
                            Result = worksheet.Cells[row, 13].Text
                        };

                        fixtureAcceptances.Add(fixtureAcceptance);
                    }
                }

                _fixtureAcceptanceDAO.AddRange(fixtureAcceptances);

                TempData["Message"] = "Dữ liệu đã được nhập thành công!";
                return RedirectToAction("Index");
            }

            TempData["Message"] = "Vui lòng tải lên một tệp Excel hợp lệ.";
            return RedirectToAction("Upload");
        }
    }
}