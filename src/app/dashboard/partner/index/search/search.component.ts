import { Component, Input, OnInit } from '@angular/core';  
import { MatInputModule } from '@angular/material/input';  
import { MatFormFieldModule } from '@angular/material/form-field';  
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';  
import { MatAutocompleteModule } from '@angular/material/autocomplete';  
import { AsyncPipe, CommonModule } from '@angular/common';  
import { map, startWith } from 'rxjs/operators';  
import { Observable } from 'rxjs';  
import { PartnerInterface } from '../../../../_common/services/partner.service';  
import { Router } from '@angular/router';

@Component({  
    selector: 'async-index-search',  
    standalone: true,  
    imports: [FormsModule, CommonModule, ReactiveFormsModule, AsyncPipe, MatFormFieldModule, MatInputModule, MatAutocompleteModule],  
    providers: [],
    template: `  
    <section>  
        <div class="search">  
            <form class="search-form">  
                <mat-form-field appearance="outline">  
                    <mat-label>App Directory</mat-label>  
                    <input matInput placeholder="Search for partner" [matAutocomplete]="auto" [formControl]="partnerCtrl">  

                    <mat-autocomplete #auto="matAutocomplete" (optionSelected)="onOptionSelected($event)">  
                    <mat-option *ngFor="let partner of filteredPartners | async" [value]="partner.name + ' ' + partner.surname" class="partner-option">  
                        <div class="partner-content">  
                            <img alt="Profile-image"   
                                class="img"   
                                [src]="partner.profileImage ? (apiURL + '/uploads/' + partner.profileImage) : './img/default_pp.png'"   
                                height="25">  
                            <span class="partner-name">{{partner.name | titlecase }} {{partner.surname | titlecase }}</span>  
                        </div>  
                    </mat-option>
                    </mat-autocomplete>  
                </mat-form-field>  
            </form>  
        </div>  
    </section>  
    `,  
    styles: `  
    section {  
        padding: 2em;  

        .search {  
            display: flex;  
            justify-content: center;  
            align-items: center;  
            width: 100%;  
            border-bottom: 1px solid rgb(225, 225, 225);  
            .search-form {  
                width: 50%;  
            }  
            mat-form-field {  
                width: 100%;  
            }  
        }  
    }  

    .partner-option {  
    display: flex;  
    align-items: center; /* Center items vertically */  
}  

.partner-content {  
    display: flex;  
    align-items: center; /* Center items vertically */  
}  

.img {  
    width: 25px;     /* Set width of circle image */  
    height: 25px;    /* Set height of circle image */  
    border-radius: 50%; /* Make the image circular */  
    object-fit: cover; /* Ensure the image covers the circle without distortion */  
    margin-right: 10px; /* Space between the image and the name */  
  }  

  .partner-name {  
      font-size: 14px; /* Adjust font size as needed */  
      line-height: 25px; /* Align line height to center vertically with the image */  
  }
    `,  
})  
export class IndexSearchComponent implements OnInit {  
  // Define API
  apiURL = 'https://diamondprojectapi-y6u04o8b.b4a.run/';
  //apiURL = 'http://localhost:3000';

    @Input() partner!: PartnerInterface;  
    @Input() partners!: Array<PartnerInterface>;  

    partnerCtrl = new FormControl('');  
    filteredPartners: Observable<PartnerInterface[]>;  

    profilePictureUrl = "./img/default_pp.png"

    constructor(
      private router: Router
    ) {  
        this.filteredPartners = this.partnerCtrl.valueChanges.pipe(  
            startWith(''),  
            map((value: string | PartnerInterface | null) => {  
                return typeof value === 'string' ? value : (value ? value.name : '');  
            }),  
            map(name => {  
                return name ? this._filterPartners(name) : this.partners.slice();  
            })  
        );  
    }  

    ngOnInit(): void {  
        //console.log(this.partners);  
    }  

    private _filterPartners(value: string): PartnerInterface[] {  
        const filterValue = value.toLowerCase();  
        return this.partners.filter(partner =>   
            partner.name.toLowerCase().includes(filterValue) ||  
            partner.surname.toLowerCase().includes(filterValue)  
        );  
    }  

    onOptionSelected(event: any): void {  
      const selectedPartner: string = event.option.value;  
      const [name, surname] = selectedPartner.split(" ");
  
      // Find the partner object where both name and surname match  
      /* const partnerObject = this.partners.find(partner =>   
          partner.name === selectedPartner.name && partner.surname === selectedPartner.surname  
      );  
      */
      if (selectedPartner) {   

        //this.router.navigate(['dashboard/search', name, surname]);  
        // Navigate with query parameters  
        this.router.navigate(['dashboard/search'], { queryParams: { name, surname } }); 
          
      } else {  
          console.log('No matching partner found.');  
      }  
  }   
}