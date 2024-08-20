import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { PartnerInterface } from '../../../../_common/services/partner.service';
import { CellMeetingService } from './cell-meeting.service';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'async-cell-meeting',
  standalone: true,
  imports: [MatButtonModule],
  providers: [CellMeetingService],
  template: `
    <div class="container">
        <div class="writeup item">
            <p>
                Click the button below to join the Cell Meeting
            </p>
        </div>
        <div class="btn-area item">
            <a mat-flat-button (click)="onJoinMeeting()" href="{{ meetingUrl }}" target="_blank">Join Meeting</a>
        </div>
    </div>
  `,
  styles: `
  .container {
    display: flex;                      /* Enable Flexbox layout */  
    justify-content: flex-start;            /* Center items horizontally */  
    align-items: center; 
    flex-direction: column;               /* Center items vertically */  
    height: 100vh;   
    .item {  
        padding: 20px;  
        margin: 10px;  
    } 
    .writeup {

    }
    .btn-area {

    }
  }
  `
})
export class CellMeetingComponent implements OnInit, OnDestroy {
  meetingUrl: string = 'https://us05web.zoom.us/j/82679293106?pwd=09UOjUWxJ1i72yKW2gBiJv0yfAJbq0.1';
  meetingWindow: Window | null = null;
  checkInterval: any;
  @Input() partner!: PartnerInterface;

  constructor(
    private cellMeetingService: CellMeetingService,
  ) {}

  
    ngOnInit(): void {
        //console.log('=',this.partner)

    }
  
    onJoinMeeting() {
        const startTime = new Date().getTime();
        localStorage.setItem('meetingStartTime', startTime.toString());
    
        // Open the meeting in a new window and keep a reference to it
        this.meetingWindow = window.open(this.meetingUrl, '_blank');
    
        // Start checking periodically if the window is closed
        this.checkInterval = setInterval(() => this.checkMeetingWindow(), 1000);
    }
    
    checkMeetingWindow() {
    if (this.meetingWindow && this.meetingWindow.closed) {
        this.onMeetingEnd();
    }
    }
    
    private onMeetingEnd() {
        const endTime = new Date().getTime();
        const startTime = parseInt(localStorage.getItem('meetingStartTime') || '0', 10);
    
        if (startTime) {
            const timeSpent = endTime - startTime; // Time in milliseconds

            // Convert timeSpent to hours, minutes, and seconds
            const hours = Math.floor(timeSpent / (1000 * 60 * 60));
            const minutes = Math.floor((timeSpent % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((timeSpent % (1000 * 60)) / 1000);
        
            const formattedTimeSpent = `${hours}h ${minutes}m ${seconds}s`;
            console.log('Time spent in meeting:', formattedTimeSpent);
    
          // Record the attendance and time spent
          this.cellMeetingService.recordAttendance(formattedTimeSpent, this.partner);
        }
    
        // Clean up
        clearInterval(this.checkInterval);
        localStorage.removeItem('meetingStartTime');
        this.meetingWindow = null;
    }
    
    ngOnDestroy() {
        // Ensure the interval is cleared if the component is destroyed
        if (this.checkInterval) {
          clearInterval(this.checkInterval);
        }
    }
    
}
