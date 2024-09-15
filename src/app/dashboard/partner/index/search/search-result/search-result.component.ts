import { AfterViewInit, Component, Input, OnChanges, OnDestroy, OnInit } from '@angular/core';  
import { MatInputModule } from '@angular/material/input';  
import { MatFormFieldModule } from '@angular/material/form-field';  
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';  
import { MatAutocompleteModule } from '@angular/material/autocomplete';  
import { AsyncPipe, CommonModule } from '@angular/common';  
import { map, startWith } from 'rxjs/operators';  
import { Observable, Subscription } from 'rxjs';  
import { PartnerInterface, PartnerService } from '../../../../../_common/services/partner.service';
import { ActivatedRoute } from '@angular/router';
import { SearchService } from '../search.service';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import Swal from 'sweetalert2';


@Component({  
    selector: 'async-search-result',  
    standalone: true,  
    imports: [FormsModule, MatButtonModule, CommonModule, MatIconModule, ReactiveFormsModule, AsyncPipe, MatFormFieldModule, MatInputModule, MatAutocompleteModule],  
    providers: [],
    templateUrl: 'search-result.component.html',  
    styleUrls: ['search-result.component.scss'],  
})  
export class SearchResultComponent implements OnInit, OnDestroy {
  // Define API
  //apiURL = 'https://diamondprojectapi-y6u04o8b.b4a.run/';
  apiURL = 'http://localhost:3000';

    @Input() searchPartners!: PartnerInterface[];

    partner!: PartnerInterface;
    subscriptions: Subscription[] = [];

    isYou = false;

    isFollowing: boolean = false; // Track the follow status

    constructor(
        private searchService: SearchService,
        private partnerService: PartnerService,
    ) {  }  

    ngOnInit(): void {
        // get current signed in user
        this.subscriptions.push(
            this.partnerService.getSharedPartnerData$.subscribe(
            
            partnerObject => {
                this.partner = partnerObject as PartnerInterface
            },
            
            (error) => {
                console.log(error)
                // redirect to home page
            }
            )
        );  
    }


    checkFollowStatus(searchPartnerId: string) {
        this.subscriptions.push(
            this.searchService.checkFollowStatus(this.partner._id, searchPartnerId).subscribe((status: any) => {
                this.isFollowing = status.isFollowing;
                if (this.partner._id === searchPartnerId) {
                    this.isYou = true;
                } else {
                    this.isYou = false;
                }
            }, (error: any) => {
                console.error('Error checking follow status:', error);
            })
        ) 
    }

    follow(searchPartnerId: string) {
        
        if (this.isFollowing) {
          this.subscriptions.push(
            this.searchService.unfollow(this.partner._id, searchPartnerId).subscribe((status: any) => {
                this.isFollowing = false;   
            }, (error: any) => {
                console.error('Error unfollowing:', error);
            })
          )

        } else {
          this.subscriptions.push(
            this.searchService.follow(this.partner._id, searchPartnerId).subscribe((status: any) => {
                this.isFollowing = true;    
            }, (error: any) => {
                console.error('Error following:', error);
            })
          )
        }
    } 

    ngOnDestroy() {
        // unsubscribe list
        this.subscriptions.forEach(subscription => {
          subscription.unsubscribe();
        });
    }
}
