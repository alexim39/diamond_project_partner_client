import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient } from '../http/api-client.service';
import { RoiEnvelope } from './marketing.models';

/** Campaign ROI → backend `/v1/marketing/*`. Fully typed. */
@Injectable({ providedIn: 'root' })
export class MarketingService {
  private readonly api = inject(ApiClient);

  roi(days = 30): Observable<RoiEnvelope> {
    return this.api.get<RoiEnvelope>(`v1/marketing/campaigns/roi?days=${days}`);
  }
}
