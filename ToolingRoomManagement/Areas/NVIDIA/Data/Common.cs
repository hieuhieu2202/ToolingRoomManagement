using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net;
using System.Web;
using ToolingRoomManagement.Areas.NVIDIA.Data;
using ToolingRoomManagement.Areas.NVIDIA.Entities;

namespace ToolingRoomManagement.Areas.NVIDIA.Data
{
    public class Common
    {
        // CheckStatus
        public static string CheckStatus(Entities.Device device)
        {
            if (device.RealQty == 0 || device.Quantity == 0)
                return "Locked";
            if (device.QtyConfirm == 0)
                return "Unconfirmed";
            

            if (device.RealQty <= device.Quantity * device.Buffer)
                return "Out Range";

            if (device.QtyConfirm < device.Quantity)
                return "Part Confirmed";
            if (device.Quantity == device.QtyConfirm)
                return "Confirmed";

            return "N/A";
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
            string mailContent = $"Hello, {sign.User.CnName}\n" +
                                 $"\n" +
                                 $"I hope this email finds you well. We would like to inform you that there is a new signature request in the system that requires your attention.\n" +
                                 $"Requester: {borrow.User.Username} - {borrow.User.CnName}\n" +
                                 $"Request Date: {borrow.DateBorrow}\n" +
                                 $"\n" +
                                 $"Devices:\n";
            int i = 1;
            mailContent += @"<table style=""width:100%"">
                                <thead>
                                    <tr style="""">
                                        <th style=""border:1px solid #414141;background-color:#cdf7e2;min-width:30px;max-width:70px;text-align:center;padding:5px"">No.</th>
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
                                      <td style=""padding:3px 3px 3px 10px;border:1px solid #414141"">{device.DeviceName}</td>
                                      <td style=""padding:3px 3px 3px 10px;border:1px solid #414141"">{BorrowDevice.BorrowQuantity}</td>
                                  </tr>";
                i++;
            }
            mailContent += "</tbody></table>\n";

            mailContent += "You can access the request by logging into your account on System <a href=\"https://10.220.130.117:5555/NVIDIA/Authentication/SignIn\">Tooling Room Management</a>. ";
            mailContent += "Once logged in, please navigate to the \"Sign\" in \"Borrow - Return\" section, where you will find the new request awaiting your action.\n";
            mailContent += "This is an automated email, so there is no need to reply. If you have any questions or require further assistance regarding this signature request, please do not hesitate to contact our support team at <a href=\"javascript:;\">[cpeii-vn-te-me@mail.foxconn.com]</a> or  <a href=\"javascript:;\">[37145]</a>.\n";
            mailContent += "\n";
            mailContent += "Thanks and Best regards!";

            md.MailContent = SignMailHtml.Content(mailContent);       

            if (Send_Mail(md))
            {
                System.Diagnostics.Debug.WriteLine(md.MailContent);
            };
        }
        public static bool Send_Mail(Model_Service.Sendmail result)
        {
            try
            {

                ServicePointManager.Expect100Continue = true;
                ServicePointManager.SecurityProtocol = SecurityProtocolType.Tls12;
                ServicePointManager.ServerCertificateValidationCallback = delegate { return true; };
                string inputJson = JsonConvert.SerializeObject(result);
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
    }

}