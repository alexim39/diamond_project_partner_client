import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { ApiError } from '../../../core/http/api-error';
import { NetworkService } from '../tree/network.service';
import { NetworkNode, NetworkTreeMeta } from '../tree/network.models';

interface OrgLevel {
  depth: number;
  members: NetworkNode[];
  leaders: number;
}

/**
 * @title Organization chart — breadth-first view of the network.
 *
 * Where the tree shows lineage, this shows levels: span of control,
 * widest bench, leaders per band. Click a member to focus their subtree.
 * OnPush + signals, fully typed.
 */
@Component({
  selector: 'async-org-chart',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatButtonModule, MatChipsModule, MatFormFieldModule, MatIconModule,
    MatInputModule, MatProgressBarModule, MatSelectModule, RouterModule,
  ],
  template: `
    <section class="breadcrumb-wrapper">
      <div class="breadcrumb">
        <a routerLink="/dashboard">Dashboard</a> &gt;
        <a>Network</a> &gt;
        <span>Org Chart</span>
      </div>
    </section>

    <section class="org-page">
      <div class="page-head">
        <div>
          <h2>Organization Chart</h2>
          <p class="subtitle">Level by level — who sits where, and how wide each bench is.</p>
        </div>
        <div class="head-links">
          <a mat-button routerLink="../tree">Tree view</a>
        </div>
      </div>

      <div class="toolbar">
        <mat-form-field appearance="outline" subscriptSizing="dynamic">
          <mat-label>Search members</mat-label>
          <input matInput type="search" placeholder="Username or name" (input)="search.set($any($event.target).value)" />
          <mat-icon matSuffix>search</mat-icon>
        </mat-form-field>
        <mat-form-field appearance="outline" subscriptSizing="dynamic" class="depth-field">
          <mat-label>Depth</mat-label>
          <mat-select [value]="depth()" (selectionChange)="depth.set($event.value); reload()">
            @for (d of depthOptions; track d) {
              <mat-option [value]="d">{{ d }} levels</mat-option>
            }
          </mat-select>
        </mat-form-field>
        @if (loading()) {
          <mat-progress-bar mode="indeterminate" class="loader" />
        }
      </div>

      @if (meta(); as m) {
        <div class="stats">
          <span><strong>{{ m.total }}</strong> partners</span>
          <span>Span of control: <strong>{{ spanOfControl() }}</strong></span>
          <span>Widest level: <strong>{{ widestLevel() }}</strong></span>
          @if (m.truncated) {
            <span class="warn">Partial data — raise depth or focus a subtree.</span>
          }
        </div>
      }

      @if (error(); as err) {
        <p class="error" role="alert">
          {{ err }}
          <button mat-button (click)="reload()">Retry</button>
        </p>
      }

      @if (levels().length > 0) {
        <ol class="levels">
          @for (level of levels(); track level.depth) {
            <li class="level dp-card">
              <button class="level-head" (click)="toggleLevel(level.depth)" [attr.aria-expanded]="!isCollapsed(level.depth)">
                <mat-icon>{{ isCollapsed(level.depth) ? 'expand_more' : 'expand_less' }}</mat-icon>
                <strong>Level {{ level.depth }}</strong>
                <span class="muted">{{ level.members.length }} members · {{ level.leaders }} leaders</span>
              </button>
              @if (!isCollapsed(level.depth)) {
                <div class="members">
                  @for (member of level.members; track member.id) {
                    <button
                      class="member"
                      [class.member--match]="isMatch(member)"
                      (click)="select(member)"
                      [title]="names(member)"
                    >
                      <span class="avatar" aria-hidden="true">{{ initial(member) }}</span>
                      <span class="member-name">{{ names(member) }}</span>
                      <span class="muted">@{{ member.username }} · {{ member.childCount }}</span>
                    </button>
                  }
                </div>
              }
            </li>
          }
        </ol>

        @if (selected(); as detail) {
          <div class="details" role="status">
            <div>
              <strong>{{ names(detail) }}</strong>
              <span class="muted">@{{ detail.username }} · {{ detail.plan }} plan · {{ detail.childCount }} downlines</span>
            </div>
            <span class="spacer"></span>
            <button mat-flat-button color="primary" (click)="focus(detail.id)">Focus subtree</button>
          </div>
        }
      } @else if (!loading() && !error()) {
        <p class="empty">No downlines yet — converted prospects will appear here.</p>
      }
    </section>
  `,
  styles: [`
    .breadcrumb-wrapper { margin-bottom: 1em; }
    .breadcrumb a { text-decoration: none; }
    .org-page { display: flex; flex-direction: column; gap: 1em; padding-bottom: 2em; }
    .page-head { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1em; }
    .page-head h2 { margin: 0; }
    .subtitle { margin: 0.25em 0 0; color: var(--dp-muted); }
    .head-links { display: flex; gap: 0.25em; }
    .toolbar { display: flex; align-items: center; gap: 1em; flex-wrap: wrap; }
    .toolbar mat-form-field { flex: 1; min-width: 200px; }
    .depth-field { max-width: 150px; }
    .loader { flex: 2; min-width: 120px; }
    .stats { display: flex; gap: 1.5em; align-items: center; flex-wrap: wrap; }
    .warn { color: var(--dp-warning); }
    .levels { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 0.75em; counter-reset: level; }
    .level { padding: 0.75em 1em; }
    .level-head { display: flex; align-items: center; gap: 0.6em; background: none; border: none; cursor: pointer; padding: 0; color: inherit; font: inherit; width: 100%; text-align: left; }
    .level-head mat-icon { color: var(--dp-gold); }
    .members { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 0.6em; margin-top: 0.75em; }
    .member { display: flex; flex-direction: column; align-items: flex-start; gap: 0.15em; background: var(--dp-paper); border: 1px solid var(--dp-line); border-radius: 8px; padding: 0.6em 0.75em; cursor: pointer; color: inherit; font: inherit; text-align: left; }
    .member:hover { border-color: var(--dp-gold); }
    .member--match { border-color: var(--dp-success); border-width: 2px; }
    .avatar { display: inline-flex; align-items: center; justify-content: center; width: 2em; height: 2em; border-radius: 50%; background: var(--dp-gold-soft); color: var(--dp-gold-ink); font-weight: 700; }
    .member-name { font-weight: 600; }
    .details { display: flex; align-items: center; gap: 1em; background: var(--dp-info-bg); border: 1px solid var(--dp-line); border-radius: 8px; padding: 0.75em 1em; flex-wrap: wrap; }
    .details .spacer { flex: 1; }
    .muted { color: var(--dp-muted); font-size: 0.85em; }
    .error { color: var(--dp-error); display: flex; align-items: center; gap: 0.5em; }
    .empty { color: var(--dp-muted); }
  `],
})
export class OrgChartComponent implements OnInit {
  private readonly network = inject(NetworkService);
  private readonly auth = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly tree = signal<NetworkNode | null>(null);
  protected readonly meta = signal<NetworkTreeMeta | null>(null);
  protected readonly rootId = signal<string | null>(null);
  protected readonly depth = signal(4);
  protected readonly search = signal('');
  protected readonly collapsed = signal<ReadonlySet<number>>(new Set());
  protected readonly selectedId = signal<string | null>(null);

