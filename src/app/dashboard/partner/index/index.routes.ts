/* import { Routes } from "@angular/router";


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
                        title: "Partner Signin - Diamond Project Partner Sign in",
                    },
                    {
                        path: 'signup',
                        component: PartnerSignupComponent,
                        title: "Partner Signup - Diamond Project Partner Sign up"
                    },
                    {
                        path: 'forgot-password',
                        component: PartnerForgotPasswordComponent,
                        title: "Forgot Password - Partner reset password"
                    },
                ]
            },
           
           
        ]
    }
]; */