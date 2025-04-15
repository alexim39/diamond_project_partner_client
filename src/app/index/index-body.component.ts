import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { BannerComponent } from './banner/banner.component';
import { WhyWeExistComponent } from './why-we-exist/why-we-exist.component';
import { BePartnerComponent } from './be-partner/be-partner.component';



@Component({
    selector: 'async-index-body',
    imports: [BannerComponent, WhyWeExistComponent, RouterModule, BePartnerComponent,],
    template: `
    <async-banner></async-banner>
    <async-be-partner></async-be-partner>
    <async-index-why-we-exist></async-index-why-we-exist>
  `,
    styles: [` `]
})
export class IndexBodyComponent {}
