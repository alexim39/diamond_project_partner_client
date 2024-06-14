import { Component, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'async-loading-spinner',
  encapsulation: ViewEncapsulation.ShadowDom,
  standalone: true,
  providers: [CommonModule],
  styles: [`
/* Styles for the overlay container */
.overlay-spinner {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.9); /* White overlay with opacity */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999; /* Ensure it's above other content */
}

/* Styles for the spinner */
.spinner {
  border: 3px solid #00838f; /* color border */
  border-top: 4px solid transparent; /* Transparent top border to create a spinner effect */
  border-radius: 50%;
  width: 80px;
  height: 80px;
  animation: spin 1s linear infinite; /* Spin animation */
}

/* Keyframes for the spin animation */
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

  `],
  template: `

    <div class="overlay-spinner">
      <div class="spinner"></div>
    </div>
  `,
})
export class LoadingSpinnerComponent {}