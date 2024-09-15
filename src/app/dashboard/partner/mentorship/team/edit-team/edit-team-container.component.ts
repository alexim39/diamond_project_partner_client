import {Component, OnDestroy, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { PartnerInterface, PartnerService } from '../../../../../_common/services/partner.service';
import { Subscription } from 'rxjs';
import { EditTeamComponent } from './edit-team.component';
import { ActivatedRoute, Router } from '@angular/router';
import { TeamInterface, TeamService } from '../team.service';

/**
 * @title Container
 */
@Component({
  selector: 'async-edit-team-container',
  template: `
  <async-edit-team *ngIf="partner && team" [partner]="partner" [team]="team"></async-edit-team>
  `,
  standalone: true,
  providers: [TeamService],
  imports: [CommonModule, EditTeamComponent],
})
export class EditTeamContainerComponent implements OnInit, OnDestroy {

    
  partner!: PartnerInterface;
  subscriptions: Subscription[] = [];
  isEmptyRecord = false;
  team!: TeamInterface;

  constructor(
    private partnerService: PartnerService,
    private router: Router, 
    private route: ActivatedRoute,
    private teamService: TeamService,
  ) { }

  ngOnInit() {
      
    // get current signed in user
    this.subscriptions.push(
      this.partnerService.getSharedPartnerData$.subscribe(
       
        partnerObject => {
          this.partner = partnerObject as PartnerInterface
          if (this.partner) {
            //console.log(this.partner)
          }
        },
        
        error => {
          console.log(error)
          // redirect to home page
        }
      )
    )

    this.route.paramMap.subscribe(params => {
      const teamId = params.get('id');
      if (teamId) {
        // Fetch prospect details using the ID
        this.subscriptions.push(
          this.teamService.getTeamById(teamId).subscribe(team => {
            //console.log(team)
            this.team = team.data;
          }, error => {
            this.isEmptyRecord = true;
          })
        )
        
      }
    });
  }

  ngOnDestroy() {
    // unsubscribe list
    this.subscriptions.forEach(subscription => {
      subscription.unsubscribe();
    });
  }
}