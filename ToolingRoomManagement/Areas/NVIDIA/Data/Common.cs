using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net;
using System.Web;
using System.IO;
using ToolingRoomManagement.Areas.NVIDIA.Data;
using ToolingRoomManagement.Areas.NVIDIA.Entities;
using System.Threading.Tasks;
using System.Threading;
using System.Web.UI.WebControls;
using System.Text.Json;
using Model.EF;
using System.Xml.Linq;

namespace ToolingRoomManagement.Areas.NVIDIA.Data
{
    public class Common
    {

        // CheckStatus
        public static string CheckStatus(Entities.Device device)
        {
            string status = "NA";

            if (device.Status == "Locked")
                status = "Locked";
            else if (device.QtyConfirm == 0)
                status = "Unconfirmed";
            else if (device.QtyConfirm < device.Quantity)
                status = "Part Confirmed";
            else if (device.QtyConfirm >= device.Quantity)
                status = "Confirmed";

            if (device.RealQty <= (device.QtyConfirm * device.Buffer))
                status = "Out Range";

            return status;
        }


        public static void SendSignMail(Entities.Borrow borrow)
        {
            Entities.UserBorrowSign sign = borrow.UserBorrowSigns.FirstOrDefault(b => b.Status == "Pending");
            Model_Service.Sendmail md = new Model_Service.Sendmail
            {
                MailTo = sign.User.Email,
                MailSubject = "New Sign Request - Tooling room Management System",
                MailType = "html",
                MailCC = "",
            };

            string mailContent = $"Hi, {RenderUserName(sign.User)}\n" +
                                 $"\n" +
                                 $"I hope this email finds you well. We would like to inform you that there is a new signature request in the system that requires your attention.\n" +
                                 $"Requester: {RenderUserName(borrow.User)}\n" +
                                 $"Request Date: {borrow.DateBorrow}\n" +
                                 $"Used for Model: {borrow.Model.ModelName}\n" +
                                 $"Used for Station: {borrow.Station.StationName}\n" +
                                 $"Note: {borrow.Note}\n" +
                                 $"\n" +
                                 $"Devices:\n";
            int i = 1;
            mailContent += @"<table style=""width:100%"">
                                <thead>
                                    <tr style="""">
                                        <th style=""border:1px solid #414141;background-color:#cdf7e2;min-width:30px;max-width:70px;text-align:center;padding:5px"">No.</th>
                                        <th style=""border:1px solid #414141;background-color:#e8eae9;padding:5px 5px 5px 10px"">Device Code</th>
                                        <th style=""border:1px solid #414141;background-color:#e8eae9;padding:5px 5px 5px 10px"">Device Name</th>
                                        <th style=""border:1px solid #414141;background-color:#e8eae9;padding:5px 5px 5px 10px"">Borrow Quantity</th>
                                    </tr>
                                </thead>
                                <tbody>";

            foreach (var BorrowDevice in borrow.BorrowDevices)
            {
                var device = BorrowDevice.Device;
                mailContent += $@"<tr>
                                      <td style=""border:1px solid #414141;background-color:#f3fff9;text-align:center;padding:3px"">{i}</td>
                                      <td style=""padding:3px 3px 3px 10px;border:1px solid #414141"">{device.DeviceCode}</td>
                                      <td style=""padding:3px 3px 3px 10px;border:1px solid #414141"">{device.DeviceName}</td>
                                      <td style=""padding:3px 3px 3px 10px;border:1px solid #414141"">{BorrowDevice.BorrowQuantity}</td>
                                  </tr>";
                i++;
            }
            mailContent += "</tbody></table>\n";

            mailContent += "You can access the request by logging into your account on System <a href=\"https://10.220.130.117:5555/NVIDIA/Authentication/SignIn\">Tooling Room Management</a>. ";
            mailContent += "Once logged in, please navigate to the \"Sign\" in \"Borrow - Return\" section, where you will find the new request awaiting your action.\n";
            mailContent += "This is an automated email, so there is no need to reply. If you have any questions, please contact our support team at <a href=\"javascript:;\">[cpeii-vn-te-me@mail.foxconn.com]</a> or  <a href=\"javascript:;\">[37145]</a>.\n";
            mailContent += "\n";
            mailContent += "Thanks and Best regards!";

            md.MailContent = SignMailHtml.Content(mailContent);

            Thread thread = new Thread(() =>
            {
                Send_Mail(md);
            });
            thread.Start();
            thread.IsBackground = true;
        }
        public static void SendSignMail(Entities.Return @return)
        {
            Entities.UserReturnSign sign = @return.UserReturnSigns.FirstOrDefault(b => b.Status == "Pending");
            Model_Service.Sendmail md = new Model_Service.Sendmail
            {
                MailTo = sign.User.Email,
                MailSubject = "New Sign Request - Tooling room Management System",
                MailType = "html",
                MailCC = "",
            };

            string mailContent = $"Hi, {RenderUserName(sign.User)}\n" +
                                 $"\n" +
                                 $"I hope this email finds you well. We would like to inform you that there is a new signature request in the system that requires your attention.\n" +
                                 $"Requester: {RenderUserName(@return.User)}\n" +
                                 $"Request Date: {@return.DateReturn}\n" +
                                 $"Note: {@return.Note}\n" +
                                 $"\n" +
                                 $"Devices:\n";
            int i = 1;
            mailContent += @"<table style=""width:100%"">
                                <thead>
                                    <tr style="""">
                                        <th style=""border:1px solid #414141;background-color:#cdf7e2;min-width:30px;max-width:70px;text-align:center;padding:5px"">No.</th>
                                        <th style=""border:1px solid #414141;background-color:#e8eae9;padding:5px 5px 5px 10px"">Device Code</th>
                                        <th style=""border:1px solid #414141;background-color:#e8eae9;padding:5px 5px 5px 10px"">Device Name</th>
                                        <th style=""border:1px solid #414141;background-color:#e8eae9;padding:5px 5px 5px 10px"">Borrow Quantity</th>
                                    </tr>
                                </thead>
                                <tbody>";

            foreach (var ReturnDevice in @return.ReturnDevices)
            {
                var device = ReturnDevice.Device;
                mailContent += $@"<tr>
                                      <td style=""border:1px solid #414141;background-color:#f3fff9;text-align:center;padding:3px"">{i}</td>
                                      <td style=""padding:3px 3px 3px 10px;border:1px solid #414141"">{device.DeviceCode}</td>
                                      <td style=""padding:3px 3px 3px 10px;border:1px solid #414141"">{device.DeviceName}</td>
                                      <td style=""padding:3px 3px 3px 10px;border:1px solid #414141"">{ReturnDevice.ReturnQuantity}</td>
                                      <td style=""padding:3px 3px 3px 10px;border:1px solid #414141"">NG: {ReturnDevice.IsNG}</td>
                                      <td style=""padding:3px 3px 3px 10px;border:1px solid #414141"">SWAP: {ReturnDevice.IsSwap}</td>
                                  </tr>";
                i++;
            }
            mailContent += "</tbody></table>\n";

            mailContent += "You can access the request by logging into your account on System <a href=\"https://10.220.130.117:5555/NVIDIA/Authentication/SignIn\">Tooling Room Management</a>. ";
            mailContent += "Once logged in, please navigate to the \"Sign\" in \"Borrow - Return\" section, where you will find the new request awaiting your action.\n";
            mailContent += "This is an automated email, so there is no need to reply. If you have any questions, please contact our support team at <a href=\"javascript:;\">[cpeii-vn-te-me@mail.foxconn.com]</a> or  <a href=\"javascript:;\">[37145]</a>.\n";
            mailContent += "\n";
            mailContent += "Thanks and Best regards!";

            md.MailContent = SignMailHtml.Content(mailContent);

            Thread thread = new Thread(() =>
            {
                Send_Mail(md);
            });
            thread.Start();
            thread.IsBackground = true;
        }

