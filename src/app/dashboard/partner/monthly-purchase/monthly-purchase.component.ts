import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { PartnerInterface } from '../../../_common/services/partner.service';
import { ProductInterface, ProductObjectInterface } from './monthly-purchase.service';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { ProductFilterPipe } from './product-filter.pipe';
import { ProductDetailComponent } from './product-detail/product-detail.component';
import { MatDialog } from '@angular/material/dialog';

/**
 * @title Basic icons
 */
@Component({
  selector: 'async-monthly-purchase',
  templateUrl: 'monthly-purchase.component.html',
  styleUrls: ['monthly-purchase.component.scss'],
  standalone: true,
  providers: [],
  imports: [MatIconModule, CommonModule, MatInputModule, MatFormFieldModule, FormsModule, MatButtonModule, ProductFilterPipe],
})
export class MonthlyPurchaseComponent {

  @Input() partner!: PartnerInterface;
  @Input() productsObject!: ProductObjectInterface;
  products!: Array<ProductInterface>;
  isEmptyRecord = false;

  filterText: string = '';

  readonly dialog = inject(MatDialog);

  constructor(
    private router: Router,
  ) { }

  private shuffleArray(array: ProductInterface[]): ProductInterface[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  ngOnInit(): void {
    if (this.productsObject.data) {


      this.products = this.shuffleArray(this.productsObject.data);



      /* if (this.products?.data.length === 0){
        this.isEmptyRecord = true;
      }  */
    }

  }

  // scroll to top when clicked
  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  openDialog(product: ProductInterface): void {
    const dialogRef = this.dialog.open(ProductDetailComponent, {
      data: product,
    });

    /* dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      if (result !== undefined) {
        this.animal.set(result);
      }
    }); */
  }


}