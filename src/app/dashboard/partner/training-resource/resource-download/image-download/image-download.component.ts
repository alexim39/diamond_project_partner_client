import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {MatTabsModule} from '@angular/material/tabs';
import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {FormsModule} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
//import templatesData from './../../../../../../../public/resource-templates/img/source.json';
import { PartnerInterface } from '../../../../../_common/services/partner.service';
import {MatButtonModule} from '@angular/material/button';
import { map, Observable, Subscription } from 'rxjs';

interface Template {
  title: string;
  imageUrl: string;
  platforms: string[];
}

/**
 * @title Basic use of the tab group
 */
@Component({
  selector: 'async-image-download',
  templateUrl: 'image-download.component.html',
  styleUrls: ['image-download.component.scss'],
  standalone: true,
  imports: [MatTabsModule, MatFormFieldModule, MatButtonModule, MatIconModule, CommonModule, FormsModule, MatInputModule, MatSelectModule],
})
export class ImageDownloadComponent implements OnDestroy, OnInit {
 filteredTemplates: Template[] = [];
 selectedPlatform: string = 'All Platforms';
 platforms: string[] = ['All Platforms'];

  templates: Template[] = [];
  private templatesSubscription: Subscription | undefined;
  private dataUrl = './resource-templates/img/source.json'; // Adjust this path as needed


  @Input() partner!: PartnerInterface;

  constructor(
    private http: HttpClient,
  ) {}

  ngOnInit(): void {
    this.loadTemplates();
  }

  ngOnDestroy(): void {
    if (this.templatesSubscription) {
      this.templatesSubscription.unsubscribe();
    }
  }

  private loadTemplates(): void {
    this.templatesSubscription = this.getTemplatesData()
      .pipe(
        map((templates: Template[]) => this.shuffleArray(templates))
      )
      .subscribe(
        (shuffledTemplates: Template[]) => {
          this.templates = shuffledTemplates;
          this.filteredTemplates = shuffledTemplates; // Initialize filteredTemplates
          this.updatePlatformsList(); // Update platforms list
          console.log('Templates loaded:', this.templates.length);
        },
        (error: Error) => {
          console.error('Error loading templates:', error);
          // Handle error (e.g., show error message to user)
        }
      );
  }

  private getTemplatesData(): Observable<Template[]> {
    return this.http.get<Template[]>(this.dataUrl);
  }

  private updatePlatformsList(): void {
    const platformSet = new Set<string>(this.platforms);
    this.templates.forEach(template => {
      template.platforms.forEach(platform => platformSet.add(platform));
    });
    this.platforms = ['All Platforms', ...Array.from(platformSet)];
  }

  private shuffleArray(array: any[]): any[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }



  filterTemplates(): void {
    if (this.selectedPlatform === 'All Platforms') {
      this.filteredTemplates = this.templates;
    } else {
      this.filteredTemplates = this.templates.filter(template =>
        template.platforms.includes(this.selectedPlatform)
      );
    }
  }

  onPlatformChange(): void {
    this.filterTemplates();
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  downloadImage(imageUrl: string, title: string): void {
    fetch(imageUrl)
      .then(response => response.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `${title}.jpg`; // Assume jpg, adjust if needed
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      })
      .catch(error => {
        console.error('Error downloading image:', error);
      });
  }

}
