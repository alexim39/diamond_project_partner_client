import { Routes } from '@angular/router';
import { MonthlyPurchaseContainerComponent } from './monthly-purchase-container.component';
import { PurchaseContainerComponent } from './purchases/purchases-container.component';

export const ProductsRoutes: Routes = [
  {
    path: '',
    redirectTo: 'eshop',
    pathMatch: 'full',
  },
  {
    path: '',
    children: [
        {
            path: 'eshop',
            component: MonthlyPurchaseContainerComponent,
            title: "Eshop - Monthly Purchase - Manage monthly purchase from partners",
        },  
        { path: 'order-history', 
            component: PurchaseContainerComponent,
            title: "Eshop - Order History - View order history from partners",
        },        
    ],
  },
];