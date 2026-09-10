import { inject, Injectable } from '@angular/core';
import { Observable, map, tap } from 'rxjs';
import { ApiClient } from '../http/api-client.service';

export type ExportKind = 'team' | 'pipeline' | 'commissions' | 'reports-mine' | 'reports-team';

const ENDPOINTS: Record<ExportKind, string> = {
  team: 'v1/exports/team.csv',
  pipeline: 'v1/exports/pipeline.csv',
  commissions: 'v1/exports/commissions.csv',
  'reports-mine': 'v1/exports/reports.csv?scope=mine',
  'reports-team': 'v1/exports/reports.csv?scope=team',
};

const triggerSave = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
};

/** CSV downloads → backend `/v1/exports/*`. Cookie session preserved. */
@Injectable({ providedIn: 'root' })
export class ExportService {
  private readonly api = inject(ApiClient);

  download(kind: ExportKind): Observable<void> {
    const filename = `${kind}-${new Date().toISOString().slice(0, 10)}.csv`;
    return this.api.download(ENDPOINTS[kind]).pipe(
      tap((blob) => triggerSave(blob, filename)),
      map(() => undefined),
    );
  }
}
