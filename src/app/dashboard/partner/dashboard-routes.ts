import { Routes } from "@angular/router";
import { DashboardComponent } from "./dashboard.component";
import { DashboardIndexComponent } from "./index/index.component";
import { MarketingChannelsComponent } from "./create-campaign/marketing-channels.component";
import { ManageCampaignContainerComponent } from "./manage-campaign/manage-campaign-container.component";
import { ManageCampaignDetailContainerComponent } from "./manage-campaign/details/manage-campaign-detail-container.component";
import { MonthlyPurchaseContainerComponent } from "./monthly-purchase/monthly-purchase-container.component";
import { InvitationContainerComponent } from "./profile/invitation/invitation-container.component";
import { ProfileMrgContainerComponent } from "./profile/profile-mgr/profile-mgr-container.component";
import { TeamMembersContainerComponent } from "./profile/team-members/team-members-container.component";
import { AddMembersContainerComponent } from "./profile/team-members/add-members/add-members-container";
import { BillingContainerComponent } from "./billing/billing-container.component";
import { CreateContactsContainerComponent } from "./contacts/create/create-contacts-container.component";
import { ManageContactsContainerComponent } from "./contacts/manage/manage-contacts-container.component";
import { ProspectListContainerComponent } from "./analytics/prospect-list/prospect-list-container.component";



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
                component: BillingContainerComponent,
                title: "Payment and billing",
            },        
            {
                path: 'monthly-purchase',
                component: MonthlyPurchaseContainerComponent,
                title: "Monthly Product Purchases",
            },        
            {
                path: 'profile-mgr',
                component: ProfileMrgContainerComponent,
                title: "Partner Profile Manager",
            },        
            {
                path: 'prospect-invite',
                component: InvitationContainerComponent,
                title: "Prospect Invitation Manager",
            },        
            {
                path: 'team-members',
                component: TeamMembersContainerComponent,
                title: "Team Members Manger",
            },        
            {
                path: 'add-members',
                component: AddMembersContainerComponent,
                title: "Add Team Members",
            },        
            {
                path: 'create-contacts',
                component: CreateContactsContainerComponent,
                title: "Create Contacts List",
            },        
            {
                path: 'manage-contacts',
                component: ManageContactsContainerComponent,
                title: "Manage Contacts List",
            },        
            {
                path: 'prospect-list',
                component: ProspectListContainerComponent,
                title: "Manage Prospect List",
            },        
        ]
    },
]
