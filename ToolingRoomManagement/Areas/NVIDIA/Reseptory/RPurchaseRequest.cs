using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Data.Entity.Migrations;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Configuration;
using ToolingRoomManagement.Areas.NVIDIA.Entities;
using ToolingRoomManagement.Areas.NVIDIA.Data;

namespace ToolingRoomManagement.Areas.NVIDIA.Reseptory
{
    internal class RPurchaseRequest
    {
        /* GET */
        public static List<PurchaseRequest> GetPurchaseRequests()
        {
            using(ToolingRoomEntities context = new ToolingRoomEntities())
            {
                context.Configuration.LazyLoadingEnabled = false;

                var prs = context.PurchaseRequests
                    .Include(p => p.UserRequest)
                    .ToList();

                return prs;

            }
        }
        public static PurchaseRequest GetPurchaseRequest(int IdPurchaseRequest)
        {
            using (ToolingRoomEntities context = new ToolingRoomEntities())
            {
                context.Configuration.LazyLoadingEnabled = false;

                var pr = context.PurchaseRequests
                    .Include(p => p.UserRequest)
                    .Include(p => p.DevicePRs.Select(dp => dp.UserCreated))
                    .Include(p => p.DevicePRs.Select(dp => dp.Device))
                    .FirstOrDefault(p => p.Id == IdPurchaseRequest);

                return pr;

            }
        }

        /* POST */
        public static PurchaseRequest CreatePurchaseRequest(PurchaseRequest PurchaseRequest)
        {
            try
            {
                using(ToolingRoomEntities context = new ToolingRoomEntities())
                {
                    context.Configuration.LazyLoadingEnabled = false;

                    CreateValidatePurchaseRequest(context, PurchaseRequest);

                    context.PurchaseRequests.Add(PurchaseRequest);
                    context.SaveChanges();

                    return GetPurchaseRequest(PurchaseRequest.Id);
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }

        }
        public static PurchaseRequest UpdatePurchaseRequest(PurchaseRequest PurchaseRequest)
        {
            try
            {
                using (ToolingRoomEntities context = new ToolingRoomEntities())
                {
                    context.Configuration.LazyLoadingEnabled = false;


                    var minLevel = 0;
                    foreach (var dpr in PurchaseRequest.DevicePRs)
                    {
                        if (string.IsNullOrEmpty(dpr.PR_No)) continue;

                        var thisLevel = 1;
                        if(dpr.PR_No != null && dpr.PR_CreatedDate != null && dpr.PR_Quantity != null)
                        {
                            thisLevel = 2;
                        }
                        if (dpr.PO_No != null && dpr.PO_CreatedDate != null)
                        {
                            thisLevel = 3;
                        }
                        if (dpr.ETD_Date != null)
                        {
                            thisLevel = 4;
                        }
                        if (dpr.ETA_Date != null)
                        {
                            thisLevel = 5;
                        }

                        if (minLevel == 0) minLevel = thisLevel;
                        else if (minLevel > thisLevel) minLevel = thisLevel;

                        dpr.Status = UpdatePurchaseRequestStatus(thisLevel);
                        context.DevicePRs.AddOrUpdate(dpr);
                    }

                    PurchaseRequest.Status = UpdatePurchaseRequestStatus(minLevel);
                    context.PurchaseRequests.AddOrUpdate(PurchaseRequest);
                    context.SaveChanges();

                    return GetPurchaseRequest(PurchaseRequest.Id);
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }

        }
        public static bool DeletePurchaseRequest(int IdPurchaseRequest)
        {
            try
            {
                using (ToolingRoomEntities context = new ToolingRoomEntities())
                {
                    context.Configuration.LazyLoadingEnabled = false;

                    var purchase = context.PurchaseRequests.FirstOrDefault(p => p.Id == IdPurchaseRequest);
                    if(purchase != null)
                    {
                        context.PurchaseRequests.Remove(purchase);
                        context.SaveChanges();
                    }
                   
                    return true;
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }

        }

        /* VALIDATE */
        private static bool CreateValidatePurchaseRequest(ToolingRoomEntities context, PurchaseRequest PurchaseRequest)
        {
            if(!context.Users.Any(u => u.Id == PurchaseRequest.IdUserRequest))
            {
                throw new Exception("User does not exists. Please login again or contact us.");
            }
            if(PurchaseRequest.DateRequest == null)
            {
                throw new Exception("Please chosse Date Request.");
            }
            if(PurchaseRequest.DateRequired == null)
            {
                throw new Exception("Please chosse Date Required.");
            }
            if(PurchaseRequest.DateRequest > PurchaseRequest.DateRequired)
            {
                throw new Exception("Please double check Date Request and Date Required.");
            }
            if (PurchaseRequest.Note == null)
            {
                throw new Exception("Please enter note.");
            }
            if(PurchaseRequest.DevicePRs.Count < 1)
            {
                throw new Exception("Please added any devices.");
            }

            foreach(var devicePr in PurchaseRequest.DevicePRs)
            {
                if(devicePr.Quantity == 0)
                {
                    throw new Exception("Quantity of at least one device is invalid");
                }
            }

            return true;
        }
        private static bool UpdateValidate_User(ToolingRoomEntities dbContext, User user)
        {
            user.Username = user.Username.Trim().ToUpper();
            var dbUser = dbContext.Users.FirstOrDefault(u => u.Username == user.Username);

            if (string.IsNullOrEmpty(user.Username) || user.Username.Length < 6)
            {
                throw new Exception("Please double check your username.");
            }

            if(!string.IsNullOrEmpty(user.Password) && dbUser.Password != user.Password)
            {
                if (user.Password.Length < 6)
                {
                    throw new Exception("Please double check your password.");
                }
            }           

            if (string.IsNullOrEmpty(user.VnName) && string.IsNullOrEmpty(user.EnName) && string.IsNullOrEmpty(user.CnName))
            {
                throw new Exception("Please double check your name.");
            }

            // Nếu thay đổi Card Id thì kiểm tra Card Id đó đã tồn tại chưa?
            if (dbUser.Username != user.Username && dbContext.Users.Any(u => u.Username == user.Username))
            {
                throw new Exception("User already exists.");
            }

            return true;
        }
        private static string UpdatePurchaseRequestStatus(int level)
        {
            switch (level)
            {
                case 0:
                    return "Rejected";
                case 1:
                    return "Open";
                case 2:
                    return "PR Created";
                case 3:
                    return "PO Created";
                case 4:
                    return "Shipping";
                case 5:
                    return "Closed";
                default:
                    return "Unknown";
            }
        }
    }
}