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
    // Define API
    apiURL = 'https://diamondprojectapi-y6u04o8b.b4a.run/';
    //apiURL = 'http://localhost:3000';

  @Input() partner!: PartnerInterface;

  profilePictureUrl = "./img/default_pp.png"
  twitter = ''
  linkedin = ''
  facebook = ''

  constructor( ) {  }

  ngOnInit() {
    //console.log(this.partner)
    if (this.partner.profileImage) {
      this.profilePictureUrl = this.apiURL + `/uploads/${this.partner.profileImage}`;
    }

    if (this.partner?.socialMedia?.facebook) {
      this.facebook = this.partner?.socialMedia?.facebook;
    } else {
      this.facebook = 'https://www.facebook.com/profile.php?id=61561933352527';
    }

    if (this.partner?.socialMedia?.twitter) {
      this.twitter = this.partner?.socialMedia?.twitter;
    } else {
      this.twitter = '';
    }

    if (this.partner?.socialMedia?.linkedin) {
      this.linkedin = this.partner?.socialMedia?.linkedin;
    } else {
      this.linkedin = '';
    }
  }
}