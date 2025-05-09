import {Component, Input, OnInit} from '@angular/core';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {FormsModule} from '@angular/forms';
import {MatRadioModule} from '@angular/material/radio';
import {MatCardModule} from '@angular/material/card';
import { PartnerInterface } from '../../../../_common/services/partner.service';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

/**
 * @title Prospect invitation
 */
@Component({
selector: 'async-invitation',
template: `

<section class="async-background">
    <h2>Prospect invitation</h2>

    <section class="async-container">
        <div class="title">
            <h3>Invite using different channels</h3>
            <div class="fund-area">
                <a mat-raised-button><mat-icon>monitoring</mat-icon>Check invites status</a>

                <!-- <div class="fund">
                    Prepaid balance
                    N5,000
                </div> -->
            </div>
        </div>

        <!-- <div class="search">
            <mat-form-field appearance="outline">
                <mat-label>Filter by transanction amount</mat-label>
                <input matInput placeholder="0.00" type="search">
            </mat-form-field>
        </div> -->

        <div class="container">

            <mat-card appearance="outlined">
                <mat-card-header>
                  <mat-card-title class="whatsApp"><i class="fa fa-whatsapp"></i> WhatsApp Invitation</mat-card-title>
                  <!-- <mat-card-subtitle>Dog Breed</mat-card-subtitle> -->
                </mat-card-header>
                <mat-card-content>
                  <p [innerHTML]="whatsappMessage"> </p>
                </mat-card-content>
                <mat-card-actions>
                  <!-- <button mat-button><mat-icon>edit</mat-icon>Custom Message</button> -->
                  <button mat-button class="whatsApp" (click)="sendWhatsAppInvitation()"><mat-icon>share</mat-icon>Share</button>
                </mat-card-actions>
            </mat-card>

            <mat-card appearance="outlined">
                <mat-card-header>
                  <mat-card-title class="facebook"><i class="fa fa-facebook"></i> Facebook Invitation</mat-card-title>
                  <!-- <mat-card-subtitle>Dog Breed</mat-card-subtitle> -->
                </mat-card-header>
                <mat-card-content>
                  <p [innerHTML]="facebookMessage"> </p>
                </mat-card-content>
                <mat-card-actions>
                  <!-- <button mat-button><mat-icon>edit</mat-icon>Custom Message</button> -->
                  <button mat-button class="facebook" (click)="postToFacebookTimeline()"><mat-icon>share</mat-icon>Post</button>
                  <!-- <button mat-button class="facebook" (click)="postToFacebookTimeline()"><mat-icon>send</mat-icon>Post</button> -->
                </mat-card-actions>
            </mat-card>


        </div>

    </section>

</section>

`,
styles:  `

.async-background {
    margin: 2em;
    .async-container {
        background-color: #dcdbdb;
        border-radius: 1%;
        height: 100%;
        padding: 1em;
        .title {
            display: flex;
            justify-content: space-between;
            border-bottom: 1px solid #ccc;
            padding: 1em;
            .fund-area {
                .fund {
                    //display: flex;
                    font-weight: bold;
                    margin-top: 1em;
                }
            }
        }

        .search {
            padding: 0.5em 0;
            //display: flex;
            //flex-direction: center;
            text-align: center;
            mat-form-field {
                width: 70%;

            }
        }

       
    }
}

.container {
    padding: 1em 0;
    display: flex;
    mat-card {
        margin: 0 1em;
        .whatsApp {
            color: #075E54;
        }
        .facebook {
            color: #3b5998;
        }
        p {
            font-size: 1.1em;
        }
    }
}


 /* Media Query for Mobile Responsiveness */
 @media screen and (max-width: 600px) {
    .container {
        display: flex;
        flex-direction: column;
        mat-card {
            margin: 1em 0;
        }
    }
 }

`,
imports: [MatCardModule, MatRadioModule, MatIconModule, MatButtonModule, FormsModule, MatCheckboxModule, MatSlideToggleModule]
})
export class InvitationComponent implements OnInit {
  @Input() partner!: PartnerInterface;
  whatsappMessage = `Hi friend, <br> I started an online business that is giving me passive income. <br> If its something you want to try`;
  facebookMessage = `You can optionally write a message while posting your link on Facebook  <br><br>`
  constructor(
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    if (this.partner) {
      const userLink = `<br>Visit this link: <a href="http://diamondprojectonline.com/${this.partner.username}" target="_blank">www.diamondprojectonline.com/${this.partner.username}</a>`;
      this.whatsappMessage = this.whatsappMessage + userLink;
      this.facebookMessage = this.facebookMessage + userLink;
    }
  }

  sendWhatsAppInvitation() {
    const message = encodeURIComponent(`Hi friend, I started an online business that is giving me passive income. if it's something you want to try visit this link http://diamondprojectonline.com/${this.partner.username}`);
    const whatsappUrl = `https://wa.me/?text=${message}`;
    window.open(whatsappUrl, '_blank');
  }

  postToFacebookTimeline() {
    const link = `http://diamondprojectonline.com/${this.partner.username}`;
    const facebookTimelineUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`;
    window.open(facebookTimelineUrl, '_blank');
  }
}