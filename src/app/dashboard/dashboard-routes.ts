import { Routes } from "@angular/router";
import { DashboardComponent } from "./dashboard.component";



export const dashboardRoutes: Routes = [
    {
        /* path: '',
        redirectTo: 'partner',
        pathMatch: 'full' */
        path: '',
        component: DashboardComponent,
    },
   /*  { 
        path: 'partner', 
        children: [
            {
                path: '',
                redirectTo: 'signin',
                pathMatch: 'full'
            },
            {   path: 'signin', 
                component: PartnerSigninComponent, 
                title: "Diamond Project Partner Sign in",
            },
            {   path: 'signup', 
                component: PartnerSignupComponent, 
                title: "Diamond Project Partner Sign up"
            },
        ]
    }, */

]