        public static void SendApproveMail(Entities.Borrow borrow)
        {
            Model_Service.Sendmail md = new Model_Service.Sendmail
            {
                MailTo = borrow.User.Email,
                MailSubject = "Hi devices request has been Approved - Tooling room Management System",
                MailType = "html",
                MailCC = "",
            };

            string mailContent = $"Hello, {RenderUserName(borrow.User)}\n" +
                                 $"\n" +
                                 $"I hope this email finds you well. We are pleased to inform you that your borrow devices request has been <span style=\"color: #29cc39; font-font-weight: bold;\">approved</span>.\n" +
                                 $"Request Date: {borrow.DateBorrow}\n" +
                                 $"Used for Model: {borrow.Model.ModelName}\n" +
                                 $"Used for Station: {borrow.Station.StationName}\n" +
                                 $"Note: {borrow.Note}\n" +
                                 $"\n" +
                                 $"Devices:\n";
            int i = 1;
            mailContent += @"<table style=""width:100%"">
                                <thead>
                                    <tr style="""">
                                        <th style=""border:1px solid #414141;background-color:#cdf7e2;min-width:30px;max-width:70px;text-align:center;padding:5px"">No.</th>
                                        <th style=""border:1px solid #414141;background-color:#e8eae9;padding:5px 5px 5px 10px"">Device Code</th>
                                        <th style=""border:1px solid #414141;background-color:#e8eae9;padding:5px 5px 5px 10px"">Device Name</th>
                                        <th style=""border:1px solid #414141;background-color:#e8eae9;padding:5px 5px 5px 10px"">Borrow Quantity</th>
                                    </tr>
                                </thead>
                                <tbody>";

            foreach (var BorrowDevice in borrow.BorrowDevices)
            {
                var device = BorrowDevice.Device;
                mailContent += $@"<tr>
                                      <td style=""border:1px solid #414141;background-color:#f3fff9;text-align:center;padding:3px"">{i}</td>
                                      <td style=""padding:3px 3px 3px 10px;border:1px solid #414141"">{device.DeviceCode}</td>
                                      <td style=""padding:3px 3px 3px 10px;border:1px solid #414141"">{device.DeviceName}</td>
                                      <td style=""padding:3px 3px 3px 10px;border:1px solid #414141"">{BorrowDevice.BorrowQuantity}</td>
                                  </tr>";
                i++;
            }
            mailContent += "</tbody></table>\n";

            mailContent += "You can access the request by logging into your account on System <a href=\"https://10.220.130.117:5555/NVIDIA/Authentication/SignIn\">Tooling Room Management</a>. ";
            mailContent += "Once logged in, please navigate to the \"Management\" in \"Borrow - Return\" section, where you will find your borrow devices request you can check request information.\n";
            mailContent += "This is an automated email, so there is no need to reply. If you have any questions, please contact our support team at <a href=\"javascript:;\">[cpeii-vn-te-me@mail.foxconn.com]</a> or  <a href=\"javascript:;\">[37145]</a>.\n";
            mailContent += "\n";
            mailContent += "Thanks and Best regards!";

            md.MailContent = SignMailHtml.Content(mailContent);

            Thread thread = new Thread(() =>
            {
                Send_Mail(md);
            });
            thread.Start();
            thread.IsBackground = true;
        }
        public static void SendApproveMail(Entities.Return @return)
        {
            Model_Service.Sendmail md = new Model_Service.Sendmail
            {
                MailTo = @return.User.Email,
                MailSubject = "Hi devices request has been Approved - Tooling room Management System",
                MailType = "html",
                MailCC = "",
            };

            string mailContent = $"Hello, {RenderUserName(@return.User)}\n" +
                                 $"\n" +
                                 $"I hope this email finds you well. We are pleased to inform you that your return devices request has been <span style=\"color: #29cc39; font-font-weight: bold;\">approved</span>.\n" +
                                 $"Request Date: {@return.DateReturn}\n" +
                                 $"Note: {@return.Note}\n" +
                                 $"\n" +
                                 $"Devices:\n";
            int i = 1;
            mailContent += @"<table style=""width:100%"">
                                <thead>
                                    <tr style="""">
                                        <th style=""border:1px solid #414141;background-color:#cdf7e2;min-width:30px;max-width:70px;text-align:center;padding:5px"">No.</th>
                                        <th style=""border:1px solid #414141;background-color:#e8eae9;padding:5px 5px 5px 10px"">Device Code</th>
                                        <th style=""border:1px solid #414141;background-color:#e8eae9;padding:5px 5px 5px 10px"">Device Name</th>
                                        <th style=""border:1px solid #414141;background-color:#e8eae9;padding:5px 5px 5px 10px"">Borrow Quantity</th>
                                        <th style=""border:1px solid #414141;background-color:#e8eae9;padding:5px 5px 5px 10px"">Return NG</th>
                                        <th style=""border:1px solid #414141;background-color:#e8eae9;padding:5px 5px 5px 10px"">Swap new</th>
                                    </tr>
                                </thead>
                                <tbody>";

            foreach (var ReturnDeivice in @return.ReturnDevices)
            {
                var device = ReturnDeivice.Device;
                mailContent += $@"<tr>
                                      <td style=""border:1px solid #414141;background-color:#f3fff9;text-align:center;padding:3px"">{i}</td>
                                      <td style=""padding:3px 3px 3px 10px;border:1px solid #414141"">{device.DeviceCode}</td>
                                      <td style=""padding:3px 3px 3px 10px;border:1px solid #414141"">{device.DeviceName}</td>
                                      <td style=""padding:3px 3px 3px 10px;border:1px solid #414141"">{ReturnDeivice.IsNG}</td>
                                      <td style=""padding:3px 3px 3px 10px;border:1px solid #414141"">{ReturnDeivice.IsSwap}</td>
                                  </tr>";
                i++;
            }
            mailContent += "</tbody></table>\n";

            mailContent += "You can access the request by logging into your account on System <a href=\"https://10.220.130.117:5555/NVIDIA/Authentication/SignIn\">Tooling Room Management</a>. ";
            mailContent += "Once logged in, please navigate to the \"Management\" in \"Borrow - Return\" section, where you will find your borrow devices request you can check request information.\n";
            mailContent += "This is an automated email, so there is no need to reply. If you have any questions, please contact our support team at <a href=\"javascript:;\">[cpeii-vn-te-me@mail.foxconn.com]</a> or  <a href=\"javascript:;\">[37145]</a>.\n";
            mailContent += "\n";
            mailContent += "Thanks and Best regards!";

            md.MailContent = SignMailHtml.Content(mailContent);

            Thread thread = new Thread(() =>
            {
                Send_Mail(md);
            });
            thread.Start();
            thread.IsBackground = true;
        }

