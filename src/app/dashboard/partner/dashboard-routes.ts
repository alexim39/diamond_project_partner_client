import { Routes } from "@angular/router";
import { DashboardComponent } from "./dashboard.component";
import { DashboardIndexComponent } from "./index/index.component";
import { MarketingChannelsComponent } from "./create-campaign/marketing-channels.component";
import { BillingComponent } from "./billing/billing.component";
import { ManageCampaignComponent } from "./manage-campaign/manage-campaign.component";



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
            }, 
            {
                path: 'create-campaign',
                component: MarketingChannelsComponent,
                title: "Choose and Create Marketing Campaign",
            },         
            {
                path: 'manage-campaign',
                component: ManageCampaignComponent,
                title: "Manage Marketing Campaigns",
            },         
            {
                path: 'billing',
                component: BillingComponent,
                title: "Payment and billing",
            },        
        ]
    },
]
