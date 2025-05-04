import { Component, Input, OnInit } from '@angular/core';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import { MatRadioModule } from '@angular/material/radio';
import { MatCardModule } from '@angular/material/card';
import { PartnerInterface } from '../../../../_common/services/partner.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';

@Component({
selector: 'async-purchases',
templateUrl: 'purchases.component.html',
styles: [`

.async-background {
    margin: 2em;
    .async-container {
        background-color: #dcdbdb;
        border-radius: 1%;
        height: 100%;
        padding: 1em;
        .title {
            display: flex;
            justify-content: space-between;
            border-bottom: 1px solid #ccc;
            padding: 1em;
            .fund-area {
                .fund {
                    //display: flex;
                    font-weight: bold;
                    margin-top: 1em;
                }
            }
        }

        .no-campaign {
            text-align: center;
            color: rgb(196, 129, 4);
            font-weight: bold;
        }

       
    }
}













$primary-color: #4a90e2;  
$secondary-color: #f5f5f5;  
$text-color: #333;  
$border-radius: 8px;  

.cart {  
    padding: 40px 20px;  
   // background-color: $secondary-color;  

    .container {  
        max-width: 1200px;  
        margin: 0 auto;  
        padding: 0 15px;  
    }  

    .cart-title {  
        text-align: center;  
        font-size: 2.5rem;  
        font-weight: bold;  
        margin-bottom: 30px;  
        color: $primary-color;  

        @media (max-width: 768px) {  
            font-size: 2rem; // Smaller font size for tablets and mobile  
        }  
    }  

    .cart-items {  
        display: flex;  
        flex-direction: column;  
        gap: 20px;  

        .cart-item {  
            background-color: white;  
            border-radius: $border-radius;  
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);  
            padding: 20px;  
            transition: box-shadow 0.3s ease;  

            &:hover {  
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);  
            }  

            .total-cost {  
                font-size: 1rem;  
                font-weight: bold;  
                color: $text-color;  
                margin-bottom: 15px;  

                @media (max-width: 768px) {  
                    font-size: 1rem; // Smaller font size for mobile  
                }  
            }  
            .status {  
                font-size: 1rem;  
                font-weight: bold;  
                color: $text-color;  
                margin-bottom: 25px;  

                @media (max-width: 768px) {  
                    font-size: 1rem; // Smaller font size for mobile  
                }  
            }  

            .products {  
                display: grid;  
                grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));  
                gap: 20px;  

                .product-card {  
                    background-color: #f9f9f9;  
                    border-radius: $border-radius;  
                    overflow: hidden;  
                    box-shadow: 0 1px 5px rgba(0, 0, 0, 0.1);  
                    transition: transform 0.2s ease;  

                    &:hover {  
                        transform: translateY(-5px);  
                    }  

                    .product-image {  
                        width: 100%;  
                        height: 150px;  
                        object-fit: cover;  
                    }  

                    .product-details {  
                        padding: 15px;  

                        .product-name {  
                            font-size: 1.2rem;  
                            font-weight: bold;  
                            color: $text-color;  
                            margin-bottom: 10px;  

                            @media (max-width: 768px) {  
                                font-size: 1rem; // Smaller font size for mobile  
                            }  
                        }  

                        .product-price {  
                            font-size: 1rem;  
                            font-weight: bold;  
                            color: $primary-color;  

                            @media (max-width: 768px) {  
                                font-size: 0.9rem; // Smaller font size for mobile  
                            }  
                        }  

                        .product-quantity {  
                            font-size: 0.9rem;  
                            color: #666;  
                            margin-top: 5px;
                            @media (max-width: 768px) {  
                                font-size: 0.8rem; // Smaller font size for mobile  
                            }  
                        }  
                    }  
                }  
            }  
        }  
    }  
}  

// Media Queries for Larger Screens  
@media (min-width: 1024px) {  
    .cart-title {  
        font-size: 3rem; // Larger font size for desktops  
    }  

    .total-cost {  
        font-size: 1.75rem; // Larger font size for desktops  
    }  

    .product-name {  
        font-size: 1.5rem; // Larger font size for desktops  
    }  

    .product-price {  
        font-size: 1.2rem; // Larger font size for desktops  
    }  
}

`],
imports: [
    MatCardModule,
    CommonModule,
    MatTableModule,
    MatRadioModule,
    MatIconModule,
    RouterModule,
    MatButtonModule,
    FormsModule,
    MatCheckboxModule,
    MatSlideToggleModule,
]
})
export class PurchasesComponent implements OnInit {
  @Input() partner!: PartnerInterface;
  @Input() cartObject!: any[];
  isEmptyRecord = false;

  ngOnInit() {
    if (this.cartObject && this.cartObject.length > 0) {
    } else {
      this.isEmptyRecord = true;
    }
  }

  // Scroll to top when clicked
  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
