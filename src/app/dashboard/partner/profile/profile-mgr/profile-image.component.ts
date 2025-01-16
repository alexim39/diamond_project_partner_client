import { Component, Input } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { PartnerInterface } from '../../../../_common/services/partner.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'async-profile-picture-upload',
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  template: `
  <section>
    <div class="profile-picture-upload">
        <img *ngIf="profilePictureUrl" [src]="profilePictureUrl" alt="Profile Picture" class="profile-picture-preview"/>
        <input type="file" (change)="onFileSelected($event)" accept="image/*" />
        <button mat-flat-button (click)="onUpload()">Upload</button>
    </div>
  </section>
  `,
  styles: `
  section {
    display: flex;  
    justify-content: center;  
    align-items: center;  
    height: 15em;  
    background-color: #f0f0f0; 
    .profile-picture-upload {
      //width: 12em;  /* Set the width of the circle */  
      //height: 12em; /* Set the height of the circle */  
      //overflow: hidden; /* Hide any overflow part of the image */  
      display: flex;  
      flex-direction: column;
      justify-content: center;  
      align-items: center;
      .profile-picture-preview {
          border-radius: 50%; /* Makes the container round */  
          width: 100%; /* Scale the image to cover the container */  
          height: auto; /* Maintain the aspect ratio */  
          object-fit: cover; /* Cover the container without distorting the image */ 
          width: 8em;  /* Set the width of the circle */  
          height: 8em; /* Set the height of the circle */   
      }
      button {
          margin:1em;
      }
    }
  }
  
  `
})
export class ProfilePictureUploadComponent {
    // Define API
    apiURL = 'https://diamondprojectapi-y6u04o8b.b4a.run/';
    //apiURL = 'http://localhost:3000';

  selectedFile: File | null = null;
  profilePictureUrl: string | ArrayBuffer | null = null;

  @Input() partner!: PartnerInterface;

  constructor(private http: HttpClient) {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];
      
      const reader = new FileReader();
      reader.onload = (e) => {
        this.profilePictureUrl = reader.result;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  onUpload(): void {
    if (this.selectedFile) {
      const formData = new FormData();
      formData.append('profilePicture', this.selectedFile, this.selectedFile.name);
      formData.append('userId', this.partner._id); 

      this.http.post(this.apiURL + `/upload-profile-picture/image/${this.partner._id}`, formData).subscribe(response => {
        //console.log('Upload successful!', response);
        // Handle successful upload, e.g., update user profile data

        Swal.fire({
          position: "bottom",
          icon: 'success',
          text: 'Your profile image has been updated successfully',
          showConfirmButton: true,
          confirmButtonColor: "#ffab40",
          timer: 15000,
        }).then((result) => {
          if (result.isConfirmed) {
            // reload page
            location.reload();
          }
        });

      }, error => {
        //console.error('Upload failed!', error);
        Swal.fire({
          position: "bottom",
          icon: 'info',
          text: 'Server error occured, please try again',
          showConfirmButton: false,
          timer: 4000
        })
      });
    }
  }
}
