import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'prospectListFilter',
  standalone: true // Make the pipe standalone
})
export class ProspectListFilterPipe implements PipeTransform {

  transform(campaign: any[], filterText: string): any[] {
    if (!campaign || !filterText) {
      return campaign;
    }
    return campaign.filter(campaign => campaign.name.toLowerCase().includes(filterText.toLowerCase()));
  }

}