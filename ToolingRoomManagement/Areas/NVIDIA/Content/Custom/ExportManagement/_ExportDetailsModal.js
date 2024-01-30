/* EXPORT DETAILS */
function ExportDetails(IdExport, IdSign, Type, Elm) {
    try {
        CreateEXportDetailsModal(IdExport);

        if (IdSign != null) {
            $('#export_action_footer').show();
            $('#export_normal_footer').hide();

            $('#export-Approved').click(function () {
                CreateApprovedAlert(IdExport, IdSign, Type, Elm);
            });
            $('#export-Rejected').click(function () {
                CreateRejectedAlert(IdExport, IdSign, Type, Elm);
            });
        }
        else {
            $('#export_action_footer').hide();
            $('#export_normal_footer').show();
        }

    } catch (error) {
        Swal.fire('Sorry, something went wrong!', `${error}`, 'error');
    }
}
async function CreateEXportDetailsModal(IdExport) {
    var _export = await GetExport(IdExport);

    var modal = $('#modal-ExportDetails');

    modal.find('.modal-title').text(`${_export.Type} REQUEST MODAL`);
    modal.find('.modal-bodytitle').text(`${_export.Type} DEVICE REQUEST`);

    modal.find('#ExportDetails-cardid').val(_export.User.Username);
    modal.find('#ExportDetails-username').val(CreateUserName(_export.User));
    modal.find('#ExportDetails-createddate').val(moment(_export.CreatedDate).format("YYYY-MM-DDTHH:mm:ss"));
    modal.find('#ExportDetails-note').val(_export.Note);


    var tablebody = modal.find('#table-ExportDetails-tbody');
    tablebody.empty();
    $.each(_export.ExportDevices, function (k, exportDevice) {
        var tr = $(`<tr class="cursor-pointer align-middle" data-id="${exportDevice.Device.Id}" data-index="${k}"></tr>`);
        tr.append(`<td class="text-center">${k + 1}</td>`);
        tr.append(`<td class="text-center">${exportDevice.Device.Product != null ? exportDevice.Device.Product.MTS : ''}</td>`);
        tr.append(`<td>${exportDevice.Device.DeviceCode != null ? exportDevice.Device.DeviceCode : ''}</td>`);
        tr.append(`<td>${exportDevice.Device.DeviceName != null ? exportDevice.Device.DeviceName : ''}</td>`);
        tr.append(`<td>${exportDevice.Device.Unit != null ? exportDevice.Device.Unit : 'NA'}</td>`);
        tr.append(`<td class="text-center">${exportDevice.ExportQuantity}</td>`);

        tr.dblclick(function () {
            var Id = exportDevice.Device.Id;
            GetDeviceDetails(Id)
        });

        tablebody.append(tr);

    });

    var signcontainer = $('#ExportDetails-signcontainer');
    signcontainer.empty();
    $.each(_export.UserExportSigns, function (k, es) { //es == export sign
        var username = CreateUserName(es.User);
        var date = moment(es.SignDate).format('YYYY-MM-DD | h:mm A');

        var title = {
            Approved: { color: 'success', text: 'Approved', icon: 'check' },
            Rejected: { color: 'danger', text: 'Rejected', icon: 'xmark' },
            Pending: { color: 'warning', text: 'Pending', icon: 'timer' },
            Waitting: { color: 'secondary', text: 'Waitting', icon: 'circle-pause' },
        }[es.Status] || { color: 'secondary', text: 'Closed' };

        var line = {
            top: k === 0 ? '' : 'border-end',
            bot: (k === 0 && _export.UserExportSigns.length === 1) ? '' : 'border-end'
        };

        var span = '';
        switch (es.Type) {
            case "Return NG": {
                span = `<span class="badge bg-danger"><i class="fa-solid fa-left-to-line"></i>Return NG</span>`;
                break;
            }
            case "Shipping": {
                span = `<span class="badge bg-success"><i class="fa-regular fa-inbox-full"></i>Shipping</span>`;
                break;
            }
            default: {
                span = `<td><span class="badge bg-secondary">NA</span></td>`;
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
                                    <p class="card-text mb-1">${es.User.Email ? es.User.Email : ''}</p>
                                    <button class="btn btn-sm btn-outline-secondary collapsed ${title.text == null ? 'd-none' : title.text != 'Rejected' ? 'd-none' : ''}" type="button" data-bs-target="#details_${k}" data-bs-toggle="collapse" aria-expanded="false">Show Details ▼</button>
                                    <div class="border collapse" id="details_${k}" style="">
                                        <div class="p-2 text-monospace">
                                            <div>${es.Note}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        ${k % 2 === 0 ? lineDot : ''}
                        ${k % 2 === 0 ? '<div class="col-sm"></div>' : ''}
                    </div>`;

        signcontainer.append(signCard);
    });

    modal.modal('show');
}