$(function () {
    CreateChart1();
    CreateChart2();
    CreateChart3();
    CreateChart4();
    CreateChart5();
    CreateChart6();
    CreateChart7();
    CreateChart8910();
});

function CreateSpanRate(Num_1, Num_2) {
    let percentageChange;

    if (Num_2 !== 0) {
        percentageChange = ((Num_1 - Num_2) / Num_2) * 100;
    } else {
        percentageChange = 100;
    }
    let displayPercentageChange = Number.isInteger(percentageChange) ? percentageChange : percentageChange.toFixed(2);

    var type = {
        text: 'primary',
        arrow: 'arrow-up'
    };

    if (Num_1 > Num_2) {
        type.text = 'success';
        type.arrow = 'arrow-up';
    }
    else {
        type.text = 'danger';
        type.arrow = 'arrow-down';
    }

    return `<span class="text-${type.text}" title="this week: ${Num_1}, last week: ${Num_2}"><i class="lni lni-${type.arrow}"></i> ${displayPercentageChange}%</span> vs last 7 days`;
}

//<!-- Tổng số thiết bị -->
function CreateChart1() {
    $.ajax({
        type: "GET",
        url: "/NVIDIA/Dashboard/GetDataChart1",
        dataType: "json",
        contentType: "application/json;charset=utf-8",
        success: function (response) {
            if (response.status) {
                $('#chart1-totalDevice').text(response.totalDevice);

                $('#chart1-rateDevices').html(CreateSpanRate(response.thisWeekDevice, response.lastWeekDevice));

                Chart1(response.thisWeekDevices, response.thisWeekDate);
            }
            else {
                toastr["error"](response.message, "ERROR");
            }
        },
        error: function (error) {
            Swal.fire("Something went wrong!", GetAjaxErrorMessage(error), "error");
        }
    });
}
function Chart1(data, categories) {
    // chart 1
    var options = {
        series: [{
            name: 'Total Devices',
            data: data
        }],
        chart: {
            type: 'area',
            height: 60,
            toolbar: {
                show: false
            },
            zoom: {
                enabled: false
            },
            dropShadow: {
                enabled: false,
                top: 3,
                left: 14,
                blur: 4,
                opacity: 0.12,
                color: '#8833ff',
            },
            sparkline: {
                enabled: true
            }
        },
        markers: {
            size: 0,
            colors: ["#8833ff"],
            strokeColors: "#fff",
            strokeWidth: 2,
            hover: {
                size: 7,
            }
        },
        plotOptions: {
            bar: {
                horizontal: false,
                columnWidth: '45%',
                endingShape: 'rounded'
            },
        },
        dataLabels: {
            enabled: false
        },
        stroke: {
            show: true,
            width: 2.5,
            curve: 'smooth'
        },
        colors: ["#8833ff"],
        xaxis: {
            categories: categories,
        },
        fill: {
            opacity: 1
        },
        tooltip: {
            theme: 'dark',
            fixed: {
                enabled: false
            },
            x: {
                show: true
            },
            y: {
                title: {
                    formatter: function (seriesName) {
                        return ''
                    }
                }
            },
            marker: {
                show: false
            }
        }
    };
    var chart = new ApexCharts(document.querySelector("#chart1"), options);
    chart.render();
}

