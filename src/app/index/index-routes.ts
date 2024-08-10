import { Routes } from "@angular/router";
import { IndexComponent } from "./index.component";
import { PartnerSigninComponent } from "../auth/signin/partner-signin.component";
import { PartnerSignupComponent } from "../auth/signup/partner-signup.component";
import { IndexBodyComponent } from "./index-body.component";

export const IndexRoutes: Routes = [
    {
        path: '',
        component: IndexComponent,
        children: [
            {
                path: '',
                component: IndexBodyComponent
            },
            {
                path: 'partner',
                children: [
                    {
                        path: '',
                        redirectTo: 'signin',
                        pathMatch: 'full'
                    },
                    {
                        path: 'signin',
                        component: PartnerSigninComponent,
                        title: "Diamond Project Partner Sign in",
                    },
                    {
                        path: 'signup',
                        component: PartnerSignupComponent,
                        title: "Diamond Project Partner Sign up"
                    },
                ]
            },
           
           
        ]
    }
];