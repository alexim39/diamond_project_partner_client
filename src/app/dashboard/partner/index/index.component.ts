import {Component, signal} from '@angular/core';
import {MatBadgeModule} from '@angular/material/badge';
import {MatButtonModule} from '@angular/material/button';

/**
 * @title dashboard index
 */
@Component({
  selector: 'async-dashboard-index',
  templateUrl: 'index.component.html',
  styleUrls: ['index.component.scss'],
  standalone: true,
  imports: [MatButtonModule, MatBadgeModule],
})
export class DashboardIndexComponent {}