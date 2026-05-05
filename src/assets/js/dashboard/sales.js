var _Dashboard_Sales = function() {
    let _Dashbaord_Name = '* * * * *  S A L E S    D A S H B O A R D  * * * * *';
    console.log(`%c ${_Dashbaord_Name}`, `color:#4dc187; font-size:15px;`);

    // Declare global chart variables
    let pss_chart, tbs_chart, sps_chart, ys_chart, sbg_chart, ws_chart, ystats_chart;
    
    //  Product Sold = Options
    
    const product_sold_stats_options = {
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
    
    //  Total Balance = Options
    
    const total_balance_stats_options = {
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
        },
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
    
    //  Sales Profit = Options

    const sales_profit_stats_options = {
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
        },
    };
    
    // Yearly Sales = Options

    const yearly_sales_options = {
        chart: {
            type: 'area',
            height: 350,
            toolbar: {
                show: false
            },
            fontFamily: 'Montserrat, sans-serif'
        },
        dataLabels: {
            enabled: false
        },
        stroke: {
            curve: 'smooth',
            width: 2 // Makes the lines thinner
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
        series: [
            {
                name: 'Total Income',
                data: [50, 40, 45, 60, 70, 80, 90, 95, 80, 60, 50, 40]
            },
            {
                name: 'Total Expenses',
                data: [30, 35, 60, 50, 60, 95, 85, 75, 85, 65, 55, 45]
            }
        ],
        xaxis: {
            categories: [
                'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
            ],
            title: {
                style: {
                    fontSize: '14px',
                    fontFamily: 'Montserrat, sans-serif',
                }
            },
            labels: {
                offsetY: 6, // Shift x-axis to the bottom by 7px
            }
        },
        yaxis: {
            max: 220,
            title: {
                text: '',
                style: {
                    fontSize: '14px',
                    fontFamily: 'Montserrat, sans-serif',
                }
            },
            labels: {
                style: {
                    fontFamily: 'Montserrat, sans-serif'
                },
                formatter: function (value) {
                    return value + "k";
                },
                offsetX: -16 // Shift y-axis to the left by 20px
            },
        },
        legend: {
            show: false,
            position: 'top',
            horizontalAlign: 'center',
            labels: {
                useSeriesColors: true,
                style: {
                    fontFamily: 'Montserrat, sans-serif'
                }
            }
        },
        tooltip: {
            enabled: true,
            custom: function({ series, seriesIndex, dataPointIndex, w }) {
                let xValue = w.globals.categoryLabels[dataPointIndex]; // Get X-axis value (Month)
                let tooltipHTML = `<div class="apex-chart-custom-tooltip bg-dark:1000">
                            <div class="acct-tooltip-header mb-3 bg-primary:500">
                                <h5 class="acct-tooltip-title mb-0 text-white text-center">${xValue}</h5>
                            </div>`;                    
                w.config.series.forEach((s, i) => {
                    let value = series[i][dataPointIndex]; // Get value
                    let color = w.config.colors[i]; // Get corresponding color

                    tooltipHTML += `<div class="acct-tooltip-content mb-1">
                            <div class="acct-tooltip-content-series d-flex align-items-center">
                                <span class="acct-tooltip-marker" style="background:${color}"></span>
                                <p class="mb-0"><span class="acct-tooltip-text text-white">${s.name} :</span> <span class="acct-tooltip-value text-dark:100">${value}k</span></p>
                            </div>
                        </div>`;
                });

                tooltipHTML += `</div>`;
                return tooltipHTML;
            }
        },
        
        
    };

    // Sales By Gender = Options

    const sales_by_gender_options = {
        chart: {
            type: 'radialBar',
            height: 350,
            fontFamily: 'Montserrat, sans-serif'
        },
        plotOptions: {
            radialBar: {
                hollow: {
                    margin: 5,
                    size: '48%',
                    background: 'transparent',
            
                },
                track: {
                    show: true,
                    strokeWidth: '27%',
                    background: '#1ad271',
                },
                
                dataLabels: {
                    name: {
                        fontSize: '22px',
                    },
                    value: {
                        fontSize: '16px',
                    },
                    total: {
                        show: true,
                        label: 'Total',
                        formatter: function (w) {
                            // By default this function returns the average of all series. The below is just an example to show the use of custom formatter function
                            return 249
                        }
                    }
                },
        
            },
        },
        stroke: {
            lineCap: 'round'
        },
        series: [71, 63, 77],
        labels: ['Mens', 'Womens', 'Kids'],
        legend: {
            show: false,
            floating: true,
            position: 'left',
            offsetX: 70,
            offsetY: 3
        },
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
            height: 300,
            toolbar: {
                show: false
            }
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
    

    var inBuiltfunctionality = {

        _applyStoredTheme: function() {

            let _getSession_Layout_DarkMode = sessionStorage.getItem('_LayoutDark');
            _convertToParse_DarkModeSession = JSON.parse(_getSession_Layout_DarkMode);

            let ys_colors;
            
            if (_convertToParse_DarkModeSession) {

                // Product Sold Stats
                product_sold_stats_options.colors = [sessionStorage.getItem('_success_900')]
                // Total Balance Stats
                total_balance_stats_options.colors = [sessionStorage.getItem('_warning_900')]
                // Sales Profit Stats
                sales_profit_stats_options.colors = [sessionStorage.getItem('_danger_900')]
                
                // Yearly Sales
                yearly_sales_options.colors = [sessionStorage.getItem('_success_400'), sessionStorage.getItem('_danger_400')]
                yearly_sales_options.grid = { borderColor: sessionStorage.getItem('_dark_600') }
                yearly_sales_options.fill.gradient.opacityFrom = 0.3;
                
                // Sales By Gender
                sales_by_gender_options.colors = [sessionStorage.getItem('_success_400'), sessionStorage.getItem('_warning_400'), sessionStorage.getItem('_danger_400')]
                sales_by_gender_options.plotOptions.radialBar.track.background = sessionStorage.getItem('_dark_600')
                sales_by_gender_options.plotOptions.radialBar.dataLabels.value.color = sessionStorage.getItem('_dark_50')
                sales_by_gender_options.plotOptions.radialBar.dataLabels.total.color = sessionStorage.getItem('_dark_50')

                // Weekly Stats
                weekly_stats_options.colors = [sessionStorage.getItem('_info_400')]
                weekly_stats_options.fill.gradient.opacityFrom = 0.3;
                
                // Yearly Stats
                const ys_maxIndex = ys_data.indexOf(Math.max(...ys_data));
                ys_colors = ys_data.map((_, index) => index === ys_maxIndex ? sessionStorage.getItem("_primary_500") : sessionStorage.getItem('_dark_500'))
                
                
            } else {

                // Product Sold Stats
                product_sold_stats_options.colors = [sessionStorage.getItem('_success_300')]
                // Total Balance Stats
                total_balance_stats_options.colors = [sessionStorage.getItem('_warning_300')]
                // Sales Profit Stats
                sales_profit_stats_options.colors = [sessionStorage.getItem('_danger_300')]
                                
                // Yearly Sales
                yearly_sales_options.colors = [sessionStorage.getItem('_success_400'), sessionStorage.getItem('_danger_400')]
                yearly_sales_options.grid = { borderColor: sessionStorage.getItem('_dark_50') }
                yearly_sales_options.fill.gradient.opacityFrom = 0.4;

                // Sales By Gender
                sales_by_gender_options.colors = [sessionStorage.getItem('_success_500'), sessionStorage.getItem('_warning_500'), sessionStorage.getItem('_danger_500')]
                sales_by_gender_options.plotOptions.radialBar.track.background = sessionStorage.getItem('_dark_50')
                sales_by_gender_options.plotOptions.radialBar.dataLabels.value.color = sessionStorage.getItem('_dark_600')
                sales_by_gender_options.plotOptions.radialBar.dataLabels.total.color = sessionStorage.getItem('_dark_600')

                // Weekly Stats
                weekly_stats_options.colors = [sessionStorage.getItem('_info_500')]
                weekly_stats_options.fill.gradient.opacityFrom = 0.4;

                // Yearly Stats
                const ys_maxIndex = ys_data.indexOf(Math.max(...ys_data));
                ys_colors = ys_data.map((_, index) => index === ys_maxIndex ? sessionStorage.getItem("_primary_500") : sessionStorage.getItem('_primary_100'))
            }
            
            yearly_stats_options.colors = ys_colors;
                        
        },

        _Re_RenderCharts: function() {
            if (pss_chart) pss_chart.destroy()
            if (tbs_chart) tbs_chart.destroy()
            if (sps_chart) sps_chart.destroy()

            if (ys_chart) ys_chart.destroy()
            if (sbg_chart) sbg_chart.destroy()
            if (ws_chart) ws_chart.destroy()
            if (ystats_chart) ystats_chart.destroy()


            console.log(`%c Updating chart colors...`, `color:#eab764; font-size:14px;`);



            console.log(`%c Re-rendering charts...`, `color:#4db0ff; font-size:14px;`);
            
        
            // Re-initialize the charts
            inBuiltfunctionality._applyStoredTheme();
            
            inBuiltfunctionality._Product_Sold();
            inBuiltfunctionality._Total_Balance();
            inBuiltfunctionality._Sales_Profit();
            inBuiltfunctionality._Yearly_Sales();
            inBuiltfunctionality._Sales_By_Gender();
            inBuiltfunctionality._Weekly_Stats();
            inBuiltfunctionality._Yearly_Stats();
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
        

        _Product_Sold: function() {
            //  Product Sold = Render
            pss_chart = new ApexCharts(document.querySelector("#product_sold_stat"), product_sold_stats_options);
            pss_chart.render();
        },

        _Total_Balance: function() {
            //  Total Balance = Render
            tbs_chart = new ApexCharts(document.querySelector("#total_balance_stat"), total_balance_stats_options);
            tbs_chart.render();
        },

        _Sales_Profit: function() {
            //  Sales Profit = Render
            sps_chart = new ApexCharts(document.querySelector("#sales_profit_stat"), sales_profit_stats_options);
            sps_chart.render();
        },

        _Yearly_Sales: function() {
            // Yearly Sales = Render
            ys_chart = new ApexCharts(document.querySelector("#yearly_sales"), yearly_sales_options);
            ys_chart.render();
        },

        _Sales_By_Gender: function() {
            // Sales By Gender = Render
            sbg_chart = new ApexCharts(document.querySelector("#sale_by_gender"), sales_by_gender_options);
            sbg_chart.render();
        },

        _Weekly_Stats: function() {
             // Weekly Stats = Render
            ws_chart = new ApexCharts(document.querySelector("#weekly_stats"), weekly_stats_options);
            ws_chart.render();
        },

        _Yearly_Stats: function() {
            // Yearly Stats = Render
            ystats_chart = new ApexCharts(document.querySelector("#yearly_stats"), yearly_stats_options);
            ystats_chart.render();
        }
        
    }

    return {
        init: function() {
            /*
                In Built Functionality fn
            */
           
            inBuiltfunctionality._applyStoredTheme();
            inBuiltfunctionality._Destroy_Charts();

            inBuiltfunctionality._Product_Sold();
            inBuiltfunctionality._Total_Balance();
            inBuiltfunctionality._Sales_Profit();
            inBuiltfunctionality._Yearly_Sales();
            inBuiltfunctionality._Sales_By_Gender();
            inBuiltfunctionality._Weekly_Stats();
            inBuiltfunctionality._Yearly_Stats();
        }
    }

}();

window.addEventListener('DOMContentLoaded', function() {
    _Dashboard_Sales.init();
})