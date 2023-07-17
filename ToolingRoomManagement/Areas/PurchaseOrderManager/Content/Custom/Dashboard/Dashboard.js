$(document).ready(function () {
    GetTotalRequest();
    GetTotalItem();
    GetTotalApproved();
    GetTotalRequestLine();
    GetTop10Newest();
});

function GetTotalRequest() {
        $.ajax({
            type: "GET",
            url: "/PurchaseOrderManager/DashBoard/NumRequests",
            contentType: "application/json;charset=utf-8",
            dataType: "json",
            success: function (response) {
                if (response.status) {
                    $('#num_request').html(response.data);
                }
                else {
                    Swal.fire({
                        title: `ERROR`,
                        text: response.message,
                        icon: 'error',
                        confirmButtonText: 'Got it!',
                        buttonsStyling: false,
                        customClass: {
                            confirmButton: 'btn btn-danger'
                        },
                    });
                }
            },
            error: function () {
                Swal.fire({
                    title: `ERROR`,
                    text: 'Server Error. Please contact us.',
                    icon: 'error',
                    confirmButtonText: 'Got it!',
                    buttonsStyling: false,
                    customClass: {
                        confirmButton: 'btn btn-danger'
                    },
                });
            }
        });
}
function GetTotalItem() {
    $.ajax({
        type: "GET",
        url: "/PurchaseOrderManager/DashBoard/NumItems",
        contentType: "application/json;charset=utf-8",
        dataType: "json",
        success: function (response) {
            if (response.status) {
                $('#num_items').html(response.data);
            }
            else {
                Swal.fire({
                    title: `ERROR`,
                    text: response.message,
                    icon: 'error',
                    confirmButtonText: 'Got it!',
                    buttonsStyling: false,
                    customClass: {
                        confirmButton: 'btn btn-danger'
                    },
                });
            }
        },
        error: function () {
            Swal.fire({
                title: `ERROR`,
                text: 'Server Error. Please contact us.',
                icon: 'error',
                confirmButtonText: 'Got it!',
                buttonsStyling: false,
                customClass: {
                    confirmButton: 'btn btn-danger'
                },
            });
        }
    });
}
function GetTotalApproved() {
    $.ajax({
        type: "GET",
        url: "/PurchaseOrderManager/DashBoard/NumApproved",
        contentType: "application/json;charset=utf-8",
        dataType: "json",
        success: function (response) {
            if (response.status) {
                $('#num_approved').html(response.data);
            }
            else {
                Swal.fire({
                    title: `ERROR`,
                    text: response.message,
                    icon: 'error',
                    confirmButtonText: 'Got it!',
                    buttonsStyling: false,
                    customClass: {
                        confirmButton: 'btn btn-danger'
                    },
                });
            }
        },
        error: function () {
            Swal.fire({
                title: `ERROR`,
                text: 'Server Error. Please contact us.',
                icon: 'error',
                confirmButtonText: 'Got it!',
                buttonsStyling: false,
                customClass: {
                    confirmButton: 'btn btn-danger'
                },
            });
        }
    });
}
function GetTotalRequestLine() {
    $.ajax({
        type: "GET",
        url: "/PurchaseOrderManager/DashBoard/AllData",
        contentType: "application/json;charset=utf-8",
        dataType: "json",
        success: function (response) {
            if (response.status) {
                rData = JSON.parse(response.data);
                ReportAreaChart(rData);
                StatusPieChart(rData);
            }
            else {
                Swal.fire({
                    title: `ERROR`,
                    text: response.message,
                    icon: 'error',
                    confirmButtonText: 'Got it!',
                    buttonsStyling: false,
                    customClass: {
                        confirmButton: 'btn btn-danger'
                    },
                });
            }
        },
        error: function () {
            Swal.fire({
                title: `ERROR`,
                text: 'Server Error. Please contact us.',
                icon: 'error',
                confirmButtonText: 'Got it!',
                buttonsStyling: false,
                customClass: {
                    confirmButton: 'btn btn-danger'
                },
            });
        }
    });
}



