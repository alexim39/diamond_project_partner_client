import { Routes } from "@angular/router";
import { DashboardComponent } from "./dashboard.component";
import { DashboardIndexComponent } from "./index/index.component";
import { MarketingChannelsComponent } from "./campaigns/create-campaign/marketing-channels.component";
import { ManageCampaignContainerComponent } from "./campaigns/manage-campaign/manage-campaign-container.component";
import { ManageCampaignDetailContainerComponent } from "./campaigns/manage-campaign/details/manage-campaign-detail-container.component";
import { MonthlyPurchaseContainerComponent } from "./monthly-purchase/monthly-purchase-container.component";
import { InvitationContainerComponent } from "./profile/invitation/invitation-container.component";
import { ProfileMrgContainerComponent } from "./profile/profile-mgr/profile-mgr-container.component";
import { TeamMembersContainerComponent } from "./profile/team-members/team-members-container.component";
import { AddMembersContainerComponent } from "./profile/team-members/add-members/add-members-container";
import { BillingContainerComponent } from "./billing/billing-container.component";
import { CreateContactsContainerComponent } from "./contacts/create/create-contacts-container.component";
import { ManageContactsContainerComponent } from "./contacts/manage/manage-contacts-container.component";
import { ProspectListContainerComponent } from "./analytics/prospect-list/prospect-list-container.component";
import { ManageContactsDetailContainerComponent } from "./contacts/manage/details/manage-contacts-detail-container.component";
import { EditContactsContainerComponent } from "./contacts/edit/edit-contacts-container.component";
import { CellMettingContainerComponent } from "./mentorship/cell-meeting/cell-meeting-container.component";
import { smsContainerComponent } from "./sms/sms-container.component";
import { smsLogContainerComponent } from "./sms/sms-log/sms-log-container.component";
import { EmailContainerComponent } from "./email/email-container.component";
import { EmailLogContainerComponent } from "./email/email-log/email-log-container.component";



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
                path: 'edit-contacts/:id',
                component: EditContactsContainerComponent,
                title: "Edit Contacts Details",
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
            {
                path: 'prospect-detail/:id',
                component: ManageContactsDetailContainerComponent,
                title: "Campaign Details",
            },        
            {
                path: 'cell-meeting',
                component: CellMettingContainerComponent,
                title: "Cell Meetings Mentorship",
            },        
            {
                path: 'send-sms',
                component: smsContainerComponent,
                title: "Send Bulk SMS",
            },        
            {
                path: 'send-email',
                component: EmailContainerComponent,
                title: "Send Bulk Email",
            },        
            {
                path: 'sms-log',
                component: smsLogContainerComponent,
                title: "Bulk SMS Log Center",
            },        
            {
                path: 'email-log',
                component: EmailLogContainerComponent,
                title: "Bulk Email Log Center",
            },        
        ]
    },
]
