import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PartnerInterface, PartnerService } from '../../../../../_common/services/partner.service';
import { map, Observable, startWith, Subscription } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';


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
    imports: [CommonModule, MatButtonModule, MatInputModule, MatFormFieldModule, ReactiveFormsModule, MatAutocompleteModule, MatIconModule, MatCardModule],
})
export class AddMembersComponent implements OnInit {
    @Input() partner!: PartnerInterface;

    addTeamMemberForm: FormGroup = new FormGroup({}); // Assigning a default value
    subscriptions: Array<Subscription> = [];
    isSpinning = false;



    constructor(
        private fb: FormBuilder,
        private router: Router,
    ) { }

    ngOnInit() {
        if (this.partner) {
            console.log(this.partner)
        } 

        this.addTeamMemberForm = this.fb.group({
            memberUsername: ['', [Validators.required]],
        });
    }

    onSubmit(){}

    back(): void {
        this.router.navigateByUrl('dashboard/team-members');
      }
    
}