/** @odoo-module */

import { registry } from "@web/core/registry"
import { loadJS } from "@web/core/assets"
const { Component, onWillStart, useRef, onMounted, useEffect, onWillUnmount } = owl

export class ApexRenderer extends Component {
    setup(){
        this.chartRef = useRef("apex_chart")
        onWillStart(async ()=>{
            await loadJS("https://cdn.jsdelivr.net/npm/apexcharts@4.4.0/dist/apexcharts.min.js")
        })
//        onMounted(()=>this.renderApexChart())
        useEffect(() => {
            this.renderApexChart()
        }, () => [this.props.config])

        onWillUnmount(() => {
            if (this.chart) {
                this.chart.destroy()
            }
        })
    }

    renderApexChart(){

        if (this.chart) {
            this.chart.destroy()
        }

            // Build dynamic y-axis based on series names
            const yaxis = this.props.config.series.map((s, index) => ({
                title: {
                    text: s.name
                },
                opposite: index === 1
            }));
        var options = {
              chart: {
                type:  this.props.type,
                toolbar: {
                    show: false
                },

              },
              series: this.props.config.series,
              labels: this.props.config.categories,
              xaxis: {
                categories: this.props.config.categories
              },
              yaxis: yaxis,

            dataLabels: {
                enabled: this.props.type === 'donut'
            },
              colors: ['#091057', '#EC8305', '#DBD3D3'],
            }
            this.chart = new ApexCharts(this.chartRef.el, options)
            this.chart.render()

    }
}

ApexRenderer.template = "custom_dashboard.ApexChartRenderer"
