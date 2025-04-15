import { CommonModule } from '@angular/common';
import {AfterViewInit, Component, ElementRef, signal, ViewChild} from '@angular/core';
import {MatBadgeModule} from '@angular/material/badge';
import {MatButtonModule} from '@angular/material/button';
import {MatInputModule} from '@angular/material/input';
import { IndexSearchContainerComponent } from './search/search-container.component';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

/**
 * @title dashboard index
 */
@Component({
    selector: 'async-dashboard-index',
    templateUrl: 'index.component.html',
    styleUrls: ['index.component.scss', 'index.mobile.scss'],
    imports: [MatButtonModule, RouterModule, MatIconModule, MatCardModule, MatBadgeModule, CommonModule, IndexSearchContainerComponent, MatInputModule]
})
export class DashboardIndexComponent  {
  appName = 'Diamond Project Online Partners Platform';
  currentYear = new Date().getFullYear();
}