import { Injectable, signal } from '@angular/core';

export type DpTheme = 'dark' | 'light';

/**
 * Diamond theme state. Persists to localStorage and mirrors to
 * `document.documentElement[data-theme]` (see styles.scss).
 * Additive to the legacy get/set API — nothing else changes.
 */
@Injectable({
  providedIn: 'root'
})
export class ThemeTogglerService {

  private readonly THEME_KEY = 'selectedTheme';

  readonly theme = signal<DpTheme>(this.getTheme());

  setTheme(theme: 'dark' | 'light') {
    localStorage.setItem(this.THEME_KEY, theme);
    document.documentElement.setAttribute('data-theme', theme);
    this.theme.set(theme);
  }

  getTheme(): 'dark' | 'light' {
    return (
      (localStorage.getItem(this.THEME_KEY) as 'dark' | 'light') || 'light'
    );
  }

  /** Apply the stored theme (call once at boot to avoid a flash). */
  init(): void {
    this.setTheme(this.getTheme());
  }

  toggle(): void {
    this.setTheme(this.theme() === 'dark' ? 'light' : 'dark');
  }
}
