import { ChangeDetectionStrategy, Component, DestroyRef, Input, OnInit, inject, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { PartnerInterface } from '../../../../_common/services/partner.service';
import { ProfilePhotoService } from '../../../../core/settings/profile-photo.service';
import { ApiError, toApiError } from '../../../../core/http/api-error';

const MAX_BYTES = 5 * 1024 * 1024;

/**
 * @title Profile photo uploader — Cloudinary-backed.
 *
 * Preview → validate (image, ≤5MB) → upload to `/v1/settings/*` → emit
 * the secure URL. The secret never leaves the server; the browser only
 * ever sees the public URL. OnPush + signals, fully typed.
 */
@Component({
selector: 'async-profile-picture-upload',
imports: [MatButtonModule, MatIconModule, MatProgressBarModule],
template: `
  <div class="photo-block">
    @if (preview()) {
      <img [src]="preview()" alt="Profile picture preview" class="photo-preview"/>
    } @else {
      <span class="photo-fallback" aria-hidden="true">{{ initial() }}</span>
    }
    <p class="why">Prospects see this photo when you invite them — faces close faster than blank avatars.</p>
    <label class="file-row">
      <input type="file" accept="image/*" (change)="onFileSelected($event)" aria-label="Choose profile photo" />
    </label>
    @if (uploading()) {
      <mat-progress-bar mode="indeterminate" />
    }
    @if (status(); as s) {
      <p class="status" [class.status--error]="isError()">{{ s }}</p>
    }
    <button mat-flat-button color="primary" (click)="onUpload()" [disabled]="!selectedFile || uploading()">
      {{ uploading() ? 'Uploading…' : 'Upload photo' }}
    </button>
  </div>
  `,
changeDetection: ChangeDetectionStrategy.OnPush,
styles: [`
  .photo-block { display: flex; flex-direction: column; align-items: center; gap: 0.6em; padding: 1em; background: var(--dp-paper); border: 1px dashed var(--dp-line); border-radius: 12px; }
  .photo-preview { width: 8em; height: 8em; border-radius: 50%; object-fit: cover; border: 2px solid var(--dp-gold); }
  .photo-fallback { width: 8em; height: 8em; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2.4em; font-weight: 800; color: var(--dp-sidenav-text); background: var(--dp-sidenav); }
  .why { margin: 0; text-align: center; font-size: 0.85em; color: var(--dp-muted); max-width: 26em; }
  .file-row input { max-width: 100%; font: inherit; }
  .file-row input::file-selector-button { min-height: 44px; border-radius: 8px; border: 1px solid var(--dp-line); background: var(--dp-surface); color: inherit; font: inherit; padding: 0 1em; margin-right: 0.75em; cursor: pointer; }
  .status { margin: 0; font-size: 0.85em; color: var(--dp-success, #2e7d32); text-align: center; }
  .status--error { color: var(--dp-error); }
  button { min-height: 44px; }
`],
})
export class ProfilePictureUploadComponent implements OnInit {
  private readonly photos = inject(ProfilePhotoService);
  private readonly destroyRef = inject(DestroyRef);

  @Input() partner!: PartnerInterface;
  readonly uploaded = output<string>();

  protected readonly preview = signal<string | null>(null);
  protected readonly initial = signal('?');
  protected readonly uploading = signal(false);
  protected readonly status = signal<string | null>(null);
  protected readonly isError = signal(false);
  protected selectedFile: File | null = null;

  ngOnInit(): void {
    if (this.partner?.profileImage) this.preview.set(this.partner.profileImage);
    const name = `${this.partner?.name ?? ''} ${this.partner?.surname ?? ''}`.trim();
    this.initial.set(name ? name.charAt(0).toUpperCase() : '?');
  }

  protected onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0] ?? null;
    this.status.set(null);
    this.isError.set(false);
    if (!file) {
      this.selectedFile = null;
      return;
    }
    if (!file.type.startsWith('image/')) {
      this.selectedFile = null;
      this.status.set('Please choose an image file (JPEG, PNG or WebP).');
      this.isError.set(true);
      return;
    }
    if (file.size > MAX_BYTES) {
      this.selectedFile = null;
      this.status.set('That image is over 5MB — please choose a smaller one.');
      this.isError.set(true);
      return;
    }
    this.selectedFile = file;
    const reader = new FileReader();
    reader.onload = () => this.preview.set(String(reader.result));
    reader.readAsDataURL(file);
  }

  protected onUpload(): void {
    if (!this.selectedFile || this.uploading()) return;
    this.uploading.set(true);
    this.status.set(null);
    this.isError.set(false);
    this.photos
      .upload(this.selectedFile)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.uploading.set(false);
          const url = res.data?.url;
          if (url) {
            this.preview.set(url);
            this.selectedFile = null;
            this.status.set('Photo updated successfully.');
            this.uploaded.emit(url);
          } else {
            this.status.set('Upload finished without a photo URL — please try again.');
            this.isError.set(true);
          }
        },
        error: (err: unknown) => {
          this.uploading.set(false);
          this.status.set(toApiError(err).message);
          this.isError.set(true);
        },
      });
  }
}
