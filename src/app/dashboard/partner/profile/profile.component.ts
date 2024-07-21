import {Component, Input, OnInit} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import { PartnerInterface, PartnerService } from '../../../_common/services/partner.service';
import { CommonModule } from '@angular/common';

/**
 * @title Profile
 */
@Component({
  selector: 'async-profile',
  templateUrl: 'profile.component.html',
  styleUrls: ['profile.component.scss'],
  standalone: true,
  imports: [MatButtonModule, CommonModule],
})
export class ProfileComponent implements OnInit {
  @Input() partner!: PartnerInterface;

  constructor(
    
  ) {  }

  ngOnInit() {
    
  }
}