import { Component, inject, Input, OnInit} from '@angular/core';
import {MatCardModule} from '@angular/material/card';
import { PartnerInterface } from '../../../../_common/services/partner.service';
import { MatDialog } from '@angular/material/dialog';
import { HelpDialogComponent } from '../../../../_common/help-dialog.component';
import { MatIconModule } from '@angular/material/icon';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Router, RouterModule } from '@angular/router';
import { MentorsProgramService } from './mentors-program.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import Swal from 'sweetalert2';

/**
 * @title Mentors Program
 */
@Component({
selector: 'async-mentors-program',
templateUrl: 'mentors-program.component.html',
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
            .action-area {
                .action {
                    font-weight: bold;
                    margin-top: 1em;
                }
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
providers: [MentorsProgramService],
imports: [CommonModule, MatIconModule, RouterModule, MatFormFieldModule, MatButtonModule, FormsModule, MatInputModule, ReactiveFormsModule, MatSelectModule]
})
export class MentorsProgramComponent implements OnInit {
    @Input() partner!: PartnerInterface;
    readonly dialog = inject(MatDialog);

    mentorsProgramForm!: FormGroup;
    subscriptions: Array<Subscription> = [];

    constructor(
      private mentorsProgramService: MentorsProgramService,
      private router: Router,
    ) {}


    ngOnInit(): void {
       // console.log(this.partner)

        if (this.partner) {
          this.mentorsProgramForm = new FormGroup({
            type: new FormControl('', Validators.required),
            goal: new FormControl('', Validators.required),
            match: new FormControl('', Validators.required),
            duration: new FormControl('', Validators.required),
            frequency: new FormControl('', Validators.required),
            channel: new FormControl('', Validators.required),
            remark: new FormControl(''),
            partnerId: new FormControl(this.partner._id),
          });
        }
    }

    onSubmit() {
      const mentorsProgramObject = this.mentorsProgramForm.value;

      if (this.mentorsProgramForm.valid) {

      }
    }

    showDescription () {
        this.dialog.open(HelpDialogComponent, {
          data: {help: `
            Make request for a scheduled mentorship seasion with partner, leaders and experts in the industry
          `},
        });
    }

    ngOnDestroy() {
      // unsubscribe list
      this.subscriptions.forEach(subscription => subscription.unsubscribe());
    }
}
