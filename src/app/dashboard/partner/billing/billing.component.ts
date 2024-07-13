import {Component} from '@angular/core';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {FormsModule} from '@angular/forms';

/**
 * @title Biling
 */
@Component({
  selector: 'async-billing',
  styleUrl: 'billing.component.scss',
  templateUrl: 'billing.component.html',
  standalone: true,
  imports: [FormsModule, MatFormFieldModule, MatInputModule],
})
export class BillingComponent {}