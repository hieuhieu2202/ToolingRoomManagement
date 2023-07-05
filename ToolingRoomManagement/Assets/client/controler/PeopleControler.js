var people = {
    init: function () {
        people.regEvents();
    },
    regEvents: function () {
        //$('#btnContinue').off('click').on('click', function () {
        //    window.location.href = "/";
        //});
        //$('#btnPayment').off('click').on('click', function () {
        //    window.location.href = "/Cart/Payment";
        //})
        //$('#btnBack').off('click').on('click', function () {
        //    window.location.href = "/";
        //});
        ////Cập nhật
        //$('#btnUpdate').off('click').on('click', function () {
        //    var listProduct = $('.txtQuantity');
        //    var cartList = [];
        //    $.each(listProduct, function (i, item) {
        //        cartList.push({
        //            Quantity: $(item).val(),
        //            Product: {
        //                id: $(item).data('id')
        //            }
        //        });
        //    });
        //    $.ajax({
        //        url: 'Cart/Update',
        //        data: { cartModel: JSON.stringify(cartList) },
        //        dataType: 'json',
        //        type: 'POST',
        //        success: function (res) {
        //            if (res.status == true) {
        //                window.location.href = "/Cart";
        //            }
        //        }
        //    })
        //});
        ////Xóa tất cả giỏ hàng
        //$('#btnDeleteAll').off('click').on('click', function () {
        //    $.ajax({
        //        url: 'Cart/DeleteAll',
        //        dataType: 'json',
        //        type: 'POST',
        //        success: function (res) {
        //            if (res.status == true) {
        //                window.location.href = "/Cart";
        //            }
        //        }
        //    })
        //});
        //DElete 1 People in RD team
        $('.btn-delete-CustomerTeam').off('click').on('click', function (e) {
            e.preventDefault();
            $.ajax({
                data: { id: $(this).data('id') },
                url: 'PeopleRDPM/Delete',
                dataType: 'json',
                type: 'POST',
                success: function (res) {
                    if (res.status == true) {
                        window.location.href = "/PeopleRDPM";
                    }
                }
            })
        });
    }
}
people.init();