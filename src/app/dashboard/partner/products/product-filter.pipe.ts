import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'productFilter',
  standalone: true // Make the pipe standalone
})
export class ProductFilterPipe implements PipeTransform {

  transform(products: any[], filterText: string): any[] {
    if (!products || !filterText) {
      return products;
    }
    return products.filter(product =>
      product.name.toLowerCase().includes(filterText.toLowerCase()));
  }

}