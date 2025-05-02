import { Component, Input, OnInit } from '@angular/core';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import { MatRadioModule } from '@angular/material/radio';
import { MatCardModule } from '@angular/material/card';
import { PartnerInterface } from '../../../../_common/services/partner.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';

@Component({
    selector: 'async-purchases',
    templateUrl: 'purchases.component.html',
    styleUrls: ['purchases.component.scss'],
    imports: [
        MatCardModule,
        CommonModule,
        MatTableModule,
        MatRadioModule,
        MatIconModule,
        RouterModule,
        MatButtonModule,
        FormsModule,
        MatCheckboxModule,
        MatSlideToggleModule,
    ]
})
export class PurchasesComponent implements OnInit {
  @Input() partner!: PartnerInterface;
  @Input() cartObject!: any[];
  isEmptyRecord = false;


  constructor() {}

  ngOnInit() {
    if (this.cartObject && this.cartObject.length > 0) {
    } else {
      this.isEmptyRecord = true;
    }
  }

  // Scroll to top when clicked
  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
