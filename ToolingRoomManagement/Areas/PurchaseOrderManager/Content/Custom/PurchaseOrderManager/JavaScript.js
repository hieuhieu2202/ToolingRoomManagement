var table_employees;
var buttonNewRequest;

$(document).ready(function () {
    buttonNewRequest = initConfettiButton('buttonNewRequest', 'canvasNewRequest');

    InitTable(); 
});

function InitTable() {
    var options = {
        scrollY: '75vh',
        paging: false,
        info: false,
        searching: false,
        scrollCollapse: true,
        fixedHeader: {
            header: true,
        },    
        columnDefs: [
            { targets: [6], orderable: false },
            { targets: "_all", orderable: true },
        ],
        columns: [
            { className: "" },
            { className: "" },
            { className: "" },
            { className: "" },
            { className: "" },
            { className: "" },
            { className: "" },

        ],
    }
    table_employees = new DataTable('#table_employees', options);

    $('#table_employees_search').click(function () {
        table_employees.search($(this).val()).draw();
    });

}