function GetTop10Newest() {
    $.ajax({
        type: "GET",
        url: "/PurchaseOrderManager/DashBoard/Top10Newest",
        contentType: "application/json;charset=utf-8",
        dataType: "json",
        success: function (response) {
            if (response.status) {
                rData = JSON.parse(response.data);
                NewestTable(rData);
                NewestTimeLine(rData);
                
                //console.log(calculateTimeDifference(rData[0].CreatedDate));
            }
            else {
                Swal.fire({
                    title: `ERROR`,
                    text: response.message,
                    icon: 'error',
                    confirmButtonText: 'Got it!',
                    buttonsStyling: false,
                    customClass: {
                        confirmButton: 'btn btn-danger'
                    },
                });
            }
        },
        error: function () {
            Swal.fire({
                title: `ERROR`,
                text: 'Server Error. Please contact us.',
                icon: 'error',
                confirmButtonText: 'Got it!',
                buttonsStyling: false,
                customClass: {
                    confirmButton: 'btn btn-danger'
                },
            });
        }
    });
}


function ReportAreaChart(data) {
    const oldCategories = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const CountMonth = new Array(12).fill(0);

    const ChartData = [
        { name: '询问价格 Hỏi giá', data: new Array(12).fill(0) },
        { name: '采购申请 PR', data: new Array(12).fill(0) },
        { name: '采购订单 PO', data: new Array(12).fill(0) },
        { name: '送货 Giao hàng', data: new Array(12).fill(0) },
        { name: '收到 Nhận hàng', data: new Array(12).fill(0) }
    ];

    const currentYear = new Date().getFullYear();

    data.forEach(function (request) {
        const valueDate = new Date(request.CreatedDate);
        if (valueDate.getFullYear() == currentYear) {
            CountMonth[valueDate.getMonth()]++;

            switch (request.Status) {
                case '询问价格 Hỏi giá':
                    ChartData[0].data[valueDate.getMonth()]++;
                    break;
                case '采购申请 PR':
                    ChartData[1].data[valueDate.getMonth()]++;
                    break;
                case '采购订单 PO':
                    ChartData[2].data[valueDate.getMonth()]++;
                    break;
                case '送货 Giao hàng':
                    ChartData[3].data[valueDate.getMonth()]++;
                    break;
                case '收到 Nhận hàng':
                    ChartData[4].data[valueDate.getMonth()]++;
                    break;
            }
        }
    });

    const newCategories = oldCategories.filter((month, i) => CountMonth[i] > 0);
    ChartData.forEach(v => {
        v.data = v.data.filter((count, i) => CountMonth[i] > 0);
    });

    new ApexCharts(document.querySelector("#reportsChart"), {
        series: ChartData,
        chart: {
            height: 350,
            type: 'area',
            toolbar: {
                show: false
            },
        },
        markers: {
            size: 4
        },
        colors: ['#0d6efd', '#ffc107', '#0dcaf0', '#6c757d', '#dc3545'],
        fill: {
            type: "gradient",
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.3,
                opacityTo: 0.4,
                stops: [0, 90, 100]
            }
        },
        dataLabels: {
            enabled: false
        },
        stroke: {
            curve: 'smooth',
            width: 2
        },
        xaxis: {
            //type: 'datetime',
            categories: newCategories
        },
        tooltip: {
            x: {
                format: 'dd/MM/yy HH:mm'
            },
        }
    }).render();
}
function StatusPieChart(data) {
    const LablesData = ['询问价格 Hỏi giá', '采购申请 PR', '采购订单 PO', '送货 Giao hàng', '收到 Nhận hàng'];
    const ChartData = [0, 0, 0, 0, 0];

    const currentYear = new Date().getFullYear();

    data.forEach(function (request) {
        const valueDate = new Date(request.CreatedDate);
        if (valueDate.getFullYear() == currentYear) {
            switch (request.Status) {
                case '询问价格 Hỏi giá':
                    ChartData[0]++;
                    break;
                case '采购申请 PR':
                    ChartData[1]++;
                    break;
                case '采购订单 PO':
                    ChartData[2]++;
                    break;
                case '送货 Giao hàng':
                    ChartData[3]++;
                    break;
                case '收到 Nhận hàng':
                    ChartData[4]++;
                    break;
            }
        }
    });

    console.log(ChartData);

    new ApexCharts(document.querySelector("#StatusChart"), {
        series: ChartData,
        noData: {
            text: 'No data to display',
            align: 'center',
            verticalAlign: 'middle',
            offsetX: 0,
            offsetY: 0,
            style: {
                fontSize: '18px',
                color: '#777'
            }
        },
        chart: {
            height: 350,
            type: 'donut',
        },
        labels: LablesData,
        colors: ['#0d6efd', '#ffc107', '#0dcaf0', '#6c757d', '#dc3545'],
        responsive: [{
            breakpoint: 480,
            options: {
                legend: {
                    position: 'bottom'
                }
            }
        }]
    }).render();
}

