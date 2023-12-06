SELECT
	d.Id,
    d.DeviceCode,
    d.DeviceName,    
	SUM(d.QtyConfirm) / COUNT(bd.IdBorrow) AS [Số lượng đã về kho] /* TotalConfirmQty */,
    SUM(d.RealQty) / COUNT(bd.IdBorrow) AS [Số lượng thực tế trong kho] /* TotalRealQty */,
	SUM(d.SysQuantity) / COUNT(bd.IdBorrow) AS [Số lượng trên hệ thống] /* TotalSysQty */,
	SUM(bd.BorrowQuantity) AS [Tổng số lượng mượn] /* TotalBorrowQty */,
	SUM(CASE WHEN b.Status = 'Pending' THEN bd.BorrowQuantity ELSE 0 END) AS [Tổng số lượng đang chờ ký] /* TotalPendingQty */,
	(SUM(d.QtyConfirm) / COUNT(bd.IdBorrow)) - SUM(bd.BorrowQuantity) - SUM(d.SysQuantity) / COUNT(bd.IdBorrow) AS [Sai số] /* GAP */
FROM
    [ToolingRoom_V2].[dbo].[Device] d
JOIN
    [ToolingRoom_V2].[dbo].[BorrowDevice] bd ON d.Id = bd.IdDevice
JOIN
    [ToolingRoom_V2].[dbo].[Borrow] b ON bd.IdBorrow = b.Id
	Where b.Status != 'Rejected' and b.Type != 'Return'
GROUP BY 
	d.Id,
	d.DeviceCode,
    d.DeviceName


/******

1. TotalRealQty - TotalSysQty = PendingQty
2. GAP > 0 => Sai số
3. Thêm lọc sai số sau Group By
    HAVING
    	(SUM(d.QtyConfirm) / COUNT(bd.IdBorrow)) - SUM(bd.BorrowQuantity) - SUM(d.SysQuantity) / COUNT(bd.IdBorrow) != 0;

******/