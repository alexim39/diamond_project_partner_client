import {Component, Input, OnInit} from '@angular/core';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {AsyncPipe} from '@angular/common';
import {map, startWith} from 'rxjs/operators';
import {Observable} from 'rxjs';
import { PartnerInterface } from '../../../../_common/services/partner.service';

export interface State {
    flag: string;
    name: string;
    population: string;
}

/**
 * @title Main index search
 */
@Component({
  selector: 'async-index-search',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, AsyncPipe, MatFormFieldModule, MatInputModule, MatAutocompleteModule],
  template: `
  <section>
    <div class="search">
        <form class="search-form">
            <mat-form-field appearance="outline">
              <mat-label>App Directory</mat-label>
              <input matInput placeholder="Search for partner" [matAutocomplete]="auto" [formControl]="stateCtrl">

              <mat-autocomplete #auto="matAutocomplete" (optionSelected)="onOptionSelected($event)">
                @for (state of filteredStates | async; track state) {
                    <mat-option [value]="state.name">
                    <img alt="" class="example-option-img" [src]="state.flag" height="25">
                    <span>{{state.name}}</span> |
                    <small>Population: {{state.population}}</small>
                    </mat-option>
                }
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
  `,

})
export class IndexSearchComponent implements OnInit {

  @Input() partner!: PartnerInterface;
  
    stateCtrl = new FormControl('');
    filteredStates: Observable<State[]>;

  states: State[] = [
    {
      name: 'Arkansas',
      population: '2.978M',
      // https://commons.wikimedia.org/wiki/File:Flag_of_Arkansas.svg
      flag: 'https://upload.wikimedia.org/wikipedia/commons/9/9d/Flag_of_Arkansas.svg',
    },
    {
      name: 'California',
      population: '39.14M',
      // https://commons.wikimedia.org/wiki/File:Flag_of_California.svg
      flag: 'https://upload.wikimedia.org/wikipedia/commons/0/01/Flag_of_California.svg',
    },
    {
      name: 'Florida',
      population: '20.27M',
      // https://commons.wikimedia.org/wiki/File:Flag_of_Florida.svg
      flag: 'https://upload.wikimedia.org/wikipedia/commons/f/f7/Flag_of_Florida.svg',
    },
    {
      name: 'Texas',
      population: '27.47M',
      // https://commons.wikimedia.org/wiki/File:Flag_of_Texas.svg
      flag: 'https://upload.wikimedia.org/wikipedia/commons/f/f7/Flag_of_Texas.svg',
    },
  ];

  constructor() {
    this.filteredStates = this.stateCtrl.valueChanges.pipe(
      startWith(''),
      map(state => (state ? this._filterStates(state) : this.states.slice())),
    );
  }

  ngOnInit(): void {
    console.log(this.partner)
  }

  private _filterStates(value: string): State[] {
    const filterValue = value.toLowerCase();

    return this.states.filter(state => state.name.toLowerCase().includes(filterValue));
  }

  onOptionSelected(event: any): void {  
    const selectedState = event.option.value;  // This retrieves the selected value  
    console.log('Selected state:', selectedState);  
    // You can also find the full state object from the states array if needed  
    const stateObject = this.states.find(state => state.name === selectedState);  
    console.log('Full selected state object:', stateObject);  
  } 

}
