/** @odoo-module */

import { registry } from "@web/core/registry"
import { ChartRenderer } from "./chart_renderer/chart_renderer"
import { ApexRenderer } from "./chart_renderer/apexchart_renderer"
import { KpiCard } from "./kpi_card/kpi_card"
import { useService } from "@web/core/utils/hooks"
const { Component, useState, onWillStart} = owl
const { DateTime } = luxon;


export class OwlCustomDashboard extends Component {

     async getMonthlySales(){
        this.state.monthlySales = {}
    }

    // partner orders
    async getPartnerOrders(){
        this.state.partnerOrders = {}
    }
    // top sales people
    async getTopSalesPeople(){
        this.state.topSalesPeople = {}
    }
    async getTopProducts(){
        this.state.topProducts = []
    }
    setup() {
        this.state = useState({
            members: [{'id': 1, 'name': 'abdul'}, {'id': 2, 'name': 'ameer'}],
            selectedEmployee: "Select Employee",
            quotations: {value:10},
            orders: {value:10,},
            period:90,
        });
        this.selectEmployee = this.selectEmployee.bind(this);
        this.actionService = useService("action")
        this.orm = useService("orm")
        this.user = useService("user");
        onWillStart(async ()=>{
            this.getDates()
            await this.getQuotations()
            await this.getOrders()
            await this.getTeamMembers()
//            await this.getSalesUsers()
            await this.getMonthlySales()
            await this.getPartnerOrders()
            await this.getTopProducts()
            await this.getTopSalesPeople()
        })
    }

        async onChangePeriod(){
        this.getDates()
        await this.getQuotations()
        await this.getOrders()
        await this.getMonthlySales()
        await this.getPartnerOrders()
         await this.getTopProducts()
         await this.getTopSalesPeople()
    }

    getDates(){
        this.state.current_date = DateTime.now().toISODate();
        this.state.previous_date = DateTime.now().minus({ days: this.state.period }).toISODate();
    }
    async getQuotations(){
        let domain = [['state', 'in', ['sent', 'draft']]]
        if (this.state.period > 0){
            domain.push(['date_order', '>', this.state.previous_date], ['date_order', '<=', this.state.current_date]);
        }
        const data = await this.orm.searchCount("sale.order", domain)
        this.state.quotations.value = data
    }
    //...
async viewQuotations(){
    let domain = [['state', 'in', ['sent', 'draft']]]
    if (this.state.period > 0){
        domain.push(['date_order', '>', this.state.previous_date], ['date_order', '<=', this.state.current_date]);
    }

    // get the id of the list view
    let list_view = await this.orm.searchRead("ir.model.data", [['name', '=', 'view_quotation_tree_with_onboarding']], ['res_id'])

    this.actionService.doAction({
        type: "ir.actions.act_window",
        name: "Quotations",
        res_model: "sale.order",
        domain,
        views: [
            [list_view.length > 0 ? list_view[0].res_id : false, "list"], // use list_view id or false
            [false, "form"],
        ]
    })
}
//...
    async viewOrders(){
    let domain = [['state', 'in', ['sale', 'done']]]
    if (this.state.period > 0){
        domain.push(['date_order', '>', this.state.previous_date], ['date_order', '<=', this.state.current_date]);
    }

    this.actionService.doAction({
        type: "ir.actions.act_window",
        name: "Quotations",
        res_model: "sale.order",
        domain,
//        context: {group_by: ['date_order']},
        views: [
            [false, "list"],
            [false, "form"],
        ]
    })
}
    async getOrders(){
        let domain = [['state', 'in', ['sale', 'done']]]
        if (this.state.period > 0){
            domain.push(['date_order', '>', this.state.previous_date], ['date_order', '<=', this.state.current_date]);
        }
        const data = await this.orm.searchCount("sale.order", domain)
        //revenues
        const current_revenue = await this.orm.readGroup("sale.order", domain, ["amount_total:sum"], [])

        //average
        const current_average = await this.orm.readGroup("sale.order", domain, ["amount_total:avg"], [])


        this.state.orders = {
            value: data,
            revenue: `${(current_revenue[0].amount_total/1000).toFixed(2)}K`,
            average: `${(current_average[0].amount_total/1000).toFixed(2)}K`,

        }
    }
    async viewRevenues(){
    let domain = [['state', 'in', ['sale', 'done']]]
    if (this.state.period > 0){
        domain.push(['date_order', '>', this.state.previous_date], ['date_order', '<=', this.state.current_date]);
    }

    this.actionService.doAction({
        type: "ir.actions.act_window",
        name: "Quotations",
        res_model: "sale.order",
        domain,
        context: {group_by: ['date_order']},
        views: [
            [false, "pivot"],
            [false, "form"],
        ]
    })
}

