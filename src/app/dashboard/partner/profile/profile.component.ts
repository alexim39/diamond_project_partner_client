import {Component, Input, OnInit} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import { PartnerInterface, PartnerService } from '../../../_common/services/partner.service';
import { CommonModule } from '@angular/common';
import { environment } from '../../../../environments/environment';

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
  private apiURL: string = environment.apiUrl; 

  profilePictureUrl = "./img/default_pp.png"

  constructor( ) {  }

  ngOnInit() {
    //console.log(this.partner)
    if (this.partner.profileImage) {
      this.profilePictureUrl = this.apiURL + `/uploads/${this.partner.profileImage}`;
    }
  }
}