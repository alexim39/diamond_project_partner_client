import { Routes } from '@angular/router';
import { ProspectListContainerComponent } from './general-prospect-list/prospect-list-container.component';
import { ProspectBookingContainerComponent } from './prospect-booking/prospect-booking-container.component';
import { EmailListContainerComponent } from './email-list/email-list-container.component';
import { MyProspectListContainerComponent } from './personal-prospect-list/personal-prospect-list-container.component';
import { ManageContactsDetailContainerComponent } from '../contacts/manage/details/manage-contacts-detail-container.component';

export const ProspectsRoutes: Routes = [
  {
    path: '',
    redirectTo: 'general-list',
    pathMatch: 'full',
  },
  {
    path: '',
    children: [
        {
            path: 'general-list',
            component: ProspectListContainerComponent,
            title: "General Prospects List - View all prospects",
        },   
        {
            path: 'bookings',
            component: ProspectBookingContainerComponent,
            title: "General Prospects Bookings - View all bookings",
        },  
         {
            path: 'email-list',
            component: EmailListContainerComponent,
            title: "General Prospects Email List - View all email list",
        }, 
        {
            path: 'personal-list',
            component: MyProspectListContainerComponent,
            title: "My Prospects List - View all my prospects",
        },   
        {
            path: 'detail/:id',
            component: ManageContactsDetailContainerComponent,
            title: "Prospect Details - View and manage your prospect details",
        },  
              
    ],
  },
];