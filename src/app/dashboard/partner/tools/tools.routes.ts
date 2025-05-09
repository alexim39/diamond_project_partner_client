import { Routes } from '@angular/router';
import { CampaignAnalyticsContainerComponent } from '../prospects/campaign-analytics/campaign-analytics-container.component';
import { LinkAnalyticsContainerComponent } from '../prospects/link-analytics/link-analytics-container.component';
import { smsContainerComponent } from '../sms/sms-container.component';
import { smsLogContainerComponent } from '../sms/sms-log/sms-log-container.component';
import { EmailContainerComponent } from '../email/email-container.component';
import { EmailLogContainerComponent } from '../email/email-log/email-log-container.component';
import { CreateContactsContainerComponent } from '../contacts/create/create-contacts-container.component';
import { ManageContactsContainerComponent } from '../contacts/manage/manage-contacts-container.component';
import { MarketingChannelsComponent } from './campaigns/create-campaign/marketing-channels.component';
import { ManageCampaignContainerComponent } from './campaigns/manage-campaign/manage-campaign-container.component';
import { ManageCampaignDetailContainerComponent } from './campaigns/manage-campaign/details/manage-campaign-detail-container.component';
import { InvitationContainerComponent } from '../profile/invitation/invitation-container.component';


export const ToolsRoutes: Routes = [
  {
    path: '',
    redirectTo: 'campaigns',
    pathMatch: 'full',
  },
  {
    path: '',
        children: [
            {
            path: 'campaigns',
            children: [
                {
                    path: 'new',
                    component: MarketingChannelsComponent,
                    title: "Choose and Create Marketing Campaign",
                },
                {
                    path: 'manage',
                    component: ManageCampaignContainerComponent,
                    title: "Manage Marketing Campaigns",
                },  
                {
                    path: 'analytics',
                    component: CampaignAnalyticsContainerComponent,
                    title: "Campaign Analytics - Manage, understanding and Analyse each campaign",
                },   
                {
                    path: 'link',
                    component: LinkAnalyticsContainerComponent,
                    title: "Unique Link Analytics - Manage, understanding and Analyse your unique link",
                }, 
                {
                    path: 'share',
                    component: InvitationContainerComponent,
                    title: "Share your unique link on social media",
                },        
                     
                {
                    path: 'detail/:id',
                    component: ManageCampaignDetailContainerComponent,
                    title: "Campaign Details",
                },  
            ]
            
        },    
              
    ],
  },
  {
    path: 'sms',
        children: [
            {
                path: 'new',
                component: smsContainerComponent,
                title: "Send Bulk SMS - Send bulk SMS to one or more contacts",
            },
            {
                path: 'messages',
                component: smsLogContainerComponent,
                title: "Bulk SMS Log Center - View and manage your bulk SMS messages ",
            },   
        ]
   },
  {
    path: 'email',
        children: [
            {
                path: 'new',
                component: EmailContainerComponent,
                title: "Send Bulk Email - Send bulk email to one or more contacts",
            },  
            {
                path: 'logs',
                component: EmailLogContainerComponent,
                title: "Bulk Email Log Center - View and manage your bulk email messages ",
            },    
        ]
   },
  {
    path: 'contacts',
        children: [
             {
                path: 'new',
                component: CreateContactsContainerComponent,
                title: "Create Contacts - Create new contacts",
            },   
            {
                path: 'list',
                component: ManageContactsContainerComponent,
                title: "Manage Contacts - View and manage your contacts",
            },     
        ]
   },
];

  