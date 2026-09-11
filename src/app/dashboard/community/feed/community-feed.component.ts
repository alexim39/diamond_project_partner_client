import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { RouterModule } from '@angular/router';
import { CommunityService } from '../../../core/community/community.service';
import { AudienceScope, FeedComment, FeedPost, POST_KIND_LABELS, PostKind } from '../../../core/community/community.models';
import { ApiError } from '../../../core/http/api-error';

const KIND_STYLES: Record<PostKind, string> = {
  standard: 'dp-status--info',
  announcement: 'dp-status--warn',
  recognition: 'dp-status--ok',
  training: 'dp-status--info',
  event: 'dp-status--warn',
};

/**
 * @title Community — team feed, recognition and announcements.
 *
 * Compose by kind + audience, like, thread comments, save, report.
 * Visibility is enforced server-side (team = downline, leadership = ECL+).
 * OnPush + signals, fully typed.
 */
@Component({
  selector: 'async-community-feed',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe, MatButtonModule, MatChipsModule, MatIconModule, MatInputModule,
    MatProgressBarModule, MatSelectModule, ReactiveFormsModule, RouterModule,
  ],
  template: `
    <section class="breadcrumb-wrapper">
      <div class="breadcrumb">
        <a routerLink="/dashboard">Dashboard</a> &gt;
        <span>Community</span>
      </div>
    </section>

    <section class="community-page">
      <div class="page-head">
        <div>
          <h2>Community</h2>
          <p class="subtitle">What your Diamond world is celebrating and announcing.</p>
        </div>
        <button mat-button (click)="toggleCompose()">{{ showCompose() ? 'Cancel' : 'Write post' }}</button>
      </div>

      @if (loading() && posts().length === 0) {
        <mat-progress-bar mode="indeterminate" />
      }

      @if (error(); as err) {
        <p class="error" role="alert">
          {{ err }}
          <button mat-button (click)="reload()">Retry</button>
        </p>
      }

      @if (showCompose()) {
        <form class="compose-form dp-card" [formGroup]="form" (ngSubmit)="publish()">
          <div class="two-col">
            <mat-form-field appearance="outline">
              <mat-label>Type</mat-label>
              <mat-select formControlName="kind">
                @for (k of kinds; track k) {
                  <mat-option [value]="k">{{ kindLabel(k) }}</mat-option>
                }
              </mat-select>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Audience</mat-label>
              <mat-select formControlName="scope">
                <mat-option value="global">Everyone</mat-option>
                <mat-option value="team">My team</mat-option>
                <mat-option value="leadership">Leadership</mat-option>
              </mat-select>
            </mat-form-field>
          </div>
          <mat-form-field appearance="outline">
            <mat-label>Title (optional)</mat-label>
            <input matInput formControlName="title" maxlength="120" />
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>What is happening?</mat-label>
            <textarea matInput rows="3" formControlName="body" maxlength="2000"></textarea>
          </mat-form-field>
          <div class="form-actions">
            <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid || publishing()">
              {{ publishing() ? 'Posting…' : 'Post' }}
            </button>
            @if (publishError(); as err) {
              <span class="error" role="alert">{{ err }}</span>
            }
          </div>
        </form>
      }

      @if (posts().length > 0) {
        <ol class="feed">
          @for (post of posts(); track post.id) {
            <li class="dp-card post" [class.post--recognition]="post.kind === 'recognition'">
              <div class="post-top">
                <span class="dp-status" [class]="kindStyle(post.kind)">{{ kindLabel(post.kind) }}</span>
                @if (post.auto) {
                  <span class="muted">automatic</span>
                }
                @if (post.pinned) {
                  <mat-icon title="Pinned">push_pin</mat-icon>
                }
                <span class="muted">{{ post.author?.name ?? 'Teammate' }} · {{ post.createdAt | date:'short' }}</span>
              </div>
              @if (post.title) {
                <strong>{{ post.title }}</strong>
              }
              <p class="post-body">{{ post.body }}</p>
              <div class="post-actions">
                <button mat-button (click)="toggleLike(post)" [disabled]="actingId() === post.id" [color]="post.likedByMe ? 'primary' : undefined">
                  <mat-icon>{{ post.likedByMe ? 'favorite' : 'favorite_border' }}</mat-icon>
                  {{ post.likeCount }}
                </button>
                <button mat-button (click)="toggleComments(post)">
                  <mat-icon>comment</mat-icon>
                  {{ post.commentCount }}
                </button>
                <button mat-button (click)="toggleSave(post)" [disabled]="actingId() === post.id">
                  <mat-icon>{{ post.savedByMe ? 'bookmark' : 'bookmark_border' }}</mat-icon>
                </button>
                <span class="spacer"></span>
                <button mat-button (click)="report(post)" [disabled]="actingId() === post.id" title="Hide this post">Hide</button>
              </div>
              @if (openThread() === post.id) {
                <div class="thread">
                  @if (loadingComments()) {
                    <mat-progress-bar mode="indeterminate" />
                  }
                  @for (comment of comments(); track comment.id) {
                    <div class="comment" [class.comment--reply]="!!comment.parentId">
                      <strong>{{ comment.author?.name ?? 'Teammate' }}</strong>
                      <p>{{ comment.body }}</p>
                      <div class="comment-foot">
                        <span class="muted">{{ comment.createdAt | date:'short' }}</span>
                        <button mat-button (click)="replyTo.set({ postId: post.id, parentId: comment.parentId ?? comment.id, name: comment.author?.name ?? 'teammate' })">Reply</button>
                      </div>
                    </div>
                  }
                  @if (replyingToPost() === post.id) {
                    <p class="muted replying">Replying to {{ replyTo()?.name }} <button mat-button (click)="replyTo.set(null)">cancel</button></p>
                  }
                  <div class="comment-box">
                    <mat-form-field appearance="outline" subscriptSizing="dynamic">
                      <mat-label>Write a comment…</mat-label>
                      <input matInput [value]="draft()" (input)="draft.set($any($event.target).value)" maxlength="1000" (keydown.enter)="sendComment(post)" />
                    </mat-form-field>
                    <button mat-button (click)="sendComment(post)" [disabled]="!draft().trim() || sendingComment()">Send</button>
                  </div>
                  @if (commentError(); as err) {
                    <span class="error" role="alert">{{ err }}</span>
                  }
                </div>
              }
            </li>
          }
        </ol>
        @if (nextCursor()) {
          <button mat-button (click)="loadMore()" [disabled]="loadingMore()">Load more</button>
        }
      } @else if (!loading() && !error()) {
        <p class="empty">Quiet here — be the first to post.</p>
      }
    </section>
  `,
  styles: [`
    .breadcrumb-wrapper { margin-bottom: 1em; }
    .breadcrumb a { text-decoration: none; }
    .community-page { display: flex; flex-direction: column; gap: 1em; padding-bottom: 2em; }
    .page-head { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1em; }
    .page-head h2 { margin: 0; }
    .subtitle { margin: 0.25em 0 0; color: var(--dp-muted); }
    .compose-form { padding: 1em; display: flex; flex-direction: column; gap: 0.75em; }
    .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75em; }
    .form-actions { display: flex; align-items: center; gap: 0.75em; }
    .feed { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 0.75em; }
    .post { padding: 1em; display: flex; flex-direction: column; gap: 0.5em; }
    .post p { margin: 0; }
    .post--recognition { border-left: 4px solid var(--dp-success); }
    .post-top { display: flex; align-items: center; gap: 0.6em; flex-wrap: wrap; }
    .post-top mat-icon { font-size: 18px; height: 18px; width: 18px; color: var(--dp-gold); }
    .post-body { white-space: pre-wrap; line-height: 1.6; }
    .post-actions { display: flex; align-items: center; gap: 0.1em; flex-wrap: wrap; }
    .post-actions .spacer { flex: 1; }
    .thread { display: flex; flex-direction: column; gap: 0.6em; border-top: 1px solid var(--dp-line); padding-top: 0.75em; }
    .comment { display: flex; flex-direction: column; gap: 0.2em; background: var(--dp-paper); border-radius: 8px; padding: 0.6em 0.8em; }
    .comment p { margin: 0; }
    .comment--reply { margin-left: 1.5em; }
    .comment-foot { display: flex; align-items: center; gap: 0.5em; }
    .replying { display: flex; align-items: center; gap: 0.4em; margin: 0; }
    .comment-box { display: flex; gap: 0.5em; align-items: center; }
    .comment-box mat-form-field { flex: 1; }
    .muted { color: var(--dp-muted); font-size: 0.85em; }
    .error { color: var(--dp-error); display: flex; align-items: center; gap: 0.5em; }
    .empty { color: var(--dp-muted); }
    @media only screen and (max-width: 600px) {
      .two-col { grid-template-columns: 1fr; }
      .comment--reply { margin-left: 0.75em; }
    }
  `],
})
export class CommunityFeedComponent implements OnInit {
  private readonly community = inject(CommunityService);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly loading = signal(true);
  protected readonly loadingMore = signal(false);
  protected readonly loadingComments = signal(false);
  protected readonly publishing = signal(false);
  protected readonly sendingComment = signal(false);
  protected readonly actingId = signal<string | null>(null);
  protected readonly error = signal<string | null>(null);
  protected readonly publishError = signal<string | null>(null);
  protected readonly commentError = signal<string | null>(null);
  protected readonly showCompose = signal(false);
  protected readonly posts = signal<FeedPost[]>([]);
  protected readonly nextCursor = signal<string | null>(null);
  protected readonly openThread = signal<string | null>(null);
  protected readonly comments = signal<FeedComment[]>([]);
  protected readonly draft = signal('');
  protected readonly replyTo = signal<{ postId: string; parentId: string; name: string } | null>(null);

