import { Component, OnInit } from '@angular/core';
import { ManageCampaignDetailComponent } from './manage-campaign-detail.component';
import { ActivatedRoute, Router } from '@angular/router';
import { ManageCampaignInterface } from '../manage-campaign.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'async-manage-campain-detail-container',
  template: `
  <async-manage-campain-detail *ngIf="campaign" [campaign]="campaign"></async-manage-campain-detail>
  `,
  standalone: true,
  imports: [ManageCampaignDetailComponent, CommonModule],
})
export class ManageCampaignDetailContainerComponent implements OnInit {

  campaign!: ManageCampaignInterface;
  campaignId!: string | null;

  constructor(private router: Router, private route: ActivatedRoute) { }

  back(): void {
    this.router.navigateByUrl('dashboard/manage-campaign');
  }



  ngOnInit(): void {
      this.route.paramMap.subscribe(params => {
        this.campaignId = params.get('id');
        if (this.campaignId) {
          // Fetch campaign details using the ID
         /*  this.campaignService.getCampaignById(this.campaignId).subscribe(campaign => {
            this.campaign = campaign;
          }); */
        }
      });
  }
}
