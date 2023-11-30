function ReturnDetails(Id, showDevice = true) {
    $.ajax({
        type: "GET",
        url: "/NVIDIA/BorrowManagement/GetReturn?Id=" + Id,
        dataType: "json",
        contentType: "application/json;charset=utf-8",
        success: function (response) {
            if (response.status) {
                var _return = response._return;

                CreateReturnDetailsModal(_return, showDevice);

                $('#return_modal').modal('show');
            }
            else {
                toastr["error"](response.message, "ERROR");
            }
        },
        error: function (error) {
            Swal.fire(i18next.t('global.swal_title'), GetAjaxErrorMessage(error), "error");
        }
    });
}
function CreateReturnDetailsModal(_return, showDevice) {
    $('#return_modal-CardId').val(_return.User.Username);
    $('#return_modal-Username').val(CreateUserName(_return.User));

    $('#return_modal-BorrowDate').val(moment(_return.DateBorrow).format('YYYY-MM-DDTHH:mm:ss'));
    $('#return_modal-DuaDate').val(moment(_return.Borrow.DateDue).format('YYYY-MM-DDTHH:mm:ss'));
    $('#return_modal-ReturnDate').val(moment(_return.DateReturn).format('YYYY-MM-DDTHH:mm:ss'));

    $('#return_modal-Note').html(`<p>${_return.Note}</p>`);

    $('div[checkType]').show();
    $('label[typeName]').html('Date Borrow');
    if (_return.Type == 'Return') {
        $('#return_modal-title').text('Return Device Request Details');
    }
    else if (_return.Type == 'Take') {
        $('#return_modal-title').text('Take Device Request Details');
        $('div[checkType]').hide();
        $('label[typeName]').html('Date');
    }
    else {
        $('#return_modal-title').text('Borrow Device Request Details');
    }


    $('#return_modal-table-tbody-borrow').empty();
    $.each(_return.Borrow.BorrowDevices, function (k, item) {
        if (item.Device != null) {
            var mts = item.Device.Product ? item.Device.Product.MTS : '';
            var borrowQty = item.BorrowQuantity ? item.BorrowQuantity : '';
            var deviceCode = item.Device ? item.Device.DeviceCode ? item.Device.DeviceCode : 'N/A' : '';
            var deviceName = item.Device ? item.Device.DeviceName ? item.Device.DeviceName : 'N/A' : '';
            var deviceUnit = item.Device.Unit ? item.Device.Unit : '';

            var row = $(`<tr data-id="${item.Device.Id}" class="cursor-pointer"></tr>`);
            row.append(`<td>${mts}</td>`);
            row.append(`<td>${deviceCode}</td>`);
            row.append(`<td>${deviceName}</td>`);
            row.append(`<td class="text-center">${deviceUnit}</td>`);
            row.append(`<td class="text-center">${borrowQty}</td>`);

            if (showDevice) {
                row.dblclick(function () {
                    var Id = $(this).data('id');
                    GetDeviceDetails(Id)
                });
            }

            $('#return_modal-table-tbody-borrow').append(row);
        }
    });


    $('#return_modal-table-tbody').empty();
    $.each(_return.ReturnDevices, function (k, item) {
        if (item.Device != null) {
            var return_qty = item.ReturnQuantity ? item.ReturnQuantity : '';
            var deviceCode = item.Device ? item.Device.DeviceCode ? item.Device.DeviceCode : 'N/A' : '';
            var deviceName = item.Device ? item.Device.DeviceName ? item.Device.DeviceName : 'N/A' : '';
            var unit = item.Device.Unit ? item.Device.Unit : '';
            var mts = item.Device.Product.MTS;
            var isNG = item.IsNG
            var isSwap = item.IsSwap;

            var row = $(`<tr data-id="${item.Device.Id}" class="cursor-pointer align-middle"></tr>`);
            row.append(`<td>${mts}</td>`);
            row.append(`<td>${deviceCode}</td>`);
            row.append(`<td>${deviceName}</td>`);
            row.append(`<td class="text-center">${unit}</td>`);
            row.append(`<td class="text-center">${return_qty}</td>`);
            row.append(`<td class="text-center">${isNG ? '<i class="fa-duotone fa-check text-success"></i>' : '<i class="fa-solid fa-xmark text-danger"></i>'}</td>`);
            row.append(`<td class="text-center">${isSwap ? '<i class="fa-duotone fa-check text-success"></i>' : '<i class="fa-solid fa-xmark text-danger"></i>'}</td>`);

            if (showDevice) {
                row.dblclick(function () {
                    var Id = $(this).data('id');
                    GetDeviceDetails(Id)
                });
            }

            $('#return_modal-table-tbody').append(row);
        }
    });

    $('#return_modal-sign-container').empty();
    $('#return_modal-sign-container').append(`<h4 class="font-weight-light text-center text-white py-3">SIGN PROCESS</h4>`);
    $.each(_return.UserReturnSigns, function (k, bs) { //bs == borrow sign
        var username = CreateUserName(bs.User);
        var date = moment(bs.DateSign).format('YYYY-MM-DD | h:mm A');

        var title = {
            Approved: { color: 'success', text: 'Approved', icon: 'check' },
            Rejected: { color: 'danger', text: 'Rejected', icon: 'xmark' },
            Pending: { color: 'warning', text: 'Pending', icon: 'timer' },
            Waitting: { color: 'secondary', text: 'Waitting', icon: 'circle-pause' },
        }[bs.Status] || { color: 'secondary', text: 'Closed' };

        var line = {
            top: k === 0 ? '' : 'border-end',
            bot: (k === 0 && _return.UserReturnSigns.length === 1) ? '' : 'border-end'
        };

        var span = '';
        switch (bs.Type) {
            case "Borrow": {
                span = `<span class="badge bg-primary"><i class="fa-solid fa-left-to-line"></i> Borrow</span>`;
                break;
            }
            case "Take": {
                span = `<span class="badge bg-secondary"><i class="fa-regular fa-inbox-full"></i> Take</span>`;
                break;
            }
            case "Return": {
                span = `<span class="badge bg-info"><i class="fa-solid fa-right-to-line"></i> Return</span>`;
                break;
            }
            default: {
                span = `<td><span class="badge bg-secondary">N/A</span></td>`;
                break;
            }
        }

        var lineDot = `<div class="col-sm-1 text-center flex-column d-none d-sm-flex">
                           <div class="row h-50">
                               <div class="col ${line.top}">&nbsp;</div>
                               <div class="col">&nbsp;</div>
                           </div>
                           <h5 class="m-2 red-dot">
                               <span class="badge rounded-pill bg-${title.color}">&nbsp;</span>
                           </h5>
                           <div class="row h-50">
                               <div class="col ${line.bot}">&nbsp;</div>
                               <div class="col">&nbsp;</div>
                           </div>
                       </div>`;
        var signCard = `<div class="row">
                        ${k % 2 === 0 ? '' : '<div class="col-sm"></div>'}
                        ${k % 2 === 0 ? '' : lineDot}
                        <div class="col-sm py-2">
                            <div class="card border-primary shadow radius-15 card-sign">
                                <div class="card-body">
                                    <div class="float-end">${date === 'Invalid date' ? '' : date}</div>
                                    <label class="mb-3"><span class="badge bg-${title.color}"><i class="fa-solid fa-${title.icon}"></i> ${title.text}</span></label>
                                    <!--<label class="mb-3">${span}</label>-->
                                    <p class="card-text mb-1">${username}</p>
                                    <p class="card-text mb-1">${bs.User.Email || ''}</p>
                                    <button class="btn btn-sm btn-outline-secondary collapsed ${title.text == null ? 'd-none' : title.text != 'Rejected' ? 'd-none' : ''}" type="button" data-bs-target="#details_${k}" data-bs-toggle="collapse" aria-expanded="false">Show Details ▼</button>
                                    <div class="border collapse" id="details_${k}" style="">
                                        <div class="p-2 text-monospace">
                                            <div>${bs.Note}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        ${k % 2 === 0 ? lineDot : ''}
                        ${k % 2 === 0 ? '<div class="col-sm"></div>' : ''}
                    </div>`;

        $('#return_modal-sign-container').append(signCard);
    });
}