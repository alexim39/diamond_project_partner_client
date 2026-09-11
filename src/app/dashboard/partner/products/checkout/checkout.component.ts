import { Component, DestroyRef, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ProductInterface, ProductService } from '../monthly-purchase.service';
import { concatMap, catchError, of } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
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
import { BillingService } from '../../../../core/billing/billing.service';

@Component({
    selector: 'async-checkout',
    templateUrl: './checkout.component.html',
    styleUrls: ['./checkout.component.scss'],
    providers: [ProductService],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [MatIconModule, CommonModule, RouterModule, TruncatePipe, MatButtonModule, FormsModule, MatButtonModule]
})
export class CheckoutComponent implements OnInit  {
    cart: ProductInterface[] = [];
    currentCost: number = 0;
    partner!: PartnerInterface;
    private readonly destroyRef = inject(DestroyRef);
    
    constructor(
        private productService: ProductService,
        private getProductService: GetProductService,
        private router: Router,
        private partnerService: PartnerService,
        private billingService: BillingService,
    ) {}
  
    ngOnInit(): void {
      this.getProductService.cart$.pipe(
        takeUntilDestroyed(this.destroyRef)
      ).subscribe((cart) => {
          this.cart = cart;
          this.updateCurrentCost(); // Recalculate the cost whenever the cart is updated
      });

      // get current signed in user (shared subject — tracked)
      this.partnerService.getSharedPartnerData$.pipe(
        takeUntilDestroyed(this.destroyRef)
      ).subscribe(
        partnerObject => {
          this.partner = partnerObject as PartnerInterface
          //console.log(this.partner)
        },
        error => {
          console.log(error)
          // redirect to home page
        }
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
      // One stream: checkout, then accrue upline commissions (idempotent —
      // safe to retry; accrual failures only log since entries can be
      // accrued later). Both calls are one-shot and self-complete.
      this.productService.checkout(cartObject).pipe(
        concatMap((response) => {
          //clear cart
          this.clearCart();

          const cartId: string | undefined = (response as { data?: { cartId?: string } })?.data?.cartId;
          const accrue$ = cartId
            ? this.billingService.accrue(cartId).pipe(
              catchError((accrueError: unknown) => {
                console.error('Commission accrual failed:', accrueError);
                return of(null);
              })
            )
            : of(null);

          Swal.fire({
            position: 'bottom',
            icon: 'success',
            text: (response as { message?: string })?.message,
            showConfirmButton: true,
            timer: 5000,
            confirmButtonColor: '#ffab40',
          });
          return accrue$;
        })
      ).subscribe({
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
      });
  }

  // Clear the cart
  clearCart(): void {
      this.getProductService.clearCart();
      this.updateCart(); // Ensure cost is reset after clearing the cart
  }
}
