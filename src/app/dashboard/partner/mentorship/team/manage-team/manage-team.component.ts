import { Component, Input, OnInit } from '@angular/core';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import { MatRadioModule } from '@angular/material/radio';
import { MatCardModule } from '@angular/material/card';
import { PartnerInterface } from '../../../../../_common/services/partner.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';
import { TeamInterface, TeamService } from '../team.service';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { TruncatePipe } from '../../../../../_common/pipes/truncate.pipe';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'async-manage-team',
  templateUrl: 'manage-team.component.html',
  styleUrls: ['manage-team.component.scss'],
  standalone: true,
  imports: [
    MatCardModule,
    CommonModule,
    MatTableModule,
    MatRadioModule,
    MatIconModule,
    RouterModule,
    MatButtonModule,
    FormsModule,
    MatCheckboxModule,
    MatSlideToggleModule,
    TruncatePipe
  ],
  providers: [TeamService],
})
export class ManageTeamComponent implements OnInit {
  @Input() partner!: PartnerInterface;
  @Input() teams!: TeamInterface[];
  subscriptions: Subscription[] = [];
  dataSource: TeamInterface[] = [];
  isEmptyRecord = false;
  filterText: string = '';
  displayedColumns: string[] = ['team', 'purpose', 'desc', 'date', 'manage', 'action'];

  constructor(
    private teamService: TeamService,
    private router: Router,
  ) {}

  ngOnInit() {
    //console.log(this.teams)
    if (this.teams && this.teams.length > 0) {
      this.dataSource = this.teams.sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    } else {
      this.isEmptyRecord = true;
    }
  }

  delete(teamId: string) {
   /*  this.subscriptions.push(
      this.teamService.deleteTeam(this.partner._id).subscribe((teams: any) => {
       // this.teams = teams.data;
        //console.log('teams ',teams)
      })
    ) */

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
                 // this.router.navigateByUrl('dashboard/manage-team');
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

  edit(id: string) {
    this.router.navigate(['/dashboard/edit-team', id]);
  }

  manage(id: string) {
    this.router.navigate(['/dashboard/edit-team', id]);
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
}
