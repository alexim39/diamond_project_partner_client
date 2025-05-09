import { Routes } from '@angular/router';
import { SubmitTicketContainerComponent } from './submit-ticket/submit-ticket-container.component';

export const SupportRoutes: Routes = [
  {
    path: '',
    redirectTo: 'ticket',
    pathMatch: 'full',
  },
  {
    path: '',
    children: [
             
        {
            path: 'ticket',
            component: SubmitTicketContainerComponent,
            title: "Submit a Ticket - Reach out to administrator for support and feedback",
        },  
    ],
  },
];