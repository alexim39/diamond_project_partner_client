import { Routes } from "@angular/router";
import { DashboardComponent } from "./dashboard.component";
import { DashboardIndexComponent } from "./index/index.component";
import { MarketingChannelsComponent } from "./marketing-channels/marketing-channels.component";
import { BillingComponent } from "./billing/billing.component";



export const dashboardRoutes: Routes = [
    {
        /* path: '',
        redirectTo: 'partner',
        pathMatch: 'full' */
        path: '',
        component: DashboardComponent,
        children: [
            {
                path: '',
                component: DashboardIndexComponent,
               /*  children: [
                    {
                        path: 'marketing-channels',
                        component: MarketingChannelsComponent,
                    }
                ] */
            }, 
            {
                path: 'marketing-channels',
                component: MarketingChannelsComponent,
                title: "Choose marketing campaign",
            },         
            {
                path: 'billing',
                component: BillingComponent,
                title: "Payment and billing",
            },        
        ]
    },
]
