import { Component, Input, OnInit } from '@angular/core';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import { MatRadioModule } from '@angular/material/radio';
import { MatCardModule } from '@angular/material/card';
import { PartnerInterface } from '../../../../../_common/services/partner.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';
import { TeamInterface, TeamService } from '../team.service';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { TruncatePipe } from '../../../../../_common/pipes/truncate.pipe';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'async-manage-team',
  templateUrl: 'manage-team.component.html',
  styleUrls: ['manage-team.component.scss'],
  standalone: true,
  imports: [
    MatCardModule, MatTooltipModule,
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
  providers: [TeamService],
})
export class ManageTeamComponent implements OnInit {
  @Input() partner!: PartnerInterface;
  @Input() teams!: TeamInterface[];
  subscriptions: Subscription[] = [];
  dataSource: TeamInterface[] = [];
  isEmptyRecord = false;
  filterText: string = '';
  displayedColumns: string[] = ['team', 'purpose', 'member', 'owner', 'date'];

  constructor(
    private router: Router,
  ) {}

  ngOnInit(): void {
    //console.log(this.teams)
    if (this.teams && this.teams.length > 0) {
      this.dataSource = this.teams.sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    } else {
      this.isEmptyRecord = true;
    }
  }

  manage(id: string) {
    this.router.navigate(['/dashboard/team-mgt', id]);
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => {
      subscription.unsubscribe();
    });
  }

  getOwnerName(team: TeamInterface, partnerId: string): string {
    //console.log(team);
  
    if (team && team.members) {
      for (let member of team.members) {
        if (member._id === team.partnerId) {
          return `${member.surname} ${member.name}`;
        }
      }
    }
  
    return 'Unknown Owner';
  }
}