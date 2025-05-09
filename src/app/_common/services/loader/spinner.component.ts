import { Component } from '@angular/core';
import { LoadingService } from './spinner.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'async-spinner',
  imports: [CommonModule],
  template: `
    <div *ngIf="loadingService.loading$ | async" class="overlay">
      <div class="circle-loader">
        <div class="dot" *ngFor="let dot of dots; index as i" [style.animationDelay.ms]="i * 1000"></div>
      </div>
    </div>
  `,
  styles: [`
    .overlay {
      position: fixed;
      inset: 0;
      background-color: rgba(0, 0, 0, 0.4);
      backdrop-filter: blur(4px);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .circle-loader {
      position: relative;
      width: 60px;
      height: 60px;
    }

    .dot {
      position: absolute;
      width: 4px;
      height: 8px;
      background-color: #ffab40;
      border-radius: 50%;
      animation: orbit 1.2s linear infinite;
    }

    @keyframes orbit {
      0%   { transform: rotate(0deg) translateX(25px) rotate(0deg); opacity: 0.3; }
      50%  { opacity: 1; }
      100% { transform: rotate(360deg) translateX(25px) rotate(-360deg); opacity: 0.3; }
    }
  `]
})
export class SpinnerComponent {
  dots = Array(10); // 10 dots in the orbit
  constructor(public loadingService: LoadingService) {}
}
