import {Component, Input, OnInit} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import { PartnerInterface, PartnerService } from '../../../_common/services/partner.service';
import { CommonModule } from '@angular/common';

/**
 * @title Profile
 */
@Component({
selector: 'async-profile',
template: `

<div class="card">
  <img [src]="profilePictureUrl" alt="Profile Image">
  <div class="name">{{partner.name | titlecase}} {{partner.surname | titlecase}}</div>
  <div class="title">&#64;{{partner.username | lowercase}}</div>
  <!-- <div class="title">090 6365 8652</div> -->
  <div class="social">
    <!-- <a href="#"><i class="fa fa-dribbble"></i></a>  -->
    <a [href]="twitter"  target="_blank"><i class="fa fa-twitter"></i></a>  
    <a [href]="linkedin"  target="_blank"><i class="fa fa-linkedin"></i></a>  
    <a [href]="facebook" target="_blank"><i class="fa fa-facebook"></i></a> 
  </div>
  <button mat-button>Contact</button>
</div>

`,
styles: [`

.card {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin: 10em 0 -1em 0.5em;
  border-bottom: 1px solid #e4e4e4;
  padding-bottom: 0.5em;
  //background-color: red;
  width: 100%;
  img {
    width: 3em;
    height: 3em;
    border-radius: 50%;
  }
  .name {
    font-size: 0.7em;
  }
  .title {
    font-size: 0.6em;
    color: gray;
    //margin-top: 0.8em;
  }
  .social {
    a {
      margin-right: 1em;
      font-size: small;
      color: black;
      cursor: pointer;
      .fa-linkedin {
        //color: #0077B5;
      }
      .fa-linkedin:hover {
       // opacity: 0.5;
       color: #0077B5;
      }
      .fa-facebook {
        //color: #1877F2;
      }
      .fa-facebook:hover {
        //opacity: 0.5;
        color: #1877F2;
      }
      .fa-twitter {
        //color: #1DA1F2;
      }
      .fa-twitter:hover {
        //opacity: 0.5;
        color: #1DA1F2;
      }
    }
  }
}

`],
imports: [MatButtonModule, CommonModule]
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

    if (this.partner?.facebookPage) {
      this.facebook = this.partner?.facebookPage;
    } else {
      this.facebook = 'https://www.facebook.com/profile.php?id=61561933352527';
    }

    if (this.partner?.twitterPage) {
      this.twitter = this.partner?.twitterPage;
    } else {
      this.twitter = '';
    }

    if (this.partner?.linkedinPage) {
      this.linkedin = this.partner?.linkedinPage;
    } else {
      this.linkedin = '';
    }
  }
}