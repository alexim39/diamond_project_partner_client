import {Component} from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';

@Component({
selector: 'async-announcements',
imports: [MatTabsModule, MatButtonModule, MatIconModule, MatChipsModule, MatCardModule],
template: `


<div class="forums-container mat-elevation-z2">
  <div class="header-row">
    <h2>Discussion Forums</h2>
    <h2>Announcements</h2>
  </div>

  <div class="content-row">
    <!-- Left Panel: Forums -->
    <div class="forums-panel">
      <mat-tab-group class="tabs" disableRipple>
        <mat-tab label="General"></mat-tab>
        <mat-tab label="Getting Started"></mat-tab>
        <mat-tab label="Product Tips"></mat-tab>
      </mat-tab-group>

      <mat-card class="forum-card">
        <div class="forum-title">Strategies for Building Your Network</div>

        <div class="forum-meta">
          <img class="avatar" src="https://i.pravatar.cc/40?img=3" />
          <span class="author-name">David Mitchell</span>
          <span class="time-ago">3 hrs ago</span>
        </div>

        <p class="forum-question">What are some effective strategies you use to grow your network?</p>
        <a href="#" class="replies-link">12 replies</a>
      </mat-card>
    </div>

    <!-- Right Panel: Announcements -->
    <div class="announcements-panel">
      <mat-card class="announcement-card">
        <div class="announcement-header">
          <img class="avatar" src="https://i.pravatar.cc/40?img=5" />
          <div class="announcement-info">
            <div class="announcement-title">Special Promotion This Month</div>
            <div class="announcement-meta">
              <span class="author-name">Sarah Parker</span>
              <span class="time-ago">2 days ago</span>
            </div>
          </div>
        </div>
        <p class="announcement-text">
          Don’t miss out on our limited-time promotion running throughout this month!
        </p>
      </mat-card>
    </div>
  </div>

  <button mat-flat-button color="primary" class="view-all-btn">View All</button>
</div>


`,
styles: `

.forums-container {
  padding: 24px;
  border-radius: 16px;
  background: #fff;

  .header-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 16px;

    h2 {
      font-size: 22px;
      font-weight: 600;
    }
  }

  .content-row {
    display: flex;
    gap: 24px;

    .forums-panel {
      flex: 2;

      .tabs {
        margin-bottom: 12px;

        ::ng-deep .mat-tab-label {
          font-weight: 500;
        }
      }

      .forum-card {
        padding: 16px;
        border-radius: 12px;

        .forum-title {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 8px;
        }

        .forum-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          margin-bottom: 8px;

          .avatar {
            width: 32px;
            height: 32px;
            border-radius: 50%;
          }

          .time-ago {
            margin-left: auto;
            color: gray;
          }
        }

        .forum-question {
          font-size: 15px;
          margin-bottom: 8px;
        }

        .replies-link {
          color: #3f51b5;
          font-weight: 500;
          text-decoration: none;
        }
      }
    }

    .announcements-panel {
      flex: 1;

      .announcement-card {
        padding: 16px;
        border-radius: 12px;

        .announcement-header {
          display: flex;
          gap: 12px;

          .avatar {
            width: 36px;
            height: 36px;
            border-radius: 50%;
          }

          .announcement-info {
            .announcement-title {
              font-size: 16px;
              font-weight: 600;
              margin-bottom: 2px;
            }

            .announcement-meta {
              font-size: 13px;
              color: gray;
              display: flex;
              gap: 8px;
            }
          }
        }

        .announcement-text {
          margin-top: 10px;
          font-size: 14px;
        }
      }
    }
  }

  .view-all-btn {
    margin-top: 24px;
    width: 100%;
    height: 48px;
    border-radius: 12px;
    font-weight: 600;
  }
}

@media (max-width: 768px) {
  .content-row {
    flex-direction: column;
  }
}


`,
})
export class AnnouncementsComponent {
  // Component logic can go here if needed

}