    async getTeamMembers(){
        debugger;
        const employees = await this.orm.searchRead("hr.employee", [["user_id", "=", this.user.userId]], ["id"]);
                    if (employees.length > 0) {
                const managerId = employees[0].id;

                // Fetch the team members of the logged-in manager
                const teamMembers = await this.orm.searchRead("hr.employee", [["parent_id", "=", managerId]], ["id", "name"]);

                this.state.members = teamMembers;  // Store team members in state
            }

    }
    selectEmployee(event, member) {
        event.preventDefault();
        this.state.selectedEmployee = member['name'];
    }

    //...
    async getMonthlySales(){
        let domain = [['state', 'in', ['draft','sent','sale', 'done']]]
        if (this.state.period > 0){
            domain.push(['date', '>', this.state.previous_date], ['date', '<=', this.state.current_date]);
        }

        const data = await this.orm.readGroup("sale.report", domain, ['date', 'state', 'price_total'], ['date', 'state'], { orderby: "date", lazy: false })

        const categories = [... new Set(data.map(d => d.date))]
        const quotations = data.filter(d => d.state == 'draft' || d.state == 'sent')
        const orders = data.filter(d => ['sale','done'].includes(d.state))

        this.state.monthlySales = {
                categories: categories,
                  series: [
                  {
                    name: 'Quotations',
                    data: categories.map(l=>quotations.filter(q=>l==q.date).map(j=>j.price_total).reduce((a,c)=>a+c,0)),

                  },{
                    name: 'Orders',
                    data: categories.map(l=>orders.filter(q=>l==q.date).map(j=>j.price_total).reduce((a,c)=>a+c,0)),
                }],

        }
    }
    //...
async getTopSalesPeople(){
    let domain = [['state', 'in', ['draft','sent','sale', 'done']]]
    if (this.state.period > 0){
        domain.push(['date', '>', this.state.previous_date], ['date', '<=', this.state.current_date]);
    }

    const data = await this.orm.readGroup("sale.report", domain,
        ['user_id', 'price_total'], ['user_id'],
        { limit: 5, orderby: "price_total desc" })

    debugger;
    this.state.topSalesPeople = {
            categories: data.map(d => d.user_id[1]),

              series: data.map(d => d.price_total),


    }
}
//...

    //...
async getPartnerOrders(){
        let domain = [['state', 'in', ['draft','sent','sale', 'done']]]
        if (this.state.period > 0){
            domain.push(['date', '>', this.state.previous_date], ['date', '<=', this.state.current_date]);
        }

        const data = await this.orm.readGroup("sale.report", domain, ['partner_id', 'price_total', 'product_uom_qty'], ['partner_id'], { orderby: "partner_id", lazy: false })

        this.state.partnerOrders = {

                categories: data.map(d => d.partner_id[1]),
                  series: [
                  {
                    name: 'Total Amount',
                    type: 'column',
                    data: data.map(d => d.price_total),
                  },{
                    name: 'Ordered Qty',
                    type: 'line',
                    data: data.map(d => d.product_uom_qty),
                }],
        }
    }

    async getSalesUsers() {
    // 1. Get the group ID from the external ID
    const [[group_id]] = await this.orm.call("ir.model.data", "xmlid_to_res_id", [
        "sales_team.group_sale_salesman"
    ]);

    // 2. Search users who are in this group
    const user_ids = await this.orm.search("res.users", [
        ["groups_id", "in", [group_id]]
    ]);

    // 3. Optionally read user details
    const users = await this.orm.read("res.users", user_ids, ["id", "name", "login", "email"]);

    console.log("Sales Users:", users);
//    this.state.sales_users = users;  // Save to state if needed
}

    async getTopProducts() {
        debugger;
        let domain = [['state', 'in', ['sale', 'done']]]
        if (this.state.period > 0){
            domain.push(['date', '>', this.state.previous_date], ['date', '<=', this.state.current_date]);
        }

        const data = await this.orm.readGroup("sale.report", domain, ['product_id', 'price_total'], ['product_id'], { orderby: "price_total desc", lazy: false })
        this.state.topProducts  = data
    }

}
OwlCustomDashboard.template = "custom_dashboard.OwlCustomDashboard"
OwlCustomDashboard.components = {KpiCard, ChartRenderer, ApexRenderer }

registry.category("actions").add("custom_dashboard.custom_dashboard", OwlCustomDashboard)