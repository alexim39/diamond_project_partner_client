import { CommonModule } from '@angular/common';
import {AfterViewInit, Component, ElementRef, signal, ViewChild} from '@angular/core';
import {MatBadgeModule} from '@angular/material/badge';
import {MatButtonModule} from '@angular/material/button';
import {MatInputModule} from '@angular/material/input';
import { IndexSearchContainerComponent } from './search/search-container.component';

/**
 * @title dashboard index
 */
@Component({
  selector: 'async-dashboard-index',
  templateUrl: 'index.component.html',
  styleUrls: ['index.component.scss'],
  standalone: true,
  imports: [MatButtonModule, MatBadgeModule, CommonModule, IndexSearchContainerComponent, MatInputModule],
})
export class DashboardIndexComponent  {}