import {Component, OnDestroy, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { PartnerInterface, PartnerService } from '../../../../../../_common/services/partner.service';
import { Subscription } from 'rxjs';
import { TeamInterface, TeamService } from '../../team.service';
import { TeamSupportComponent } from './support.component';
import { ActivatedRoute, Router } from '@angular/router';

/**
 * @title Container
 */
@Component({
    selector: 'async-team-support-container',
    template: `
  <async-team-support *ngIf="partner && team" [partner]="partner" [team]="team" />
  `,
    providers: [TeamService],
    imports: [CommonModule, TeamSupportComponent]
})
export class TeamSupportContainerComponent implements OnInit, OnDestroy {

    
  partner!: PartnerInterface;
  subscriptions: Subscription[] = [];
  team!: TeamInterface;
  isEmptyRecord = false;

  constructor(
    private partnerService: PartnerService,
    private teamService: TeamService,
    private router: Router, 
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {
      
    // get current signed in user
    this.subscriptions.push(
      this.partnerService.getSharedPartnerData$.subscribe({
       
        next: (partner: PartnerInterface) => {
          this.partner = partner;
        },
      
  })
    )

    this.route.paramMap.subscribe(params => {
      const teamId = params.get('id');
      if (teamId) {
        // Fetch prospect details using the ID
        this.subscriptions.push(
          this.teamService.getTeamById(teamId).subscribe({
            next: (team) => {
              this.team = team.data;
            },
            error: () => {
              this.isEmptyRecord = true;
            }
          })
        )
        
      }
    });
  }

  ngOnDestroy() {
    // unsubscribe list
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }
}
