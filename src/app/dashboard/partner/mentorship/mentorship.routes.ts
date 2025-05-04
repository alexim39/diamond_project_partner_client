import { Routes } from '@angular/router';
import { MentorsProgramContainerComponent } from './mentors-program/mentors-program-container.component';
import { CreateTeamContainerComponent } from './team/create-team/create-team-container.component';
import { ManageTeamContainerComponent } from './team/manage-team/manage-team-container.component';
import { MyPartnersContainerComponent } from './my-partners/my-partners-container.component';
import { TeamSupportContainerComponent } from './team/manage-team/support/support-container.component';
import { EditTeamContainerComponent } from './team/edit-team/edit-team-container.component';

export const MentorshipRoutes: Routes = [
  {
    path: '',
    redirectTo: 'new-request',
    pathMatch: 'full',
  },
  {
    path: '',
    children: [
        {
            path: 'new-request',
            component: MentorsProgramContainerComponent,
            title: "New Request - Mentorship Program for New Request",
        },  
        {
            path: 'team',
            children: [
                {
                    path: 'new',
                    component: CreateTeamContainerComponent,
                    title: "Create New Team - Create new team from partners",
                },
                 {
                    path: 'members',
                    component: ManageTeamContainerComponent,
                    title: "Manage Team - Manage team members from partners",
                }, 

                {
                    path: 'member/:id',
                    component: TeamSupportContainerComponent,
                    title: "Team Support - Manage team members from partners",
                },  

                {
                    path: 'detail/:id',
                    component: EditTeamContainerComponent,
                    title: "Edit Team Details",
                },   
            ]
            
        },  
        {
            path: 'partners',
            children: [
                {
                    path: 'my-partners',
                    component: MyPartnersContainerComponent,
                    title: "My Partners - Manage partners listing",
                },    
            ]
            
        },  
       
        
    ],
  },
];