import { Routes } from "@angular/router";
import { DashboardComponent } from "./dashboard.component";
import { DashboardIndexComponent } from "./index/index.component";
import { MarketingChannelsComponent } from "./create-campaign/marketing-channels.component";
import { BillingComponent } from "./billing/billing.component";
import { ManageCampaignContainerComponent } from "./manage-campaign/manage-campaign-container.component";
import { ManageCampaignDetailContainerComponent } from "./manage-campaign/details/manage-campaign-detail-container.component";



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
                component: ManageCampaignContainerComponent,
                title: "Manage Marketing Campaigns",
            },         
            {
                path: 'campaign-detail/:id',
                component: ManageCampaignDetailContainerComponent,
                title: "Campaign Details",
            },         
            {
                path: 'billing',
                component: BillingComponent,
                title: "Payment and billing",
            },        
        ]
    },
]
