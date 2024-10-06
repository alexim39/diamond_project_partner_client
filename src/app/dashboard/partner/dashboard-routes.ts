import { Routes } from "@angular/router";
import { DashboardComponent } from "./dashboard.component";
import { DashboardIndexComponent } from "./index/index.component";
import { MarketingChannelsComponent } from "./campaigns/create-campaign/marketing-channels.component";
import { ManageCampaignContainerComponent } from "./campaigns/manage-campaign/manage-campaign-container.component";
import { ManageCampaignDetailContainerComponent } from "./campaigns/manage-campaign/details/manage-campaign-detail-container.component";
import { MonthlyPurchaseContainerComponent } from "./monthly-purchase/monthly-purchase-container.component";
import { InvitationContainerComponent } from "./profile/invitation/invitation-container.component";
import { ProfileMrgContainerComponent } from "./profile/profile-mgr/profile-mgr-container.component";
//import { TeamMembersContainerComponent } from "./profile/team-members/team-members-container.component";
//import { AddMembersContainerComponent } from "./profile/team-members/add-members/add-members-container";
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
import { LinkAnalyticsContainerComponent } from "./analytics/link-analytics/link-analytics-container.component";
import { CampaignAnalyticsContainerComponent } from "./analytics/campaign-analytics/campaign-analytics-container.component";
import { SearchResultContainerComponent } from "./index/search/search-result/search-result-container.component";
import { MentorsProgramContainerComponent } from "./mentorship/mentors-program/mentors-program-container.component";
import { SubmitTicketContainerComponent } from "./help-feedback/submit-ticket/submit-ticket-container.component";
import { CreateTeamContainerComponent } from "./mentorship/team/create-team/create-team-container.component";
import { ManageTeamContainerComponent } from "./mentorship/team/manage-team/manage-team-container.component";
import { CheckoutComponent } from "./monthly-purchase/checkout/checkout.component";
import { PurchaseContainerComponent } from "./monthly-purchase/purchases/purchases-container.component";
import { ResourceDownloadContainerComponent } from "./training-resource/resource-download/resource-download-container.component";
import { EditTeamContainerComponent } from "./mentorship/team/edit-team/edit-team-container.component";
import { LandingPageSettingContainerComponent } from "./settings/Landing-page/Landing-page-container.component";
import { PreapproachDownloadContainerComponent } from "./training-resource/pre-approach-download/pre-approach-download-container.component";
import { BookSessionContainerComponent } from "./contacts/book-session/book-session-container.component";
import { ProspectBookingContainerComponent } from "./analytics/prospect-booking/prospect-booking-container.component";



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
                children: [
                   /*  { path: '', 
                        component: GetStartedComponent, 
                        title: "Diamond Project Online - Get trained to get financially free",
                    }, */
                    {   path: 'search',
                        component: SearchResultContainerComponent, 
                        title: "Partners Search - Partners result details"
                    },
                    /* { path: 'get-involved', 
                        component: GettingInvolvedComponent, 
                        title: "Project Summary - Get involved as a member"
                    }, */
        
                ]
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
                path: 'create-team',
                component: CreateTeamContainerComponent,
                title: "Create Team - Create new team of partners",
            },        
            {
                path: 'manage-team',
                component: ManageTeamContainerComponent,
                title: "Manage Team - Manage list of created partners team",
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
                path: 'book-prospect-session/:id',
                component: BookSessionContainerComponent,
                title: "Book a Prospect Session - Prosepct session booking",
            },        
            {
                path: 'edit-team/:id',
                component: EditTeamContainerComponent,
                title: "Edit Team Details",
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
                path: 'prospect-booking',
                component: ProspectBookingContainerComponent,
                title: "Manage Prospect Session Booking",
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
                title: "Send Bulk SMS - Send bulk SMS to one or more contacts",
            },        
            {
                path: 'send-email',
                component: EmailContainerComponent,
                title: "Send Bulk Email - Send bulk email to one or more contacts",
            },        
            {
                path: 'sms-log',
                component: smsLogContainerComponent,
                title: "Bulk SMS Log Center - View and manage your bulk SMS messages ",
            },        
            {
                path: 'email-log',
                component: EmailLogContainerComponent,
                title: "Bulk Email Log Center - View and manage your bulk email messages ",
            },        
            {
                path: 'link-analytics',
                component: LinkAnalyticsContainerComponent,
                title: "Unique Link Analytics - Manage, understanding and Analyse your unique link",
            },        
            {
                path: 'campaign-analytics',
                component: CampaignAnalyticsContainerComponent,
                title: "Campaign Analytics - Manage, understanding and Analyse each campaign",
            },        
            {
                path: 'mentors-program',
                component: MentorsProgramContainerComponent,
                title: "Mentors Program - Manage, grow and collaborate with your team",
            },        
            {
                path: 'submit-ticket',
                component: SubmitTicketContainerComponent,
                title: "Submit a Ticket - Reach out to app. administrator for support and feedback",
            },   
            { path: 'checkout', 
                component: CheckoutComponent,
                title: "Monthly Purchase - Checkout summary",
            },     
            { path: 'purchases', 
                component: PurchaseContainerComponent,
                title: "Purchase - List of purchase history",
            },     
            { path: 'ads-contents', 
                component: ResourceDownloadContainerComponent,
                title: "Ads Resource Download - Access Ads resources",
            },     
            { path: 'landing-page-settings', 
                component: LandingPageSettingContainerComponent,
                title: "Landing Page Settings - Set what prospect sees on your landing page",
            },     
            { path: 'pre-approach-material', 
                component: PreapproachDownloadContainerComponent,
                title: "Pre-Approach Material Download - Download the pre-approach material",
            },     
        ]
    },
]
