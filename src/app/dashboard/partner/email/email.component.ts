import { Component, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { PartnerInterface } from '../../../_common/services/partner.service';
import { EmailService } from './email.service';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { HelpDialogComponent } from '../../../_common/help-dialog.component';
import { MatIconModule } from '@angular/material/icon';
import {MatTabsModule} from '@angular/material/tabs';
import { EnterEmailComponent } from './enter-email/enter-email.component';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
selector: 'async-email',
imports: [MatButtonModule, MatIconModule, RouterModule, MatTabsModule, EnterEmailComponent, CommonModule],
providers: [EmailService],
templateUrl: 'email.component.html',
styles: [`

.async-background {
    margin: 2em;
    h2 {
        mat-icon {
            cursor: pointer;
        }
    }
    .async-container {
        background-color: #dcdbdb;
        border-radius: 10px;
        height: 100%;
        padding: 1em;
        .title {
            display: flex;
            justify-content: space-between;
            border-bottom: 1px solid #ccc;
            padding: 1em;
            .action-area {
                .action {
                    font-weight: bold;
                    margin-top: 1em;
                }
            }
        }

        .search {
            padding: 0.5em 0;
            text-align: center;
            mat-form-field {
                width: 70%;

            }
        }       

        .no-campaign {
            text-align: center;
            color: rgb(196, 129, 4);
            font-weight: bold;
        }
    }
}

.container {
    margin-top: 1em;
    padding: 20px;
    background-color: white;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    border-radius: 5px;
}


@media (max-width: 600px) {
    .form-group {
        flex: 1 1 100%;
    }
}

`]
})
export class EmailComponent{

  @Input() partner!: PartnerInterface;
  readonly dialog = inject(MatDialog);

  constructor(
    private emailService: EmailService,
    private router: Router,
  ) {}


  showDescription () {
    this.dialog.open(HelpDialogComponent, {
      data: {help: `
        Here, you can effortlessly send bulk email to your contact list and manage your email contacts.
      `},
    });
  }

  importEmailsNumbers() {
    this.router.navigate(['/dashboard/tools/contacts/new']);
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
    
}
