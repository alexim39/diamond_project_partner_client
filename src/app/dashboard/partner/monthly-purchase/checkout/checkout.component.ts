import { Component, OnDestroy, OnInit } from '@angular/core';
import { ProductInterface, ProductService } from '../monthly-purchase.service';
import { Subscription } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { GetProductService } from '../get-product.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'async-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss'],
  standalone: true,
  providers: [ProductService],
  imports: [MatIconModule, CommonModule, MatButtonModule, FormsModule, MatButtonModule]
})
export class CheckoutComponent implements OnInit, OnDestroy  {
    cart: ProductInterface[] = [];
    subscriptions: Subscription[] = [];
    currentCost: number = 0;

    constructor(
        private productService: ProductService,
        private getProductService: GetProductService,
        private router: Router
    ) {}
  
    ngOnInit(): void {
        this.subscriptions.push(
            this.getProductService.cart$.subscribe((cart) => {
                //console.log('Cart updated:', cart);
                this.cart = cart;
                
                this.updateCurrentCost(); // Recalculate the cost whenever the cart is updated
            })
        );
    }
    

    updateCurrentCost(): void {
        this.currentCost = this.getProductService.getCart().reduce((total, product) => total + product.price, 0);
    }

    ngOnDestroy() {
        // unsubscribe list
        this.subscriptions.forEach(subscription => {
          subscription.unsubscribe();
        });

        // clear cart
        this.getProductService.clearCart();
    }

    back(): void {
        this.router.navigateByUrl('dashboard/monthly-purchase');
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
  }

  // Recalculates the cost and updates the cart
  updateCart(): void {
    this.getProductService.updateCart(this.cart);
    this.updateCurrentCost();
  }

  // Navigate to the checkout process (can be modified as needed)
  checkout(): void {
    // Add your checkout navigation logic here
    console.log('Proceed to checkout with cart:', this.cart);
  }

  // Clear the cart
  clearCart(): void {
    this.getProductService.clearCart();
  }
    
}
