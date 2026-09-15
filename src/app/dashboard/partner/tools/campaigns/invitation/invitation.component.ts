import {Component, Input, OnInit, ChangeDetectionStrategy, inject} from '@angular/core';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {FormsModule} from '@angular/forms';
import {MatRadioModule} from '@angular/material/radio';
import {MatCardModule} from '@angular/material/card';
import { PartnerInterface } from '../../../../../_common/services/partner.service';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatSnackBar} from '@angular/material/snack-bar';
import { RouterModule } from '@angular/router';

/**
 * @title Share invite link — send your personal link outward.
 */
@Component({
selector: 'async-invitation',
template: `

<section class="breadcrumb-wrapper">
  <div class="breadcrumb">
    <a routerLink="/dashboard">Dashboard</a> &gt;
    <a>Marketing</a> &gt;
    <a>Share</a> &gt;
    <span>Share invite link</span>
  </div>
</section>

<section class="invite-page">
  <div class="page-head">
    <div>
      <h2>Share invite link</h2>
      <p class="subtitle">Your personal link, ready to send anywhere — visits show up under Link traffic.</p>
    </div>
    <a mat-button routerLink="/dashboard/marketing/roi" title="See what campaigns earned"><mat-icon>payments</mat-icon>What campaigns earned</a>
  </div>

  <section class="dp-card link-card">
    <div>
      <span class="muted">Your invite link</span>
      <strong class="link">{{ personalLink() }}</strong>
    </div>
    <span class="spacer"></span>
    <button mat-flat-button color="primary" (click)="copyLink()">Copy link</button>
  </section>

  <div class="channel-grid">
    <mat-card appearance="outlined">
      <mat-card-header>
        <mat-card-title><mat-icon>chat</mat-icon> WhatsApp invitation</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <p>Opens WhatsApp with your invite text and link prefilled — pick the chats, hit send.</p>
      </mat-card-content>
      <mat-card-actions>
        <button mat-button (click)="sendWhatsAppInvitation()"><mat-icon>share</mat-icon>Share</button>
      </mat-card-actions>
    </mat-card>

    <mat-card appearance="outlined">
      <mat-card-header>
        <mat-card-title><mat-icon>public</mat-icon> Facebook invitation</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <p>Opens the Facebook sharer with your link attached — add a line, post to your timeline.</p>
      </mat-card-content>
      <mat-card-actions>
        <button mat-button (click)="postToFacebookTimeline()"><mat-icon>share</mat-icon>Post</button>
      </mat-card-actions>
    </mat-card>
  </div>

</section>

`,
styles:  [`

.invite-page { display: flex; flex-direction: column; gap: 1em; padding-bottom: 2em; }
.page-head { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1em; }
.page-head h2 { margin: 0; }
.page-head a[mat-button] { min-height: 44px; }
.subtitle { margin: 0.25em 0 0; color: var(--dp-muted); max-width: 44em; }
.link-card { padding: 1em; display: flex; align-items: center; gap: 0.75em; flex-wrap: wrap; }
.link-card .muted { display: block; }
.link { overflow-wrap: anywhere; }
.spacer { flex: 1; }
.link-card button { min-height: 44px; }
.channel-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1em; }
.channel-grid mat-card-title { display: flex; align-items: center; gap: 0.4em; font-size: 1.05em; }
.channel-grid mat-card-title mat-icon { color: var(--dp-gold-ink); }
.channel-grid p { color: var(--dp-muted); }
.channel-grid button { min-height: 44px; }
.breadcrumb-wrapper { margin-bottom: 1em; }
.breadcrumb a { text-decoration: none; }

`],
changeDetection: ChangeDetectionStrategy.Eager,
imports: [MatCardModule, MatRadioModule, MatIconModule, MatButtonModule, FormsModule, MatCheckboxModule, MatSlideToggleModule, RouterModule]
})
export class InvitationComponent implements OnInit {
  @Input() partner!: PartnerInterface;
  private readonly snackBar = inject(MatSnackBar);

  ngOnInit() {}

  protected personalLink(): string {
    return `https://c21fg.online/${this.partner?.username ?? ''}`;
  }

  protected copyLink(): void {
    navigator.clipboard.writeText(this.personalLink()).then(() => {
      this.snackBar.open('Invite link copied!', 'Close', { duration: 3000 });
    }).catch(() => {
      this.snackBar.open('Could not copy — long-press the link instead.', 'Close', { duration: 4000 });
    });
  }

  sendWhatsAppInvitation() {
    const message = encodeURIComponent(`Hi friend, I started an online business that is giving me passive income. if it's something you want to try visit this link ${this.personalLink()}`);
    const whatsappUrl = `https://wa.me/?text=${message}`;
    window.open(whatsappUrl, '_blank');
  }

  postToFacebookTimeline() {
    const facebookTimelineUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(this.personalLink())}`;
    window.open(facebookTimelineUrl, '_blank');
  }
}
