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
import { HttpErrorResponse } from '@angular/common/http';

/**
 * @title Mentors Program
 */
@Component({
selector: 'async-edit-team',
templateUrl: 'edit-team.component.html',
styles: [`


.async-background {
    margin: 2em;
    h2 {
        mat-icon {
            cursor: pointer;
        }
    }
    .async-container {
        background-color: #dcdbdb;
        border-radius: 10px;
        height: 100%;
        padding: 1em;
        .title {
            display: flex;
            justify-content: space-between;
            border-bottom: 1px solid #ccc;
            padding: 1em;
            .back {
                cursor: pointer;
            }
        }

        .search {
            padding: 0.5em 0;
            text-align: center;
            mat-form-field {
                width: 70%;

            }
        }       

        .no-campaign {
            text-align: center;
            color: rgb(196, 129, 4);
            font-weight: bold;
        }
    }
}


.form-container {
    margin-top: 1em;
    padding: 20px;
    background-color: white;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    border-radius: 5px;
    .flex-form {
        display: flex;
        flex-wrap: wrap;
        gap: 20px;
        .form-group {
            flex: 1 1 calc(50% - 20px); /* Adjusting for gap space */
            display: flex;
            flex-direction: column;
        }    
    }
}


@media (max-width: 600px) {
    .form-group {
        flex: 1 1 100%;
    }
}



`],
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
          this.createTeamService.updateTeam(teamObject).subscribe({

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
                  this.router.navigate(['/dashboard/mentorship/team/members']);
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
    }

    back(): void {
      this.router.navigateByUrl('dashboard/mentorship/team/members');
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
