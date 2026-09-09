import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { ApiError } from '../../../core/http/api-error';
import { NetworkService } from './network.service';
import { NetworkNode, NetworkTreeMeta, PositionedNode } from './network.models';

const NODE_W = 168;
const NODE_H = 62;
const X_GAP = 196;
const Y_GAP = 118;

const ROLE_FILL: Record<string, string> = {
  admin: '#ffccbc',
  leader: '#bbdefb',
  user: '#e8eaf6',
};

/**
 * @title Network tree — downline visualization.
 *
 * Dependency-free SVG tidy-tree (no D3): post-order x-assignment, parents
 * centered over children. Click toggles collapse, details panel focuses a
 * subtree, breadcrumb walks the upline chain. OnPush + signals throughout.
 */
@Component({
  selector: 'async-network-tree',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatButtonModule, MatButtonToggleModule, MatFormFieldModule, MatIconModule,
    MatInputModule, MatProgressBarModule, MatSelectModule, MatTooltipModule, RouterModule,
  ],
  template: `
    <section class="breadcrumb-wrapper">
      <div class="breadcrumb">
        <a routerLink="/dashboard">Dashboard</a> &gt;
        <a>Mentorship</a> &gt;
        <span>Network Tree</span>
      </div>
    </section>

    <section class="tree-page">
      <div class="page-head">
        <div>
          <h2>Network Tree</h2>
          <p class="subtitle">Your full downline, live from the referral chain.</p>
        </div>
        <mat-button-toggle-group>
          <mat-button-toggle routerLink="../mentorship/partners/my-partners" title="Manage partners">
            <mat-icon>groups</mat-icon> Partners
          </mat-button-toggle>
        </mat-button-toggle-group>
      </div>

      @if (upline().length > 0) {
        <nav class="upline" aria-label="Upline">
          <mat-icon>arrow_upward</mat-icon>
          @for (ancestor of upline(); track ancestor.id; let last = $last) {
            <button mat-button (click)="focus(ancestor.id)">{{ names(ancestor) }}</button>
            @if (!last) {
              <span class="sep">›</span>
            }
          }
          <span class="sep">›</span>
          <strong>{{ names(rootLabel()) }}</strong>
        </nav>
      }

      <div class="toolbar">
        <mat-form-field appearance="outline" subscriptSizing="dynamic">
          <mat-label>Search network</mat-label>
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
          <span><strong>{{ m.perLevel.length - 1 }}</strong> levels deep</span>
          @if (m.truncated) {
            <span class="warn">Showing partial tree — raise depth or focus a subtree.</span>
          }
        </div>
      }

      @if (error(); as err) {
        <p class="error" role="alert">
          {{ err }}
          <button mat-button (click)="reload()">Retry</button>
        </p>
      }

      @if (layout(); as layout) {
        <div class="canvas-wrap">
          <svg
            [attr.viewBox]="'0 0 ' + layout.width + ' ' + layout.height"
            [attr.width]="layout.width"
            [attr.height]="layout.height"
            role="img"
            aria-label="Downline network tree"
          >
            @for (edge of layout.edges; track $index) {
              <path [attr.d]="edge.d" class="edge" />
            }
            @for (node of layout.nodes; track node.id) {
              <g
                class="node"
                [class.selected]="selectedId() === node.id"
                [class.match]="isMatch(node)"
                (click)="toggle(node)"
                tabindex="0"
                role="button"
                [attr.aria-label]="names(node)"
              >
                <rect
                  [attr.x]="node.x"
                  [attr.y]="node.y"
                  [attr.width]="nodeWidth"
                  [attr.height]="nodeHeight"
                  rx="10"
                  [attr.fill]="fill(node)"
                />
                <text [attr.x]="node.x + nodeWidth / 2" [attr.y]="node.y + 22" text-anchor="middle" class="t-name">
                  {{ shortName(node) }}
                </text>
                <text [attr.x]="node.x + nodeWidth / 2" [attr.y]="node.y + 40" text-anchor="middle" class="t-sub">
                  @{{ node.username }} · {{ node.childCount }}
                </text>
                @if (node.children.length > 0) {
                  <circle
                    [attr.cx]="node.x + nodeWidth / 2"
                    [attr.cy]="node.y + nodeHeight"
                    r="10"
                    class="toggle"
                  />
                  <text
                    [attr.x]="node.x + nodeWidth / 2"
                    [attr.y]="node.y + nodeHeight + 4"
                    text-anchor="middle"
                    class="t-toggle"
                  >{{ isCollapsed(node.id) ? '+' : '−' }}</text>
                }
              </g>
            }
          </svg>
        </div>

        @if (selected(); as detail) {
          <div class="details" role="status">
            <div>
              <strong>{{ names(detail) }}</strong>
              <span class="muted">@{{ detail.username }} · {{ detail.plan }} plan</span>
            </div>
            <span class="muted">{{ detail.childCount }} direct downlines</span>
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
    .tree-page { display: flex; flex-direction: column; gap: 1.25em; }
    .page-head { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1em; }
    .page-head h2 { margin: 0; }
    .subtitle { margin: 0.25em 0 0; color: #666; }
    .upline { display: flex; align-items: center; gap: 0.25em; flex-wrap: wrap; background: #f5f5f5; border-radius: 8px; padding: 0.4em 0.8em; }
    .upline .sep { color: #999; }
    .toolbar { display: flex; align-items: center; gap: 1em; flex-wrap: wrap; }
    .toolbar mat-form-field { flex: 1; min-width: 200px; }
    .depth-field { max-width: 150px; }
    .loader { flex: 2; min-width: 120px; }
    .stats { display: flex; gap: 1.5em; align-items: center; flex-wrap: wrap; }
    .warn { color: #e65100; }
    .canvas-wrap { overflow: auto; border: 1px solid #e0e0e0; border-radius: 10px; background: #fafafa; }
    svg { display: block; }
    .edge { fill: none; stroke: #b0bec5; stroke-width: 2; }
    .node { cursor: pointer; }
    .node rect { stroke: #90a4ae; stroke-width: 1.5; }
    .node.selected rect { stroke: #1565c0; stroke-width: 3; }
    .node.match rect { stroke: #2e7d32; stroke-width: 3; stroke-dasharray: 5 3; }
    .t-name { font-size: 13px; font-weight: 600; fill: #212121; }
    .t-sub { font-size: 11px; fill: #616161; }
    .toggle { fill: #fff; stroke: #78909c; stroke-width: 2; }
    .t-toggle { font-size: 12px; font-weight: 700; fill: #37474f; pointer-events: none; }
    .details { display: flex; align-items: center; gap: 1em; background: #e3f2fd; border-radius: 8px; padding: 0.75em 1em; flex-wrap: wrap; }
    .details .spacer { flex: 1; }
    .muted { color: #777; font-size: 0.85em; }
    .error { color: #d32f2f; display: flex; align-items: center; gap: 0.5em; }
    .empty { color: #666; }
  `],
})
export class NetworkTreeComponent implements OnInit {
  private readonly network = inject(NetworkService);
  private readonly auth = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly tree = signal<NetworkNode | null>(null);
  protected readonly meta = signal<NetworkTreeMeta | null>(null);
  protected readonly upline = signal<NetworkNode[]>([]);
  protected readonly rootId = signal<string | null>(null);
  protected readonly depth = signal(4);
  protected readonly search = signal('');
  protected readonly collapsed = signal<ReadonlySet<string>>(new Set());
  protected readonly selectedId = signal<string | null>(null);

