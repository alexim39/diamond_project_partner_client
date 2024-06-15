import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { BannerComponent } from '../index/banner/banner.component';
import { WhyWeExistComponent } from '../index/why-we-exist/why-we-exist.component';


@Component({
  selector: 'async-index',
  standalone: true,
  imports: [BannerComponent, WhyWeExistComponent, RouterModule],
  template: `
    
    <async-banner></async-banner>
    <async-index-why-we-exist></async-index-why-we-exist>
    

  `,
  styles: [`
  `]
})
export class IndexComponent { 
  constructor( ) {}
  
  ngOnInit(): void { }
}
