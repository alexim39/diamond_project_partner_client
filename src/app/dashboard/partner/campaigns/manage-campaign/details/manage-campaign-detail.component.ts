import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { CampaignInterface } from '../manage-campaign.service';
import {MatDividerModule} from '@angular/material/divider';
import {MatListModule} from '@angular/material/list';
import { CommonModule } from '@angular/common';
import {MatButtonModule} from '@angular/material/button';

/** @title Disabled select */
@Component({
  selector: 'async-manage-campain-detail',
  templateUrl: 'manage-campaign-detail.component.html',
  styleUrls: ['manage-campaign-detail.component.scss'],
  standalone: true,
  imports: [
    MatCheckboxModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatIconModule, MatButtonModule,
    MatDividerModule, MatListModule, CommonModule
  ],
})
export class ManageCampaignDetailComponent implements OnInit {

  @Input() campaign!: CampaignInterface;
  campaignData!: any; 
  duration!: null | number;
  

  constructor(private router: Router, private route: ActivatedRoute) { }

  back(): void {
    this.router.navigateByUrl('dashboard/manage-campaign');
  }

  
  ngOnInit(): void { 
    //console.log(this.campaignData)
    if (this.campaign.data) {
      this.campaignData = this.campaign.data;
      
    }
    this.calculateDuration();
   }

  private calculateDuration() {

    if (!this.campaignData.adDuration.noEndDate) {

      const startDateControl = this.campaignData.adDuration.campaignStartDate;
      const endDateControl = this.campaignData.adDuration.campaignEndDate;
      if (startDateControl && endDateControl) {
        const startDate = new Date(startDateControl);
        const endDate = new Date(endDateControl);
        if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
          const durationInMilliseconds = endDate.getTime() - startDate.getTime();
          this.duration = durationInMilliseconds / (1000 * 3600 * 24);
        } /* else {
          this.duration = null;
        } */
      }
    }/*  else {
      this.duration = null;
    } */
  }


  getSelectedAdPreferences(): string[] {
    const adPreferencesGroup = this.campaignData.adFormat.adPreferences;
    if (!adPreferencesGroup) {
      return [];
    }

    const selectedPreferences = Object.keys(adPreferencesGroup)
      .filter(key => adPreferencesGroup[key])
      .map(key => this.separateCamelCase(key));

    return selectedPreferences;
  }

  private separateCamelCase(input: string): string {
    let result = '';

    for (let i = 0; i < input.length; i++) {
      const char = input.charAt(i);
      // Check if the character is uppercase and not the first character
      if (char === char.toUpperCase() && i !== 0) {
        // Separate the words at this position
        result = `${input.substring(0, i)} ${input.substring(i)}`;
        break;
      }
    }

    return result.trim();
  }



}
