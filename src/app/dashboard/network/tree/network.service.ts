import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient } from '../../../core/http/api-client.service';
import { NetworkTreeEnvelope, UplineEnvelope } from './network.models';

/** Network read-model access → backend `/v1/network/*`. Fully typed. */
@Injectable({ providedIn: 'root' })
export class NetworkService {
  private readonly api = inject(ApiClient);

  tree(partnerId: string, depth = 4): Observable<NetworkTreeEnvelope> {
    return this.api.get<NetworkTreeEnvelope>(`v1/network/${partnerId}/tree?depth=${depth}`);
  }

  upline(partnerId: string): Observable<UplineEnvelope> {
    return this.api.get<UplineEnvelope>(`v1/network/${partnerId}/upline`);
  }

  displayName(node: { name: string; surname: string; username: string }): string {
    const full = `${node.name ?? ''} ${node.surname ?? ''}`.trim();
    return full || node.username;
  }
}
