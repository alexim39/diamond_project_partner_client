import { Routes } from "@angular/router";
import { DashboardComponent } from "./dashboard.component";
import { DashboardIndexComponent } from "./index/index.component";
import { HomeComponent } from "../home/home.component";
import { SearchResultContainerComponent } from "./index/search/search-result/search-result-container.component";
import { authGuard } from "../../core/auth/auth.guard";



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
                component: HomeComponent,
                title: "Dashboard - Your business command center",
            },
            {
                path: 'classic',
                component: DashboardIndexComponent,
                children: [
                    {   path: 'search',
                        component: SearchResultContainerComponent,
                        title: "Partners Search - Partners result details"
                    },
                ]
            },
            // Legacy absolute navigations to `dashboard/search` keep working.
            { path: 'search', redirectTo: 'classic/search', pathMatch: 'full' },

            { path: 'settings', loadChildren: () => import('./settings/settings.routes').then(r => r.SettingsRoutes) }, 
            { path: 'resources', loadChildren: () => import('./resources/resources.routes').then(r => r.RourcesRoutes) }, 
            { path: 'mentorship', loadChildren: () => import('./mentorship/mentorship.routes').then(r => r.MentorshipRoutes) }, 
            { path: 'products', loadChildren: () => import('./products/products.routes').then(r => r.ProductsRoutes) }, 
            { path: 'prospects', loadChildren: () => import('./prospects/prospects.routes').then(r => r.ProspectsRoutes) }, 
            { path: 'tools', loadChildren: () => import('./tools/tools.routes').then(r => r.ToolsRoutes) }, 
            { path: 'support', loadChildren: () => import('./support/support.routes').then(r => r.SupportRoutes) }, 
            { path: 'admin', loadChildren: () => import('../admin/admin.routes').then(r => r.AdminRoutes) }, 
            { path: 'network', loadChildren: () => import('../network/network.routes').then(r => r.NetworkRoutes) }, 
            { path: 'notifications', loadChildren: () => import('../notifications/notifications.routes').then(r => r.NotificationsRoutes) }, 
            { path: 'goals', loadChildren: () => import('../goals/goals.routes').then(r => r.GoalsRoutes) }, 
            { path: 'insights', loadChildren: () => import('../insights/insights.routes').then(r => r.InsightsRoutes) }, 
            { path: 'messages', loadChildren: () => import('../messages/messages.routes').then(r => r.MessagesRoutes) }, 
            { path: 'earnings', loadChildren: () => import('../earnings/earnings.routes').then(r => r.EarningsRoutes) }, 
            { path: 'progress', loadChildren: () => import('../progress/progress.routes').then(r => r.ProgressRoutes) }, 
            { path: 'training', loadChildren: () => import('../training/training.routes').then(r => r.TrainingRoutes) }, 
            { path: 'community', loadChildren: () => import('../community/community.routes').then(r => r.CommunityRoutes) }, 
                
                 
            {
                path: 'cell-meeting',
                loadComponent: () => import('./mentorship/cell-meeting/cell-meeting-container.component').then(r => r.CellMettingContainerComponent),
                title: "Cell Meetings Mentorship",
            },


            { path: 'checkout',
                loadComponent: () => import('./products/checkout/checkout.component').then(r => r.CheckoutComponent),
                title: "Monthly Purchase - Checkout summary",
            },


            {
                path: 'contact-analytics',
                loadComponent: () => import('./contacts/manage/analytics/manage-contacts-analytics.component').then(r => r.ManageContactsAnalyticsComponent),
                title: "Contact Summary & Analytics",
            },
        ]
    },
]
