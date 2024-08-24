import {Component, Input, OnInit} from '@angular/core';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {FormsModule} from '@angular/forms';
import {MatRadioModule} from '@angular/material/radio';
import {MatCardModule} from '@angular/material/card';
import { PartnerInterface } from '../../../../../_common/services/partner.service';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import { NavigationEnd, NavigationStart, Router, RouterModule, } from '@angular/router';

/**
 * @title Prospect invitation
 */
@Component({
  selector: 'async-team-members',
  templateUrl: 'team-members.component.html',
  styleUrl: 'team-members.component.scss',
  standalone: true,
  imports: [MatCardModule, MatRadioModule,MatIconModule, RouterModule, MatButtonModule,FormsModule, MatCheckboxModule, MatSlideToggleModule],
})
export class TeamMembersComponent implements OnInit {
  @Input() partner!: PartnerInterface;

  constructor() {}

  ngOnInit() {
    if (this.partner) {
     console.log(this.partner)
    }
  }

  
  // scroll to top when clicked
  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  
}