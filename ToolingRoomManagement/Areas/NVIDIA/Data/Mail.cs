using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace ToolingRoomManagement.Areas.NVIDIA.Data
{
    public class SignMailHtml
    {
        // Html of mail
        public static string Content(string Content)
        {
            string renderContent = RenderContent(Content);
            string htmlString = $@"<!DOCTYPE html PUBLIC ""-//W3C//DTD XHTML 1.0 Transitional //EN"" ""http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"">
                                   <html xmlns=""http://www.w3.org/1999/xhtml"" xmlns:v=""urn:schemas-microsoft-com:vml"" xmlns:o=""urn:schemas-microsoft-com:office:office"">
                                   <head>
                                       <meta http-equiv=""Content-Type"" content=""text/html; charset=UTF-8"">
                                   
                                       <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
                                       <meta name=""x-apple-disable-message-reformatting"">
                                   </head>
                                   
                                   <body class=""clean-body u_body"" style=""margin: 0;padding: 0;-webkit-text-size-adjust: 100%;background-color: #535353;color: #000000"">
                                       <table id=""u_body"" style=""border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;min-width: 320px;Margin: 0 auto;background-color: #535353;width:100%"" cellpadding=""0"" cellspacing=""0"">
                                           <tbody>
                                               <tr style=""vertical-align: top"">
                                                   <td style=""word-break: break-word;border-collapse: collapse !important;vertical-align: top"">
                                                       
                                                       <!-- Header -->
                                                       <div class=""u-row-container"" style=""padding: 0px;background-color: transparent"">
                                                           <div class=""u-row"" style=""margin: 0 auto;min-width: 320px;max-width: 600px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: transparent;"">
                                                               <div style=""border-collapse: collapse;display: table;width: 100%;height: 100%;background-color: transparent;"">
                                                                   <div class=""u-col u-col-100"" style=""max-width: 320px;min-width: 600px;display: table-cell;vertical-align: top;"">
                                                                       <div style=""background-color: #232323;height: 100%;width: 100% !important;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;"">
                                                                           <div class=""v-col-border"" style=""box-sizing: border-box; height: 100%; padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;"">
                                                                               <table id=""u_content_heading_8"" style=""font-family:arial,helvetica,sans-serif;"" role=""presentation"" cellpadding=""0"" cellspacing=""0"" width=""100%"" border=""0"">
                                                                                   <tbody>
                                                                                       <tr>
                                                                                            <td class=""v-container-padding-padding"" style=""overflow-wrap:break-word;word-break:break-word;padding: 10px 10px 10px 10px;font-family:arial,helvetica,sans-serif;text-align: center;color: white;font-weight: bold;"" align=""left"">
                                                                                                <span>Tooling Room Management System</span>
                                                                                            </td>
                                                                                       </tr>
                                                                                   </tbody>
                                                                               </table>
                                                                           </div>
                                                                       </div>
                                                                   </div>
                                                               </div>
                                                           </div>
                                                       </div>
                                                       
                                                       <!-- Body -->
                                                       <div class=""u-row-container"" style=""padding: 0px;background-color: transparent"">
                                                           <div class=""u-row"" style=""margin: 0 auto;min-width: 320px;max-width: 600px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: transparent;"">
                                                               <div style=""border-collapse: collapse;display: table;width: 100%;height: 100%;background-color: transparent;"">
                                                                   <div id=""u_column_6"" class=""u-col u-col-100"" style=""max-width: 320px;min-width: 600px;display: table-cell;vertical-align: top;"">
                                                                       <div style=""background-color: #ffffff;height: 100%;width: 100% !important;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;"">
                                                                           <div class=""v-col-border"" style=""box-sizing: border-box; height: 100%; padding: 0px;border-top: 30px solid #e8eae9;border-left: 57px solid #e8eae9;border-right: 57px solid #e8eae9;border-bottom: 30px solid #e8eae9;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;"">
                                                                               <table id=""u_content_text_2"" style=""font-family:arial,helvetica,sans-serif;"" role=""presentation"" cellpadding=""0"" cellspacing=""0"" width=""100%"" border=""0"">
                                                                                   <tbody>
                                                                                       <tr>
                                                                                           <td class=""v-container-padding-padding"" style=""overflow-wrap:break-word;word-break:break-word;padding:20px 30px;font-family:arial,helvetica,sans-serif;"" align=""left"">
                                   
                                                                                               <div style=""font-size: 14px;line-height: 140%;text-align: justify;word-wrap: break-word;"">
                                                                                                   <!-- Content here -->
                                                                                                    {renderContent}
                                                                                               </div>
                                   
                                                                                           </td>
                                                                                       </tr>
                                                                                   </tbody>
                                                                               </table>
                                                                           </div>
                                                                       </div>
                                                                   </div>
                                                               </div>
                                                           </div>
                                                       </div>

                                                       <!-- Footer -->
                                                        <div class=""u-row-container"" style=""padding: 0px;background-color: transparent"">
                                                            <div class=""u-row"" style=""margin: 0 auto;min-width: 320px;max-width: 600px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: transparent;"">
                                                                <div style=""border-collapse: collapse;display: table;width: 100%;height: 100%;background-color: transparent;"">
                                                                    <div class=""u-col u-col-100"" style=""max-width: 320px;min-width: 600px;display: table-cell;vertical-align: top;"">
                                                                        <div style=""background-color: #232323;height: 100%;width: 100% !important;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;"">
                                                                            <div class=""v-col-border"" style=""box-sizing: border-box; height: 100%; padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;"">
                                                                                <table id=""u_content_heading_8"" style=""font-family:arial,helvetica,sans-serif;"" role=""presentation"" cellpadding=""0"" cellspacing=""0"" width=""100%"" border=""0"">
                                                                                    <tbody>
                                                                                        <tr>
                                                                                            <td class=""v-container-padding-padding"" style=""overflow-wrap:break-word;word-break:break-word;padding: 10px 10px 10px 10px;font-family:arial,helvetica,sans-serif;text-align: right;font-size: 12px;color: white;display: flex;justify-content: space-between;"" align=""left"">
                                                                                                <span style=""float: left;"">MBD-AUTOMATION-IOT@mail.foxconn.com</span>
                                                                                                <span style=""float: right;"">Copyright © 2023. MBD Automation IOT.</span>
                                                                                            </td>
                                                                                        </tr>
                                                                                    </tbody>
                                                                                </table>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                   </td>
                                               </tr>
                                           </tbody>
                                       </table>
                                   </body>
                                   </html>";
            return htmlString;
        }
        private static string RenderContent(string content)
        {
            string[] contentRow = content.Split('\n');
            string endContent = "";
            foreach (var row in contentRow)
            {
                endContent += $"<p style=\"line-height: 120%;\">{row}</p>";
            }
            return endContent;
        }
    }
}