function NewestTable(data) {
    $('#cardTbody').html('');
    data.forEach(function (item) {
        var colorText = '';

        switch (item.Status) {
            case '询问价格 Hỏi giá':
                colorText = 'primary';
                break;
            case '采购申请 PR':
                colorText = 'warning';
                break;
            case '采购订单 PO':
                colorText = 'info';
                break;
            case '送货 Giao hàng':
                colorText = 'secondary';
                break;
            case '收到 Nhận hàng':
                colorText = 'danger';
                break;
        }

        var htmlString = `<tr>
                              <th scope="row">${item.CreatedDate}</th>
                              <td>${item.Requester}</td>
                              <td>${item.RequesterPhoneNumber}</td>
                              <td>${item.RequesterEmail}</td>
                              <td><span class="badge bg-${colorText}">${item.Status}</span></td>
                          </tr>`
        $('#cardTbody').append(htmlString);
    });
};
function NewestTimeLine(data) {
    $('#requestNewest').html('');
    data.forEach(function (item) {

        var colorText = '';

        switch (item.Status) {
            case '询问价格 Hỏi giá':
                colorText = 'primary';
                break;
            case '采购申请 PR':
                colorText = 'warning';
                break;
            case '采购订单 PO':
                colorText = 'info';
                break;
            case '送货 Giao hàng':
                colorText = 'secondary';
                break;
            case '收到 Nhận hàng':
                colorText = 'danger';
                break;
        }

        var htmlString = `<div class="activity-item d-flex">
                                          <div class="activite-label">${calculateTimeDifference(rData[0].CreatedDate)}</div>
                                          <i class="bi bi-circle-fill activity-badge text-${colorText} align-self-start"></i>
                                          <div class="activity-content">
                                              ${item.RequestDepartment} - ${item.Requester} - ${item.RequesterPhoneNumber} - ${item.RequesterEmail}
                                          </div>
                                      </div>`;
        $('#requestNewest').append(htmlString);
    });
}

function calculateTimeDifference(dateString) {
    // Chuyển đổi chuỗi thành đối tượng Date
    var targetDate = new Date(dateString);

    // Tính thời gian chênh lệch (đơn vị milliseconds) giữa ngày hiện tại và targetDate
    var timeDifference = targetDate.getTime() - new Date().getTime();

    // Chuyển đổi thời gian chênh lệch thành giờ, phút, ngày
    var minutes = Math.abs(Math.floor(timeDifference / (1000 * 60)));
    var hours = Math.abs(Math.floor(timeDifference / (1000 * 60 * 60)));
    var days = Math.abs(Math.floor(timeDifference / (1000 * 60 * 60 * 24)));

    if (minutes == 0) {
        return "now";
    }

    // Xác định đơn vị thời gian phù hợp
    var unit;
    var timeValue;
    if (days > 0) {
        unit = "day";
        timeValue = days;
    } else if (hours > 0) {
        unit = "hrs";
        timeValue = hours;
    } else {
        unit = "min";
        timeValue = minutes;
    }

    // Tạo chuỗi kết quả
    return result = timeValue + " " + unit;
}
