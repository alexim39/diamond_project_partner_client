import { Routes } from '@angular/router';
import { smsContainerComponent } from '../sms/sms-container.component';
import { smsLogContainerComponent } from '../sms/sms-log/sms-log-container.component';
import { EmailContainerComponent } from '../email/email-container.component';
import { EmailLogContainerComponent } from '../email/email-log/email-log-container.component';
import { CreateContactsContainerComponent } from '../contacts/create/create-contacts-container.component';
import { MarketingChannelsComponent } from './campaigns/create-campaign/marketing-channels.component';
import { ManageCampaignContainerComponent } from './campaigns/manage-campaign/manage-campaign-container.component';
import { ManageCampaignDetailContainerComponent } from './campaigns/manage-campaign/details/manage-campaign-detail-container.component';
import { InvitationContainerComponent } from './campaigns/invitation/invitation-container.component';


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
                    title: "My Campaigns - Manage your invite campaigns",
                },  
                {
                    // Retired: mislabeled prospect tables, not analytics.
                    // Real numbers live under What campaigns earned.
                    path: 'analytics',
                    redirectTo: '/dashboard/marketing/roi',
                    pathMatch: 'full',
                },   
                {
                    // Retired: same reason — see above.
                    path: 'link',
                    redirectTo: '/dashboard/marketing/roi',
                    pathMatch: 'full',
                }, 
                {
                    path: 'share',
                    component: InvitationContainerComponent,
                    title: "Share Invite Link - Send your personal link outward",
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
                title: "Send SMS - Send bulk SMS to one or more contacts",
            },
            {
                path: 'messages',
                component: smsLogContainerComponent,
                title: "SMS Inbox - View and manage your bulk SMS messages ",
            },   
        ]
   },
  {
    path: 'email',
        children: [
            {
                path: 'new',
                component: EmailContainerComponent,
                title: "Send Email - Send bulk email to one or more contacts",
            },  
            {
                path: 'logs',
                component: EmailLogContainerComponent,
                title: "Email Inbox - View and manage your bulk email messages ",
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
                // Legacy table retired — the pipeline absorbed its bulk
                // outreach; old links land on the working view instead.
                path: 'list',
                redirectTo: '/dashboard/prospects/pipeline',
                pathMatch: 'full',
            },
        ]
   },
];

  