//<!-- Tổng số lượng -->
function CreateChart2() {
    $.ajax({
        type: "GET",
        url: "/NVIDIA/Dashboard/GetDataChart2",
        dataType: "json",
        contentType: "application/json;charset=utf-8",
        success: function (response) {
            if (response.status) {
                $('#chart2-totalQty').text(response.totalQuantity);

                $('#chart2-rateQty').html(CreateSpanRate(response.thisWeekQuantity, response.lastWeekQuantity));

                Chart2(response.arrWeekQuantity, response.arrWeekDate);
            }
            else {
                toastr["error"](response.message, "ERROR");
            }
        },
        error: function (error) {
            Swal.fire("Something went wrong!", GetAjaxErrorMessage(error), "error");
        }
    });
}
function Chart2(data, categories) {
    var options = {
        series: [{
            name: 'Total Quantity',
            data: data
        }],
        chart: {
            type: 'area',
            height: 60,
            toolbar: {
                show: false
            },
            zoom: {
                enabled: false
            },
            dropShadow: {
                enabled: false,
                top: 3,
                left: 14,
                blur: 4,
                opacity: 0.12,
                color: '#f41127',
            },
            sparkline: {
                enabled: true
            }
        },
        markers: {
            size: 0,
            colors: ["#f41127"],
            strokeColors: "#fff",
            strokeWidth: 2,
            hover: {
                size: 7,
            }
        },
        plotOptions: {
            bar: {
                horizontal: false,
                columnWidth: '40%',
                endingShape: 'rounded'
            },
        },
        dataLabels: {
            enabled: false
        },
        stroke: {
            show: true,
            width: 2.5,
            curve: 'smooth'
        },
        colors: ["#f41127"],
        xaxis: {
            categories: categories,
        },
        fill: {
            opacity: 1
        },
        tooltip: {
            theme: 'dark',
            fixed: {
                enabled: false
            },
            x: {
                show: true
            },
            y: {
                title: {
                    formatter: function (seriesName) {
                        return ''
                    }
                }
            },
            marker: {
                show: false
            }
        }
    };
    var chart = new ApexCharts(document.querySelector("#chart2"), options);
    chart.render();
}

//<!--Tổng số người dùng-->
function CreateChart3() {
    $.ajax({
        type: "GET",
        url: "/NVIDIA/Dashboard/GetDataChart3",
        dataType: "json",
        contentType: "application/json;charset=utf-8",
        success: function (response) {
            if (response.status) {
                $('#chart3-totalUser').text(response.totalUser);

                $('#chart3-rateUser').html(CreateSpanRate(response.thisWeekUser, response.lastWeekUser));

                Chart3(response.arrWeekUser, response.arrWeekDate);
            }
            else {
                toastr["error"](response.message, "ERROR");
            }
        },
        error: function (error) {
            Swal.fire("Something went wrong!", GetAjaxErrorMessage(error), "error");
        }
    });
}
function Chart3(data, categories) {
    var options = {
        series: [{
            name: 'Total User',
            data: data
        }],
        chart: {
            type: 'area',
            height: 60,
            toolbar: {
                show: false
            },
            zoom: {
                enabled: false
            },
            dropShadow: {
                enabled: false,
                top: 3,
                left: 14,
                blur: 4,
                opacity: 0.12,
                color: '#ffc107',
            },
            sparkline: {
                enabled: true
            }
        },
        markers: {
            size: 0,
            colors: ["#ffc107"],
            strokeColors: "#fff",
            strokeWidth: 2,
            hover: {
                size: 7,
            }
        },
        plotOptions: {
            bar: {
                horizontal: false,
                columnWidth: '45%',
                endingShape: 'rounded'
            },
        },
        dataLabels: {
            enabled: false
        },
        stroke: {
            show: true,
            width: 2.5,
            curve: 'smooth'
        },
        colors: ["#ffc107"],
        xaxis: {
            categories: categories,
        },
        fill: {
            opacity: 1
        },
        tooltip: {
            theme: 'dark',
            fixed: {
                enabled: false
            },
            x: {
                show: true
            },
            y: {
                title: {
                    formatter: function (seriesName) {
                        return ''
                    }
                }
            },
            marker: {
                show: false
            }
        }
    };
    var chart = new ApexCharts(document.querySelector("#chart3"), options);
    chart.render();
}