        public static void SendRejectMail(Entities.Borrow borrow)
        {
            Entities.UserBorrowSign reject = borrow.UserBorrowSigns.FirstOrDefault(b => b.Status == "Rejected");
            Model_Service.Sendmail md = new Model_Service.Sendmail
            {
                MailTo = borrow.User.Email,
                MailSubject = "Borrow devices request has been Rejected - Tooling room Management System",
                MailType = "html",
                MailCC = "",
            };

            string mailContent = $"Hi, {RenderUserName(borrow.User)}\n" +
                                 $"\n" +
                                 $"I hope this email finds you well. We regret to inform you that your request to borrow devices has been <span style=\"color: #ff0000; font-font-weight: bold;\">rejected</span>.\n" +
                                 $"Reject by: {RenderUserName(reject.User)}\n" +
                                 $"Reject Date: {reject.DateSign}\n" +
                                 $"Note: {reject.Note}\n" +
                                 $"\n" +
                                 $"Devices:\n";
            int i = 1;
            mailContent += @"<table style=""width:100%"">
                                <thead>
                                    <tr style="""">
                                        <th style=""border:1px solid #414141;background-color:#cdf7e2;min-width:30px;max-width:70px;text-align:center;padding:5px"">No.</th>
                                        <th style=""border:1px solid #414141;background-color:#e8eae9;padding:5px 5px 5px 10px"">Device Code</th>
                                        <th style=""border:1px solid #414141;background-color:#e8eae9;padding:5px 5px 5px 10px"">Device Name</th>
                                        <th style=""border:1px solid #414141;background-color:#e8eae9;padding:5px 5px 5px 10px"">Borrow Quantity</th>
                                    </tr>
                                </thead>
                                <tbody>";

            foreach (var BorrowDevice in borrow.BorrowDevices)
            {
                var device = BorrowDevice.Device;
                mailContent += $@"<tr>
                                      <td style=""border:1px solid #414141;background-color:#f3fff9;text-align:center;padding:3px"">{i}</td>
                                      <td style=""padding:3px 3px 3px 10px;border:1px solid #414141"">{device.DeviceCode}</td>
                                      <td style=""padding:3px 3px 3px 10px;border:1px solid #414141"">{device.DeviceName}</td>
                                      <td style=""padding:3px 3px 3px 10px;border:1px solid #414141"">{BorrowDevice.BorrowQuantity}</td>
                                  </tr>";
                i++;
            }
            mailContent += "</tbody></table>\n";

            mailContent += "You can access the request by logging into your account on System <a href=\"https://10.220.130.117:5555/NVIDIA/Authentication/SignIn\">Tooling Room Management</a>. ";
            mailContent += "Once logged in, please navigate to the \"Management\" in \"Borrow - Return\" section, where you will find your borrow devices request you can check request information.\n";
            mailContent += "This is an automated email, so there is no need to reply. If you have any questions, please contact our support team at <a href=\"javascript:;\">[cpeii-vn-te-me@mail.foxconn.com]</a> or  <a href=\"javascript:;\">[37145]</a>.\n";
            mailContent += "\n";
            mailContent += "Thanks and Best regards!";

            md.MailContent = SignMailHtml.Content(mailContent);

            Thread thread = new Thread(() =>
            {
                Send_Mail(md);
            });
            thread.Start();
            thread.IsBackground = true;
        }
        public static void SendRejectMail(Entities.Return @return)
        {
            Entities.UserReturnSign reject = @return.UserReturnSigns.FirstOrDefault(b => b.Status == "Rejected");
            Model_Service.Sendmail md = new Model_Service.Sendmail
            {
                MailTo = @return.User.Email,
                MailSubject = "Return devices request has been Rejected - Tooling room Management System",
                MailType = "html",
                MailCC = "",
            };

            string mailContent = $"Hi, {RenderUserName(@return.User)}\n" +
                                 $"\n" +
                                 $"I hope this email finds you well. We regret to inform you that your request to return devices has been <span style=\"color: #ff0000; font-font-weight: bold;\">rejected</span>.\n" +
                                 $"Reject by: {RenderUserName(reject.User)}\n" +
                                 $"Reject Date: {reject.DateSign}\n" +
                                 $"Note: {reject.Note}\n" +
                                 $"\n" +
                                 $"Devices:\n";
            int i = 1;
            mailContent += @"<table style=""width:100%"">
                                <thead>
                                    <tr style="""">
                                        <th style=""border:1px solid #414141;background-color:#cdf7e2;min-width:30px;max-width:70px;text-align:center;padding:5px"">No.</th>
                                        <th style=""border:1px solid #414141;background-color:#e8eae9;padding:5px 5px 5px 10px"">Device Code</th>
                                        <th style=""border:1px solid #414141;background-color:#e8eae9;padding:5px 5px 5px 10px"">Device Name</th>
                                        <th style=""border:1px solid #414141;background-color:#e8eae9;padding:5px 5px 5px 10px"">Borrow Quantity</th>
                                    </tr>
                                </thead>
                                <tbody>";

            foreach (var ReturnDevice in @return.ReturnDevices)
            {
                var device = ReturnDevice.Device;
                mailContent += $@"<tr>
                                      <td style=""border:1px solid #414141;background-color:#f3fff9;text-align:center;padding:3px"">{i}</td>
                                      <td style=""padding:3px 3px 3px 10px;border:1px solid #414141"">{device.DeviceCode}</td>
                                      <td style=""padding:3px 3px 3px 10px;border:1px solid #414141"">{device.DeviceName}</td>
                                      <td style=""padding:3px 3px 3px 10px;border:1px solid #414141"">{ReturnDevice.ReturnQuantity}</td>
                                      <td style=""padding:3px 3px 3px 10px;border:1px solid #414141"">NG: {ReturnDevice.IsNG}</td>
                                      <td style=""padding:3px 3px 3px 10px;border:1px solid #414141"">Swap: {ReturnDevice.IsSwap}</td>
                                  </tr>";
                i++;
            }
            mailContent += "</tbody></table>\n";

            mailContent += "You can access the request by logging into your account on System <a href=\"https://10.220.130.117:5555/NVIDIA/Authentication/SignIn\">Tooling Room Management</a>. ";
            mailContent += "Once logged in, please navigate to the \"Management\" in \"Borrow - Return\" section, where you will find your borrow devices request you can check request information.\n";
            mailContent += "This is an automated email, so there is no need to reply. If you have any questions, please contact our support team at <a href=\"javascript:;\">[cpeii-vn-te-me@mail.foxconn.com]</a> or  <a href=\"javascript:;\">[37145]</a>.\n";
            mailContent += "\n";
            mailContent += "Thanks and Best regards!";

            md.MailContent = SignMailHtml.Content(mailContent);

            Thread thread = new Thread(() =>
            {
                Send_Mail(md);
            });
            thread.Start();
            thread.IsBackground = true;
        }


