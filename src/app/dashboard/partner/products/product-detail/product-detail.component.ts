import { Component, inject} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import { ProductInterface } from '../monthly-purchase.service';
import { CommonModule } from '@angular/common';


@Component({
selector: 'async-product-detail',
template: `

<h2 mat-dialog-title>{{product.name | titlecase}}</h2>
<mat-dialog-content class="mat-typography">

    <h3>Current Price</h3>
    <p>{{product.price | currency:'₦':'symbol':'1.0-0' }}</p>

    <p [innerHTML]="product.desc"></p>

</mat-dialog-content>
<mat-dialog-actions align="end">
  <button mat-button mat-dialog-close>Cancel</button>
  <!-- <button mat-button [mat-dialog-close]="true" cdkFocusInitial>Install</button> -->
</mat-dialog-actions>


`,
styles: [`
`],
imports: [
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    CommonModule
]
})
  export class ProductDetailComponent {
    readonly dialogRef = inject(MatDialogRef<ProductDetailComponent>);
    readonly product = inject<ProductInterface>(MAT_DIALOG_DATA);
    //readonly animal = model(this.data.animal);
  
    onClose(): void {
      this.dialogRef.close();
    }
  }