  protected readonly depthOptions = [2, 3, 4, 5, 6, 8, 10];

  /** Breadth-first levels over the loaded tree (search filters members). */
  protected readonly levels = computed<OrgLevel[]>(() => {
    const root = this.tree();
    if (!root) return [];
    const q = this.search().trim().toLowerCase();
    const bands = new Map<number, NetworkNode[]>();
    const queue: Array<{ node: NetworkNode; depth: number }> = [{ node: root, depth: 0 }];
    while (queue.length > 0) {
      const { node, depth } = queue.shift()!;
      if (!bands.has(depth)) bands.set(depth, []);
      bands.get(depth)!.push(node);
      for (const child of node.children ?? []) queue.push({ node: child, depth: depth + 1 });
    }
    return [...bands.entries()]
      .sort(([a], [b]) => a - b)
      .map(([depth, members]) => {
        const filtered = q
          ? members.filter((m) => `${m.username} ${m.name} ${m.surname}`.toLowerCase().includes(q))
          : members;
        return {
          depth,
          members: filtered,
          leaders: members.filter((m) => m.role === 'leader' || m.role === 'admin').length,
        };
      })
      .filter((level) => level.members.length > 0);
  });

  protected readonly spanOfControl = computed(() => this.levels().find((l) => l.depth === 1)?.members.length ?? 0);

  protected readonly widestLevel = computed(() => {
    const levels = this.levels();
    if (levels.length === 0) return '—';
    const widest = levels.reduce((a, b) => (b.members.length > a.members.length ? b : a));
    return `L${widest.depth} (${widest.members.length})`;
  });

  protected readonly selected = computed(() => {
    const id = this.selectedId();
    if (!id) return null;
    for (const level of this.levels()) {
      const found = level.members.find((m) => m.id === id);
      if (found) return found;
    }
    return null;
  });

  ngOnInit(): void {
    const me = this.auth.currentUser()?.id;
    if (me) {
      this.rootId.set(me);
      this.reload();
    } else {
      this.error.set('Session expired. Please sign in again.');
      this.loading.set(false);
    }
  }

  protected reload(): void {
    const root = this.rootId();
    if (!root) return;
    this.loading.set(true);
    this.error.set(null);
    this.network
      .tree(root, this.depth())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.tree.set(res.data.tree);
          this.meta.set(res.data.meta);
          this.collapsed.set(new Set());
          this.selectedId.set(null);
          this.loading.set(false);
        },
        error: (err: ApiError) => {
          this.error.set(err.message);
          this.loading.set(false);
        },
      });
  }

  protected focus(partnerId: string): void {
    this.rootId.set(partnerId);
    this.search.set('');
    this.reload();
  }

  protected toggleLevel(depth: number): void {
    const next = new Set(this.collapsed());
    if (next.has(depth)) {
      next.delete(depth);
    } else {
      next.add(depth);
    }
    this.collapsed.set(next);
  }

  protected isCollapsed(depth: number): boolean {
    return this.collapsed().has(depth);
  }

  protected select(member: NetworkNode): void {
    this.selectedId.set(this.selectedId() === member.id ? null : member.id);
  }

  protected isMatch(member: NetworkNode): boolean {
    const q = this.search().trim().toLowerCase();
    if (!q) return false;
    return `${member.username} ${member.name} ${member.surname}`.toLowerCase().includes(q);
  }

  protected names(node: { name: string; surname: string; username: string }): string {
    return this.network.displayName(node);
  }

  protected initial(node: { name: string; username: string }): string {
    return (node.name?.charAt(0) ?? node.username?.charAt(0) ?? '?').toUpperCase();
  }
}