//<!-- Tổng số yêu cầu mượn -->
function CreateChart4() {
    $.ajax({
        type: "GET",
        url: "/NVIDIA/Dashboard/GetDataChart4",
        dataType: "json",
        contentType: "application/json;charset=utf-8",
        success: function (response) {
            if (response.status) {
                $('#chart4-totalBorrow').text(response.totalBorrow);

                $('#chart4-rateBorrow').html(CreateSpanRate(response.thisWeekBorrow, response.lastWeekBorrow));

                Chart4(response.arrWeekBorrow, response.arrWeekDate);
            }
            else {
                toastr["error"](response.message, "ERROR");
            }
        },
        error: function (error) {
            Swal.fire("Something went wrong!", GetAjaxErrorMessage(error), "error");
        }
    });
}
function Chart4(data, categories) {
    var options = {
        series: [{
            name: 'Total Borrow',
            data: data
        }],
        chart: {
            type: 'area',
            height: 60,
            toolbar: {
                show: false
            },
            zoom: {
                enabled: false
            },
            dropShadow: {
                enabled: false,
                top: 3,
                left: 14,
                blur: 4,
                opacity: 0.12,
                color: '#0dcaf0',
            },
            sparkline: {
                enabled: true
            }
        },
        markers: {
            size: 0,
            colors: ["#0dcaf0"],
            strokeColors: "#fff",
            strokeWidth: 2,
            hover: {
                size: 7,
            }
        },
        plotOptions: {
            bar: {
                horizontal: false,
                columnWidth: '40%',
                endingShape: 'rounded'
            },
        },
        dataLabels: {
            enabled: false
        },
        stroke: {
            show: true,
            width: 2.4,
            curve: 'smooth'
        },
        colors: ["#0dcaf0"],
        xaxis: {
            categories: categories,
        },
        fill: {
            opacity: 1
        },
        tooltip: {
            theme: 'dark',
            fixed: {
                enabled: false
            },
            x: {
                show: true
            },
            y: {
                title: {
                    formatter: function (seriesName) {
                        return ''
                    }
                }
            },
            marker: {
                show: false
            }
        }
    };
    var chart = new ApexCharts(document.querySelector("#chart4"), options);
    chart.render();
}

//<!-- Tổng số yêu cầu được chấp nhận -->
function CreateChart5() {
    $.ajax({
        type: "GET",
        url: "/NVIDIA/Dashboard/GetDataChart5",
        dataType: "json",
        contentType: "application/json;charset=utf-8",
        success: function (response) {
            if (response.status) {
                $('#chart5-totalApprove').text(response.totalApprove);

                $('#chart5-rateApprove').html(CreateSpanRate(response.thisWeekApprove, response.lastWeekApprove));

                Chart5(response.arrWeekApprove, response.arrWeekDate);
            }
            else {
                toastr["error"](response.message, "ERROR");
            }
        },
        error: function (error) {
            Swal.fire("Something went wrong!", GetAjaxErrorMessage(error), "error");
        }
    });
}
function Chart5(data, categories) {
    var options = {
        series: [{
            name: 'Bounce Rate',
            data: data
        }],
        chart: {
            type: 'area',
            height: 60,
            toolbar: {
                show: false
            },
            zoom: {
                enabled: false
            },
            dropShadow: {
                enabled: false,
                top: 3,
                left: 14,
                blur: 4,
                opacity: 0.12,
                color: '#29cc39',
            },
            sparkline: {
                enabled: true
            }
        },
        markers: {
            size: 0,
            colors: ["#29cc39"],
            strokeColors: "#fff",
            strokeWidth: 2,
            hover: {
                size: 7,
            }
        },
        plotOptions: {
            bar: {
                horizontal: false,
                columnWidth: '45%',
                endingShape: 'rounded'
            },
        },
        dataLabels: {
            enabled: false
        },
        stroke: {
            show: true,
            width: 2.4,
            curve: 'smooth'
        },
        colors: ["#29cc39"],
        xaxis: {
            categories: categories,
        },
        fill: {
            opacity: 1
        },
        tooltip: {
            theme: 'dark',
            fixed: {
                enabled: false
            },
            x: {
                show: true
            },
            y: {
                title: {
                    formatter: function (seriesName) {
                        return ''
                    }
                }
            },
            marker: {
                show: false
            }
        }
    };
    var chart = new ApexCharts(document.querySelector("#chart5"), options);
    chart.render();
}

