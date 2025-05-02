import { Component, inject, Input, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { PartnerInterface } from '../../../_common/services/partner.service';
import { ProductInterface, ProductObjectInterface, ProductService } from './monthly-purchase.service';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { ProductFilterPipe } from './product-filter.pipe';
import { ProductDetailComponent } from './product-detail/product-detail.component';
import { MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import Swal from 'sweetalert2';
import { GetProductService } from './get-product.service';
import { Subscription } from 'rxjs';

/**
 * @title Basic icons
 */
@Component({
    selector: 'async-monthly-purchase',
    templateUrl: 'monthly-purchase.component.html',
    styleUrls: ['monthly-purchase.component.scss'],
    providers: [ProductService],
    imports: [MatIconModule, CommonModule, MatTooltipModule, RouterModule, MatInputModule, MatFormFieldModule, FormsModule, MatButtonModule, ProductFilterPipe]
})
export class MonthlyPurchaseComponent implements OnDestroy {

  @Input() partner!: PartnerInterface;
  @Input() productsObject!: ProductObjectInterface;
  products!: Array<ProductInterface>;
  isEmptyRecord = false;

  filterText: string = '';

  readonly dialog = inject(MatDialog);

  cart: ProductInterface[] = [];
  currentCost: number = 0;
  selectedProducts: Set<string> = new Set(); 
  subscriptions: Subscription[] = [];


  constructor(
    private router: Router,
    private productService: ProductService,
    private getProductService: GetProductService,
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

    this.subscriptions.push(
      this.getProductService.cart$.subscribe((cart) => {
          this.cart = cart;
          this.updateCurrentCost();
          this.updateSelectedProducts(); // Called here to update the selected products
      })
    );

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

  addToCart(product: ProductInterface): void {
    this.getProductService.addToCart(product);
    this.updateCurrentCost();
    this.selectedProducts.add(product._id); // Add product to selected set

  }

  updateSelectedProducts(): void {
    this.selectedProducts.clear();
    this.cart.forEach(product => this.selectedProducts.add(product._id));
}

  updateCurrentCost(): void {
    this.currentCost = this.getProductService.getCart().reduce((total, product) => total + product.price, 0);
  }

  checkout(): void {
    if (this.getProductService.getCart().length > 0) {
      // Proceed to checkout; you can navigate to the checkout page or open a dialog
      this.getProductService.getCart()
      // Example: navigate to a checkout component
      this.router.navigate(['dashboard/checkout']);
    } else {
      //console.log('Cart is empty.');
      Swal.fire({
        position: "bottom",
        icon: 'info',
        text: 'Cart is empty, choose product and try again',
        showConfirmButton: false,
        timer: 4000
      })
    }
  }

  clearCart() {
    this.getProductService.clearCart();
    this.currentCost = 0;
  }


  ngOnDestroy() {
     // unsubscribe list
     this.subscriptions.forEach(subscription => {
      subscription.unsubscribe();
    });
  }

}