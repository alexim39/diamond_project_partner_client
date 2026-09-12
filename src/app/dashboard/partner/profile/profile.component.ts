import {Component, Input, OnChanges, OnInit, ChangeDetectionStrategy, SimpleChanges} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import { PartnerInterface } from '../../../_common/services/partner.service';
import { AvatarComponent } from '../../../_common/avatar.component';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

/**
 * @title Profile — sidenav identity card.
 * Photo resolves both storage generations (absolute Cloudinary URLs and
 * legacy `/uploads/` filenames) via the shared avatar; members without
 * social pages simply show no icon (never a stranger's profile).
 */
@Component({
selector: 'async-profile',
template: `

<div class="card">
  <async-avatar [photo]="partner?.profileImage" [name]="displayName()" size="md" />
  <div class="name">{{partner.name | titlecase}} {{partner.surname | titlecase}}</div>
  <div class="title">&#64;{{partner.username | lowercase}}</div>
  <!-- <div class="title">090 6365 8652</div> -->
  <div class="social">
    <!-- <a href="#"><i class="fa fa-dribbble"></i></a>  -->
    @if (twitter) {
      <a [href]="twitter" target="_blank" rel="noopener"><i class="fa fa-twitter"></i></a>
    }
    @if (linkedin) {
      <a [href]="linkedin" target="_blank" rel="noopener"><i class="fa fa-linkedin"></i></a>
    }
    @if (facebook) {
      <a [href]="facebook" target="_blank" rel="noopener"><i class="fa fa-facebook"></i></a>
    }
  </div>
  <button (click)="submitTicket()" mat-button>Contact</button>
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
  .name {
    font-size: 0.9em;
    font-weight: 600;
    margin-top: 0.4em;
  }
  .title {
    font-size: 0.8em;
    color: var(--dp-sidenav-text);
    opacity: 0.75;
    //margin-top: 0.8em;
  }
  .social {
    a {
      margin-right: 1em;
      font-size: small;
      color: var(--dp-sidenav-text);
      opacity: 0.8;
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
    a:last-child {
      margin-right: 0;
    }
  }
}

`],
changeDetection: ChangeDetectionStrategy.OnPush,
imports: [MatButtonModule, CommonModule, AvatarComponent]
})
export class ProfileComponent implements OnInit, OnChanges {
  constructor(
      private router: Router
  ){}

  @Input() partner!: PartnerInterface;

  twitter = ''
  linkedin = ''
  facebook = ''

  ngOnInit() {
    this.deriveFromPartner();
  }

  ngOnChanges(changes: SimpleChanges) {
    // OnPush-safe: re-derive when the shell hands us a new partner object.
    if (changes['partner']) this.deriveFromPartner();
  }

  protected displayName(): string {
    if (!this.partner) return '';
    return `${this.partner.name ?? ''} ${this.partner.surname ?? ''}`.trim() || this.partner.username || '';
  }

  private deriveFromPartner() {
    //console.log(this.partner)
    if (!this.partner) return;

    // No personal-ID fallback: members without a page show no icon.
    this.facebook = this.partner?.facebookPage || '';
    this.twitter = this.partner?.twitterPage || '';
    this.linkedin = this.partner?.linkedinPage || '';
  }

  submitTicket() {
    this.router.navigate(['/dashboard/support/ticket'])
  }
}
