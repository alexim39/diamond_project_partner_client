import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogModule,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { PartnerInterface } from '../../../../../../../_common/services/partner.service'; // Adjust path as needed
import { Subscription, Observable } from 'rxjs';
import { SearchService } from '../../../../../index/search/search.service'; // Adjust path as needed
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { startWith, map } from 'rxjs/operators';
import { MatChipInputEvent, } from '@angular/material/chips';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { TeamService } from '../../../team.service';
import Swal from 'sweetalert2';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MatSnackBarModule} from '@angular/material/snack-bar';

@Component({
  selector: 'dialog-overview-example',
  standalone: true,
  template: `
    <h2 mat-dialog-title>Add New Team Member</h2>
    <mat-dialog-content>
      <p>Search by partner name to add as a team member</p>
      <form>
        <mat-form-field class="example-chip-list">
          <mat-label>Add A Member</mat-label>
          <mat-chip-grid #chipGrid aria-label="Partner selection">
            <mat-chip-row *ngFor="let partner of selectedPartners" (removed)="remove(partner)">
              {{ partner.name }} {{ partner.surname }}  <button matChipRemove [attr.aria-label]="'remove ' + partner.name">
                <mat-icon>cancel</mat-icon>
              </button>
            </mat-chip-row>
          </mat-chip-grid>
          <input
            name="currentPartner"
            placeholder="New Partner..."
            #partnerInput
            [formControl]="partnerCtrl"
            [matChipInputFor]="chipGrid"
            [matAutocomplete]="auto"
            [matChipInputSeparatorKeyCodes]="separatorKeysCodes"
            (matChipInputTokenEnd)="add($event)"
          />
          <mat-autocomplete #auto="matAutocomplete" (optionSelected)="selected($event)">
            <mat-option *ngFor="let partner of filteredPartners | async" [value]="partner.name">
              {{partner.name }} {{partner.surname}}
            </mat-option>
          </mat-autocomplete>
        </mat-form-field>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions>
      <button mat-button (click)="onClose()">Close</button>
      <button mat-button (click)="addMember(data.team._id)">Add</button>
    </mat-dialog-actions>
  `,
  providers: [SearchService, TeamService],
  imports: [
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatAutocompleteModule,
    MatChipsModule,
    MatIconModule,
    CommonModule,
    MatSnackBarModule
  ],
  styles: `
    .example-chip-list {
      width: 100%;
    }
  `,
})
export class AddMemberComponent implements OnInit, OnDestroy {
  readonly dialogRef = inject(MatDialogRef<AddMemberComponent>);
  readonly data = inject<any>(MAT_DIALOG_DATA);

  partners: PartnerInterface[] = [];
  private subscriptions: Subscription[] = [];

  partnerCtrl = new FormControl('');
  filteredPartners!: Observable<PartnerInterface[]>;
  selectedPartners: PartnerInterface[] = [];
  separatorKeysCodes: number[] = [ENTER, COMMA];

  constructor(
    private searchService: SearchService,
    private teamService: TeamService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadAllPartners();

    this.filteredPartners = this.partnerCtrl.valueChanges.pipe(
      startWith(''),
      map((value) => this._filter(value || ''))
    );
  }

  onClose(): void {
    this.dialogRef.close();
  }

  displayFn(partner: PartnerInterface): string {
    return partner && partner.name ? partner.name : '';
  }

  private _filter(value: string): PartnerInterface[] {
    const filterValue = value.toLowerCase();
    return this.partners.filter((partner) => partner.name.toLowerCase().includes(filterValue));
  }

  add(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;

    const selectedPartner = this.partners.find(partner => partner.name === value);

    if (selectedPartner && !this.selectedPartners.find(p => p._id === selectedPartner._id)) { // Check by ID
      this.selectedPartners.push(selectedPartner);
    }

    if (input) {
      input.value = '';
    }

    this.partnerCtrl.setValue(null);
  }

  remove(partner: PartnerInterface): void {
    const index = this.selectedPartners.findIndex(p => p._id === partner._id); // Find by ID
    if (index >= 0) {
      this.selectedPartners.splice(index, 1);
    }
  }

  selected(event: any): void {
    const selectedPartner = this.partners.find(partner => partner.name === event.option.value);

    if (selectedPartner && !this.selectedPartners.find(p => p._id === selectedPartner._id)) { // Check by ID
      this.selectedPartners.push(selectedPartner);
    }
    this.partnerCtrl.setValue(null);
  }

  addMember(teamId: string) {
    // Logic to use this.selectedPartners (e.g., close the dialog with the selected partners)
    //console.log("Selected Partners:", this.selectedPartners);
   


     this.subscriptions.push(
      this.teamService.addTeamMember(this.selectedPartners, teamId).subscribe((teams: any) => {

        this.snackBar.open(`Team member have been successfully added`, 'Close', {
          duration: 1000,
        });
        this.dialogRef.close(this.selectedPartners); // Example: close and return the selected partners

        setTimeout(() => {
          location.reload();
        }, 1000);

        
      }, (error: Error) => {
        //console.log(error)
        Swal.fire({
          position: "bottom",
          icon: 'info',
          text: 'Server error occured, please and try again',
          showConfirmButton: false,
          timer: 4000
        })
      })
    )

  }

  private loadAllPartners(): void {
    this.subscriptions.push(
      this.searchService.getAllUsers().subscribe({
        next: (partners: PartnerInterface[]) => {
          this.partners = partners;
        },
        error: (err) => {
          console.error('Error loading partners:', err);
        },
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }
}