//<!-- Tổng số yêu cầu mượn theo tháng/tuần -->
var chart6;
$('#chart6-selectType').on('change', function (e) {
    e.preventDefault();
    CreateChart6($(this).val());
});
function CreateChart6(type) {

    if (!type) type = 'week';

    $.ajax({
        type: "GET",
        url: "/NVIDIA/Dashboard/GetDataChart6?type=" + type,
        dataType: "json",
        contentType: "application/json;charset=utf-8",
        success: function (response) {
            if (response.status) {
                Chart6(response.listCountBorrow, response.listDate);
            }
            else {
                toastr["error"](response.message, "ERROR");
            }
        },
        error: function (error) {
            Swal.fire("Something went wrong!", GetAjaxErrorMessage(error), "error");
        }
    });
}
function Chart6(data, categories) {
    var options = {
        series: [{
            name: 'Borrow Requests Overview',
            data: data
        }],
        chart: {
            type: 'area',
            foreColor: '#9a9797',
            height: 250,
            toolbar: {
                show: false
            },
            zoom: {
                enabled: false
            },
            dropShadow: {
                enabled: false,
                top: 3,
                left: 14,
                blur: 4,
                opacity: 0.12,
                color: '#8833ff',
            },
            sparkline: {
                enabled: false
            }
        },
        markers: {
            size: 0,
            colors: ["#8833ff"],
            strokeColors: "#fff",
            strokeWidth: 2,
            hover: {
                size: 7,
            }
        },
        plotOptions: {
            bar: {
                horizontal: false,
                columnWidth: '45%',
                endingShape: 'rounded'
            },
        },
        dataLabels: {
            enabled: false
        },
        stroke: {
            show: true,
            width: 3,
            curve: 'smooth'
        },
        fill: {
            type: 'gradient',
            gradient: {
                shade: 'light',
                type: 'vertical',
                shadeIntensity: 0.5,
                gradientToColors: ['#fff'],
                inverseColors: false,
                opacityFrom: 0.8,
                opacityTo: 0.5,
                stops: [0, 100]
            }
        },
        colors: ["#8833ff"],
        grid: {
            show: true,
            borderColor: '#ededed',
            //strokeDashArray: 4,
        },
        xaxis: {
            categories: categories,
        },

        tooltip: {
            theme: 'dark',
            fixed: {
                enabled: false
            },
            x: {
                show: true
            },
            y: {
                title: {
                    formatter: function (seriesName) {
                        return ''
                    }
                }
            },
            marker: {
                show: false
            }
        }
    };

    if (!chart6) {
        chart6 = new ApexCharts(document.querySelector("#chart6"), options);
        chart6.render();
    }
    else {
        chart6.updateOptions({
            xaxis: {
                categories: categories,
            },
            series: [{
                data: data
            }]
        })
    }   
}

