import { Component, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import Swal from 'sweetalert2';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { PartnerInterface, PartnerService } from '../../../../../../_common/services/partner.service';
import { TeamInterface, TeamService } from '../../team.service';
import { AddMemberComponent } from './add-member/add-member.component';
import {MatExpansionModule} from '@angular/material/expansion';
import { HttpErrorResponse } from '@angular/common/http';

/** @title Teams details */
@Component({
    selector: 'async-team-support',
    templateUrl: 'support.component.html',
    styleUrls: ['support.component.scss'],
    imports: [
        MatCheckboxModule,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatSelectModule,
        MatInputModule, MatExpansionModule,
        MatIconModule, MatButtonModule,
        MatDividerModule, MatListModule, CommonModule, RouterModule
    ]
})
export class TeamSupportComponent implements OnDestroy {

  @Input() partner!: PartnerInterface;
  @Input() team!: TeamInterface;
  duration!: null | number;
  readonly dialog = inject(MatDialog);
  subscriptions: Array<Subscription> = [];


  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private partnerService: PartnerService,
    private teamService: TeamService,

  ) {}


  back(): void {
    this.router.navigateByUrl('dashboard/mentorship/team/members');
  }

  deleteTeam(teamId: string) { 
    Swal.fire({
      title: `Are you sure of your delete action?`,
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ffab40",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!"
    }).then((result) => {
      if (result.isConfirmed) {

        this.subscriptions.push(
          this.teamService.deleteTeam(teamId).subscribe({

            next: (response) => {
              Swal.fire({
                position: "bottom",
                icon: 'success',
                text: response.message,
                showConfirmButton: true,
                timer: 10000,
                confirmButtonColor: "#ffab40",
              }).then((result) => {
                if (result.isConfirmed) {
                  this.router.navigateByUrl('dashboard/mentorship/team/members');
                }
              });
            },
            error: (error: HttpErrorResponse) => {
              let errorMessage = 'Server error occurred, please try again.'; // default error message.
              if (error.error && error.error.message) {
                errorMessage = error.error.message; // Use backend's error message if available.
              }
              Swal.fire({
                position: "bottom",
                icon: 'error',
                text: errorMessage,
                showConfirmButton: false,
                timer: 4000
              });  
            }
      })
      )

      }
    });
  }

  edit(id: string) {
    this.router.navigate(['/dashboard/mentorship/team/detail', id]);
  }

  addMember(team: TeamInterface, partner: PartnerInterface) {
    this.dialog.open(AddMemberComponent, {
      data: {team, partner},
    });

    /* dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      if (result !== undefined) {
        this.animal.set(result);
      }
    }); */
  }

  // Scroll to top when clicked
  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }


  ngOnDestroy() {
    // unsubscribe list
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  removeMember(memberId: string, teamId: string) {
    Swal.fire({
      title: `Are you sure of your delete action?`,
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ffab40",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!"
    }).then((result) => {
      if (result.isConfirmed) {

        this.subscriptions.push(
          this.teamService.deleteTeamMember(memberId, teamId).subscribe({

            next: (response) => {
              Swal.fire({
                position: "bottom",
                icon: 'success',
                text: response.message,
                showConfirmButton: true,
                timer: 10000,
                confirmButtonColor: "#ffab40",
              }).then((result) => {
                if (result.isConfirmed) {
                  location.reload();
                }
              });
            },
            error: (error: HttpErrorResponse) => {
              let errorMessage = 'Server error occurred, please try again.'; // default error message.
              if (error.error && error.error.message) {
                errorMessage = error.error.message; // Use backend's error message if available.
              }
              Swal.fire({
                position: "bottom",
                icon: 'error',
                text: errorMessage,
                showConfirmButton: false,
                timer: 4000
              });  
            }
          })
        )

      }
    });
  }


}
