import { Routes } from '@angular/router';
import { ResourceDownloadContainerComponent } from './resource-download/resource-download-container.component';
import { PreapproachDownloadContainerComponent } from './pre-approach-download/pre-approach-download-container.component';

export const RourcesRoutes: Routes = [
  {
    path: '',
    redirectTo: 'ads-contents',
    pathMatch: 'full',
  },
  {
    path: '',
    children: [
        { path: 'ads-contents', 
            component: ResourceDownloadContainerComponent,
            title: "Ads Contents - Download Contents for Ads Campaigns",
        },
        { path: 'prospecting-contents', 
            component: PreapproachDownloadContainerComponent,
            title: "Prospecting Contents - Download Contents for Prospecting Campaigns",
        }, 
        
    ],
  },
];