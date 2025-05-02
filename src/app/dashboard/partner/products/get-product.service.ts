import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ProductInterface } from './monthly-purchase.service';

@Injectable({
  providedIn: 'root'
})
export class GetProductService {
 /*  private cart = new BehaviorSubject<ProductInterface[]>([]);
  cart$ = this.cart.asObservable();

  constructor() {}

  addToCart(product: ProductInterface): void {
    const currentCart = this.cart.value;
    currentCart.push(product);
    this.cart.next(currentCart); // Update the observable
  }

  getCart(): ProductInterface[] {
    return this.cart.value;
  }

  clearCart(): void {
    this.cart.next([]);
  } */

    private cartSubject = new BehaviorSubject<ProductInterface[]>([]);
  cart$ = this.cartSubject.asObservable();

  getCart(): ProductInterface[] {
    return this.cartSubject.value;
  }

  updateCart(cart: ProductInterface[]): void {
    this.cartSubject.next(cart);
  }

  addToCart(product: ProductInterface): void {
    const cart = this.getCart();
    const productInCart = cart.find(item => item._id === product._id);

    if (productInCart) {
        productInCart.quantity = (productInCart.quantity ?? 0) + 1;
    } else {
        cart.push({ ...product, quantity: 1 }); // Initialize quantity as 1
    }

    this.updateCart(cart);
}


  removeFromCart(product: ProductInterface): void {
    let cart = this.getCart();
    cart = cart.filter(item => item._id !== product._id);
    this.updateCart(cart);
  }

  clearCart(): void {
    this.updateCart([]);
  }

}
