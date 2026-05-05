var _Dashboard_Analytics = function() {
    let _Dashbaord_Name = '* * * * *  A N A L Y T I C S    D A S H B O A R D  * * * * *';
    console.log(`%c ${_Dashbaord_Name}`, `color:#4dc187; font-size:20px;`);

    // Declare global chart variables
    let wss_chart,
        nus_chart,
        pos_chart,
        ms_chart,
        
        ys_chart,
        sbg_chart,
        // ws_chart,
        ystats_chart,
        st_chart;

    
    //  Weekly Sales = Options
    
    const weekly_sales_stats_options = {
        series: [{
            name: 'Product Sold',
            data: [31, 15, 36, 45, 71, 74, 66, 15]
        }],
        chart: {
            height: 80,
            width: 130,
            type: 'line',
            sparkline: {
                enabled: true
            },
            // animations: {
            //     enabled: false,
            // }
        },
        fill: {
            type: 'gradient',
            gradient: {
                shade: 'light',
                type: 'vertical',
                gradientToColors: [sessionStorage.getItem('_success_600')], // Target color
                stops: [0, 100] // 0% to 100% gradient transition
            }
        },
        dataLabels: {
            enabled: false
        },
        stroke: {
            curve: 'smooth',
            width: 2 // Makes the lines thinner
        },
        xaxis: {
            categories: [
                'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'
            ],
            title: {
                // text: 'Months',
                style: {
                    fontSize: '14px',
                    fontFamily: 'Montserrat, sans-serif'
                }
            },
            labels: {
                offsetY: 7 // Shift x-axis to the bottom by 7px
            }
        },
        tooltip: {
            enabled: true,
            custom: function({ series, seriesIndex, dataPointIndex, w }) {
                let xValue = w.globals.categoryLabels[dataPointIndex]; // Get X-axis value (Month)
                let tooltipHTML = `<div class="apex-chart-custom-tooltip bg-dark:1000">
                            <div class="acct-tooltip-header mb-2 bg-primary:500">
                                <h5 class="acct-tooltip-title mb-0 text-white text-center">${xValue}</h5>
                            </div>`;                    
                w.config.series.forEach((s, i) => {
                    let value = series[i][dataPointIndex]; // Get value
                    let color = w.config.colors[i]; // Get corresponding color

                    tooltipHTML += `<div class="acct-tooltip-content mb-1">
                            <div class="acct-tooltip-content-series d-flex align-items-center">
                                <span class="acct-tooltip-marker" style="background:${color}"></span>
                                <p class="mb-0"><span class="acct-tooltip-value text-dark:100">${value}</span></p>
                            </div>
                        </div>`;
                });

                tooltipHTML += `</div>`;
                return tooltipHTML;
            }
        },
        
    };
    
    //  New Users = Options
    
    const new_users_stats_options = {
        series: [{
            name: 'Total balance',
            data: [60, 55, 50, 71, 82, 54, 40, 56]
        }],
        chart: {
            height: 80,
            width: 130,
            type: 'line',
            sparkline: {
                enabled: true
            },
            // animations: {
            //     enabled: false,
            // }
        },
        fill: {
            type: 'gradient',
            gradient: {
                shade: 'light',
                type: 'vertical',
                gradientToColors: [sessionStorage.getItem('_secondary_600')], // Target color
                stops: [0, 100] // 0% to 100% gradient transition
            }
        },
        dataLabels: {
            enabled: false
        },
        stroke: {
            curve: 'smooth',
            width: 2 // Makes the lines thinner
        },
        xaxis: {
            categories: [
                'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'
            ],
            title: {
                // text: 'Months',
                style: {
                    fontSize: '14px',
                    fontFamily: 'Montserrat, sans-serif'
                }
            },
            labels: {
                offsetY: 7 // Shift x-axis to the bottom by 7px
            }
        },
        tooltip: {
            enabled: true,
            custom: function({ series, seriesIndex, dataPointIndex, w }) {
                let xValue = w.globals.categoryLabels[dataPointIndex]; // Get X-axis value (Month)
                let tooltipHTML = `<div class="apex-chart-custom-tooltip bg-dark:1000">
                            <div class="acct-tooltip-header mb-2 bg-primary:500">
                                <h5 class="acct-tooltip-title mb-0 text-white text-center">${xValue}</h5>
                            </div>`;                    
                w.config.series.forEach((s, i) => {
                    let value = series[i][dataPointIndex]; // Get value
                    let color = w.config.colors[i]; // Get corresponding color

                    tooltipHTML += `<div class="acct-tooltip-content mb-1">
                            <div class="acct-tooltip-content-series d-flex align-items-center">
                                <span class="acct-tooltip-marker" style="background:${color}"></span>
                                <p class="mb-0"><span class="acct-tooltip-value text-dark:100">${value}</span></p>
                            </div>
                        </div>`;
                });

                tooltipHTML += `</div>`;
                return tooltipHTML;
            }
        },
    };
    
    //  Purchase Orders = Options

    const purchase_orders_stats_options = {
        series: [{
            name: 'Sales Profit',
            data: [50, 90, 95, 88, 60, 25, 10, 50]
        }],
        chart: {
            height: 80,
            width: 130,
            type: 'line',
            sparkline: {
                enabled: true
            },
            // animations: {
            //     enabled: false,
            // }
        },
        // colors: [sessionStorage.getItem('_danger_300')],
        fill: {
            type: 'gradient',
            gradient: {
                shade: 'light',
                type: 'vertical',
                gradientToColors: [sessionStorage.getItem('_warning_600')], // Target color
                stops: [0, 100] // 0% to 100% gradient transition
            }
        },
        dataLabels: {
            enabled: false
        },
        stroke: {
            curve: 'smooth',
            width: 2 // Makes the lines thinner
        },
        xaxis: {
            categories: [
                'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'
            ],
            title: {
                // text: 'Months',
                style: {
                    fontSize: '14px',
                    fontFamily: 'Montserrat, sans-serif'
                }
            },
            labels: {
                offsetY: 7 // Shift x-axis to the bottom by 7px
            }
        },
        tooltip: {
            enabled: true,
            custom: function({ series, seriesIndex, dataPointIndex, w }) {
                let xValue = w.globals.categoryLabels[dataPointIndex]; // Get X-axis value (Month)
                let tooltipHTML = `<div class="apex-chart-custom-tooltip bg-dark:1000">
                            <div class="acct-tooltip-header mb-2 bg-primary:500">
                                <h5 class="acct-tooltip-title mb-0 text-white text-center">${xValue}</h5>
                            </div>`;                    
                w.config.series.forEach((s, i) => {
                    let value = series[i][dataPointIndex]; // Get value
                    let color = w.config.colors[i]; // Get corresponding color

                    tooltipHTML += `<div class="acct-tooltip-content mb-1">
                            <div class="acct-tooltip-content-series d-flex align-items-center">
                                <span class="acct-tooltip-marker" style="background:${color}"></span>
                                <p class="mb-0"><span class="acct-tooltip-value text-dark:100">${value}</span></p>
                            </div>
                        </div>`;
                });

                tooltipHTML += `</div>`;
                return tooltipHTML;
            }
        },
    };

    //  Message = Options

    const message_stats_options = {
        series: [{
            name: 'Sales Profit',
            data: [60, 150, 85, 98, 50, 35, 22, 40]
        }],
        chart: {
            height: 80,
            width: 130,
            type: 'line',
            sparkline: {
                enabled: true
            },
            // animations: {
            //     enabled: false,
            // }
        },
        colors: [sessionStorage.getItem('_danger_300')],
        fill: {
            type: 'gradient',
            gradient: {
                shade: 'light',
                type: 'vertical',
                gradientToColors: [sessionStorage.getItem('_danger_600')], // Target color
                stops: [0, 100] // 0% to 100% gradient transition
            }
        },
        dataLabels: {
            enabled: false
        },
        stroke: {
            curve: 'smooth',
            width: 2 // Makes the lines thinner
        },
        xaxis: {
            categories: [
                'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'
            ],
            title: {
                // text: 'Months',
                style: {
                    fontSize: '14px',
                    fontFamily: 'Montserrat, sans-serif'
                }
            },
            labels: {
                offsetY: 7 // Shift x-axis to the bottom by 7px
            }
        },
        tooltip: {
            enabled: true,
            custom: function({ series, seriesIndex, dataPointIndex, w }) {
                let xValue = w.globals.categoryLabels[dataPointIndex]; // Get X-axis value (Month)
                let tooltipHTML = `<div class="apex-chart-custom-tooltip bg-dark:1000">
                            <div class="acct-tooltip-header mb-2 bg-primary:500">
                                <h5 class="acct-tooltip-title mb-0 text-white text-center">${xValue}</h5>
                            </div>`;                    
                w.config.series.forEach((s, i) => {
                    let value = series[i][dataPointIndex]; // Get value
                    let color = w.config.colors[i]; // Get corresponding color

                    tooltipHTML += `<div class="acct-tooltip-content mb-1">
                            <div class="acct-tooltip-content-series d-flex align-items-center">
                                <span class="acct-tooltip-marker" style="background:${color}"></span>
                                <p class="mb-0"><span class="acct-tooltip-value text-dark:100">${value}</span></p>
                            </div>
                        </div>`;
                });

                tooltipHTML += `</div>`;
                return tooltipHTML;
            }
        }
    };
    
    // Website Visits = Options

    const website_visits_options = {
        chart: {
            type: "bar",
            height: 400,
            fontFamily: 'Montserrat, sans-serif',
            toolbar: { show: false },
            // animations: {
            //     enabled: false,
            // }
        },
        series: [
            { name: "Team A", data: [45, 30, 20, 35, 60, 60, 35, 20, 50] },
            { name: "Team B", data: [50, 65, 45, 60, 40, 30, 20, 65, 25] }
        ],
        xaxis: {
            categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"],
            labels: { style: { colors: "#666", fontSize: "12px" } }
        },
        yaxis: { labels: { style: { colors: "#999" } } },
        plotOptions: {
            bar: {
                horizontal: false,
                columnWidth: "50%",
                borderRadius: 5,
                borderRadiusApplication: 'end'
            }
        },
        dataLabels: {
            enabled: false
        },
        legend: {
            position: "right", // Aligns legend to the right
            floating: true,
            horizontalAlign: 'right',
            offsetX: 0,
            offsetY: 10,
            markers: {
                radius: 12, // Makes legend markers rounded
                shape: 'circle',
                size: 6,
                offsetX: -5,
                offsetY: 0
            },
            itemMargin: {
                vertical: 5
            },
            labels: {
                colors: '#1ad271'
            },
        },
        // colors: ["#1A806E", "#F6AE3F"], // Custom colors for Team A & B
        tooltip: {
            enabled: true,
            custom: function({ series, seriesIndex, dataPointIndex, w }) {
                // console.log(series);
                // console.log(seriesIndex);
                // console.log(dataPointIndex);
                // console.log(w);
                // console.log(w.config.series[seriesIndex].name);
                
                let xValue = w.config.series[seriesIndex].name; // Get X-axis value (Month)
                let tooltipHTML = `<div class="apex-chart-custom-tooltip bg-dark:1000">
                            <div class="acct-tooltip-header mb-2 bg-primary:500">
                                <h5 class="acct-tooltip-title mb-0 text-white text-center">${xValue}</h5>
                            </div>`;                    
                w.config.series.forEach((s, i) => {
                    let value = series[i][dataPointIndex]; // Get value
                    let color = w.config.colors[i]; // Get corresponding color

                    tooltipHTML += `<div class="acct-tooltip-content mb-1">
                            <div class="acct-tooltip-content-series d-flex align-items-center">
                                <span class="acct-tooltip-marker" style="background:${color}"></span>
                                <p class="mb-0"><span class="acct-tooltip-value text-dark:100">${value}</span></p>
                            </div>
                        </div>`;
                });

                tooltipHTML += `</div>`;
                return tooltipHTML;
            }
        }
        // grid: { borderColor: "#e5e5e5", strokeDashArray: 3 }
        
    };

    // Current Visits = Options

    const current_visits_options = {

        series: [45, 31.3, 18.8, 6.3],
        chart: {
            type: 'pie',
            fontFamily: 'Montserrat, sans-serif',
            // animations: {
            //     enabled: false,
            // }
        },
        legend: {
            show: false,
        },
        stroke: {
            show: true,
            curve: 'straight',
            lineCap: 'butt',
            colors: undefined,
            width: 2,
            dashArray: 0, 
        },
        labels: ['America', 'Asia', 'Europe', 'Africa'],
        tooltip: {
            enabled: true,
            custom: function({ series, seriesIndex, dataPointIndex, w }) {
                // console.log(series);
                // console.log(seriesIndex);
                // console.log(dataPointIndex);
                // console.log(w);
                // console.log(w.config.labels[seriesIndex]);
                
                let xValue = w.globals.categoryLabels[dataPointIndex]; // Get X-axis value (Month)
                let tooltipHTML = `<div class="apex-chart-custom-tooltip bg-dark:1000">
                `;                    
                w.config.series.forEach((s, i) => {
                    let value = series[i][dataPointIndex]; // Get value
                    let seriesVal = w.config.series[i];
                    let color = w.config.colors[i]; // Get corresponding color

                    tooltipHTML += `<div class="acct-tooltip-content mb-1">
                            <div class="acct-tooltip-content-series d-flex align-items-center">
                                <span class="acct-tooltip-marker" style="background:${color}"></span>
                                <p class="mb-0"><span class="acct-tooltip-value text-dark:100">${seriesVal}%</span></p>
                            </div>
                        </div>`;
                });

                tooltipHTML += `</div>`;
                return tooltipHTML;
            }
        }
        
    };
    
    // Weekly Stats = Options
    
    const weekly_stats_options = {
        series: [{
            name: 'Weekly Stats:',
            data: [15, 55, 28, 40, 15]
        }],
        chart: {
            height: 150,
            type: 'area',
            sparkline: {
                enabled: true
            },
            // animations: {
            //     enabled: false,
            // }
        },
        fill: {
            type: 'gradient',
            gradient: {
                shadeIntensity: 9,
                opacityFrom: 0.4,
                opacityTo: 0,
                stops: [0, 90, 100]
            }
        },
        dataLabels: {
            enabled: false
        },
        stroke: {
            curve: 'smooth',
            width: 2 // Makes the lines thinner
        },
        xaxis: {
            categories: [
                '1', '2', '3', '4', '5'
            ],
            title: {
                style: {
                    fontSize: '14px',
                    fontFamily: 'Montserrat, sans-serif'
                }
            },
            labels: {
                offsetY: 7 // Shift x-axis to the bottom by 7px
            }
        },
        tooltip: {
            enabled: true,
            custom: function({ series, seriesIndex, dataPointIndex, w }) {
                let xValue = w.globals.categoryLabels[dataPointIndex]; // Get X-axis value (Month)
                let tooltipHTML = `<div class="apex-chart-custom-tooltip bg-dark:1000">
                            <div class="acct-tooltip-header mb-2 bg-primary:500">
                                <h5 class="acct-tooltip-title mb-0 text-white text-center">${xValue}</h5>
                            </div>`;                    
                w.config.series.forEach((s, i) => {
                    let value = series[i][dataPointIndex]; // Get value
                    let color = w.config.colors[i]; // Get corresponding color

                    tooltipHTML += `<div class="acct-tooltip-content mb-1">
                            <div class="acct-tooltip-content-series d-flex align-items-center">
                                <span class="acct-tooltip-marker" style="background:${color}"></span>
                                <p class="mb-0"><span class="acct-tooltip-value text-dark:100">${value}</span></p>
                            </div>
                        </div>`;
                });

                tooltipHTML += `</div>`;
                return tooltipHTML;
            }
        }
    };
    
    // Yearly Stats = Options

    const ys_data = [30, 25, 60, 50, 20, 35];
    
    const yearly_stats_options = {
        chart: {
            type: 'bar',
            height: 270,
            toolbar: {
                show: false
            },
            // animations: {
            //     enabled: false,
            // }
            
        },
        series: [{
            name: 'Yearly Stats',
            data: ys_data
        }],
        xaxis: {
            categories: ['Apr', 'May', 'June', 'July', 'Aug', 'Sept'],
            labels: {
                style: {
                    colors: '#adb5bd',
                    fontSize: '12px'
                }
            },
            axisBorder: {
                show: false
            },
            axisTicks: {
                show: false
            }
        },
        yaxis: {
            show: false
        },
        plotOptions: {
            bar: {
                columnWidth: '50%',
                borderRadius: 8,
                distributed: true,
            }
        },
        dataLabels: {
            enabled: false
        },
        fill: {
            type: 'solid'
        },
        legend: {
            show: false
        },
        grid: {
            show: false
        },
        tooltip: {
            enabled: true,
            custom: function({ series, seriesIndex, dataPointIndex, w }) {
                
                let xValue = w.config.xaxis.categories[dataPointIndex]; // Get X-axis value (Month)
                let tooltipHTML = `<div class="apex-chart-custom-tooltip bg-dark:1000">
                            <div class="acct-tooltip-header mb-2 bg-primary:500">
                                <h5 class="acct-tooltip-title mb-0 text-white text-center">${xValue}</h5>
                            </div>`;                    
                w.config.series.forEach((s, i) => {
                    let value = series[i][dataPointIndex]; // Get value
                    let color = w.config.colors[i]; // Get corresponding color

                    tooltipHTML += `<div class="acct-tooltip-content mb-1">
                            <div class="acct-tooltip-content-series d-flex align-items-center">
                                <span class="acct-tooltip-marker" style="background:${color}"></span>
                                <p class="mb-0"><span class="acct-tooltip-value text-dark:100">${value}</span></p>
                            </div>
                        </div>`;
                });

                tooltipHTML += `</div>`;
                return tooltipHTML;
            }
        }
    };
    

    let total = 50;
    let open = 12;
    let inProgress = 18;
    let resolved = total - (open + inProgress);
    
    const support_tickets_options = {
        series: [open, inProgress, resolved],
        chart: {
            type: 'donut',
            height: 250,
            fontFamily: 'Montserrat, sans-serif',
            // animations: {
            //     enabled: false,
            // }
        },
        plotOptions: {
            pie: {
                donut: {
                    size: '75%', // Adjust this value to make slices thinner
                    labels: {
                        show: true,
                        total: {
                            show: true,
                            label: 'Total',
                            color: "#1ad271", // Apply color to Total text
                            formatter: function () {
                                return total; // Display total tickets in center
                            }
                        },
                        name: {
                            color: "#1ad271",
                        },
                        value: {
                            color: "#1ad271",
                        }
                    }
            
                },
            }
        },
        tooltip: {
            enabled: true,

            custom: function({ series, seriesIndex, dataPointIndex, w }) {

                let yValue = series[seriesIndex];
                let _getLabel = w.config.labels[seriesIndex];
                let _get_Color = w.config.colors[seriesIndex];
                
                let tooltipHTML = `<div class="apex-chart-custom-tooltip bg-dark:1000">
                            <div class="acct-tooltip-header mb-2 bg-primary:500">
                                <h5 class="acct-tooltip-title mb-0 text-white text-center">${_getLabel}</h5>
                            </div> 
                            
                            <div class="acct-tooltip-content mb-1">
                            <div class="acct-tooltip-content-series d-flex align-items-center">
                                <span class="acct-tooltip-marker" style="background:${_get_Color}"></span>
                                <p class="mb-0"><span class="acct-tooltip-value text-dark:100">${yValue}</span></p>
                            </div>
                        </div>`;

                tooltipHTML += `</div>`;
                return tooltipHTML;
            }
        },
        labels: ["Open", "In Progress", "Resolved"],
        legend: {
            // enabled: false, // Hide percentage labels
            position: 'bottom',
            // floating: true,
            offsetX: 0,
            offsetY: 0,
            markers: {
                radius: 12, // Makes legend markers rounded
                shape: 'circle',
                size: 6,
                offsetX: -5,
                offsetY: 0
            },
            labels: {
                colors: "#fff", // Apply colors to legend text
            }
        },
        dataLabels: {
            enabled: false // Hide percentage labels
        },
        stroke: {
            // show: false // Remove stroke from donut slices
            colors: "#1ad271",
            // width: 1,
        }
    };
    

    var inBuiltfunctionality = {

        _applyStoredTheme: function() {

            let _getSession_Layout_DarkMode = sessionStorage.getItem('_LayoutDark');
            _convertToParse_DarkModeSession = JSON.parse(_getSession_Layout_DarkMode);

            let ys_colors;

            console.log(_convertToParse_DarkModeSession)
            
            if (_convertToParse_DarkModeSession) {

                // Weekly Sales Stats
                weekly_sales_stats_options.colors = [sessionStorage.getItem('_success_900')]
                // New Users Stats
                new_users_stats_options.colors = [sessionStorage.getItem('_secondary_900')]
                // Purchase Orders Stats
                purchase_orders_stats_options.colors = [sessionStorage.getItem('_warning_900')]
                // Message Stats
                message_stats_options.colors = [sessionStorage.getItem('_danger_900')]
                
                // Yearly Sales
                website_visits_options.colors = [sessionStorage.getItem('_success_500'), sessionStorage.getItem('_danger_500')]
                website_visits_options.grid = { borderColor: sessionStorage.getItem('_dark_500'), strokeDashArray: 3 }
                website_visits_options.legend.labels.colors = sessionStorage.getItem('_dark_200');
                
                // Sales By Gender
                current_visits_options.colors = [sessionStorage.getItem('_primary_500'), sessionStorage.getItem('_success_500'), sessionStorage.getItem('_warning_500'), sessionStorage.getItem('_danger_500')]

                // Weekly Stats
                weekly_stats_options.colors = [sessionStorage.getItem('_info_400')]
                weekly_stats_options.fill.gradient.opacityFrom = 0.3;
                
                // Yearly Stats
                const ys_maxIndex = ys_data.indexOf(Math.max(...ys_data));
                ys_colors = ys_data.map((_, index) => index === ys_maxIndex ? sessionStorage.getItem("_primary_500") : sessionStorage.getItem('_dark_500'))

                // Support Tickets
                support_tickets_options.colors = [sessionStorage.getItem('_danger_500'), sessionStorage.getItem('_primary_500'), sessionStorage.getItem('_success_500')]
                support_tickets_options.legend.labels.colors = sessionStorage.getItem('_dark_200');
                // support_tickets_options.storke.colors = sessionStorage.getItem('_dark_200');
                support_tickets_options.stroke.colors = sessionStorage.getItem('_dark_500');

                support_tickets_options.plotOptions.pie.donut.labels.total.color = sessionStorage.getItem('_dark_50');
                support_tickets_options.plotOptions.pie.donut.labels.name.color = sessionStorage.getItem('_dark_50');
                support_tickets_options.plotOptions.pie.donut.labels.value.color = sessionStorage.getItem('_dark_50');

            } else {

                // Weekly Sales Stats
                weekly_sales_stats_options.colors = [sessionStorage.getItem('_success_300')]
                // New Users Stats
                new_users_stats_options.colors = [sessionStorage.getItem('_secondary_300')]
                // Purchase Orders Stats
                purchase_orders_stats_options.colors = [sessionStorage.getItem('_warning_300')]
                // Message Stats
                message_stats_options.colors = [sessionStorage.getItem('_danger_300')]
                                
                // Yearly Sales
                website_visits_options.colors = [sessionStorage.getItem('_success_400'), sessionStorage.getItem('_danger_400')]
                website_visits_options.grid = { borderColor: sessionStorage.getItem('_dark_50'), strokeDashArray: 3 }
                website_visits_options.legend.labels.colors = sessionStorage.getItem('_dark_600');

                // Sales By Gender
                current_visits_options.colors = [sessionStorage.getItem('_primary_400'), sessionStorage.getItem('_success_400'), sessionStorage.getItem('_warning_400'), sessionStorage.getItem('_danger_400')]

                // Weekly Stats
                weekly_stats_options.colors = [sessionStorage.getItem('_info_500')]
                weekly_stats_options.fill.gradient.opacityFrom = 0.4;

                // Yearly Stats
                const ys_maxIndex = ys_data.indexOf(Math.max(...ys_data));
                ys_colors = ys_data.map((_, index) => index === ys_maxIndex ? sessionStorage.getItem("_primary_500") : sessionStorage.getItem('_primary_100'))

                // Support Tickets
                support_tickets_options.colors = [sessionStorage.getItem('_danger_400'), sessionStorage.getItem('_primary_400'), sessionStorage.getItem('_success_400')]
                support_tickets_options.legend.labels.colors = sessionStorage.getItem('_dark_500');
                support_tickets_options.stroke.colors = sessionStorage.getItem('_dark_50');

                support_tickets_options.plotOptions.pie.donut.labels.total.color = sessionStorage.getItem('_dark_500');
                support_tickets_options.plotOptions.pie.donut.labels.name.color = sessionStorage.getItem('_dark_500');
                support_tickets_options.plotOptions.pie.donut.labels.value.color = sessionStorage.getItem('_dark_500');
                
            }
            
            yearly_stats_options.colors = ys_colors;
                        
        },

        _Re_RenderCharts: function() {
            // wss_chart, nus_chart, pos_chart, ms_chart,    ys_chart, sbg_chart, ws_chart, ystats_chart;

            if (wss_chart) wss_chart.destroy();
            if (nus_chart) nus_chart.destroy();
            if (pos_chart) pos_chart.destroy();
            if (ms_chart) ms_chart.destroy();
            
            if (ys_chart) ys_chart.destroy();
            if (sbg_chart) sbg_chart.destroy();
            // if (ws_chart) ws_chart.destroy();
            if (ystats_chart) ystats_chart.destroy();

            if (st_chart) st_chart.destroy();


            console.log(`%c Updating chart colors...`, `color:#eab764; font-size:14px;`);



            console.log(`%c Re-rendering charts...`, `color:#4db0ff; font-size:14px;`);
            
        
            // Re-initialize the charts
            inBuiltfunctionality._applyStoredTheme();
            
            inBuiltfunctionality._Weekly_Sales();
            inBuiltfunctionality._New_Users();
            inBuiltfunctionality._Purchase_Orders();
            inBuiltfunctionality._Message();


            inBuiltfunctionality._Yearly_Sales();
            inBuiltfunctionality._Sales_By_Gender();
            inBuiltfunctionality._Yearly_Stats();
            inBuiltfunctionality._Support_Ticket_Stats();
        },
        
        _Destroy_Charts: function() {
            let ThemeToggle = document.querySelector('.theme-toggle');
            ThemeToggle.addEventListener('click', function() {
                inBuiltfunctionality._Re_RenderCharts();
            })

            setTimeout(() => {
                
                // Select all checkboxes with the name "option"
                const ThemeToggleColorScheme = document.querySelectorAll('input[name="theme-colorScheme-style"]');
    
                ThemeToggleColorScheme.forEach(function(checkbox) {
                    
                    checkbox.addEventListener('click', function() {

                        // // Check which checkbox was clicked and whether it's checked
                        if (this.checked) {
                            if (this.value === 'theme-light') {
                                sessionStorage.setItem('_LayoutDark', false);
                            } else if (this.value === 'theme-dark') {
                                sessionStorage.setItem('_LayoutDark', true);
                            }
                        } else {
                            console.log(`${this.value} was unchecked`);
                        }

                        inBuiltfunctionality._Re_RenderCharts();
                    });
                });

            }, 1000);
            
        },
        
        _Weekly_Sales: function() {
            //  Weekly Sales = Render
            wss_chart = new ApexCharts(document.querySelector("#weekly_sales_stat"), weekly_sales_stats_options);
            wss_chart.render();
        },

        _New_Users: function() {
            //  New Users = Render
            nus_chart = new ApexCharts(document.querySelector("#new_users_stat"), new_users_stats_options);
            nus_chart.render();
        },

        _Purchase_Orders: function() {
            //  Purchase Orders = Render
            pos_chart = new ApexCharts(document.querySelector("#purchase_orders_stat"), purchase_orders_stats_options);
            pos_chart.render();
        },

        _Message: function() {
            //  Message = Render
            ms_chart = new ApexCharts(document.querySelector("#messages_stat"), message_stats_options);
            ms_chart.render();
        },

        _Yearly_Sales: function() {
            // Yearly Sales = Render
            ys_chart = new ApexCharts(document.querySelector("#website_visits"), website_visits_options);
            ys_chart.render();
        },

        _Sales_By_Gender: function() {
            // Sales By Gender = Render
            sbg_chart = new ApexCharts(document.querySelector("#current_visits"), current_visits_options);
            sbg_chart.render();
        },

        // _Weekly_Stats: function() {
        //      // Weekly Stats = Render
        //     ws_chart = new ApexCharts(document.querySelector("#weekly_stats"), weekly_stats_options);
        //     ws_chart.render();
        // },

        _Yearly_Stats: function() {
            // Yearly Stats = Render
            ystats_chart = new ApexCharts(document.querySelector("#total_earning"), yearly_stats_options);
            ystats_chart.render();
        },

        _Support_Ticket_Stats: function() {
            // Yearly Stats = Render

            st_chart = new ApexCharts(document.querySelector("#ticketsChart"), support_tickets_options);
            st_chart.render();

            // console.log(st_chart);
        },

        _Support_Ticket_StatsUI: function() {
            document.getElementById("totalTickets").textContent = total;
            document.getElementById("openTickets").textContent = open;
            document.getElementById("inProgressTickets").textContent = inProgress;
            document.getElementById("resolvedTickets").textContent = resolved;
        }
        
    }

    return {
        init: function() {
            /*
                In Built Functionality fn
            */
           
            inBuiltfunctionality._applyStoredTheme();
            inBuiltfunctionality._Destroy_Charts();

            inBuiltfunctionality._Weekly_Sales();
            inBuiltfunctionality._New_Users();
            inBuiltfunctionality._Purchase_Orders();
            inBuiltfunctionality._Message();


            inBuiltfunctionality._Yearly_Sales();
            inBuiltfunctionality._Sales_By_Gender();
            // inBuiltfunctionality._Weekly_Stats();
            inBuiltfunctionality._Yearly_Stats();
            inBuiltfunctionality._Support_Ticket_Stats();

            inBuiltfunctionality._Support_Ticket_StatsUI();


            
        }
    }

}();

window.addEventListener('DOMContentLoaded', function() {
    _Dashboard_Analytics.init();
})


// document.addEventListener("DOMContentLoaded", function () {
//     let total = 50;
//     let open = 12;
//     let inProgress = 18;
//     let resolved = total - (open + inProgress);

//     // Update UI values
//     document.getElementById("totalTickets").textContent = total;
//     document.getElementById("openTickets").textContent = open;
//     document.getElementById("inProgressTickets").textContent = inProgress;
//     document.getElementById("resolvedTickets").textContent = resolved;

//     // Initialize ApexChart
    

    
// });