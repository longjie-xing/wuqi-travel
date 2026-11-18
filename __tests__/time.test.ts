/**
 * time.ts 回归测试 —— 两次真机 bug 的防线。
 *
 * -8 小时 bug（H5 v3）：fmt 用本地 getter，UTC 下系统性 -8h。
 * 11/NaN bug（2026-11-17 真机）：bjParts 用 Intl formatToParts，
 * iPhone Hermes 下 day 拆出非纯数字、hour/minute 缺失，首页延误
 * 卡片显示 "11/NaN 00:00"。本文件锁定正确行为：所有时刻一律
 * 按北京时间（Asia/Shanghai）显示，与设备本地时区无关。
 *
 * 跑法：npm test；或在三个时区下各跑一遍——
 *   TZ=UTC npx jest __tests__/time.test.ts
 *   TZ=America/New_York npx jest __tests__/time.test.ts
 *   TZ=Asia/Shanghai npx jest __tests__/time.test.ts
 * 三遍结果必须完全一致。
 */
import {
  addDays,
  bjParts,
  countdownTo,
  evTimestamp,
  formatDateTimeBJ,
  formatTimeBJ,
  minusHours,
  weekdayBJ,
} from '../src/lib/time';

/** CA1831 延误后起飞时刻：2026-11-21 09:15（北京时间）。 */
const FLIGHT = evTimestamp('2026-11-21', '09:15');
/** 值机开放：2026-11-20 09:15（北京时间）。 */
const CHECKIN = evTimestamp('2026-11-20', '09:15');

describe('北京时间格式化（固定值）', () => {
  test('航班 09:15', () => {
    expect(formatTimeBJ(FLIGHT)).toBe('09:15');
    expect(formatDateTimeBJ(FLIGHT)).toBe('11/21 09:15');
  });

  test('出发提醒：提前 3 小时 / 提前 1 小时', () => {
    expect(formatDateTimeBJ(minusHours(FLIGHT, 3))).toBe('11/21 06:15');
    expect(formatDateTimeBJ(minusHours(FLIGHT, 1))).toBe('11/21 08:15');
  });

  test('值机 11/20 09:15 开放', () => {
    expect(formatDateTimeBJ(CHECKIN)).toBe('11/20 09:15');
  });

  test('星期', () => {
    expect(weekdayBJ(FLIGHT)).toBe('周六');
    expect(weekdayBJ(evTimestamp('2026-11-22', '09:00'))).toBe('周日');
    expect(weekdayBJ(evTimestamp('2026-11-23', '11:00'))).toBe('周一');
  });

  test('addDays：+1 天、+30 天、+0 天', () => {
    expect(addDays('2026-11-21', 1)).toBe('2026-11-22');
    expect(addDays('2026-11-21', 30)).toBe('2026-12-21');
    expect(addDays('2026-11-21', 0)).toBe('2026-11-21');
  });

  test('00:00 / 23:59 边界', () => {
    expect(formatDateTimeBJ(evTimestamp('2026-11-21', '00:00'))).toBe('11/21 00:00');
    expect(formatDateTimeBJ(evTimestamp('2026-11-21', '23:59'))).toBe('11/21 23:59');
  });

  test('倒计时：11/17 17:21 → 11/21 09:15 为 3 天 15 时 54 分 0 秒', () => {
    const cd = countdownTo(FLIGHT, evTimestamp('2026-11-17', '17:21'));
    expect(cd).toEqual({ days: 3, hours: 15, minutes: 54, seconds: 0, past: false });
  });

  test('bjParts 各分量均为有限整数（防 NaN）', () => {
    const samples = [
      FLIGHT,
      minusHours(FLIGHT, 3),
      minusHours(FLIGHT, 1),
      CHECKIN,
      evTimestamp('2026-11-21', '00:00'),
      evTimestamp('2026-11-21', '23:59'),
    ];
    for (const ts of samples) {
      const p = bjParts(ts);
      for (const v of [p.year, p.month, p.day, p.hour, p.minute, p.weekday]) {
        expect(Number.isFinite(v)).toBe(true);
        expect(Number.isInteger(v)).toBe(true);
      }
    }
  });
});

describe('回归：延误顺延提醒文案绝不出现 NaN（2026-11-17 真机 11/NaN 00:00）', () => {
  test('首页延误卡片文案与 HomeScreen 拼法一致', () => {
    // 与 src/screens/HomeScreen.tsx 延误卡片的拼法逐字对应。
    const text =
      'CA1831 延误 40 分钟，起飞 09:15，登机口由 C12 变更为 C18。后续提醒已自动顺延：' +
      `出发提醒 ${formatDateTimeBJ(minusHours(FLIGHT, 3))} / ${formatDateTimeBJ(minusHours(FLIGHT, 1))}，` +
      `值机 ${formatDateTimeBJ(CHECKIN)} 开放。`;
    expect(text).toContain('出发提醒 11/21 06:15 / 11/21 08:15');
    expect(text).toContain('值机 11/20 09:15 开放');
    expect(text).not.toContain('NaN');
    expect(text).not.toMatch(/NaN|undefined/);
  });

  test('所有格式化输出都符合 MM/DD HH:mm 且不含 NaN', () => {
    const samples = [FLIGHT, minusHours(FLIGHT, 3), minusHours(FLIGHT, 1), CHECKIN];
    for (const ts of samples) {
      const s = formatDateTimeBJ(ts);
      expect(s).toMatch(/^\d{2}\/\d{2} \d{2}:\d{2}$/);
      expect(s).not.toContain('NaN');
    }
  });
});

describe('跨时区一致性（与设备本地时区无关）', () => {
  // 说明：Jest 的 vm 上下文不响应运行中改 process.env.TZ，
  // 但进程启动时传入的 TZ 是生效的。因此跨时区验证靠在三个
  // 时区下各跑一遍整套测试完成：
  //   TZ=UTC npx jest
  //   TZ=America/New_York npx jest
  //   TZ=Asia/Shanghai npx jest
  // 若实现改回本地 getter，UTC / 纽约那两遍会立刻失败。
  // 本测试在当前进程时区下再守一道：先证明本地 getter 确实
  // 跟着进程时区走（本地小时 = UTC 小时 - 时区偏移），再断言
  // 北京时间输出不变——两者同时成立才说明格式化与本地时区无关。
  test('本地时间随进程时区变化，但北京时间输出不变', () => {
    const utcHour = new Date(FLIGHT).getUTCHours(); // 1
    const offsetMin = new Date(FLIGHT).getTimezoneOffset();
    const expectedLocalHour = (((utcHour - offsetMin / 60) % 24) + 24) % 24;
    expect(new Date(FLIGHT).getHours()).toBe(expectedLocalHour);
    expect(formatDateTimeBJ(minusHours(FLIGHT, 3))).toBe('11/21 06:15');
    expect(formatDateTimeBJ(minusHours(FLIGHT, 1))).toBe('11/21 08:15');
    expect(formatDateTimeBJ(FLIGHT)).toBe('11/21 09:15');
    expect(formatDateTimeBJ(CHECKIN)).toBe('11/20 09:15');
    expect(weekdayBJ(FLIGHT)).toBe('周六');
  });
});
