import { Routes } from "@angular/router";
import { PartnerSigninComponent } from "./partner/signin/partner-signin.component";
import { PartnerSignupComponent } from "./partner/signup/partner-signup.component";


export const authRoutes: Routes = [
    {
        path: '',
        redirectTo: 'partner',
        pathMatch: 'full'
    },
    { 
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
            /* { path: 'get-involved', 
                component: GettingInvolvedComponent, 
                title: "Project Summary - Get involved as a member"
            }, */

        ]
    },

]
