import { computed, inject, Injectable } from '@angular/core';
import { ThemeTogglerService } from '../../_common/services/theme-toggler.service';
import type { EChartsCoreOption } from './echarts-setup';

export interface DpChartPalette {
  text: string;
  muted: string;
  line: string;
  gold: string;
  goldSoft: string;
  success: string;
  error: string;
  info: string;
  ramp: string[];
}

/**
 * Chart theming bound to the Diamond theme signal — options built in a
 * `computed()` re-render automatically on light/dark toggle.
 */
@Injectable({ providedIn: 'root' })
export class ChartThemeService {
  private readonly themes = inject(ThemeTogglerService);

  readonly palette = computed<DpChartPalette>(() => {
    const dark = this.themes.theme() === 'dark';
    return {
      text: dark ? '#f0ebe0' : '#1c1a15',
      muted: dark ? '#a8a094' : '#6e6e6e',
      line: dark ? '#38342c' : '#e4ddcd',
      gold: '#a97f2c',
      goldSoft: dark ? '#2c2417' : '#f3e8d2',
      success: dark ? '#9ccc9f' : '#1b5e20',
      error: dark ? '#e89a9a' : '#b71c1c',
      info: dark ? '#90caf9' : '#0d47a1',
      ramp: ['#a97f2c', '#c39a4a', '#d9b36a', '#8a6723', '#6e5218', '#e3c878'],
    };
  });

  /** Base text/line colors shared by every chart. */
  base(): EChartsCoreOption {
    const p = this.palette();
    return {
      backgroundColor: 'transparent',
      textStyle: { color: p.text, fontFamily: 'Inter, Roboto, Arial, sans-serif' },
      animationDuration: 400,
    };
  }

  axis(): { axisLine: object; axisLabel: object; splitLine: object } {
    const p = this.palette();
    return {
      axisLine: { lineStyle: { color: p.line } },
      axisLabel: { color: p.muted },
      splitLine: { lineStyle: { color: p.line, opacity: 0.6 } },
    };
  }
}
