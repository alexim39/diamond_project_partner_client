import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { PartnerInterface, PartnerService } from '../../../../../_common/services/partner.service';
import { map, Observable, startWith, Subscription } from 'rxjs';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatCardModule} from '@angular/material/card';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import { FormControl, ReactiveFormsModule } from '@angular/forms';


export interface User {
    name: string;
  }

/**
 * @title Container
 */
@Component({
  selector: 'async-add-members',
  templateUrl: 'add-members.html',
  styleUrls: ['add-members.scss'],
  standalone: true,
  providers: [],
  imports: [CommonModule, MatButtonModule, MatFormFieldModule, ReactiveFormsModule, MatAutocompleteModule, MatIconModule, MatCardModule],
})
export class AddMembersComponent implements OnInit {
    @Input() partner!: PartnerInterface;




    myControl = new FormControl<string | User>('');
    options: User[] = [{name: 'Mary'}, {name: 'Shelley'}, {name: 'Igor'}];
    filteredOptions!: Observable<User[]>;

    

    constructor() {}
  
    ngOnInit() {
      if (this.partner) {
       console.log(this.partner)
      }



      this.filteredOptions = this.myControl.valueChanges.pipe(
        startWith(''),
        map(value => {
          const name = typeof value === 'string' ? value : value?.name;
          return name ? this._filter(name as string) : this.options.slice();
        }),
      );

    }

    displayFn(user: User): string {
        return user && user.name ? user.name : '';
      }
    
      private _filter(name: string): User[] {
        const filterValue = name.toLowerCase();
    
        return this.options.filter(option => option.name.toLowerCase().includes(filterValue));
      }
}