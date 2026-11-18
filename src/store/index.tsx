/**
 * 单一数据源 + AsyncStorage 持久化。
 * 键名沿用 H5 原型 v3 的思路：tripReminderProto.v3。
 * 所有改动（事件、清单、费用、共享、提醒、主题）都要写回，
 * 刷新 / 重启 App 不丢。云同步先留接口占位，见 cloudSyncTodo()。
 */
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  seedEvents,
  seedExpenses,
  seedPacks,
  seedShares,
  type Expense,
  type PackItem,
  type PackKey,
  type Share,
  type ShareRole,
  type ThemeKey,
  type TripEvent,
} from '../data/seed';

export const STORAGE_KEY = 'tripReminderProto.v3';

export interface AppState {
  events: TripEvent[];
  packs: Record<PackKey, PackItem[]>;
  expenses: Expense[];
  shares: Share[];
  theme: ThemeKey;
  calendarSync: boolean;
  alarmEnabled: boolean;
  lastSavedAt: string | null;
}

export const initialState: AppState = {
  events: seedEvents,
  packs: seedPacks,
  expenses: seedExpenses,
  shares: seedShares,
  theme: 'business',
  calendarSync: true,
  alarmEnabled: true,
  lastSavedAt: null,
};

export interface StoreApi extends AppState {
  loaded: boolean;
  addEvent: (e: Omit<TripEvent, 'id'>) => void;
  updateEvent: (id: string, patch: Partial<TripEvent>) => void;
  deleteEvent: (id: string) => void;
  togglePack: (key: PackKey, itemId: string) => void;
  addExpense: (e: Omit<Expense, 'id'>) => void;
  updateExpense: (id: string, patch: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  addShare: (s: Omit<Share, 'id' | 'status'>) => void;
  updateShareRole: (id: string, role: ShareRole) => void;
  acceptShare: (id: string) => void;
  revokeShare: (id: string) => void;
  setTheme: (t: ThemeKey) => void;
  setCalendarSync: (v: boolean) => void;
  setAlarmEnabled: (v: boolean) => void;
  /** TODO（待接后端）：云同步占位。当前只写本地，不上传。 */
  cloudSyncTodo: () => string;
}

const StoreContext = createContext<StoreApi | null>(null);

let idSeq = 1000;
const nextId = (prefix: string) => `${prefix}-${Date.now()}-${idSeq++}`;

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(initialState);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as AppState;
          setState({ ...initialState, ...parsed });
        }
      } catch {
        // 损坏的本地数据：回落到种子数据，不崩溃
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => {});
  }, [state, loaded]);

  const api = useMemo<StoreApi>(
    () => ({
      ...state,
      loaded,
      addEvent: (e) =>
        setState((s) => ({ ...s, events: [...s.events, { ...e, id: nextId('ev') }] })),
      updateEvent: (id, patch) =>
        setState((s) => ({
          ...s,
          events: s.events.map((ev) => (ev.id === id ? { ...ev, ...patch } : ev)),
        })),
      deleteEvent: (id) =>
        setState((s) => ({ ...s, events: s.events.filter((ev) => ev.id !== id) })),
      togglePack: (key, itemId) =>
        setState((s) => ({
          ...s,
          packs: {
            ...s.packs,
            [key]: s.packs[key].map((it) =>
              it.id === itemId ? { ...it, checked: !it.checked } : it,
            ),
          },
        })),
      addExpense: (e) =>
        setState((s) => ({ ...s, expenses: [...s.expenses, { ...e, id: nextId('ex') }] })),
      updateExpense: (id, patch) =>
        setState((s) => ({
          ...s,
          expenses: s.expenses.map((ex) => (ex.id === id ? { ...ex, ...patch } : ex)),
        })),
      deleteExpense: (id) =>
        setState((s) => ({ ...s, expenses: s.expenses.filter((ex) => ex.id !== id) })),
      addShare: (s2) =>
        setState((s) => ({
          ...s,
          shares: [...s.shares, { ...s2, id: nextId('sh'), status: 'pending' as const }],
        })),
      updateShareRole: (id, role) =>
        setState((s) => ({
          ...s,
          shares: s.shares.map((sh) => (sh.id === id ? { ...sh, role } : sh)),
        })),
      acceptShare: (id) =>
        setState((s) => ({
          ...s,
          shares: s.shares.map((sh) =>
            sh.id === id ? { ...sh, status: 'accepted' as const } : sh,
          ),
        })),
      revokeShare: (id) =>
        setState((s) => ({ ...s, shares: s.shares.filter((sh) => sh.id !== id) })),
      setTheme: (t) => setState((s) => ({ ...s, theme: t })),
      setCalendarSync: (v) => setState((s) => ({ ...s, calendarSync: v })),
      setAlarmEnabled: (v) => setState((s) => ({ ...s, alarmEnabled: v })),
      cloudSyncTodo: () => '待接后端：Supabase 同步尚未接入，当前仅本地保存',
    }),
    [state, loaded],
  );

  return <StoreContext.Provider value={api}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreApi {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore 必须在 StoreProvider 内使用');
  return ctx;
}

/** 派生数据：全部由同一份 state 计算，不许各页手写数字。 */
export function sortedEvents(events: TripEvent[]): TripEvent[] {
  return [...events].sort((a, b) =>
    `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`),
  );
}

/** 日历同步节点数 = 事件数 + 每事件提醒档数（rem>0 才计）。 */
export function calendarNodeCount(events: TripEvent[]): number {
  return events.reduce(
    (n, ev) => n + 1 + (ev.rem1Hours > 0 ? 1 : 0) + (ev.rem2Hours > 0 ? 1 : 0),
    0,
  );
}

/** 费用占比：最大余数法，合计恒为 100%。 */
export function expensePercents(expenses: Expense[]): Record<string, number> {
  const cats = ['transport', 'hotel', 'food', 'ticket'] as const;
  const total = expenses.reduce((s, e) => s + e.amount, 0);
  if (total === 0) return { transport: 0, hotel: 0, food: 0, ticket: 0 };
  const raw = cats.map((c) => ({
    c,
    val: (expenses.filter((e) => e.category === c).reduce((s, e) => s + e.amount, 0) / total) * 100,
  }));
  const floors = raw.map((r) => ({ ...r, pct: Math.floor(r.val) }));
  let rest = 100 - floors.reduce((s, r) => s + r.pct, 0);
  const order = [...floors]
    .sort((a, b) => b.val - Math.floor(b.val) - (a.val - Math.floor(a.val)))
    .map((r) => r.c);
  const out: Record<string, number> = {};
  floors.forEach((r) => {
    out[r.c] = r.pct;
  });
  for (const c of order) {
    if (rest <= 0) break;
    out[c] += 1;
    rest -= 1;
  }
  return out;
}

export function expenseTotal(expenses: Expense[]): number {
  return expenses.reduce((s, e) => s + e.amount, 0);
}

/** 共享只计已接受人数。 */
export function acceptedShareCount(shares: Share[]): number {
  return shares.filter((s) => s.status === 'accepted').length;
}
