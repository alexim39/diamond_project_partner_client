import {Component, Input, OnInit} from '@angular/core';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {FormsModule} from '@angular/forms';
import {MatRadioModule} from '@angular/material/radio';
import {MatCardModule} from '@angular/material/card';
import { PartnerInterface } from '../../../../_common/services/partner.service';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';

/**
 * @title Prospect invitation
 */
@Component({
  selector: 'async-invitation',
  templateUrl: 'invitation.component.html',
  styleUrl: 'invitation.component.scss',
  standalone: true,
  imports: [MatCardModule, MatRadioModule,MatIconModule, MatButtonModule,FormsModule, MatCheckboxModule, MatSlideToggleModule],
})
export class InvitationComponent implements OnInit {
  @Input() partner!: PartnerInterface;
  whatsappMessage = `Hi friend, <br> I started an online business that is giving me passive income. <br> If its something you want to try`;

  constructor() {}

  ngOnInit() {
    if (this.partner) {
      const whatsappLink = `<br>Visit this link: <a href="http://diamondprojectonline.com/${this.partner.username}" target="_blank">www.diamondprojectonline.com/${this.partner.username}</a>`;
      this.whatsappMessage = this.whatsappMessage + whatsappLink;
    }
  }

  sendWhatsAppInvitation() {
    const message = encodeURIComponent(`Hi friend, I started an online business that is giving me passive income. if it's something you want to try visit this link http://diamondprojectonline.com/${this.partner.username}`);
    const whatsappUrl = `https://wa.me/?text=${message}`;
    window.open(whatsappUrl, '_blank');
  }
}