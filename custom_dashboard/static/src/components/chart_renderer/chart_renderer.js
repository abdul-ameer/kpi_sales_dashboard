/** @odoo-module */

import { registry } from "@web/core/registry"
import { loadJS } from "@web/core/assets"
const { Component, onWillStart, useRef, onMounted } = owl

export class ChartRenderer extends Component {
    setup(){
        this.chartRef = useRef("chart")
        onWillStart(async ()=>{
            await loadJS("https://cdn.jsdelivr.net/npm/chart.js@4.4.7/dist/chart.umd.min.js")
        })

        onMounted(()=>this.renderChart())
    }

    renderChart(){
        new Chart(this.chartRef.el,
        {
          type: this.props.type,
          data: {
            labels: [
                'Red',
                'Blue',
                'Yellow'
              ],
              datasets: [
              {
                label: 'My First Dataset',
                data: [300, 50, 100],
                backgroundColor : ['#091057', '#EC8305', '#DBD3D3'],
                hoverOffset: 4
              },{
                label: 'My Second Dataset',
                data: [100, 70, 150],
                backgroundColor : ['#091057', '#EC8305', '#DBD3D3'],
                hoverOffset: 4
             }]
          },
          options: {
            responsive: true,
            plugins: {
              legend: {
                position: 'bottom',
              },
              title: {
                display: true,
                text: this.props.title,
                position: 'bottom',
              }
            }
          },
        }
      );
    }
}

ChartRenderer.template = "custom_dashboard.ChartRenderer"
