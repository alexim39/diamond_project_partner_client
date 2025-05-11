import {Component, Input, OnInit} from '@angular/core';
import { ContactsInterface } from '../../../contacts.service';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';



@Component({
selector: 'async-prospect-basic-info-panel',
template: `

<article>  
    <h2>Basic Information</h2>  

        <div class="list">
            <h5> Names </h5>
            <span class="data">{{prospectData.prospectName | titlecase}} {{prospectData.prospectSurname | titlecase}}  </span>
        </div>
        <mat-divider></mat-divider>


        <div class="list">
            <h5> Phone Number </h5>
            <span class="data">{{prospectData.prospectPhone }} </span>
        </div>
        <mat-divider></mat-divider>

        <div class="list">
            <h5> Email Address </h5>
            <span class="data">{{prospectData.prospectEmail | lowercase }} </span>
        </div>
        <mat-divider></mat-divider>

        <div class="list">
            <h5> Age Range</h5>
            <span class="data">{{prospectData.survey.ageRange ? prospectData.survey.ageRange : 'No age range' }} </span>
        </div>
        <mat-divider></mat-divider>

        <div class="list">
            <h5> Contact Channel</h5>
            <span class="data">{{prospectData.prospectSource | titlecase }} </span>
        </div>
        <mat-divider></mat-divider>

        <div class="list">
            <h5> Prospect Source</h5>
            <span class="data">{{prospectData.survey.referral ? (prospectData.survey.referral | titlecase) : 'No source' }} </span>
            @if (prospectData.survey.referralCode) {
                <div class="info">Prospect was referred by <strong>{{prospectData.survey.referralCode}}</strong>, who is probably a member in <strong>{{prospectData.survey.state}}</strong> State (Find out prospect's level of connection with referral if possible)</div>
            }
        </div>
        <mat-divider></mat-divider>

        <div class="list">
            <h5> Employment Status</h5>
            <span class="data">{{prospectData.survey.employedStatus ? (prospectData.survey.employedStatus | titlecase) : 'Unavailable' }} </span>
        </div>
        <mat-divider></mat-divider>

        <div class="list">
            <h5> Prospect Origin</h5>
            <span class="data">{{prospectData.survey.state ? (prospectData.survey.state | titlecase) : 'Unknown'}} State, {{prospectData.survey.country | titlecase }} </span>
        </div>
        <mat-divider></mat-divider>


        <!--  <div class="list" *ngIf="prospectData.preapproachDownload">
            <h5> Pre-approach Downloaded </h5>
            <span class="data"><em>Note that prospect downloaded the pre-approach document</em></span>
            <mat-divider style="margin-top: 1em;"></mat-divider>
        </div> -->
    
        <div class="list">
            <h5> Created Date </h5>
            <span class="data">{{prospectData.createdAt | date}} by {{prospectData.createdAt | date:'shortTime'}} </span>
        </div>
        <mat-divider></mat-divider>
        
        <div class="list">
            <h5> Modified Date </h5>
            <span class="data">{{prospectData.updatedAt | date}} by {{prospectData.updatedAt | date:'shortTime'}} </span>
        </div>
        
</article>

`,
styles: `

.list {
    margin-bottom: 1em;
    h5 {
        color: gray
    }
    .data {
        font-weight: bold;
        .custom-textarea {  
            min-width: 500px;
            min-height: 300px; 
        }
    }
    .info {
        color: gray;
        font-size: 0.9em;
        margin-top: 0.5em;
        margin-bottom: 0.5em;
    }
    .wrap {
        word-wrap: break-word;
        max-width: 10px !important; /* Adjust as needed */
    }
    .copy-link {
       // background-color: gray;
        display: flex;
        justify-content: space-between;
        align-items: center;
        p {
            font-weight: bold;
        }
        mat-icon {
            cursor: pointer;
        }
    }
}


`,
imports: [
    MatDividerModule, MatListModule, CommonModule,
],
})
export class ProspectBasicInformationComponent implements OnInit {
    @Input() prospect!: ContactsInterface;
    prospectData!: any; 

    ngOnInit(): void {     
        if (this.prospect.data) {
        this.prospectData = this.prospect.data;
        }
    }
}