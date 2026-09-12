import { Component, ChangeDetectionStrategy, computed, effect, inject, input, signal } from '@angular/core';
import { API_BASE_URL } from '../core/config/api-tokens';

/**
 * Shared member avatar — photo when present, initial letter otherwise.
 * Resolves both storage generations: absolute URLs (Cloudinary) pass
 * through, legacy bare filenames resolve against `/uploads/`.
 */
@Component({
  selector: 'async-avatar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (url() && !failed()) {
      <img [src]="url()" [alt]="alt()" class="avatar avatar--{{ size() }}" loading="lazy" (error)="failed.set(true)" />
    } @else {
      <span class="avatar avatar--{{ size() }} avatar--fallback" aria-hidden="true">{{ initial() }}</span>
    }
  `,
  styles: [`
    .avatar { border-radius: 50%; object-fit: cover; flex: none; background: var(--dp-sidenav); }
    .avatar--xs { width: 1.6em; height: 1.6em; font-size: 0.85em; }
    .avatar--sm { width: 2.2em; height: 2.2em; font-size: 1em; }
    .avatar--md { width: 3em; height: 3em; font-size: 1.2em; }
    img.avatar { border: 1px solid var(--dp-line); }
    .avatar--fallback { display: inline-flex; align-items: center; justify-content: center; font-weight: 800; color: var(--dp-sidenav-text); }
  `],
})
export class AvatarComponent {
  /** Raw stored value: absolute URL (Cloudinary) or legacy bare filename. */
  readonly photo = input<string | null | undefined>(null);
  /** Display name — feeds the initial and the alt text. */
  readonly name = input<string>('');
  readonly size = input<'xs' | 'sm' | 'md'>('sm');

  private readonly baseUrl = inject(API_BASE_URL);
  /** Set when the image 404s (deleted legacy file, dead URL) — fall back to the initial. */
  protected readonly failed = signal(false);

  constructor() {
    // New photo → retry the image instead of sticking on the fallback.
    effect(() => {
      this.photo();
      this.failed.set(false);
    }, { allowSignalWrites: true });
  }

  protected readonly url = computed(() => {
    const raw = String(this.photo() ?? '').trim();
    if (!raw) return null;
    if (/^https?:\/\//i.test(raw)) return raw;
    return `${this.baseUrl}/uploads/${raw.replace(/^\/+/, '')}`;
  });

  protected readonly initial = computed(() => {
    const name = this.name().trim();
    return name ? name.charAt(0).toUpperCase() : '?';
  });

  protected readonly alt = computed(() => {
    const name = this.name().trim();
    return name ? `${name}'s profile photo` : 'Profile photo';
  });
}
