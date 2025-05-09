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
template: `

<div class="wrapper">
    <section class="content-header">
      <h1>Social Media Text Templates</h1>
      <h6>Copy the content templates below to start posting your Ads</h6>
    </section>
    
    <section class="filter-search">
      <div class="filters">
        <mat-form-field appearance="outline">
          <mat-label>Select Platform</mat-label>
          <mat-select [(ngModel)]="selectedPlatform" (selectionChange)="filterTemplates()">
            <mat-option value="All Platforms">All Platforms</mat-option>
            <mat-option value="Facebook">Facebook</mat-option>
            <mat-option value="Twitter">Twitter</mat-option>
            <mat-option value="Instagram">Instagram</mat-option>
            <mat-option value="WhatsApp">WhatsApp</mat-option>
            <mat-option value="LinkedIn">LinkedIn</mat-option>
            <mat-option value="Pinterest">Pinterest</mat-option>
            <mat-option value="TikTok">TikTok</mat-option>
            <mat-option value="YouTube">YouTube</mat-option>
          </mat-select>
        </mat-form-field>
      </div>
    </section>
  
    <section class="template-list">
      <div class="template-item" *ngFor="let template of filteredTemplates">
        <mat-icon class="copy-icon" (click)="copyContent(template)">content_copy</mat-icon>
        <h3>{{ template.title }}</h3>
        <p>{{ template.description }}</p>
        <p>Visit <a href="https://diamondprojectonline.com/{{partner.username}}" target="_blank">diamondprojectonline.com/{{partner.username}}</a> to get started</p>
      </div>
    </section>
  
    <button mat-mini-fab color="primary" class="scroll-to-top" (click)="scrollToTop()">
      <mat-icon>arrow_upward</mat-icon>
    </button>
</div>

`,
styles: [`


.wrapper {
    margin: 2em;
}
.content-header {
    text-align: center;
    margin-bottom: 1.5rem;
}


.filter-search {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 1.5rem;
}

.template-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1.5rem;
}

.template-item {
    background-color: #f9f9f9;
    border-radius: 8px;
    padding: 1rem;
    text-align: left;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    transition: transform 0.2s ease-in-out;
}

.copy-icon {
    float: right;
    cursor: pointer;
    color: #007bff;
}

.template-item:hover {
    transform: scale(1.03);
}

.template-item h3 {
    margin-bottom: 0.5rem;
    font-size: 1.2rem;
    color: #333;
}

.template-item p, a {
    font-size: 0.9rem;
    color: #555;
    margin-bottom: 1rem;
}

a {
    text-decoration: underline;
    font-weight: bolder;
}

.template-item button {
    background-color: #007BFF;
    color: #fff;
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.3s ease-in-out;
}

.template-item button:hover {
    background-color: #0056b3;
}

@media (max-width: 768px) {
    .template-list {
        grid-template-columns: 1fr 1fr;
    }
}

@media (max-width: 480px) {
    .template-list {
        grid-template-columns: 1fr;
    }
}

.scroll-to-top {
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 1000;
}

`],
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