  protected readonly depthOptions = [2, 3, 4, 5, 6, 8, 10];
  protected readonly nodeWidth = NODE_W;
  protected readonly nodeHeight = NODE_H;

  protected readonly searching = computed(() => this.search().trim().length > 0);

  /** Tidy-tree layout over the visible (uncollapsed, or all when searching) nodes. */
  protected readonly layout = computed(() => {
    const root = this.tree();
    if (!root) return null;
    const collapsed = this.searching() ? new Set<string>() : this.collapsed();
    const nodes: PositionedNode[] = [];
    const edges: { d: string }[] = [];
    let leaf = 0;
    const walk = (node: NetworkNode, depthLevel: number, parent: PositionedNode | null): PositionedNode => {
      const positioned: PositionedNode = { ...node, x: 0, y: depthLevel * Y_GAP + 20, depth: depthLevel };
      const kids = collapsed.has(node.id) ? [] : (node.children ?? []);
      if (kids.length === 0) {
        positioned.x = leaf * X_GAP + 20;
        leaf += 1;
      } else {
        const placed = kids.map((k) => walk(k, depthLevel + 1, positioned));
        positioned.x = (placed[0].x + placed[placed.length - 1].x) / 2;
        for (const child of placed) {
          const px = positioned.x + NODE_W / 2;
          const py = positioned.y + NODE_H;
          const cx = child.x + NODE_W / 2;
          const cy = child.y;
          const my = (py + cy) / 2;
          edges.push({ d: `M ${px} ${py} L ${px} ${my} L ${cx} ${my} L ${cx} ${cy}` });
        }
      }
      nodes.push(positioned);
      return positioned;
    };
    walk(root, 0, null);
    const width = Math.max(leaf * X_GAP + 40, NODE_W + 40);
    const maxY = nodes.reduce((m, n) => Math.max(m, n.y), 0);
    return { nodes, edges, width, height: maxY + NODE_H + 40 };
  });

  protected readonly selected = computed(() => {
    const id = this.selectedId();
    if (!id) return null;
    return this.layout()?.nodes.find((n) => n.id === id) ?? null;
  });

  protected rootLabel(): NetworkNode {
    return this.tree() ?? ({ id: '', username: '', name: '', surname: '' }) as NetworkNode;
  }

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
    this.network
      .upline(root)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => this.upline.set([...(res.data.chain ?? [])].reverse()),
        error: () => this.upline.set([]),
      });
  }

  protected focus(partnerId: string): void {
    this.rootId.set(partnerId);
    this.search.set('');
    this.reload();
  }

  protected toggle(node: PositionedNode): void {
    this.selectedId.set(node.id);
    if (node.children.length === 0) return;
    const next = new Set(this.collapsed());
    if (next.has(node.id)) {
      next.delete(node.id);
    } else {
      next.add(node.id);
    }
    this.collapsed.set(next);
  }

  protected isCollapsed(id: string): boolean {
    return !this.searching() && this.collapsed().has(id);
  }

  protected isMatch(node: PositionedNode): boolean {
    const q = this.search().trim().toLowerCase();
    if (!q) return false;
    return `${node.username} ${node.name} ${node.surname}`.toLowerCase().includes(q);
  }

  protected names(node: { name: string; surname: string; username: string }): string {
    return this.network.displayName(node);
  }

  protected shortName(node: PositionedNode): string {
    const full = this.names(node);
    return full.length > 20 ? `${full.slice(0, 19)}…` : full;
  }

  protected fill(node: PositionedNode): string {
    return ROLE_FILL[node.role] ?? ROLE_FILL['user'] ?? '#e8eaf6';
  }
}
