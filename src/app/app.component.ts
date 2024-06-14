import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavComponent } from './index/nav/nav.component';
import { FooterComponent } from './index/footer/footer.component';
import { BannerComponent } from './index/banner/banner.component';
import { WhyWeExistComponent } from './index/why-we-exist/why-we-exist.component';

@Component({
  selector: 'async-root',
  standalone: true,
  imports: [RouterOutlet, NavComponent, FooterComponent, BannerComponent, WhyWeExistComponent],
  template: `
    <async-nav></async-nav>

    <async-banner></async-banner>

    <async-index-why-we-exist></async-index-why-we-exist>

    <async-footer></async-footer>
  `,
  styles: [`
  `]
})
export class AppComponent {
  title = 'partners vae';
}