//<!-- In/Out thiết bị theo tháng/tuần -->
var chart7;
$('#chart7-selectType').on('change', function (e) {
    e.preventDefault();
    CreateChart7($(this).val());
});
function CreateChart7(type) {

    if (!type) type = 'week';

    $.ajax({
        type: "GET",
        url: "/NVIDIA/Dashboard/GetDataChart7?type=" + type,
        dataType: "json",
        contentType: "application/json;charset=utf-8",
        success: function (response) {
            if (response.status) {
                Chart7(response.listReturnQty, response.listBorrowQty, response.listDate);
            }
            else {
                toastr["error"](response.message, "ERROR");
            }
        },
        error: function (error) {
            Swal.fire("Something went wrong!", GetAjaxErrorMessage(error), "error");
        }
    });
}
function Chart7(data1, data2, categories) {
    var options = {
        series: [{
            name: 'Borrow Quantity',
            data: data1

        }, {
            name: 'Return Quantity',
            data: data2
        }],
        chart: {
            foreColor: '#9ba7b2',
            type: 'bar',
            height: 260,
            stacked: false,
            toolbar: {
                show: false
            },
        },
        plotOptions: {
            bar: {
                horizontal: false,
                columnWidth: '45%',
                endingShape: 'rounded'
            },
        },
        legend: {
            show: false,
            position: 'top',
            horizontalAlign: 'left',
            offsetX: -20
        },
        dataLabels: {
            enabled: false
        },
        stroke: {
            show: true,
            width: 3,
            colors: ['transparent']
        },
        colors: ["#8833ff", '#cba6ff'],        
        xaxis: {
            categories: categories,
        },
        grid: {
            show: true,
            borderColor: '#ededed',
        },
        fill: {
            opacity: 1
        },
        tooltip: {
            theme: 'dark',
        }
    };
    if (!chart7) {
        chart7 = new ApexCharts(document.querySelector("#chart7"), options);
        chart7.render();
    }
    else {
        chart7.updateOptions({
            xaxis: {
                categories: categories,
            },
            series: [{
                data: data1

            }, {
                data: data2
            }],
        })
    }
}

/*<!-- Số đơn approved theo tuần -->
  <!-- Số đơn pending theo tuần -->
  <!-- Số đơn reject theo tuần -->*/
