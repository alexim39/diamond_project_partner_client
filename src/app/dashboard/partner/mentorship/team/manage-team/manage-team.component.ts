import { Component, Input, OnInit } from '@angular/core';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import { MatRadioModule } from '@angular/material/radio';
import { MatCardModule } from '@angular/material/card';
import { PartnerInterface } from '../../../../../_common/services/partner.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { TeamInterface } from '../team.service';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { TruncatePipe } from '../../../../../_common/pipes/truncate.pipe';

@Component({
  selector: 'async-manage-team',
  templateUrl: 'manage-team.component.html',
  styleUrls: ['manage-team.component.scss'],
  standalone: true,
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
    TruncatePipe
  ],
})
export class ManageTeamComponent implements OnInit {
  @Input() partner!: PartnerInterface;
  @Input() teams!: TeamInterface[];

  dataSource: TeamInterface[] = [];
  isEmptyRecord = false;
  filterText: string = '';
  displayedColumns: string[] = ['team', 'purpose', 'desc', 'date', 'action'];

  constructor() {}

  ngOnInit() {
    //console.log(this.teams)
    if (this.teams && this.teams.length > 0) {
      this.dataSource = this.teams.sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    } else {
      this.isEmptyRecord = true;
    }
  }

  delete(id: string) {

  }

  // Scroll to top when clicked
  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
