WITH Calculations AS (
    SELECT
        D.Id,
        D.DeviceCode,
        D.DeviceName,
        D.QtyConfirm AS ConfirmQty,
        D.RealQty,
		D.SysQuantity AS SystemQty,
		D.NG_Qty AS NotGoodQty,
		(D.RealQty - D.SysQuantity) AS PendingQty,
        ISNULL(BQ.BorrowQty, 0) AS BorrowQty,
        ISNULL(RQ.ReturnQty, 0) AS ReturnQty,
		((D.RealQty - D.SysQuantity) + ISNULL(BQ.BorrowQty, 0)) AS OutWarehouseQty,
		(D.RealQty + (D.RealQty - D.SysQuantity) + ISNULL(RQ.ReturnQty, 0) - D.NG_Qty) AS InWarehouseQty,
        D.QtyConfirm - (D.SysQuantity + ISNULL(BQ.BorrowQty, 0) - ISNULL(RQ.ReturnQty, 0)) AS GAP,
    FROM
        dbo.Device D
    LEFT JOIN
        (
            SELECT
                BD.IdDevice,
                SUM(BD.BorrowQuantity) AS BorrowQty
            FROM
                dbo.Borrow B
            JOIN
                dbo.BorrowDevice BD ON B.Id = BD.IdBorrow
            WHERE
                B.Status IN ('Approved', 'Pending') AND B.Type != 'Return'
            GROUP BY
                BD.IdDevice
        ) BQ ON D.Id = BQ.IdDevice
    LEFT JOIN
        (
            SELECT
                RD.IdDevice,
                SUM(RD.ReturnQuantity) AS ReturnQty				
            FROM
                dbo.[Return] R
            JOIN
                dbo.ReturnDevice RD ON R.Id = RD.IdReturn
            WHERE
                R.Status IN ('Approved', 'Pending')
            GROUP BY
                RD.IdDevice,
				RD.IsNG,
				RD.IsSwap
        ) RQ ON D.Id = RQ.IdDevice
    LEFT JOIN
        dbo.Borrow B ON D.Id = B.IdModel
    WHERE        
        B.Status = 'Return' OR B.Status IS NULL
)

SELECT * FROM Calculations where GAP > 0;
