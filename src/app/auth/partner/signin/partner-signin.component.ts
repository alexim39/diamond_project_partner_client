import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { RouterModule } from '@angular/router';

/**
 * @title Partner signin
 */
@Component({
    selector: 'async-partner-signin',
    standalone: true,
    imports: [MatButtonModule, MatDividerModule, MatIconModule, MatExpansionModule, MatFormFieldModule, MatInputModule, RouterModule],
    templateUrl: 'partner-signin.component.html' ,
    styleUrls: ['partner-signin.component.scss']
})
export class PartnerSigninComponent {
  hide = true;
}