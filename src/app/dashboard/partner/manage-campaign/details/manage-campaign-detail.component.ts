import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { CampaignInterface } from '../manage-campaign.service';

/** @title Disabled select */
@Component({
  selector: 'async-manage-campain-detail',
  templateUrl: 'manage-campaign-detail.component.html',
  styleUrls: ['manage-campaign-detail.component.scss'],
  standalone: true,
  imports: [
    MatCheckboxModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatIconModule
  ],
})
export class ManageCampaignDetailComponent implements OnInit {

  @Input() campaign!: CampaignInterface;

  constructor(private router: Router, private route: ActivatedRoute) { }

  back(): void {
    this.router.navigateByUrl('dashboard/manage-campaign');
  }



  ngOnInit(): void {  }
}
