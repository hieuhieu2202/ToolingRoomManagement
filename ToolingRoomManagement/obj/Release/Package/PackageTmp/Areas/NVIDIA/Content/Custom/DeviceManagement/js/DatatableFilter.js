function SetFilterData(response) {
    // Product
    $('#filter_Product').html($('<option value="Product" selected>Product (All)</option>'));
    $.each(response.products, function (k, item) {
        let opt1 = $(`<option value="${item.ProductName}">${item.ProductName}</option>`);
        $('#filter_Product').append(opt1);
    });
    // Model
    $('#filter_Model').html($('<option value="Model" selected>Model (All)</option>'));
    $.each(response.models, function (k, item) {
        let opt = $(`<option value="${item.ModelName}"></option>`);
        $('#device_edit-Model-List').append(opt);

        let opt1 = $(`<option value="${item.ModelName}">${item.ModelName}</option>`);
        $('#filter_Model').append(opt1);
    });
    // Station
    $('#filter_Station').html($('<option value="Station" selected>Station (All)</option>'));
    $.each(response.stations, function (k, item) {
        let opt1 = $(`<option value="${item.StationName}">${item.StationName}</option>`);
        $('#filter_Station').append(opt1);
    });
    // Group
    $('#filter_Group').html($('<option value="Group" selected>Group (All)</option>'));
    $.each(response.groups, function (k, item) {
        let opt1 = $(`<option value="${item.GroupName}">${item.GroupName}</option>`);
        $('#filter_Group').append(opt1);
    });
    // Vendor
    $('#filter_Vendor').html($('<option value="Vendor" selected>Vendor (All)</option>'));
    $.each(response.vendors, function (k, item) {
        let opt1 = $(`<option value="${item.VendorName}">${item.VendorName}</option>`);
        $('#filter_Vendor').append(opt1);
    });

    FilterSelect2();
}
$('#filter-refresh').click(function (e) {
    e.preventDefault();

    $('#filter_Product').val("Product").trigger('change');
    $('#filter_Group').val("Group").trigger('change');
    $('#filter_Vendor').val("Vendor").trigger('change');
    $('#filter_Type').val("Type").trigger('change');
    $('#filter_Status').val("Status").trigger('change');

    $('#filter').click();
});
var isDropdownShow = false;
$('#filter_dropdown_btn').click(function () {
    if (!isDropdownShow) {
        isDropdownShow = true;
        $('#filter_dropdown_btn').html('<i class="fa-solid fa-filter-circle-xmark" style="font-size: 15px;"></i>')
    }
    else {
        isDropdownShow = false;
        $('#filter_dropdown_btn').html('<i class="fa-solid fa-filter" style="font-size: 15px; margin-left: 2px;"></i>')
    }
    $(this).dropdown('toggle');


    $('.select2-results__options strong').each(function (k, item) {
    });
});
$("body").on('click', '.select2-results__group', function () {
    $(this).siblings().toggle();
});
$('#filter_Type').on('select2:open', function () {
    setTimeout(() => {
        $('.select2-results__options strong').each(function (k, strong) {
            var elm = $(strong);
            elm.removeClass('text-primary text-info');

            if (elm.text() == "Normal") {
                elm.addClass('text-primary');
            }
            else if (elm.text() == "Consign") {
                elm.addClass('text-info');
            }
        });
    }, 100);

    //$('.select2-results__options strong').each(function (k, item) {
    //    console.log(item);
    //});
})

function FilterSelect2() {
    $('#filter_Product').select2({
        theme: 'bootstrap4',
        width: '75%',
    });
    $('#filter_Model').select2({
        theme: 'bootstrap4',
        width: '75%',
    });
    $('#filter_Vendor').select2({
        theme: 'bootstrap4',
        width: '75%',
    });
    $('#filter_Type').select2({
        theme: 'bootstrap4',
        width: '75%',
        minimumResultsForSearch: -1,
        dropdownParent: $("#dropdown_filter"),
    });

    $('#filter_Station').select2({
        theme: 'bootstrap4',
        width: '75%',
    });
    $('#filter_Group').select2({
        theme: 'bootstrap4',
        width: '75%',
    });
    $('#filter_Status').select2({
        theme: 'bootstrap4',
        width: '75%',
        minimumResultsForSearch: -1,
    });
}