import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient } from '../http/api-client.service';
import { ActionsEnvelope, ActivationEnvelope, FunnelEnvelope, OverviewEnvelope, TeamEnvelope } from './analytics.models';

/** Read-only analytics → backend `/v1/analytics/*`. Fully typed. */
@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private readonly api = inject(ApiClient);

  funnel(days = 30): Observable<FunnelEnvelope> {
    return this.api.get<FunnelEnvelope>(`v1/analytics/funnel?days=${days}`);
  }

  team(days = 30): Observable<TeamEnvelope> {
    return this.api.get<TeamEnvelope>(`v1/analytics/team?days=${days}`);
  }

  actions(limit = 15): Observable<ActionsEnvelope> {
    return this.api.get<ActionsEnvelope>(`v1/analytics/actions?limit=${limit}`);
  }

  /** Single aggregation powering the Insights page (replaces 3 calls). */
  overview(days = 30): Observable<OverviewEnvelope> {
    return this.api.get<OverviewEnvelope>(`v1/dashboard/overview?days=${days}`);
  }

  /** 7-day onboarding activation over the trailing signup cohort. */
  activation(days = 90): Observable<ActivationEnvelope> {
    return this.api.get<ActivationEnvelope>(`v1/analytics/activation?days=${days}`);
  }
}
