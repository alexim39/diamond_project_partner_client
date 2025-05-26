import { Component, Input, OnInit } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatCardModule } from '@angular/material/card';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { SettingsService } from '../settings.service';
import { PartnerInterface } from '../../../../_common/services/partner.service';
import Swal from 'sweetalert2';

@Component({
selector: 'async-notifications-settings',
template: `
    <mat-card class="notification-card">
      <h2 class="title">Notification Preferences</h2>
      
      <mat-accordion>

        <mat-expansion-panel [expanded]="true">
          <mat-expansion-panel-header>
            <mat-panel-title>Set Send Notification Method</mat-panel-title>
          </mat-expansion-panel-header>

          <mat-radio-group [(ngModel)]="selectedSendNotificationOption" class="radio-group">
            <mat-radio-button value="email">Email Only</mat-radio-button>
            <mat-radio-button value="sms">SMS Only</mat-radio-button>
            <mat-radio-button value="both">Both Email & SMS</mat-radio-button>
            <mat-radio-button value="off">Off</mat-radio-button>
          </mat-radio-group>

           <div class="action-row">
            <button mat-flat-button color="primary" (click)="saveSendNotification()">Save Settings</button>
          </div>

        </mat-expansion-panel>
        
        <mat-expansion-panel>
          <mat-expansion-panel-header>
            <mat-panel-title>Set Receive Notification Method</mat-panel-title>
          </mat-expansion-panel-header>

          <mat-radio-group [(ngModel)]="selectedReceiveNotificationOption" class="radio-group">
            <mat-radio-button value="email">Email Only</mat-radio-button>
            <mat-radio-button value="sms">SMS Only</mat-radio-button>
            <mat-radio-button value="both">Both Email & SMS</mat-radio-button>
            <mat-radio-button value="off">Off</mat-radio-button>
          </mat-radio-group>

           <div class="action-row">
            <button mat-flat-button color="primary" (click)="saveReceiveNotification()">Save Settings</button>
          </div>

        </mat-expansion-panel>

       
      </mat-accordion>

      
    </mat-card>
`,
styles: [`
    .notification-card {
      margin: 2rem auto;
      padding: 1rem;
    }

    .title {
      margin-bottom: 1rem;
      text-align: center;
      font-weight: 600;
    }

    .radio-group {
      display: flex;
      flex-direction: column;
      margin: 1rem 0;
      gap: 0.5rem;
    }

    .action-row {
      text-align: center;
      margin-top: 1rem;
    }
`],
imports: [
    MatExpansionModule,
    MatCardModule,
    MatRadioModule,
    MatButtonModule,
    FormsModule
],
providers: [SettingsService]
})
export class NotificationsSettingsComponent implements OnInit {
  selectedSendNotificationOption = 'email'; // Default value
  selectedReceiveNotificationOption = 'email'; // Default value
  @Input() partner!: PartnerInterface;
  
  constructor(
    private settingsService: SettingsService, 
  ) {}

  ngOnInit(): void {
    this.selectedSendNotificationOption = this.partner?.settings?.notification?.send as string;
    this.selectedReceiveNotificationOption = this.partner?.settings?.notification?.receive as string;
  }

  saveSendNotification() {
    const formObject = {
      value: this.selectedSendNotificationOption,
      partnerId: this.partner._id
    }
    this.settingsService.updateSendNotificationPreference(formObject).subscribe({
      next: (response) => {
        Swal.fire({
          position: 'bottom',
          icon: 'success',
          text: response.message,
          showConfirmButton: true,
          timer: 5000,
          confirmButtonColor: '#ffab40',
        });
      },
      error: (error) => {
        let errorMessage = 'Server error occurred, please try again.';
        if (error.error && error.error.message) {
          errorMessage = error.error.message;
        }
        Swal.fire({
          position: 'bottom',
          icon: 'error',
          text: errorMessage,
          showConfirmButton: false,
          timer: 4000,
        });
      }
    });
  }

  saveReceiveNotification() {
    const formObject = {
      value: this.selectedReceiveNotificationOption,
      partnerId: this.partner._id
    }
    this.settingsService.updateReceiveNotificationPreference(formObject).subscribe({
      next: (response) => {
        Swal.fire({
          position: 'bottom',
          icon: 'success',
          text: response.message,
          showConfirmButton: true,
          timer: 5000,
          confirmButtonColor: '#ffab40',
        });
      },
      error: (error) => {
        let errorMessage = 'Server error occurred, please try again.';
        if (error.error && error.error.message) {
          errorMessage = error.error.message;
        }
        Swal.fire({
          position: 'bottom',
          icon: 'error',
          text: errorMessage,
          showConfirmButton: false,
          timer: 4000,
        });
      }
    });
  }
}