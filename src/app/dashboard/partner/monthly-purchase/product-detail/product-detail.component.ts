import { Component, inject, OnInit} from '@angular/core';
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
    templateUrl: 'product-detail.component.html',
    styleUrls: ['product-detail.component.scss'],
    standalone: true,
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
    ],
    
  })
  export class ProductDetailComponent implements OnInit {
    readonly dialogRef = inject(MatDialogRef<ProductDetailComponent>);
    readonly product = inject<ProductInterface>(MAT_DIALOG_DATA);
    //readonly animal = model(this.data.animal);

    ngOnInit(): void {
        //console.log(this.data)
    }
  
    onClose(): void {
      this.dialogRef.close();
    }
  }