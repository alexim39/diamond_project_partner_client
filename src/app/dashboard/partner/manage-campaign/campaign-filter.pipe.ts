import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'campaignFilter',
  standalone: true // Make the pipe standalone
})
export class CampaignFilterPipe implements PipeTransform {

  transform(campaign: any[], filterText: string): any[] {
    if (!campaign || !filterText) {
      return campaign;
    }
    return campaign.filter(campaign => campaign.campaignName.toLowerCase().includes(filterText.toLowerCase()));
  }

}