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
using System.Runtime.Remoting.Contexts;
using System.Web;

namespace ToolingRoomManagement.Areas.NVIDIA.Reseptory
{
    internal class RPurchaseRequest
    {
        /* GET */
        public static object GetPurchaseRequests()
        {
            using(ToolingRoomEntities context = new ToolingRoomEntities())
            {
                context.Configuration.LazyLoadingEnabled = false;

                var prs = context.PurchaseRequests
                    .Include(p => p.UserRequest)
                    .Select(p => new
                    {
                        p.Id,
                        p.UserRequest,
                        p.DateRequest,
                        p.DateRequired,
                        p.Note,
                        p.Status,
                        p.Type,
                        p.DevicePRs,
                        PNs = p.DevicePRs.Select(dpr => dpr.Device.DeviceCode).ToList(),
                    })
                    .ToList();

                return prs;

            }
        }
        public static object GetPurchaseRequest(int IdPurchaseRequest)
        {
            try
            {
                using (ToolingRoomEntities context = new ToolingRoomEntities())
                {
                    context.Configuration.LazyLoadingEnabled = false;

                    var pr = context.PurchaseRequests
                        .Include(p => p.UserRequest)
                        .Include(p => p.DevicePRs.Select(dp => dp.UserCreated))
                        .Include(p => p.DevicePRs.Select(dp => dp.Device))
                        .FirstOrDefault(p => p.Id == IdPurchaseRequest);

                    var result = new
                    {
                        pr.Id,
                        pr.IdUserRequest,
                        pr.UserRequest,
                        pr.DateRequest,
                        pr.DateRequired,
                        pr.Note,
                        pr.Status,
                        pr.Type,
                        pr.DevicePRs,
                        PNs = pr.DevicePRs.Select(dpr => dpr.Device.DeviceCode).ToList()
                    };

                    return result;

                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
            
        }

        /* POST */
        public static object CreatePurchaseRequest(PurchaseRequest PurchaseRequest)
        {
            try
            {
                using(ToolingRoomEntities context = new ToolingRoomEntities())
                {
                    context.Configuration.LazyLoadingEnabled = false;

                    CreateValidatePurchaseRequest(context, PurchaseRequest);

                    PurchaseRequest = CheckPurchaseRequestStatus(context, PurchaseRequest);

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
        public static object UpdatePurchaseRequest(PurchaseRequest PurchaseRequest)
        {
            try
            {
                using (ToolingRoomEntities context = new ToolingRoomEntities())
                {
                    context.Configuration.LazyLoadingEnabled = false;

                    PurchaseRequest = CheckPurchaseRequestStatus(context, PurchaseRequest);

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
        public static PurchaseRequest CheckPurchaseRequestStatus(ToolingRoomEntities context, PurchaseRequest PurchaseRequest)
        {
            var minLevel = 0;
            foreach (var dpr in PurchaseRequest.DevicePRs)
            {
                if (string.IsNullOrEmpty(dpr.PR_No)) continue;

                var thisLevel = 1;
                if (dpr.PR_No != null && dpr.PR_CreatedDate != null && dpr.PR_Quantity != null)
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

                dpr.Status = GetPurchaseRequestLevel(thisLevel);
                context.DevicePRs.AddOrUpdate(dpr);
            }
            PurchaseRequest.Status = GetPurchaseRequestLevel(minLevel);


            return PurchaseRequest;
        }
        private static string GetPurchaseRequestLevel(int level)
        {
            switch (level)
            {
                case 0:
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