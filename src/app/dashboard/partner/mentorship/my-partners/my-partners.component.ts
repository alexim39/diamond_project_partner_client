import { AfterViewInit, Component, inject, Input, OnInit, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatCardModule } from '@angular/material/card';
import { PartnerInterface } from '../../../../_common/services/partner.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Subscription } from 'rxjs';
import { FormsModule, ReactiveFormsModule} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import {MatPaginator, MatPaginatorModule} from '@angular/material/paginator';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { ActivateNewPartnerComponent } from './activate-new-partner.component';
import { MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AvatarComponent } from '../../../../_common/avatar.component';
import { PresenceService, PresenceStatus } from '../../../../core/presence/presence.service';


@Component({
selector: 'async-my-partners',
templateUrl: 'my-partners.component.html',
styles: [`

.async-background {
    display: flex;
    flex-direction: column;
    gap: 1em;
    padding-bottom: 2em;
    h2 {
        margin: 0;
        mat-icon {
            cursor: pointer;
        }
    }
    .async-container {
        background: var(--dp-surface);
        border: 1px solid var(--dp-line);
        border-radius: var(--dp-radius);
        height: 100%;
        padding: 1em;
        .title {
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 0.75em;
            border-bottom: 1px solid var(--dp-line);
            padding: 0.5em 0.5em 1em;
            h3 {
                margin: 0;
            }
            .fund-area {
                .fund {
                    font-weight: bold;
                    margin-top: 1em;
                }
            }
        }

        .search {
            padding: 0.75em 0;
            text-align: center;
            mat-form-field {
                width: min(70%, 560px);
            }
        }

        .table {
            padding: 0.5em;
            border-radius: var(--dp-radius);
            background: var(--dp-paper);
            border: 1px solid var(--dp-line);
            overflow-x: auto;
        }

        .table table.mat-mdc-table,
        .table mat-paginator {
            background: transparent;
        }

        .table .mat-mdc-header-cell {
            color: var(--dp-muted);
        }

        .name-cell {
            display: inline-flex;
            align-items: center;
            gap: 0.5em;
        }

        .chip-row {
            display: inline-flex;
            gap: 0.25em;
            flex-wrap: wrap;
        }

        .muted {
            color: var(--dp-muted);
        }

        .small {
            font-size: 0.8em;
        }

        .fund-area {
            display: flex;
            gap: 0.5em;
            flex-wrap: wrap;
            align-items: center;
        }

        .fund-area a {
            min-height: 44px;
        }

        .no-campaign {
            text-align: center;
            color: var(--dp-gold-ink);
            font-weight: bold;
        }

    }
}

.page-sub {
    margin: 0;
    color: var(--dp-muted);
    font-size: 0.9em;
    max-width: 44em;
}


`],
imports: [
        MatCardModule, ReactiveFormsModule, FormsModule, MatFormFieldModule,
        CommonModule, MatPaginatorModule, MatInputModule, MatChipsModule,
        MatTableModule,
        MatRadioModule,
        MatIconModule,
        RouterModule,
        MatButtonModule,
        FormsModule,
        MatCheckboxModule,
        MatSlideToggleModule,
        MatTooltipModule,
        AvatarComponent
    ],
    changeDetection: ChangeDetectionStrategy.Eager,
    providers: []
})
export class MyPartnersComponent implements OnInit, AfterViewInit {
  @Input() partner!: PartnerInterface;
  @Input() myPartners!: PartnerInterface[];
  /** Activation snapshot keyed by partner id — fail-soft, missing rows hide extra chips. */
  @Input() supportMap: Record<string, { levelLabel?: string; relation?: string; ipoDone?: boolean; qsgDone?: boolean; worked?: number; total?: number; unworked?: number; overdue?: boolean }> = {};
  subscriptions: Subscription[] = [];
  dataSource = new MatTableDataSource<PartnerInterface>([]);  
  isEmptyRecord = false;
  filterText: string = '';
  displayedColumns: string[] = ['name', 'status', 'phone', 'email', 'username', 'date', 'actions'];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  readonly dialog = inject(MatDialog);

  constructor(
    private router: Router,
    private presence: PresenceService,
  ) {}

  /** partnerId → lastSeenAt (null = offline); drives avatar dots. */
  presenceMap: Record<string, string | null> = {};

  protected presenceStatus(id: string | null | undefined): PresenceStatus {
    if (!id) return null;
    return this.presence.statusOf(this.presenceMap[String(id)] ?? null);
  }

  ngOnInit() {
    //console.log(this.myPartners);
    
    // Check if myPartners has data
    if (this.myPartners && this.myPartners.length > 0) {
      // Use data property to set the array as the table's data source
      this.dataSource = new MatTableDataSource<PartnerInterface>(this.myPartners);
      this.dataSource.paginator = this.paginator; // Ensure paginator is set
    } else {
      this.isEmptyRecord = true;
    }
  
    // Custom filter predicate — name, phone, username or email.
    this.dataSource.filterPredicate = (data: PartnerInterface, filter: string) => {
      const q = filter.toLowerCase();
      return [data.name, data.surname, data.phone, data.username, data.email]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    };

    // Presence dots for direct downline (single bulk call, cached 60s).
    const ids = (this.myPartners ?? []).map((p) => (p as PartnerInterface & { _id?: string })._id).filter(Boolean) as string[];
    if (ids.length > 0) {
      this.subscriptions.push(
        this.presence.lookup(ids).subscribe((map) => {
          this.presenceMap = { ...this.presenceMap, ...map };
        })
      );
    }
  }



  
  ngAfterViewInit() {
    // Link the paginator to the data source
    this.dataSource.paginator = this.paginator;
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }


  support(id: string) {
    this.router.navigate(['/dashboard/mentorship/partners/my-partners/detail', id]);
  }

  /** Activation snapshot for one partner id (null when not loaded). */
  info(id: string): { levelLabel?: string; relation?: string; ipoDone?: boolean; qsgDone?: boolean; worked?: number; total?: number; unworked?: number; overdue?: boolean } | null {
    return this.supportMap?.[String(id)] ?? null;
  }

  // Scroll to top when clicked
  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  ngOnDestroy() {
    // unsubscribe list
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  ActivateNewPartner() {
    this.dialog.open(ActivateNewPartnerComponent, {
      data: this.partner
    });
  }
}
