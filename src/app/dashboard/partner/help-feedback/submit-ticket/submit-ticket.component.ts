import { Component, inject, Input, OnInit, signal} from '@angular/core';
import { PartnerInterface } from '../../../../_common/services/partner.service';
import { MatDialog } from '@angular/material/dialog';
import { HelpDialogComponent } from '../../../../_common/help-dialog.component';
import { MatIconModule } from '@angular/material/icon';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Router, RouterModule } from '@angular/router';
import { TicketService } from './submit-ticket.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatDatepickerModule} from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core'; // For native date adapter  
import Swal from 'sweetalert2';

/**
 * @title Mentors Program
 */
@Component({
    selector: 'async-submit-ticket',
    templateUrl: 'submit-ticket.component.html',
    styleUrls: ['submit-ticket.component.scss'],
    providers: [TicketService],
    imports: [CommonModule, MatIconModule, RouterModule, MatNativeDateModule, MatDatepickerModule, MatExpansionModule, MatFormFieldModule, MatButtonModule, FormsModule, MatInputModule, ReactiveFormsModule, MatSelectModule]
})
export class SubmitTicketComponent implements OnInit {
  readonly panelOpenState = signal(false);
  
    @Input() partner!: PartnerInterface;
    readonly dialog = inject(MatDialog);

    ticketForm!: FormGroup;
    subscriptions: Array<Subscription> = [];

    constructor(
     private ticketService: TicketService,
      private router: Router,
    ) {}


    ngOnInit(): void {
       // console.log(this.partner)

        if (this.partner) {
          this.ticketForm = new FormGroup({
            subject: new FormControl('', Validators.required),
            description: new FormControl('', Validators.required),
            date: new FormControl('', Validators.required),
            category: new FormControl('', Validators.required),
            priority: new FormControl('', Validators.required),
            comment: new FormControl(''),
            partnerId: new FormControl(this.partner._id),
          });
        }
    }

    onSubmit() {
      const ticketObject = this.ticketForm.value;

      if (this.ticketForm.valid) {
        this.subscriptions.push(
          this.ticketService.submitTicket(ticketObject).subscribe((res: any) => {
    
            Swal.fire({
              position: "bottom",
              icon: 'success',
              text: 'Your ticket has been submited successfully, we will revert as soon as possible with updates.',
              showConfirmButton: true,
              confirmButtonColor: "#ffab40",
              timer: 15000,
            })
    
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

    showDescription () {
        this.dialog.open(HelpDialogComponent, {
          data: {help: `
            Contact the application administrator for assistance, feedback, and suggestions for improvement.

            <p>Feel free to share any challenges you encounter while using the app, along with any suggestions for improvements or features you would like to see added.</p>
          `},
        });
      }

    ngOnDestroy() {
      // unsubscribe list
      this.subscriptions.forEach(subscription => {
        subscription.unsubscribe();
      });
    }
}
