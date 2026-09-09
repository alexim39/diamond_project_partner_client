import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FooterComponent } from '../index/footer/footer.component';
import { NavComponent } from '../index/nav/nav.component';
@Component({
    selector: 'async-index',
    imports: [RouterModule, FooterComponent, NavComponent],
    template: `
    <async-nav></async-nav>
    <router-outlet></router-outlet>
    <async-footer class="footer"></async-footer>
  `,
    changeDetection: ChangeDetectionStrategy.Eager,
    styles: [`
  `]
})
export class IndexComponent { 
  constructor( ) {}
  
  ngOnInit(): void { }
}
