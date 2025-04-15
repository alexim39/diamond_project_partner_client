import { Component, inject, Input, OnInit, signal} from '@angular/core';
import { PartnerInterface } from '../../../../../_common/services/partner.service';
import { MatDialog } from '@angular/material/dialog';
import { HelpDialogComponent } from '../../../../../_common/help-dialog.component';
import { MatIconModule } from '@angular/material/icon';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Router, RouterModule } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatDatepickerModule} from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core'; // For native date adapter  
import Swal from 'sweetalert2';
import { TeamInterface, TeamService } from '../team.service';

/**
 * @title Mentors Program
 */
@Component({
    selector: 'async-edit-team',
    templateUrl: 'edit-team.component.html',
    styleUrls: ['edit-team.component.scss'],
    providers: [TeamService],
    imports: [CommonModule, MatIconModule, RouterModule, MatNativeDateModule, MatDatepickerModule, MatExpansionModule, MatFormFieldModule, MatButtonModule, FormsModule, MatInputModule, ReactiveFormsModule, MatSelectModule]
})
export class EditTeamComponent implements OnInit {
  readonly panelOpenState = signal(false);
  
    @Input() partner!: PartnerInterface;
    @Input() team!: TeamInterface;
    readonly dialog = inject(MatDialog);

    createTeamForm!: FormGroup;
    subscriptions: Array<Subscription> = [];

    constructor(
     private createTeamService: TeamService,
      private router: Router,
    ) {}


    ngOnInit(): void {
       // console.log(this.team)

        if (this.partner && this.team) {
          this.createTeamForm = new FormGroup({
            teamName: new FormControl(this.team?.teamName, Validators.required),
            description: new FormControl(this.team?.description,),
            teamPurpose: new FormControl(this.team?.teamPurpose, Validators.required),
            partnerId: new FormControl(this.partner._id),
            temaId: new FormControl(this.team?._id),
          });
        }
    }

    onSubmit() {
      const teamObject = this.createTeamForm.value;

      if (this.createTeamForm.valid) {
        this.subscriptions.push(
          this.createTeamService.updateTeam(teamObject).subscribe((res: any) => {
    
            Swal.fire({
              position: "bottom",
              icon: 'success',
              text: 'Your team detail has been created successfully.',
              showConfirmButton: true,
              confirmButtonColor: "#ffab40",
              timer: 15000,
            }).then((result) => {
              if (result.isConfirmed) {
                this.router.navigate(['/dashboard/manage-team']);
              }
            });
    
          }, (error: any) => {
            //console.log(error)
            Swal.fire({
              position: "bottom",
              icon: 'info',
              text: 'Server error occured, please try again',
              showConfirmButton: false,
              timer: 4000
            })
          })
        )
      }
    }

    back(): void {
      this.router.navigateByUrl('dashboard/manage-team');
    }

    showDescription () {
        this.dialog.open(HelpDialogComponent, {
          data: {help: `
            Here, you can modify an existing team details.
          `},
        });
      }

    ngOnDestroy() {
      // unsubscribe list
      this.subscriptions.forEach(subscription => {
        subscription.unsubscribe();
      });
    }

    scrollToTop() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}
