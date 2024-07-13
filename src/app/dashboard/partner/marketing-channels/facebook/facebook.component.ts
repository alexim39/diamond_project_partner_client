import {Component} from '@angular/core';
import {FormBuilder, Validators, FormsModule, ReactiveFormsModule, FormGroup, FormControl} from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatStepperModule} from '@angular/material/stepper';
import {MatButtonModule} from '@angular/material/button';
import {MatSelectModule} from '@angular/material/select';
import {MatCheckboxModule} from '@angular/material/checkbox';

/**
 * @title Stepper vertical
 */
@Component({
  selector: 'async-facebook',
  templateUrl: 'facebook.component.html',
  styleUrl: 'facebook.component.scss',
  standalone: true,
  imports: [
    MatButtonModule, MatSelectModule, MatCheckboxModule,
    MatStepperModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
  ],
})
export class FacebookComponent {
  targetAudienceFormGroup!: FormGroup;
  marketingObjectivesFormGroup!: FormGroup;
  budgetFormGroup!: FormGroup;
  adDurationFormGroup!: FormGroup;
  adFormatFormGroup!: FormGroup;
  adPreferences!: FormGroup;

  constructor(private _formBuilder: FormBuilder) {}

  ngOnInit() {
    this.targetAudienceFormGroup = this._formBuilder.group({
      ageRangeTarget: ['', Validators.required],
      genderTarget: ['', Validators.required],
      locationTarget: ['', Validators.required],
      educationTarget: ['', Validators.required],
      relationshipTarget: ['', Validators.required]
    });

    this.marketingObjectivesFormGroup = this._formBuilder.group({
      adObjective: ['', Validators.required],
      successMeasurement: ['', Validators.required]
    });

    this.budgetFormGroup = this._formBuilder.group({
      budgetType: ['', Validators.required],
      budgetAmount: ['', [Validators.required, Validators.pattern('^[0-9]*$')]]
    });

    this.adDurationFormGroup = this._formBuilder.group({
      compaignStartDate: ['', Validators.required],
      compaignEndDate: ['', Validators.required],
      noEndDate: [false]
    });

    this.adFormatFormGroup = this._formBuilder.group({
      adFormat: ['', Validators.required],
      deviceType: ['', Validators.required]
    });

    this.adPreferences = this._formBuilder.group({
      FacebookFeed: new FormControl(false),
      InstagramFeed: new FormControl(false),
      InstagramStories: new FormControl(false),
      FacebookStories: new FormControl(false),
      AudienceNetwork: new FormControl(false),
      MessengerInbox: new FormControl(false),
    })

  }


  onSubmit() {
    const campaignData = {
      targetAudience: this.targetAudienceFormGroup.value,
      marketingObjectives: this.marketingObjectivesFormGroup.value,
      budget: this.budgetFormGroup.value,
      adDuration: this.adDurationFormGroup.value,
      adFormat: {
        ...this.adFormatFormGroup.value,
        adPreferences: this.adPreferences.value,
      }
    }; 

    console.log('Campaign submitted successfully', campaignData);
  }

  
}