function calculateSum(array) {
    return array.map(function (acc, item) {
        return acc + item;
    }, 0);
}
function CreateChart8910() {

    $.ajax({
        type: "GET",
        url: "/NVIDIA/Dashboard/GetDataChart78910",
        dataType: "json",
        contentType: "application/json;charset=utf-8",
        success: function (response) {
            if (response.status) {
                Chart8910(response.WeekApprove, response.WeekPending, response.WeekReject, response.listDate);

                console.log(response)

                var sumApprove = 0;
                var sumPending = 0;
                var sumReject = 0;
                for (let i = 0; i < 7; i++) {
                    sumApprove += response.WeekApprove[i];
                    sumPending += response.WeekPending[i];
                    sumReject += response.WeekReject[i];
                }
                var totalSum = sumApprove + sumPending + sumReject;

                console.log(sumApprove, sumPending, sumReject, totalSum);

                var ratioApprove = (sumApprove / totalSum) * 100;
                var ratioPending = (sumPending / totalSum) * 100;
                var ratioReject = 100 - ratioApprove - ratioPending;

                $('#chart8-rate').text(`${ratioApprove}%`);
                $('#chart9-rate').text(`${ratioPending}%`);
                $('#chart10-rate').text(`${ratioReject}%`);

            }
            else {
                toastr["error"](response.message, "ERROR");
            }
        },
        error: function (error) {
            Swal.fire("Something went wrong!", GetAjaxErrorMessage(error), "error");
        }
    });
}
function Chart8910(data1, data2, data3, categories) {
    // chart 8
    var options = {
        series: [{
            name: 'Approved',
            data: data1
        }],
        chart: {
            type: 'bar',
            height: 60,
            toolbar: {
                show: false
            },
            zoom: {
                enabled: false
            },
            dropShadow: {
                enabled: false,
                top: 3,
                left: 14,
                blur: 4,
                opacity: 0.12,
                color: '#8833ff',
            },
            sparkline: {
                enabled: true
            }
        },
        markers: {
            size: 0,
            colors: ["#8833ff"],
            strokeColors: "#fff",
            strokeWidth: 2,
            hover: {
                size: 7,
            }
        },
        plotOptions: {
            bar: {
                horizontal: false,
                columnWidth: '45%',
                endingShape: 'rounded'
            },
        },
        dataLabels: {
            enabled: false
        },
        stroke: {
            show: true,
            width: 3,
            // curve: 'smooth'
        },
        colors: ["#8833ff"],
        xaxis: {
            categories: categories,
        },
        fill: {
            opacity: 1
        },
        tooltip: {
            theme: 'dark',
            fixed: {
                enabled: false
            },
            x: {
                show: false
            },
            y: {
                title: {
                    formatter: function (seriesName) {
                        return ''
                    }
                }
            },
            marker: {
                show: false
            }
        }
    };
    var chart = new ApexCharts(document.querySelector("#chart8"), options);
    chart.render();
    // chart 9
    var options = {
        series: [{
            name: 'Sessions',
            data: data2
        }],
        chart: {
            type: 'area',
            height: 60,
            toolbar: {
                show: false
            },
            zoom: {
                enabled: false
            },
            dropShadow: {
                enabled: false,
                top: 3,
                left: 14,
                blur: 4,
                opacity: 0.12,
                color: '#f41127',
            },
            sparkline: {
                enabled: true
            }
        },
        markers: {
            size: 0,
            colors: ["#f41127"],
            strokeColors: "#fff",
            strokeWidth: 2,
            hover: {
                size: 7,
            }
        },
        plotOptions: {
            bar: {
                horizontal: false,
                columnWidth: '45%',
                endingShape: 'rounded'
            },
        },
        dataLabels: {
            enabled: false
        },
        stroke: {
            show: true,
            width: 3,
            // curve: 'smooth'
        },
        colors: ["#f41127"],
        xaxis: {
            categories: categories,
        },
        fill: {
            opacity: 1
        },
        tooltip: {
            theme: 'dark',
            fixed: {
                enabled: false
            },
            x: {
                show: false
            },
            y: {
                title: {
                    formatter: function (seriesName) {
                        return ''
                    }
                }
            },
            marker: {
                show: false
            }
        }
    };
    var chart = new ApexCharts(document.querySelector("#chart9"), options);
    chart.render();
    // chart 10
    var options = {
        series: [{
            name: 'Sessions',
            data: data3
        }],
        chart: {
            type: 'area',
            height: 60,
            toolbar: {
                show: false
            },
            zoom: {
                enabled: false
            },
            dropShadow: {
                enabled: false,
                top: 3,
                left: 14,
                blur: 4,
                opacity: 0.12,
                color: '#17a00e',
            },
            sparkline: {
                enabled: true
            }
        },
        markers: {
            size: 0,
            colors: ["#17a00e"],
            strokeColors: "#fff",
            strokeWidth: 2,
            hover: {
                size: 7,
            }
        },
        plotOptions: {
            bar: {
                horizontal: false,
                columnWidth: '45%',
                endingShape: 'rounded'
            },
        },
        dataLabels: {
            enabled: false
        },
        stroke: {
            show: true,
            width: 3,
            // curve: 'smooth'
        },
        colors: ["#17a00e"],
        xaxis: {
            categories: categories,
        },
        fill: {
            opacity: 1
        },
        tooltip: {
            theme: 'dark',
            fixed: {
                enabled: false
            },
            x: {
                show: false
            },
            y: {
                title: {
                    formatter: function (seriesName) {
                        return ''
                    }
                }
            },
            marker: {
                show: false
            }
        }
    };
    var chart = new ApexCharts(document.querySelector("#chart10"), options);
    chart.render();
}

