var IntervalCount = 0;
$(function () {
    if (!$('#isHasSession').val()) {
        $('.sidebar-wrapper').hide();
        $('header').hide();
        $('.page-wrapper').css("margin", 0);
        $('#SignIn').show();
    }    



    CreateChart1();
    CreateChart2();
    CreateChart3();
    CreateChart4();
    CreateChart5();
    CreateChart6();
    CreateChart7();
    CreateChart8910();
    CreateChart11();
    CreateChart12();
    //GetModels();
    offcanvasDetails = new bootstrap.Offcanvas($('#offcanvasModel'));

    setInterval(() => {
        CreateChart1();
        CreateChart2();
        CreateChart3();
        CreateChart4();
        CreateChart5();
        CreateChart6();
        CreateChart7();
        CreateChart8910();
        CreateChart11();
        CreateChart12();

        IntervalCount++;
        console.log(IntervalCount);
    }, 60000);
});

// Chart
{
    var chart_1, chart_2, chart_3, chart_4, chart_5, chart_6, chart_7, chart_8, chart_9, chart_10, chart_11, chart_12;

    // Render Span
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

        return `<span class="text-${type.text}" title="this week: ${Num_1}, last week: ${Num_2}"><i class="lni lni-${type.arrow}"></i> ${displayPercentageChange}%</span> vs last week`;
    }

    //<!--Tổng số người dùng-->
    function CreateChart1() {
        $.ajax({
            type: "GET",
            url: "/NVIDIA/Dashboard/GetDataChart1",
            dataType: "json",
            contentType: "application/json;charset=utf-8",
            async: false,
            success: function (response) {
                if (response.status) {
                    $('#chart1-totalUser').text(response.thisWeekUser);

                    $('#chart1-rateUser').html(CreateSpanRate(response.thisWeekUser, response.lastWeekUser));

                    Chart1(response.arrWeekUser, response.arrWeekDate);
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
        if (chart_1 == null) {
            var options = {
                series: [{
                    name: 'Weekly User',
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
            chart_1 = new ApexCharts(document.querySelector("#chart1"), options);
            chart_1.render();
        }
        else {
            chart_1.updateOptions({
                series: [{
                    data: data
                }],
                xaxis: {
                    categories: categories,
                },
            });
        }       
    }

    //<!-- Tổng số thiết bị -->
    function CreateChart2() {
        $.ajax({
            type: "GET",
            url: "/NVIDIA/Dashboard/GetDataChart2",
            dataType: "json",
            contentType: "application/json;charset=utf-8",
            async: false,
            success: function (response) {
                if (response.status) {
                    $('#chart2-totalDevice').text(response.thisWeekDevice);

                    $('#chart2-rateDevices').html(CreateSpanRate(response.thisWeekDevice, response.lastWeekDevice));

                    Chart2(response.thisWeekDevices, response.thisWeekDate);
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
        if (chart_2 == null) {
            // chart 2
            var options = {
                series: [{
                    name: 'Weekly Device',
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
            chart_2 = new ApexCharts(document.querySelector("#chart2"), options);
            chart_2.render();
        }
        else {
            chart_2.updateOptions({
                series: [{
                    data: data
                }],
                xaxis: {
                    categories: categories,
                },
            });
        }
        
    }

    //<!-- Tổng số lượng -->
    function CreateChart3() {
        $.ajax({
            type: "GET",
            url: "/NVIDIA/Dashboard/GetDataChart3",
            dataType: "json",
            contentType: "application/json;charset=utf-8",
            async: false,
            success: function (response) {
                if (response.status) {
                    $('#chart3-totalRequest').text(response.thisWeekRequest);

                    $('#chart3-rateRequest').html(CreateSpanRate(response.thisWeekRequest, response.lastWeekRequest));

                    Chart3(response.arrWeekRequest, response.arrWeekDate);
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
        if (chart_3 == null) {
            var options = {
                series: [{
                    name: 'Weekly Request',
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
            chart_3 = new ApexCharts(document.querySelector("#chart3"), options);
            chart_3.render();
        }
        else {
            chart_3.updateOptions({
                series: [{
                    data: data
                }],
                xaxis: {
                    categories: categories,
                },
            });
        }        
    }

    //<!-- Tổng số yêu cầu được chấp nhận -->
    function CreateChart4() {
        $.ajax({
            type: "GET",
            url: "/NVIDIA/Dashboard/GetDataChart4",
            dataType: "json",
            contentType: "application/json;charset=utf-8",
            async: false,
            success: function (response) {
                if (response.status) {
                    $('#chart4-totalApproved').text(response.thisWeekAprovedRequest);

                    $('#chart4-rateApproved').html(CreateSpanRate(response.thisWeekAprovedRequest, response.lastWeekAprovedRequest));

                    Chart4(response.arrWeekApprovedRequest, response.arrWeekDate);
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
        if (chart_4 == null) {
            var options = {
                series: [{
                    name: 'Weekly Approved Request',
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
            chart_4 = new ApexCharts(document.querySelector("#chart4"), options);
            chart_4.render();
        }
        else {
            chart_4.updateOptions({
                series: [{
                    data: data
                }],
                xaxis: {
                    categories: categories,
                },
            });
        }
        
    }

    //<!-- Tổng số yêu cầu 0 được chấp nhận -->
    function CreateChart5() {
        $.ajax({
            type: "GET",
            url: "/NVIDIA/Dashboard/GetDataChart5",
            dataType: "json",
            contentType: "application/json;charset=utf-8",
            async: false,
            success: function (response) {
                if (response.status) {
                    $('#chart5-totalRejected').text(response.thisWeekRejectedRequest);

                    $('#chart5-rateRejected').html(CreateSpanRate(response.thisWeekRejectedRequest, response.lastWeekRejectedRequest));

                    Chart5(response.arrWeekRejectedRequest, response.arrWeekDate);
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
        if (chart_5 == null) {
            var options = {
                series: [{
                    name: 'Weekly Rejected Request',
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
            chart_5 = new ApexCharts(document.querySelector("#chart5"), options);
            chart_5.render();
        }
        else {
            chart_5.updateOptions({
                series: [{
                    data: data
                }],
                xaxis: {
                    categories: categories,
                },
            });
        }
        
    }


    //<!-- Tổng số yêu cầu mượn theo tháng/tuần -->
    $('#chart6-selectType').on('change', function (e) {
        e.preventDefault();
        CreateChart6($(this).val());
    });
    function CreateChart6(type) {

        if (!type) type = $('#chart6-selectType').val();

        $.ajax({
            type: "GET",
            url: "/NVIDIA/Dashboard/GetDataChart6?type=" + type,
            dataType: "json",
            async: false,
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

        if (chart_6 == null) {
            chart_6 = new ApexCharts(document.querySelector("#chart6"), options);
            chart_6.render();
        }
        else {
            chart_6.updateOptions({
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
    $('#chart7-selectType').on('change', function (e) {
        e.preventDefault();
        CreateChart7($(this).val());
    });
    function CreateChart7(type) {

        if (!type) type = $('#chart7-selectType').val();

        $.ajax({
            type: "GET",
            url: "/NVIDIA/Dashboard/GetDataChart7?type=" + type,
            dataType: "json",
            async: false,
            contentType: "application/json;charset=utf-8",
            success: function (response) {
                if (response.status) {
                    Chart7(response.listTakeQty, response.listBorrowQty, response.listReturnQty, response.listReturnNgQty, response.listExportQty, response.listDate);
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
    function Chart7(data1 = [], data2 = [], data3 = [], data4 = [], data5 = [], categories) {
        var options = {
            series: [
                {
                    name: 'Take Quantity',
                    data: data1
                }, {
                    name: 'Borrow Quantity',
                    data: data2

                }, {
                    name: 'Return Quantity',
                    data: data3
                }, {
                    name: 'NG Quantity',
                    data: data4
                }, {
                    name: 'Export Quantity',
                    data: data5
                }
            ],
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
            colors: ["#a8adb0", "#8833ff", '#0dcaf0', '#fd3550', '#15ca20'],
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
        if (chart_7 == null) {
            chart_7 = new ApexCharts(document.querySelector("#chart7"), options);
            chart_7.render();
        }
        else {
            chart_7.updateOptions({
                xaxis: {
                    categories: categories,
                },
                series: [{
                    data: data1
                }, {
                    data: data2
                }, {
                    data: data3
                }, {
                    data: data4
                }, {
                    data: data5
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
            url: "/NVIDIA/Dashboard/GetDataChart8910",
            dataType: "json",
            async: false,
            contentType: "application/json;charset=utf-8",
            success: function (response) {
                if (response.status) {
                    Chart8910(response.WeekApprove, response.WeekPending, response.WeekReject, response.listDate);

                    var sumApprove = 0;
                    var sumPending = 0;
                    var sumReject = 0;
                    for (let i = 0; i < 7; i++) {
                        sumApprove += response.WeekApprove[i];
                        sumPending += response.WeekPending[i];
                        sumReject += response.WeekReject[i];
                    }
                    var totalSum = sumApprove + sumPending + sumReject;

                    var ratioApprove = ((sumApprove / totalSum) * 100).toFixed(2);
                    var ratioPending = ((sumPending / totalSum) * 100).toFixed(2);
                    var ratioReject = 100 - (parseFloat(ratioApprove) + parseFloat(ratioPending));

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
        if (chart_8 == null) {
            chart_8 = new ApexCharts(document.querySelector("#chart8"), options);
            chart_8.render();
        }
        else {
            chart_8.updateOptions({
                series: [{
                    data: data1
                }],
                xaxis: {
                    categories: categories,
                },
            })
        }
        
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
                width: 3,
                // curve: 'smooth'
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
        if (chart_9 == null) {
            chart_9 = new ApexCharts(document.querySelector("#chart9"), options);
            chart_9.render();
        }
        else {
            chart_9.updateOptions({
                series: [{
                    data: data1
                }],
                xaxis: {
                    categories: categories,
                },
            })
        }

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
        if (chart_10 == null) {
            chart_10 = new ApexCharts(document.querySelector("#chart10"), options);
            chart_10.render();
        }
        else {
            chart_10.updateOptions({
                series: [{
                    data: data1
                }],
                xaxis: {
                    categories: categories,
                },
            })
        }
    }

    //<!-- Trạng thái thiết bị -->
    function CreateChart11() {
        $.ajax({
            type: "GET",
            url: "/NVIDIA/Dashboard/GetDataChart11",
            dataType: "json",
            async: false,
            contentType: "application/json;charset=utf-8",
            success: function (response) {
                if (response.status) {
                    var data = {
                        Unconfirmed: response.Unconfirmed,
                        PartConfirmed: response.PartConfirmed,
                        Confirmed: response.Confirmed,
                        Locked: response.Locked,
                        OutRange: response.OutRange
                    }
                    data.total = data.Unconfirmed + data.PartConfirmed + data.Confirmed + data.Locked + data.OutRange;
                    data.good = data.PartConfirmed + data.Confirmed;

                    Chart11(data);

                    $('#chart11-ConfirmedText').text(data.Confirmed);
                    $('#chart11-ConfirmedBar').css('width', `${((data.Confirmed / data.total) * 100).toFixed(0)}%`);

                    $('#chart11-PartConfirmedText').text(data.PartConfirmed);
                    $('#chart11-PartConfirmedBar').css('width', `${((data.PartConfirmed / data.total) * 100).toFixed(0)}%`);

                    $('#chart11-UnconfirmedText').text(data.Unconfirmed);
                    $('#chart11-UnconfirmedBar').css('width', `${((data.Unconfirmed / data.total) * 100).toFixed(0)}%`);

                    $('#chart11-LockedText').text(data.Locked);
                    $('#chart11-LockedBar').css('width', `${((data.Locked / data.total) * 100).toFixed(0)}%`);

                    $('#chart11-OutRangeText').text(data.OutRange);
                    $('#chart11-OutRangeBar').css('width', `${((data.OutRange / data.total) * 100).toFixed(0)}%`);
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
    function Chart11(data) {
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
            series: [(data.good / data.total * 100).toFixed(2)],
            stroke: {
                lineCap: 'round',
                //dashArray: 4
            },
            labels: ['Good Device'],
        }
        

        if (chart_11 == null) {
            chart_11 = new ApexCharts(document.querySelector("#chart11"), options);
            chart_11.render();
        }
        else {
            chart_11.updateOptions({
                series: [(data.good / data.total * 100).toFixed(2)],
            });
        }
    }

    //<!-- Thiết bị trong mỗi kho - Loại thiết bị (dynamic/static/fixture/consign/orther) -->
    function CreateChart12() {
        $.ajax({
            type: "GET",
            url: "/NVIDIA/Dashboard/GetDataChart12",
            dataType: "json",
            async: false,
            contentType: "application/json;charset=utf-8",
            success: function (response) {
                if (response.status) {
                    var data = {
                        TotalQuantity: response.TotalQuantity,
                        TotalRealQuantity: response.TotalRealQuantity,
                        TotalStatic: response.TotalStatic,
                        TotalDynamic: response.TotalDynamic,
                        TotalFixture: response.TotalFixture,
                        TotalNA: response.TotalNA,
                    }
                    data.TotalStatus = data.TotalStatic + data.TotalDynamic + data.TotalFixture + data.TotalNA;

                    var WarehouseDeviceCount = response.WarehouseDeviceCount;
                    var WarehouseDeviceName = response.WarehouseDeviceName;

                    Chart12(WarehouseDeviceCount, WarehouseDeviceName);

                    data.RateStatic = parseFloat((data.TotalStatic / data.TotalStatus * 100).toFixed(2));
                    data.RateDynamic = parseFloat((data.TotalDynamic / data.TotalStatus * 100).toFixed(2));                    
                    data.RateFixture = parseFloat((data.TotalFixture / data.TotalStatus * 100).toFixed(2));
                    data.RateNA = parseFloat((100 - (data.RateStatic + data.RateDynamic + data.RateFixture)).toFixed(2));

                    $('#chart12-RateStatic').text(`${data.RateStatic}%`);
                    $('#chart12-RateStaticBar').css('width', `${data.RateStatic}%`);

                    $('#chart12-RateDynamic').text(`${data.RateDynamic}%`);
                    $('#chart12-RateDynamicBar').css('width', `${data.RateDynamic}%`);

                    $('#chart12-RateFixture').text(`${data.RateFixture}%`);
                    $('#chart12-RateFixtureBar').css('width', `${data.RateFixture}%`);

                    $('#chart12-RateNA').text(`${data.RateNA}%`);
                    $('#chart12-RateNABar').css('width', `${data.RateNA}%`);

                    ;
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
    function Chart12(data, labels) {
        var options = {
            chart: {
                width: 350,
                height: 350,
                type: 'pie',
            },
            series: data,
            labels: labels,
            dataLabels: {
                enabled: true
            },
            legend: {
                show: true,
                labels: {
                    colors: ['#fff']
                },
                formatter: function (val) {
                    return 'Warehouse ' + val;
                }
            },
            tooltip: {
                y: {
                    formatter: function (val) {
                        return val + ' devives';
                    }
                }
            },
        };

        
        if (chart_12 == null) {
            chart_12 = new ApexCharts(document.getElementById('chart12'), options);
            chart_12.render();
        }
        else {
            chart_12.updateOptions({
                series: data,
                labels: labels,
            });
        }
    }
}

// Model
var offcanvasDetails;
function GetModels() {
    $.ajax({
        type: "GET",
        url: "/NVIDIA/Dashboard/GetModels",
        dataType: "json",
        contentType: "application/json;charset=utf-8",
        success: function (response) {
            if (response.status) {
                var ModelsResults = response.ModelsResults;

                $('#Model-Container').empty();
                $.each(ModelsResults, function (k, ModelsResult) {
                    var Model = ModelsResult.Model;
                    var col = $(`<div class="col" data-id="${Model.Id}">
                                    <div class="card radius-10">
                                        <div class="card-body">
                                            <div class="d-flex align-items-center">
                                                <div class="card-model">
                                                    <p class="mb-0 text-secondary">${(Model.ModelName == null || Model.ModelName == '') ? 'Unknown' : Model.ModelName}</p>
                                                    <span class="fs-4 text-white">${ModelsResult.CountStation}</span> (Station) 
                                                    <span class="fs-4 text-success">/</span>
                                                    <span class="fs-4 text-white">${ModelsResult.CountDevice}</span> (Device)
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>`);
                    col.on('click', function (e) {
                        e.preventDefault();
                        GetModelDetails($(this).data('id'));
                    });
                    $('#Model-Container').append(col)
                });
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
function GetModelDetails(Id) {
    $.ajax({
        type: "GET",
        url: "/NVIDIA/Dashboard/GetModelDetails?Id=" + Id,
        dataType: "json",
        contentType: "application/json;charset=utf-8",
        success: function (response) {
            if (response.status) {

                $('#station-container').empty();
                $.each(response.ModelDetailsResults, function (k, Results) {

                    var station = Results.Station;
                    var DeviceCount = Results.Devices.length;

                    var card = $(`<div class="col">
                                      <div class="card radius-10">
                                          <div class="card-header">
                                              <div class="d-flex justify-content-between">
                                                  <h5 class="mb-0 text-secondary">${(station.StationName == null || station.StationName == '') ? 'Unknown' : station.StationName}</h5>
                                                  <button class="btn btn-sm btn-outline-primary radius-10" data-idmodel="${Id}" data-idstation="${station.Id}">
                                                        <i class="fa-duotone fa-circle-info"></i> Details
                                                  </button>
                                              </div>
                                          </div>
                                          <div class="card-body">
                                              <h4 class="my-1">${DeviceCount} Devices</h4>
                                          </div>
                                      </div>
                                  </div>`);

                    var button = card.find('button');
                    button.on('click', function (e) {
                        e.preventDefault();

                        var IdModel = $(this).data('idmodel');
                        var IdStation = $(this).data('idstation');

                        GetStationDetails(IdModel, IdStation);
                    });

                    $('#station-container').append(card);
                });

                offcanvasDetails.show();
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
function GetStationDetails(IdModel, IdStation) {
    $.ajax({
        type: "GET",
        url: "/NVIDIA/Dashboard/GetStationDetails",
        data: { IdModel: IdModel, IdStation: IdStation },
        dataType: "json",
        contentType: "application/json;charset=utf-8",
        success: function (response) {
            if (response.status) {
                var result = response.StationDetailsResults;

                $('#device_details-tbody').empty();
                $.each(result, function (k, deviceDetails) {
                    var device = deviceDetails.Device;
                    var row = $(`<tr>
                                    <td>${k + 1}</td>
                                    <td>${device.Id}</td>
                                    <td>${device.DeviceCode}</td>
                                    <td>${device.DeviceName}</td>
                                    <td>${device.Model ? (device.Model.ModelName != null || device.Model.ModelName != '') ? device.Model.ModelName : '' : ''}</td>
                                    <td>${device.Station ? (device.Station.StationName != null || device.Station.StationName != '') ? device.Station.StationName : '' : ''}</td>
                                    <td>${deviceDetails.Quantity}</td>
                                </tr>`);
                    $('#device_details-tbody').append(row);
                });

                $('#device_details-modal').modal('show');
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

