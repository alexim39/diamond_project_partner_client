import { Routes } from '@angular/router';
import { GeneralProspectListContainerComponent } from './general-prospect-list/general-prospect-list-container.component';
import { ProspectBookingContainerComponent } from './prospect-booking/prospect-booking-container.component';
import { EmailListContainerComponent } from './email-list/email-list-container.component';
import { MyProspectListContainerComponent } from './personal-prospect-list/personal-prospect-list-container.component';
import { LeadPipelineComponent } from './lead-pipeline/lead-pipeline.component';
import { PipelineBoardComponent } from './pipeline-board/board.component';
import { ProspectDetailComponent } from './prospect-detail/detail.component';
import { EditContactsContainerComponent } from '../contacts/edit/edit-contacts-container.component';
import { BookSessionContainerComponent } from '../contacts/book-session/book-session-container.component';

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
            component: GeneralProspectListContainerComponent,
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
            path: 'pipeline',
            component: LeadPipelineComponent,
            title: "Lead Pipeline - Track prospects through to conversion",
        },
        {
            path: 'board',
            component: PipelineBoardComponent,
            title: "Pipeline Board - Drag and drop your deals",
        },
        {
            path: 'detail/:id',
            component: ProspectDetailComponent,
            title: "Prospect Details - Timeline, activities and conversion",
        },
         {
            path: 'edit/:id',
            component: EditContactsContainerComponent,
            title: "Edit Contacts Details",
        },  
         {
            path: 'booking/:id',
            component: BookSessionContainerComponent,
            title: "Book a Prospect Session - Prosepct session booking",
        },  
              
    ],
  },
];