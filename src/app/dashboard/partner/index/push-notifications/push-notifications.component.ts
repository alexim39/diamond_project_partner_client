import { Component} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import {MatDividerModule} from '@angular/material/divider';

@Component({
selector: 'async-push-notifications',
template: `
    <section class="notification-list">
      <div class="notification-list__header">
        <h2 class="notification-list__title">Today's Follow-ups</h2>
      </div>

      <mat-divider class="notification-list__divider"/>

      <button mat-menu-item class="notification-item notification-item--urgent">
        <div class="notification-item__icon">
          <mat-icon color="warn">priority_high</mat-icon>
        </div>
        <div class="notification-item__content">
          <h3 class="notification-item__title">URGENT: Call Rachel Peters</h3>
          <p class="notification-item__description">
            Expressed intent to join yesterday, send registration link
            <span class="notification-item__tag">Promise made</span>
          </p>
        </div>
        <div class="notification-item__actions"></div>
      </button>

      <button mat-menu-item class="notification-item">
        <div class="notification-item__icon">
          <mat-icon>smart_display</mat-icon>
        </div>
        <div class="notification-item__content">
          <h3 class="notification-item__title">Call Mark Johnson</h3>
          <p class="notification-item__description">
            Watched opportunity video 2 days ago
            <span class="notification-item__tag">75% completion rate</span>
          </p>
        </div>
        <div class="notification-item__actions"></div>
      </button>

      <button mat-menu-item class="notification-item">
        <div class="notification-item__icon">
          <mat-icon>sms</mat-icon>
        </div>
        <div class="notification-item__content">
          <h3 class="notification-item__title">Text Susan Williams</h3>
          <p class="notification-item__description">
            Product samples delivered yesterday
            <span class="notification-item__tag">Confirmation needed</span>
          </p>
        </div>
        <div class="notification-item__actions"></div>
      </button>

      <button mat-menu-item class="notification-item">
        <div class="notification-item__icon">
          <mat-icon>mail</mat-icon>
        </div>
        <div class="notification-item__content">
          <h3 class="notification-item__title">Email Business Prospects Group</h3>
          <p class="notification-item__description">
            7-day follow-up with success story
            <span class="notification-item__tag">Sequence Step 3</span>
          </p>
        </div>
        <div class="notification-item__actions"></div>
      </button>

      <button mat-menu-item class="notification-item">
        <div class="notification-item__icon">
          <mat-icon>call</mat-icon>
        </div>
        <div class="notification-item__content">
          <h3 class="notification-item__title">Call David Garcia</h3>
          <p class="notification-item__description">
            Asked for time to think 5 days ago
            <span class="notification-item__tag">Decision checkpoint</span>
          </p>
        </div>
        <div class="notification-item__actions"></div>
      </button>
    </section>
`,
imports: [
    MatIconModule, MatDividerModule
],
styles: `
.notification-list {
  width: 100%; /* Ensure it takes full width of its container */
  max-width: 500px; /* Set a reasonable maximum width */
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15); /* Slightly stronger shadow */

  &__header {
    padding: 16px 20px; /* Slightly more horizontal padding */
    text-align: left;
  }

  &__title {
    margin: 0;
    font-size: 1.15rem; /* Slightly smaller, cleaner */
    font-weight: 600;
    color: #212121; /* Darker text */
  }

  &__divider {
    margin: 0; /* Ensure no extra spacing */
  }

  .notification-item {
    display: flex;
    align-items: flex-start;
    padding: 16px 20px; /* Consistent horizontal padding */
    text-align: left;
    white-space: normal;
    transition: background-color 0.15s ease-in-out;
    cursor: pointer;

    &:last-child {
      border-bottom: none;
    }

    &:hover {
      background-color: #f5f5f5; /* Slightly darker hover */
    }

    &--urgent {
      background-color: #ffebee; /* Light red */
      border-left: 1px solid #c62828; /* Darker, more serious red */
    }

    &__icon {
      margin-right: 16px; /* More spacing for better visual separation */
      margin-top: 2px;

      mat-icon {
        font-size: 22px; /* Slightly larger icons */
        height: 22px;
        width: 22px;
        color: rgba(0, 0, 0, 0.7); /* Darker icons */
      }
    }

    &__content {
      flex-grow: 1;
    }

    &__title {
      margin: 0 0 6px 0; /* Slightly more space below title */
      font-size: 1rem;
      font-weight: 500; /* Slightly lighter font weight */
      color: #212121; /* Darker text */

      /* Urgent title styling */
      .notification-item--urgent & {
        color: #b71c1c; /* Even darker red for urgent title */
      }
    }

    &__description {
      font-size: 0.875rem; /* Slightly smaller description */
      margin: 0;
      color: #424242; /* Darker description text */
      line-height: 1.4;
    }

    &__tag {
      display: inline-block;
      font-size: 0.7rem; /* Slightly smaller tag */
      color: #1a237e; /* Darker blue */
      background-color: #e0e0e0; /* Light gray background for tag */
      padding: 2px 6px;
      border-radius: 4px;
      margin-top: 6px; /* More space above tag */
    }

    &__actions {
      margin-left: 16px;
      opacity: 0.8; /* Slightly more visible actions */
      /* Add styling for action buttons here if needed */
    }
  }
}
`
})
export class PushNotificationsComponent {}