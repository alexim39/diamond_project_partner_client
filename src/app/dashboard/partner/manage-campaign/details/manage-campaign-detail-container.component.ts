import { Component, OnInit } from '@angular/core';
import { ManageCampaignDetailComponent } from './manage-campaign-detail.component';
import { ActivatedRoute, Router } from '@angular/router';
import { CampaignInterface, CampaignService } from '../manage-campaign.service';
import { CommonModule } from '@angular/common';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';

@Component({
  selector: 'async-manage-campain-detail-container',
  template: `
  <ng-container *ngIf="!isEmptyRecord">
    <async-manage-campain-detail *ngIf="campaign" [campaign]="campaign"></async-manage-campain-detail>
  </ng-container>
    <ng-container *ngIf="isEmptyRecord">
        <div class="container">
          <p class="no-content">Something Went Wrong</p>
          <button mat-flat-button (click)="browserBackHistory()"><mat-icon>arrow_back</mat-icon>Go back</button>
        </div>
    </ng-container>
  `,
  standalone: true,
  providers: [CampaignService],
  imports: [ManageCampaignDetailComponent, CommonModule, MatButtonModule, MatIconModule],
  styles: `
  .container {
    padding: 2em;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
  .no-content {
    color: rgb(196, 129, 4);
    font-weight: bold;
  }
   
  `
})
export class ManageCampaignDetailContainerComponent implements OnInit {

  campaign!: CampaignInterface;
  campaignId!: string | null;
  isEmptyRecord = false;

  constructor(
    private router: Router, 
    private route: ActivatedRoute,
    private campaignService: CampaignService
  ) { }

  back(): void {
    this.router.navigateByUrl('dashboard/manage-campaign');
  }

  ngOnInit(): void {
      this.route.paramMap.subscribe(params => {
        this.campaignId = params.get('id');
        if (this.campaignId) {
          // Fetch campaign details using the ID
          this.campaignService.getCampaignById(this.campaignId).subscribe(campaign => {
            this.campaign = campaign;
          }, error => {
            this.isEmptyRecord = true;
          });
        }
      });
  }

  browserBackHistory () {
    window.history.back();  
  }
}
