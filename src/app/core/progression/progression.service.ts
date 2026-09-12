import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient } from '../http/api-client.service';
import { ConfirmationsEnvelope, JourneyEnvelope, MilestonesEnvelope, OversightEnvelope, PendingEnvelope } from './progression.models';

/** Diamond journey ladder → backend `/v1/progression/*`. Fully typed. */
@Injectable({ providedIn: 'root' })
export class ProgressionService {
  private readonly api = inject(ApiClient);

  mine(): Observable<JourneyEnvelope> {
    return this.api.get<JourneyEnvelope>('v1/progression/mine');
  }

  attest(patch: Record<string, unknown>): Observable<MilestonesEnvelope> {
    return this.api.put<MilestonesEnvelope>('v1/progression/mine/milestones', patch);
  }

  requestNomination(note = ''): Observable<unknown> {
    return this.api.post('v1/progression/mine/nomination', { note });
  }

  requestTraining(key: string): Observable<unknown> {
    return this.api.post('v1/progression/mine/training/request', { key });
  }

  pendingConfirmations(): Observable<ConfirmationsEnvelope> {
    return this.api.get<ConfirmationsEnvelope>('v1/progression/team/confirmations');
  }

  decideTraining(partnerId: string, key: string, approved: boolean, note = ''): Observable<unknown> {
    return this.api.post('v1/progression/confirmations/decision', { partnerId, key, approved, note });
  }

  pendingNominations(): Observable<PendingEnvelope> {
    return this.api.get<PendingEnvelope>('v1/progression/nominations/pending');
  }

  decideNomination(partnerId: string, approved: boolean): Observable<unknown> {
    return this.api.post('v1/progression/nominations/decision', { partnerId, approved });
  }

  oversight(): Observable<OversightEnvelope> {
    return this.api.get<OversightEnvelope>('v1/progression/oversight');
  }
}
