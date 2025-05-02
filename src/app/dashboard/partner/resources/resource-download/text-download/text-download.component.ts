import {Component, Input} from '@angular/core';
import {MatTabsModule} from '@angular/material/tabs';
import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {FormsModule} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import templatesData from '../../../../../../../public/resource-templates/text/source.json';
import { PartnerInterface } from '../../../../../_common/services/partner.service';
import {MatButtonModule} from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';

/**
 * @title Text template download
 */
@Component({
    selector: 'async-text-download',
    templateUrl: 'text-download.component.html',
    styleUrls: ['text-download.component.scss'],
    imports: [MatTabsModule, MatFormFieldModule, MatButtonModule, MatIconModule, CommonModule, FormsModule, MatInputModule, MatSelectModule]
})
export class TextDownloadComponent {
  templates = templatesData;
  filteredTemplates = templatesData;
  selectedPlatform: string = 'All Platforms';

  @Input() partner!: PartnerInterface;

  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {}

    ngOnInit(): void {
        this.templates = this.shuffleArray(templatesData);
    }
  
    private shuffleArray(array: any[]): any[] {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    }

 /*  copyContent(template: { description: string; }): void {
    const partnerLink = `Visit https://diamondprojectonline/${this.partner.username} to get started`;
    const fullContent = `${template.description}\n\n${partnerLink}`;
    
    navigator.clipboard.writeText(fullContent).then(() => {
      console.log('Content and link copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy content and link: ', err);
    });
  } */

    copyContent(template: { description: string; }): void {
      const partnerLink = `Visit https://diamondprojectonline.com/${this.partner.username} to get started`;
      const fullContent = `${template.description}\n\n${partnerLink}`;
      
      navigator.clipboard.writeText(fullContent).then(() => {
        this.showSnackbar('Content and link copied to clipboard!');
      }).catch(err => {
        console.error('Failed to copy content and link: ', err);
        this.showSnackbar('Failed to copy content. Please try again.');
      });
    }
  
    private showSnackbar(message: string): void {
      this.snackBar.open(message, 'Close', {
        duration: 3000, // Duration in milliseconds
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
      });
    }
  

  filterTemplates() {
    if (this.selectedPlatform === 'All Platforms') {
      this.filteredTemplates = this.templates;
    } else {
      this.filteredTemplates = this.templates.filter(template =>
        template.platforms?.includes(this.selectedPlatform)
      );
    }
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

}
