import { Routes } from "@angular/router";
import { DashboardComponent } from "./dashboard.component";
import { DashboardIndexComponent } from "./index/index.component";
import { InvitationContainerComponent } from "./profile/invitation/invitation-container.component";
import { EditContactsContainerComponent } from "./contacts/edit/edit-contacts-container.component";
import { CellMettingContainerComponent } from "./mentorship/cell-meeting/cell-meeting-container.component";
import { SearchResultContainerComponent } from "./index/search/search-result/search-result-container.component";
import { SubmitTicketContainerComponent } from "./help-feedback/submit-ticket/submit-ticket-container.component";
import { CheckoutComponent } from "./products/checkout/checkout.component";
import { EditTeamContainerComponent } from "./mentorship/team/edit-team/edit-team-container.component";
import { BookSessionContainerComponent } from "./contacts/book-session/book-session-container.component";
import { MyPartnerSupportContainerComponent } from "./mentorship/my-partners/support/support-container.component";
import { MyPartnersContactsContainerComponent } from "./mentorship/my-partners/contacts/contacts-container.component";
import { MyPartnerContactsDetailContainerComponent } from "./mentorship/my-partners/contacts/details/contacts-detail-container.component";
import { ManageContactsAnalyticsComponent } from "./contacts/manage/analytics/manage-contacts-analytics.component";
import { authGuard } from "./guard.service";



export const dashboardRoutes: Routes = [
    {
        /* path: '',
        redirectTo: 'partner',
        pathMatch: 'full' */
        path: '',
        component: DashboardComponent,
        canActivate: [authGuard],
        children: [
            {
                path: '',
                component: DashboardIndexComponent,
                children: [
                    {   path: 'search',
                        component: SearchResultContainerComponent, 
                        title: "Partners Search - Partners result details"
                    },
                ]
            }, 

            { path: 'settings', loadChildren: () => import('./settings/settings.routes').then(r => r.SettingsRoutes) }, 
            { path: 'resources', loadChildren: () => import('./resources/resources.routes').then(r => r.RourcesRoutes) }, 
            { path: 'mentorship', loadChildren: () => import('./mentorship/mentorship.routes').then(r => r.MentorshipRoutes) }, 
            { path: 'products', loadChildren: () => import('./products/products.routes').then(r => r.ProductsRoutes) }, 
            { path: 'prospects', loadChildren: () => import('./prospects/prospects.routes').then(r => r.ProspectsRoutes) }, 
            { path: 'tools', loadChildren: () => import('./tools/tools.routes').then(r => r.ToolsRoutes) }, 


                   
                 
                  
                  
                  
                  
            {
                path: 'prospect-invite',
                component: InvitationContainerComponent,
                title: "Prospect Invitation Manager",
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
                path: 'my-partner-contact-detail/:id',
                component: MyPartnerContactsDetailContainerComponent,
                title: "Partner Prospect Details - View and manage your partner prospect details",
            },        
            {
                path: 'support-partner/:id',
                component: MyPartnerSupportContainerComponent,
                title: "Partner Support - View details & support partner",
            },        
            {
                path: 'my-partners-contacts/:id',
                component: MyPartnersContactsContainerComponent,
                title: "Partner Support - View details & support partner",
            },        
            {
                path: 'cell-meeting',
                component: CellMettingContainerComponent,
                title: "Cell Meetings Mentorship",
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
              
                
                
               
            {
                path: 'contact-analytics',
                component: ManageContactsAnalyticsComponent,
                title: "Contact Summary & Analytics",
            },  
        ]
    },
]