  protected readonly kinds: PostKind[] = ['standard', 'announcement', 'recognition', 'training', 'event'];

  protected readonly form = this.fb.nonNullable.group({
    kind: ['standard' as PostKind, Validators.required],
    scope: ['global' as AudienceScope, Validators.required],
    title: ['', Validators.maxLength(120)],
    body: ['', [Validators.required, Validators.maxLength(2000)]],
  });

  ngOnInit(): void {
    this.reload();
  }

  protected kindLabel(kind: PostKind): string {
    return POST_KIND_LABELS[kind] ?? kind;
  }

  protected kindStyle(kind: PostKind): string {
    return KIND_STYLES[kind] ?? 'dp-status--info';
  }

  protected replyingToPost(): string | null {
    const r = this.replyTo();
    return r && this.openThread() === r.postId ? r.postId : null;
  }

  protected reload(): void {
    this.loading.set(true);
    this.error.set(null);
    this.community
      .feed(undefined, 20)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.posts.set(res.data?.items ?? []);
          this.nextCursor.set(res.data?.nextCursor ?? null);
          this.loading.set(false);
        },
        error: (err: ApiError) => {
          this.error.set(err.message);
          this.loading.set(false);
        },
      });
  }

  protected loadMore(): void {
    const cursor = this.nextCursor();
    if (!cursor) return;
    this.loadingMore.set(true);
    this.community
      .feed(cursor, 20)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.loadingMore.set(false);
          this.posts.set([...this.posts(), ...(res.data?.items ?? [])]);
          this.nextCursor.set(res.data?.nextCursor ?? null);
        },
        error: (err: ApiError) => {
          this.loadingMore.set(false);
          this.error.set(err.message);
        },
      });
  }

  protected toggleCompose(): void {
    this.showCompose.set(!this.showCompose());
    this.publishError.set(null);
  }

  protected publish(): void {
    if (this.form.invalid) return;
    this.publishing.set(true);
    this.publishError.set(null);
    const v = this.form.getRawValue();
    this.community
      .create({ kind: v.kind, title: v.title.trim(), body: v.body.trim(), scope: v.scope })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.publishing.set(false);
          this.showCompose.set(false);
          this.form.reset({ kind: 'standard', scope: 'global', title: '', body: '' });
          // POST returns the raw row — normalize enrichment fields locally.
          if (res.data) {
            const fresh: FeedPost = {
              ...(res.data as object) as FeedPost,
              author: null, likeCount: 0, commentCount: 0, likedByMe: false, savedByMe: false,
            };
            this.posts.set([fresh, ...this.posts()]);
          }
        },
        error: (err: ApiError) => {
          this.publishing.set(false);
          this.publishError.set(err.message);
        },
      });
  }

  protected toggleLike(post: FeedPost): void {
    this.actingId.set(post.id);
    this.community
      .toggleLike(post.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.actingId.set(null);
          this.posts.set(this.posts().map((p) => p.id === post.id
            ? { ...p, likedByMe: !p.likedByMe, likeCount: p.likeCount + (p.likedByMe ? -1 : 1) }
            : p));
        },
        error: (err: ApiError) => {
          this.actingId.set(null);
          this.error.set(err.message);
        },
      });
  }

  protected toggleSave(post: FeedPost): void {
    this.actingId.set(post.id);
    this.community
      .toggleSave(post.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.actingId.set(null);
          this.posts.set(this.posts().map((p) => p.id === post.id ? { ...p, savedByMe: !p.savedByMe } : p));
        },
        error: (err: ApiError) => {
          this.actingId.set(null);
          this.error.set(err.message);
        },
      });
  }

  protected report(post: FeedPost): void {
    this.actingId.set(post.id);
    this.community
      .report(post.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.actingId.set(null);
          this.posts.set(this.posts().filter((p) => p.id !== post.id));
        },
        error: (err: ApiError) => {
          this.actingId.set(null);
          this.error.set(err.message);
        },
      });
  }

  protected toggleComments(post: FeedPost): void {
    if (this.openThread() === post.id) {
      this.openThread.set(null);
      return;
    }
    this.openThread.set(post.id);
    this.replyTo.set(null);
    this.draft.set('');
    this.commentError.set(null);
    this.loadingComments.set(true);
    this.community
      .comments(post.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.loadingComments.set(false);
          this.comments.set(res.data ?? []);
        },
        error: (err: ApiError) => {
          this.loadingComments.set(false);
          this.commentError.set(err.message);
        },
      });
  }

  protected sendComment(post: FeedPost): void {
    const body = this.draft().trim();
    if (!body) return;
    const reply = this.replyTo();
    this.sendingComment.set(true);
    this.commentError.set(null);
    this.community
      .addComment(post.id, body, reply && reply.postId === post.id ? reply.parentId : undefined)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.sendingComment.set(false);
          this.draft.set('');
          this.replyTo.set(null);
          if (res.data) this.comments.set([...this.comments(), res.data as FeedComment]);
          this.posts.set(this.posts().map((p) => p.id === post.id ? { ...p, commentCount: p.commentCount + 1 } : p));
        },
        error: (err: ApiError) => {
          this.sendingComment.set(false);
          this.commentError.set(err.message);
        },
      });
  }
}
