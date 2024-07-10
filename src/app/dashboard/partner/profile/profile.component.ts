import {Component} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';

/**
 * @title Profile
 */
@Component({
  selector: 'async-profile',
  templateUrl: 'profile.component.html',
  styleUrls: ['profile.component.scss'],
  standalone: true,
  imports: [MatButtonModule,],
})
export class ProfileComponent {
}