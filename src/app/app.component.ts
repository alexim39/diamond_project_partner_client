import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from './index/footer/footer.component';
import { NavComponent } from './index/nav/nav.component';


@Component({
  selector: 'async-root',
  standalone: true,
  imports: [RouterOutlet, FooterComponent, NavComponent],
  template: `
  <div id="container">
    <async-nav></async-nav>
    <div class="body">
      <router-outlet></router-outlet>
    </div>
    <async-footer class="footer"></async-footer>
  </div>
  `,
  styles: [`

#container {
  animation: fadeInAnimation ease 3s;
  .body {
    display: grid;
    min-height: 100vh;
    grid-template-rows: auto 1fr auto;
  }
}
@keyframes fadeInAnimation {
  0% {
      opacity: 0;
  }
  100% {
      opacity: 1;
  }
}

/* Extra small devices (phones, 600px and down) */
@media only screen and (max-width: 600px) {
  #container {
    display:flex;
    flex-direction: column;
  }
}
  `]
})
export class AppComponent {}
