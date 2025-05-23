import { Component, OnDestroy, OnInit } from '@angular/core';
import { ProductInterface, ProductService } from '../monthly-purchase.service';
import { Subscription } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterModule } from '@angular/router';
import { GetProductService } from '../get-product.service';
import { FormsModule } from '@angular/forms';
import { TruncatePipe } from '../../../../_common/pipes/truncate.pipe';
import Swal from 'sweetalert2';
import { PartnerInterface, PartnerService } from '../../../../_common/services/partner.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
    selector: 'async-checkout',
    templateUrl: './checkout.component.html',
    styleUrls: ['./checkout.component.scss'],
    providers: [ProductService],
    imports: [MatIconModule, CommonModule, RouterModule, TruncatePipe, MatButtonModule, FormsModule, MatButtonModule]
})
export class CheckoutComponent implements OnInit, OnDestroy  {
    cart: ProductInterface[] = [];
    subscriptions: Subscription[] = [];
    currentCost: number = 0;
    partner!: PartnerInterface;
    
    constructor(
        private productService: ProductService,
        private getProductService: GetProductService,
        private router: Router,
        private partnerService: PartnerService,
    ) {}
  
    ngOnInit(): void {
      this.subscriptions.push(
          this.getProductService.cart$.subscribe((cart) => {
              this.cart = cart;
              this.updateCurrentCost(); // Recalculate the cost whenever the cart is updated
          })
      );

      // get current signed in user
      this.subscriptions.push(
        this.partnerService.getSharedPartnerData$.subscribe(
          partnerObject => {
            this.partner = partnerObject as PartnerInterface
            //console.log(this.partner)
          },
          error => {
            console.log(error)
            // redirect to home page
          }
        )
      )
    }

    // Scroll to top when clicked
    scrollToTop() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    updateCurrentCost(): void {
        this.currentCost = this.getProductService.getCart().reduce((total, product) => total + (product.price * (product.quantity ?? 1)), 0);
    }

    ngOnDestroy() {
        this.subscriptions.forEach(subscription => subscription.unsubscribe());
        this.getProductService.clearCart();
    }

    back(): void {
        this.router.navigateByUrl('dashboard/products/eshop');
    }

    // Increase the quantity of a product in the cart
    increaseQuantity(product: ProductInterface): void {
        product.quantity = (product.quantity || 0) + 1;
        this.updateCart();
    }

    // Decrease the quantity of a product in the cart
    decreaseQuantity(product: ProductInterface): void {
        const currentQuantity = product.quantity ?? 1;
        if (currentQuantity > 1) {
            product.quantity = currentQuantity - 1;
            this.updateCart();
        }
    }

    // Remove a product from the cart
    removeFromCart(product: ProductInterface): void {
        this.getProductService.removeFromCart(product);
        this.updateCart();
    }

    // Recalculates the cost and updates the cart
    updateCart(): void {
      this.getProductService.updateCart(this.cart);
      this.updateCurrentCost();
    }

    // Navigate to the checkout process
    checkout(): void {
      //console.log('Proceed to checkout with cart:', this.cart);
      const cartObject = {
        products: this.cart,
        totalCost: this.updateCurrentCost(),
        partnerId: this.partner._id
      }
      this.subscriptions.push(
        this.productService.checkout(cartObject).subscribe({

          next: (response) => {
            //clear cart
            this.clearCart();

            Swal.fire({
              position: 'bottom',
              icon: 'success',
              text: response.message,
              showConfirmButton: true,
              timer: 5000,
              confirmButtonColor: '#ffab40',
            });
          },
         error: (error: HttpErrorResponse) => {
              let errorMessage = 'Server error occurred, please try again.';
              if (error.error && error.error.message) {
                errorMessage = error.error.message;
              }
              Swal.fire({
                position: 'bottom',
                icon: 'error',
                text: errorMessage,
                showConfirmButton: false,
                timer: 4000,
              });
            }
        })
      )
  }

  // Clear the cart
  clearCart(): void {
      this.getProductService.clearCart();
      this.updateCart(); // Ensure cost is reset after clearing the cart
  }
}