//<!-- Trạng thái thiết bị -->
function Chart11() {
    var options = {
        chart: {
            height: 330,
            type: 'radialBar',
            toolbar: {
                show: false
            }
        },
        plotOptions: {
            radialBar: {
                startAngle: -130,
                endAngle: 130,
                hollow: {
                    margin: 0,
                    size: '78%',
                    //background: '#fff',
                    image: undefined,
                    imageOffsetX: 0,
                    imageOffsetY: 0,
                    position: 'front',
                    dropShadow: {
                        enabled: false,
                        top: 3,
                        left: 0,
                        blur: 4,
                        color: 'rgba(0, 169, 255, 0.25)',
                        opacity: 0.65
                    }
                },
                track: {
                    background: '#dfecff',
                    //strokeWidth: '67%',
                    margin: 0, // margin is in pixels
                    dropShadow: {
                        enabled: false,
                        top: -3,
                        left: 0,
                        blur: 4,
                        color: 'rgba(0, 169, 255, 0.85)',
                        opacity: 0.65
                    }
                },
                dataLabels: {
                    showOn: 'always',
                    name: {
                        offsetY: -25,
                        show: true,
                        color: '#6c757d',
                        fontSize: '16px'
                    },
                    value: {
                        formatter: function (val) {
                            return val + "%";
                        },
                        color: '#000',
                        fontSize: '45px',
                        show: true,
                        offsetY: 10,
                    }
                }
            }
        },
        fill: {
            type: 'gradient',
            gradient: {
                shade: 'dark',
                type: 'horizontal',
                shadeIntensity: 0.5,
                gradientToColors: ['#8e2de2'],
                inverseColors: false,
                opacityFrom: 1,
                opacityTo: 1,
                stops: [0, 100]
            }
        },
        colors: ["#4a00e0"],
        series: [84],
        stroke: {
            lineCap: 'round',
            //dashArray: 4
        },
        labels: ['Dynamics Today'],
    }
    var chart = new ApexCharts(document.querySelector("#chart11"), options);
    chart.render();
}

//<!-- Thiết bị trong kho, ngoài kho - Loại thiết bị (dynamic/static) -->
function Chart1213() {
    Highcharts.chart('chart12', {
        chart: {
            width: '190',
            height: '190',
            plotBackgroundColor: null,
            plotBorderWidth: null,
            plotShadow: false,
            type: 'pie',
            styledMode: true
        },
        credits: {
            enabled: false
        },
        exporting: {
            buttons: {
                contextButton: {
                    enabled: false,
                }
            }
        },
        title: {
            text: ''
        },
        tooltip: {
            pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
        },
        accessibility: {
            point: {
                valueSuffix: '%'
            }
        },
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                dataLabels: {
                    enabled: false
                },
                showInLegend: false
            }
        },
        series: [{
            name: 'Users',
            colorByPoint: true,
            data: [{
                name: 'Male',
                y: 61.41,
                sliced: true,
                selected: true
            }, {
                name: 'Female',
                y: 11.84
            }]
        }]
    });

    Highcharts.chart('chart13', {
        chart: {
            height: 360,
            type: 'column',
            styledMode: true
        },
        credits: {
            enabled: false
        },
        title: {
            text: 'Traffic Sources Status. January, 2021'
        },
        accessibility: {
            announceNewData: {
                enabled: true
            }
        },
        xAxis: {
            type: 'category'
        },
        yAxis: {
            title: {
                text: 'Traffic Sources Status'
            }
        },
        legend: {
            enabled: false
        },
        plotOptions: {
            series: {
                borderWidth: 0,
                dataLabels: {
                    enabled: true,
                    format: '{point.y:.1f}%'
                }
            }
        },
        tooltip: {
            headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
            pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>{point.y:.2f}%</b> of total<br/>'
        },
        series: [{
            name: "Traffic Sources",
            colorByPoint: true,
            data: [{
                name: "Organic Search",
                y: 62.74,
                drilldown: "Organic Search"
            }, {
                name: "Direct",
                y: 40.57,
                drilldown: "Direct"
            }, {
                name: "Referral",
                y: 25.23,
                drilldown: "Referral"
            }, {
                name: "Others",
                y: 10.58,
                drilldown: "Others"
            }]
        }],

    });
}
