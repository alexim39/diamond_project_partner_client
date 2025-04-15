import { Component } from '@angular/core';
import { LoadingService } from './spinner.service';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
    selector: 'async-spinner',
    imports: [CommonModule, MatProgressSpinnerModule],
    template: `
    <div *ngIf="loadingService.loading$ | async" class="overlay">
      <!-- <mat-spinner color="primary"></mat-spinner> -->
      <div class="spinner-container">
        <div class="spinner"></div>
      </div>
    </div>
  `,
    styles: `

.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
}


.spinner-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh; /* Full viewport height */
}

.spinner {
  border: 4px solid rgba(0, 0, 0, 0.1); /* Light gray border */
  border-top: 4px solid #ffab40; /* Primary color */
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite; /* Smooth and continuous rotation */
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}


  `
})
export class SpinnerComponent {
  constructor(public loadingService: LoadingService) {}
}
