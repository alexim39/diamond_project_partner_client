import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeTogglerService {

  private readonly THEME_KEY = 'selectedTheme';

  setTheme(theme: 'dark' | 'light') {
    localStorage.setItem(this.THEME_KEY, theme);
    document.documentElement.setAttribute('data-theme', theme);
  }

  getTheme(): 'dark' | 'light' {
    return (
      (localStorage.getItem(this.THEME_KEY) as 'dark' | 'light') || 'light'
    );
  }
}