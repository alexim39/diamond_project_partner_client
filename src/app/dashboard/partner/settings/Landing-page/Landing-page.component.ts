import {Component, inject, Input} from '@angular/core';
import {MatTabsModule} from '@angular/material/tabs';
import { PartnerInterface } from '../../../../_common/services/partner.service';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { HelpDialogComponent } from '../../../../_common/help-dialog.component';
import { SocialMediaSettingsComponent } from './social-media/social-media.component';
import { CommonModule } from '@angular/common';
import { TestimonialWriteupSettingsComponent } from './testimonial-writeup/testimonial-writeup.component';

/**
 * @title landing page settings
 */
@Component({
  selector: 'async-landing-page-setting',
  templateUrl: 'landing-page.component.html',
  styleUrls: ['landing-page.component.scss'],
  standalone: true,
  imports: [MatTabsModule, CommonModule, MatIconModule, MatButtonModule, SocialMediaSettingsComponent, TestimonialWriteupSettingsComponent],
})
export class LandingPageSettingComponent {
    @Input() partner!: PartnerInterface;
    readonly dialog = inject(MatDialog);

    constructor(
        private router: Router,
    ) { }
    
    ngOnInit(): void {
        //console.log(this.partner)
    }

     // scroll to top when clicked
  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  showDescription () {
    this.dialog.open(HelpDialogComponent, {
      data: {help: 'In this section, you can set up your landing page variables'},
    });
  }
}
