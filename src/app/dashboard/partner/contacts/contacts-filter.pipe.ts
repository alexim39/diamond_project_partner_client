import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'contactFilter',
  standalone: true // Make the pipe standalone
})
export class ConctactFilterPipe implements PipeTransform {

  transform(campaign: any[], filterText: string): any[] {
    if (!campaign || !filterText) {
      return campaign;
    }
    return campaign.filter(campaign => campaign.prospectName.toLowerCase().includes(filterText.toLowerCase()));
  }

}