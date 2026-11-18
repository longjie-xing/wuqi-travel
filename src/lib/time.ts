/**
 * 北京时间工具 —— 两次 bug 的教训。
 *
 * 第一次 -8 小时 bug：evDT 用 `+08:00` 解析时间戳是对的，但 fmtDT
 * 用了本地 getter（getHours / getDate / getDay），UTC 浏览器下系统性 -8h。
 *
 * 第二次 11/NaN bug（2026-11-17 真机）：bjParts 用
 * Intl.DateTimeFormat('zh-CN').formatToParts() 拆年月日时分，
 * 其返回的 part 类型/取值随 JS 引擎与 ICU locale 数据而变——
 * Node/V8 下全对，iPhone Hermes 下 day 拆出非纯数字（Number -> NaN）、
 * hour/minute 干脆缺失（?? 0 兜底 -> 00:00），于是首页延误卡片
 * 显示 "11/NaN 00:00"。佐证：同一屏里倒计时（纯 ms 运算）与
 * 星期（早已走 ts+8h -> getUTCDay）全部正确，只有经
 * formatToParts 的分量坏了。
 *
 * 本文件铁律：绝不用 Date 的本地 getter（getHours/getDate/getDay/
 * getMonth/setDate 等）做显示，也不再用 Intl.DateTimeFormat /
 * formatToParts 做显示。所有显示一律走“时间戳 +8h 后取 UTC
 * 分量”算法（getUTC*，与设备本地时区、ICU locale 数据均无关）。
 * 时间戳差值运算与时区无关，可直接用 ms 相减。
 */

export const BJ_TZ = 'Asia/Shanghai';

/** '2026-11-21' + '09:15' -> 带 +08:00 的时间戳（ms）。 */
export function evTimestamp(date: string, time: string): number {
  return new Date(`${date}T${time}:00+08:00`).getTime();
}

/** 取北京时间各分量：时间戳 +8h 后取 UTC 分量，不用本地 getter，也不用 Intl/formatToParts（iPhone Hermes 下 formatToParts 拆出的 day/hour/minute 不可解析，见文件头 11/NaN 教训）。 */
export function bjParts(ts: number): {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  weekday: number; // 0=周日 … 6=周六（北京时间）
} {
  const d = new Date(ts + 8 * 3_600_000);
  return {
    year: d.getUTCFullYear(),
    month: d.getUTCMonth() + 1,
    day: d.getUTCDate(),
    hour: d.getUTCHours(),
    minute: d.getUTCMinutes(),
    weekday: d.getUTCDay(),
  };
}

const pad2 = (n: number) => String(n).padStart(2, '0');

export function formatTimeBJ(ts: number): string {
  const p = bjParts(ts);
  return `${pad2(p.hour)}:${pad2(p.minute)}`;
}

export function formatDateBJ(ts: number): string {
  const p = bjParts(ts);
  return `${p.year}-${pad2(p.month)}-${pad2(p.day)}`;
}

/** '11/21 09:15' */
export function formatDateTimeBJ(ts: number): string {
  const p = bjParts(ts);
  return `${pad2(p.month)}/${pad2(p.day)} ${pad2(p.hour)}:${pad2(p.minute)}`;
}

export function formatDateTimeFullBJ(ts: number): string {
  const p = bjParts(ts);
  return `${p.year}-${pad2(p.month)}-${pad2(p.day)} ${pad2(p.hour)}:${pad2(p.minute)}`;
}

const WEEKDAYS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

export function weekdayBJ(ts: number): string {
  return WEEKDAYS[bjParts(ts).weekday];
}

/** 时间戳 +/- N 分钟，返回新时间戳。 */
export function addMinutes(ts: number, minutes: number): number {
  return ts + minutes * 60_000;
}

/** 提前 N 小时（可为小数，如 0.5 = 30 分钟）。 */
export function minusHours(ts: number, hours: number): number {
  return ts - hours * 3_600_000;
}

/** 倒计时：目标 - 现在，返回 {d,h,m,s}（全部 >= 0）。 */
export function countdownTo(targetTs: number, nowTs: number = Date.now()): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  past: boolean;
} {
  const diff = targetTs - nowTs;
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, past: true };
  const totalSec = Math.floor(diff / 1000);
  return {
    days: Math.floor(totalSec / 86400),
    hours: Math.floor((totalSec % 86400) / 3600),
    minutes: Math.floor((totalSec % 3600) / 60),
    seconds: totalSec % 60,
    past: false,
  };
}

/** '2026-11-21' + N 天 -> '2026-12-17'：用 UTC 日期运算，不用 setDate。 */
export function addDays(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const ts = Date.UTC(y, m - 1, d) + days * 86_400_000;
  const dt = new Date(ts);
  return `${dt.getUTCFullYear()}-${pad2(dt.getUTCMonth() + 1)}-${pad2(dt.getUTCDate())}`;
}
