import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from './index/footer/footer.component';
import { NavComponent } from './index/nav/nav.component';


@Component({
  selector: 'async-root',
  standalone: true,
  imports: [RouterOutlet, FooterComponent, NavComponent],
  template: `
    <async-nav></async-nav>
    <div class="body">
      <router-outlet></router-outlet>
    </div>
    <async-footer class="footer"></async-footer>
  `,
  styles: [`
  .body {
    display: grid;
    min-height: 100vh;
    grid-template-rows: auto 1fr auto;
  }
  `]
})
export class AppComponent {}
