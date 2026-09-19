import { Routes } from '@angular/router';
import { GeneralProspectListContainerComponent } from './general-prospect-list/general-prospect-list-container.component';
import { ProspectBookingContainerComponent } from './prospect-booking/prospect-booking-container.component';
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
            title: "Buy Prospect - Claim fresh leads for your pipeline",
        },   
        {
            path: 'bookings',
            component: ProspectBookingContainerComponent,
            title: "General Prospects Bookings - View all bookings",
        },
        {
            // Retired: the newsletter email list is managed by admins now
            // (Admin → Growth → Email list). Old links land on the pipeline.
            path: 'email-list',
            redirectTo: 'pipeline',
            pathMatch: 'full',
        }, 
        {
            // Consolidated into the pipeline table (same mine-scoped data
            // over the validated v1 API). Component file kept for rollback.
            path: 'personal-list',
            redirectTo: 'pipeline',
            pathMatch: 'full',
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