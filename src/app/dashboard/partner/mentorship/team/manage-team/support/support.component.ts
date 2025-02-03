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
import { MatSnackBar } from '@angular/material/snack-bar';
import { TeamInterface, TeamService } from '../../team.service';
import { AddMemberComponent } from './add-member/add-member.component';
import {MatExpansionModule} from '@angular/material/expansion';

/** @title Teams details */
@Component({
  selector: 'async-team-support',
  templateUrl: 'support.component.html',
  styleUrls: ['support.component.scss'],
  standalone: true,
  imports: [
    MatCheckboxModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule, MatExpansionModule,
    MatIconModule, MatButtonModule,
    MatDividerModule, MatListModule, CommonModule, RouterModule
  ],
})
export class TeamSupportComponent implements OnInit, OnDestroy {

  @Input() partner!: PartnerInterface;
  @Input() team!: TeamInterface;
  duration!: null | number;
  readonly dialog = inject(MatDialog);
  subscriptions: Array<Subscription> = [];


  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private partnerService: PartnerService,
    private snackBar: MatSnackBar,
    private teamService: TeamService,

  ) {}


  back(): void {
    this.router.navigateByUrl('dashboard/manage-team');
  }


  ngOnInit(): void {
    //console.log(this.partner)
    //console.log(this.team)

    
    /* if (this.myPartner) {
      this.myPartner = this.myPartner;
    } */

   /*  // get current signed in user
    this.subscriptions.push(
      this.partnerService.getSharedPartnerData$.subscribe(
        partnerObject => {
          this.partner = partnerObject as PartnerInterface
          //console.log(this.partner)
        },
        error => {
          console.log(error)
          // redirect to home page
        }
      )
    ) */
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
          this.teamService.deleteTeam(teamId).subscribe((teams: any) => {
            //console.log('prospectContact ',prospectStatus)
            Swal.fire({
              position: "bottom",
              icon: 'success',
              text: `Your have successfully deleted that team record`,
              showConfirmButton: true,
              confirmButtonColor: "#ffab40",
              timer: 15000,
            }).then((result) => {
              if (result.isConfirmed) {
              this.router.navigateByUrl('dashboard/manage-team');
              //location.reload();
              }
            });
      
          }, (error: any) => {
            //console.log(error)
            Swal.fire({
              position: "bottom",
              icon: 'info',
              text: 'Server error occured, please and try again',
              showConfirmButton: false,
              timer: 4000
            })
          })
        )

      }
    });
  }

  edit(id: string) {
    this.router.navigate(['/dashboard/edit-team', id]);
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
    this.subscriptions.forEach(subscription => {
      subscription.unsubscribe();
    });
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
          this.teamService.deleteTeamMember(memberId, teamId).subscribe((teams: any) => {
            //console.log('prospectContact ',prospectStatus)
            Swal.fire({
              position: "bottom",
              icon: 'success',
              text: `Your have successfully deleted that member record`,
              showConfirmButton: true,
              confirmButtonColor: "#ffab40",
              timer: 15000,
            }).then((result) => {
              if (result.isConfirmed) {
              //this.router.navigateByUrl('dashboard/manage-team');
              location.reload();
              }
            });
      
          }, (error: any) => {
            //console.log(error)
            Swal.fire({
              position: "bottom",
              icon: 'info',
              text: 'Server error occured, please and try again',
              showConfirmButton: false,
              timer: 4000
            })
          })
        )

      }
    });
  }


}
