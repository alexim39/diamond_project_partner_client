import { ChangeDetectionStrategy, Component, computed, DestroyRef, ElementRef, inject, OnInit, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { ThemeTogglerService } from '../../../_common/services/theme-toggler.service';
import { ApiError } from '../../../core/http/api-error';
import { NetworkService } from './network.service';
import { AvatarComponent } from '../../../_common/avatar.component';
import { NetworkNode, NetworkTreeMeta, PositionedNode } from './network.models';

const NODE_W = 168;
const NODE_H = 62;
const X_GAP = 196;
const Y_GAP = 118;
const ZOOM_MIN = 0.4;
const ZOOM_MAX = 2.5;
const ZOOM_STEP = 0.25;

/** Node fills per theme — readable on light paper and dark surfaces. */
const ROLE_FILL: Record<string, Record<string, string>> = {
  light: { admin: '#ffccbc', leader: '#bbdefb', user: '#e8eaf6' },
  dark: { admin: '#5d2f22', leader: '#274b6b', user: '#2c3140' },
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
    AvatarComponent, MatButtonModule, MatButtonToggleModule, MatFormFieldModule, MatIconModule, MatInputModule,
    MatProgressBarModule, MatSelectModule, RouterModule,
  ],
  template: `
    <section class="breadcrumb-wrapper">
      <div class="breadcrumb">
        <a routerLink="/dashboard">Dashboard</a> &gt;
        <a>Network</a> &gt;
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
          <mat-button-toggle routerLink="../org" title="Organization chart">
            <mat-icon>account_tree</mat-icon> Org Chart
          </mat-button-toggle>
          <mat-button-toggle routerLink="/dashboard/mentorship/partners/my-partners" title="Manage partners">
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
          <input matInput type="search" placeholder="Username or name" (input)="onSearch($any($event.target).value)" />
          <mat-icon matSuffix>search</mat-icon>
        </mat-form-field>
        @if (searching()) {
          <div class="match-nav" role="group" aria-label="Search results">
            <span class="muted">{{ matches().length }} found</span>
            <button mat-icon-button (click)="stepMatch(-1)" [disabled]="matches().length === 0" title="Previous match" aria-label="Previous match">
              <mat-icon>chevron_left</mat-icon>
            </button>
            <button mat-icon-button (click)="stepMatch(1)" [disabled]="matches().length === 0" title="Next match" aria-label="Next match">
              <mat-icon>chevron_right</mat-icon>
            </button>
          </div>
        }
        <mat-form-field appearance="outline" subscriptSizing="dynamic" class="depth-field">
          <mat-label>Depth</mat-label>
          <mat-select [value]="depth()" (selectionChange)="depth.set($event.value); reload()">
            @for (d of depthOptions; track d) {
              <mat-option [value]="d">{{ d }} levels</mat-option>
            }
          </mat-select>
        </mat-form-field>
        <div class="zoom-group" role="group" aria-label="Zoom and layout">
          <button mat-icon-button (click)="zoomOut()" [disabled]="zoom() <= ZOOM_MIN" title="Zoom out" aria-label="Zoom out">
            <mat-icon>zoom_out</mat-icon>
          </button>
          <span class="muted zoom-label">{{ zoomLabel() }}</span>
          <button mat-icon-button (click)="zoomIn()" [disabled]="zoom() >= ZOOM_MAX" title="Zoom in" aria-label="Zoom in">
            <mat-icon>zoom_in</mat-icon>
          </button>
          <button mat-icon-button (click)="fit()" title="Fit to width" aria-label="Fit to width">
            <mat-icon>fit_screen</mat-icon>
          </button>
          <button mat-icon-button (click)="resetView()" title="Reset view" aria-label="Reset view">
            <mat-icon>restart_alt</mat-icon>
          </button>
          <button mat-icon-button (click)="expandAll()" title="Expand all" aria-label="Expand all">
            <mat-icon>unfold_more</mat-icon>
          </button>
          <button mat-icon-button (click)="collapseAll()" title="Collapse all" aria-label="Collapse all">
            <mat-icon>unfold_less</mat-icon>
          </button>
        </div>
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
        <div class="canvas-wrap" #canvasWrap tabindex="0" (keydown)="onCanvasKey($event)" aria-label="Tree canvas. Plus and minus zoom, zero resets.">
          <svg
            [attr.viewBox]="'0 0 ' + layout.width + ' ' + layout.height"
            [attr.width]="layout.width * zoom()"
            [attr.height]="layout.height * zoom()"
            role="img"
            aria-label="Downline network tree"
          >
            <g [attr.transform]="'translate(' + panX() + ' ' + panY() + ') scale(' + zoom() + ')'">
            @for (edge of layout.edges; track $index) {
              <path [attr.d]="edge.d" class="edge" />
            }
            @for (node of layout.nodes; track node.id) {
              <g
                class="node"
                [class.selected]="selectedId() === node.id"
                [class.match]="isMatch(node)"
                (click)="toggle(node)"
                (keydown.enter)="toggle(node)"
                (keydown.space)="toggle(node); $event.preventDefault()"
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
            </g>
          </svg>
        </div>

        @if (selected(); as detail) {
          <div class="details" role="status">
            <async-avatar [photo]="detail.profileImage" [name]="names(detail)" size="sm" />
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
    .subtitle { margin: 0.25em 0 0; color: var(--dp-muted); }
    .upline { display: flex; align-items: center; gap: 0.25em; flex-wrap: wrap; background: var(--dp-surface); border: 1px solid var(--dp-line); border-radius: 8px; padding: 0.4em 0.8em; }
    .upline .sep { color: var(--dp-muted); }
    .toolbar { display: flex; align-items: center; gap: 1em; flex-wrap: wrap; }
    .toolbar mat-form-field { flex: 1; min-width: 200px; }
    .depth-field { max-width: 150px; }
    .loader { flex: 2; min-width: 120px; }
    .match-nav { display: flex; align-items: center; gap: 0.1em; }
    .zoom-group { display: flex; align-items: center; gap: 0.1em; }
    .zoom-label { min-width: 3.2em; text-align: center; }
    .stats { display: flex; gap: 1.5em; align-items: center; flex-wrap: wrap; }
    .warn { color: var(--dp-warning); }
    .canvas-wrap { overflow: auto; border: 1px solid var(--dp-line); border-radius: 10px; background: var(--dp-paper); max-height: 70vh; }
    .canvas-wrap:focus-visible { outline: 2px solid var(--dp-gold); outline-offset: -2px; }
    svg { display: block; }
    .edge { fill: none; stroke: var(--dp-muted); stroke-width: 2; opacity: 0.6; }
    .node { cursor: pointer; }
    .node rect { stroke: var(--dp-muted); stroke-width: 1.5; }
    .node.selected rect { stroke: var(--dp-gold); stroke-width: 3; }
    .node.match rect { stroke: var(--dp-success); stroke-width: 3; stroke-dasharray: 5 3; }
    .t-name { font-size: 13px; font-weight: 600; fill: var(--dp-text); }
    .t-sub { font-size: 12px; fill: var(--dp-muted); }
    .toggle { fill: var(--dp-surface); stroke: var(--dp-muted); stroke-width: 2; }
    .t-toggle { font-size: 13px; font-weight: 700; fill: var(--dp-text); pointer-events: none; }
    .details { display: flex; align-items: center; gap: 1em; background: var(--dp-info-bg); border: 1px solid var(--dp-line); border-radius: 8px; padding: 0.75em 1em; flex-wrap: wrap; }
    .details .spacer { flex: 1; }
    .muted { color: var(--dp-muted); font-size: 0.85em; }
    .error { color: var(--dp-error); display: flex; align-items: center; gap: 0.5em; }
    .empty { color: var(--dp-muted); }
  `],
})
export class NetworkTreeComponent implements OnInit {
  private readonly network = inject(NetworkService);
  private readonly auth = inject(AuthService);
  private readonly themes = inject(ThemeTogglerService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly canvasWrap = viewChild<ElementRef<HTMLDivElement>>('canvasWrap');

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
  protected readonly zoom = signal(1);
  protected readonly panX = signal(0);
  protected readonly panY = signal(0);
  protected readonly matchIdx = signal(0);

  protected readonly ZOOM_MIN = ZOOM_MIN;
  protected readonly ZOOM_MAX = ZOOM_MAX;

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

  protected readonly matches = computed(() => {
    if (!this.searching()) return [];
    return (this.layout()?.nodes ?? []).filter((n) => this.isMatch(n));
  });

  protected readonly zoomLabel = computed(() => `${Math.round(this.zoom() * 100)}%`);

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
          this.matchIdx.set(0);
          this.resetView();
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
    this.matchIdx.set(0);
    this.resetView();
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

  protected onSearch(value: string): void {
    this.search.set(value);
    this.matchIdx.set(0);
  }

  protected zoomIn(): void {
    this.zoom.set(Math.min(ZOOM_MAX, Math.round((this.zoom() + ZOOM_STEP) * 100) / 100));
  }

  protected zoomOut(): void {
    this.zoom.set(Math.max(ZOOM_MIN, Math.round((this.zoom() - ZOOM_STEP) * 100) / 100));
  }

  protected resetView(): void {
    this.zoom.set(1);
    this.panX.set(0);
    this.panY.set(0);
  }

  /** Scale the tree to the visible width. */
  protected fit(): void {
    const el = this.canvasWrap()?.nativeElement;
    const layout = this.layout();
    if (!el || !layout || layout.width <= 0) return;
    this.zoom.set(Math.min(1.5, Math.max(ZOOM_MIN, el.clientWidth / layout.width)));
    this.panX.set(0);
    this.panY.set(0);
  }

  /** Center a node in the viewport (transform is translate then scale). */
  protected centerOn(node: PositionedNode): void {
    const el = this.canvasWrap()?.nativeElement;
    if (!el) return;
    const z = Math.max(this.zoom(), 1);
    this.zoom.set(z);
    this.selectedId.set(node.id);
    this.panX.set(el.clientWidth / 2 / z - (node.x + NODE_W / 2));
    this.panY.set(Math.max(0, el.clientHeight / 2 / z - (node.y + NODE_H / 2)));
    el.focus({ preventScroll: true });
  }

  protected stepMatch(dir: 1 | -1): void {
    const list = this.matches();
    if (list.length === 0) return;
    const next = (this.matchIdx() + dir + list.length) % list.length;
    this.matchIdx.set(next);
    const node = list[next];
    if (node) this.centerOn(node);
  }

  protected expandAll(): void {
    this.collapsed.set(new Set());
  }

  protected collapseAll(): void {
    const root = this.tree();
    if (!root) return;
    const ids = new Set<string>();
    const walk = (node: NetworkNode): void => {
      if ((node.children ?? []).length > 0) {
        ids.add(node.id);
        node.children.forEach(walk);
      }
    };
    walk(root);
    this.collapsed.set(ids);
    this.selectedId.set(root.id);
  }

  protected onCanvasKey(event: KeyboardEvent): void {
    if (event.key === '+' || event.key === '=') {
      this.zoomIn();
      event.preventDefault();
    } else if (event.key === '-' || event.key === '_') {
      this.zoomOut();
      event.preventDefault();
    } else if (event.key === '0') {
      this.resetView();
      event.preventDefault();
    } else if (event.key === 'Escape') {
      this.selectedId.set(null);
    }
  }

  protected names(node: { name: string; surname: string; username: string }): string {
    return this.network.displayName(node);
  }

  protected shortName(node: PositionedNode): string {
    const full = this.names(node);
    return full.length > 20 ? `${full.slice(0, 19)}…` : full;
  }

  protected fill(node: PositionedNode): string {
    const palette = ROLE_FILL[this.themes.theme()] ?? ROLE_FILL['light'] ?? {};
    return palette[node.role] ?? palette['user'] ?? '#e8eaf6';
  }
}