        public static bool Send_Mail(Model_Service.Sendmail result)
        {
            try
            {

                ServicePointManager.Expect100Continue = true;
                ServicePointManager.SecurityProtocol = SecurityProtocolType.Tls12;
                ServicePointManager.ServerCertificateValidationCallback = delegate { return true; };
                string inputJson = JsonSerializer.Serialize(result);
                var client = new HttpClient();
                var request = new HttpRequestMessage(HttpMethod.Post, "https://10.220.130.117:8888/api/Service/SendMail");
                var content = new StringContent(inputJson, null, "application/json");
                request.Content = content;
                var response = client.SendAsync(request).Result;

                if (response.EnsureSuccessStatusCode().StatusCode == HttpStatusCode.OK)
                {
                    return true;
                }
            }
            catch
            {

            }
            return false;
        }
        private static string RenderUserName(Entities.User user)
        {
            string name = $"{user.Username}";
            if (!string.IsNullOrEmpty(user.VnName))
            {
                name += $" - {user.VnName}";
            }
            else if (!string.IsNullOrEmpty(user.CnName))
            {
                name += $" - {user.CnName}";
            }

            if (!string.IsNullOrEmpty(user.EnName))
            {
                name += $" ({user.EnName}).";
            }
            return name;
        }

        public static void SaveDeviceHistoryLog(Entities.User user, Entities.Device before, Entities.Device after, string ServerPath)
        {
            try
            {
                using(ToolingRoomEntities db = new ToolingRoomEntities())
                {
                    db.Configuration.LazyLoadingEnabled = false;

                    Entities.HistoryUpdateDevice history = new HistoryUpdateDevice
                    {
                        IdUser = user.Id,
                        IdDevice = after.Id,
                        UpdateDate = DateTime.Now,
                        GuidCode = Guid.NewGuid(),
                    };

                    if (before != null && after != null)
                    {
                        history.Type = "Update";

                        string beforeLogPath = Path.Combine(ServerPath, $"before-{history.GuidCode}.txt");
                        string afterLogPath = Path.Combine(ServerPath, $"after-{history.GuidCode}.txt");

                        using (StreamWriter writer = new StreamWriter(beforeLogPath))
                        {
                            writer.Write(JsonSerializer.Serialize(before));
                            history.BeforeData = beforeLogPath;
                        }
                        using (StreamWriter writer = new StreamWriter(afterLogPath))
                        {
                            writer.Write(JsonSerializer.Serialize(after));
                            history.AfterData = afterLogPath;
                        }
                    }
                    else if(before == null)
                    {
                        history.Type = "Create";

                        string createLogPath = Path.Combine(ServerPath, $"create-{history.GuidCode}.txt");

                        using (StreamWriter writer = new StreamWriter(createLogPath))
                        {
                            writer.Write(JsonSerializer.Serialize(after));
                        }
                        history.BeforeData = createLogPath;
                    }
                    db.HistoryUpdateDevices.Add(history);
                    db.SaveChanges();
                }
            }
            catch (Exception ex)
            {
                throw new Exception("History Log Errr" + ex.Message);
            }
        }
    }

}