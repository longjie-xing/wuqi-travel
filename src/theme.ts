import type { ThemeKey } from './data/seed';

export interface Theme {
  bg: string;
  card: string;
  text: string;
  muted: string;
  primary: string;
  accent: string;
  danger: string;
  border: string;
}

export const THEMES: Record<ThemeKey, Theme> = {
  business: {
    bg: '#F2F5FA',
    card: '#FFFFFF',
    text: '#111827',
    muted: '#6B7280',
    primary: '#2563EB',
    accent: '#0EA5E9',
    danger: '#DC2626',
    border: '#E5E7EB',
  },
  warm: {
    bg: '#FFF7ED',
    card: '#FFFFFF',
    text: '#1F2937',
    muted: '#9A6B4F',
    primary: '#EA580C',
    accent: '#F59E0B',
    danger: '#DC2626',
    border: '#FDE68A',
  },
  dark: {
    bg: '#0F172A',
    card: '#1E293B',
    text: '#F1F5F9',
    muted: '#94A3B8',
    primary: '#38BDF8',
    accent: '#818CF8',
    danger: '#F87171',
    border: '#334155',
  },
};
