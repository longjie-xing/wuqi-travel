/**
 * 种子数据 + 派生数据回归测试。
 * 锁定真机点验过的数字（2026-11-17 iPhone 截图核对）：
 * 费用总额 ¥5,062、日历节点 17 个、已接受共享 2 人；
 * 并锁定 2026-11-17 修掉的取票码重复 bug 不再现。
 */
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

import { seedEvents, seedExpenses, seedPacks, seedShares } from '../src/data/seed';
import {
  acceptedShareCount,
  calendarNodeCount,
  expensePercents,
  expenseTotal,
} from '../src/store';

describe('行程种子数据', () => {
  test('7 个事件，主航班 CA1831 字段完整', () => {
    expect(seedEvents).toHaveLength(7);
    const flight = seedEvents.find((e) => e.flightNo === 'CA1831');
    expect(flight).toBeDefined();
    expect(flight?.date).toBe('2026-11-21');
    expect(flight?.time).toBe('09:15');
    expect(flight?.seat).toBe('18A');
    expect(flight?.gate).toBe('C18');
    expect(flight?.originalTime).toBe('08:35');
    expect(flight?.rem1Hours).toBe(3);
    expect(flight?.rem2Hours).toBe(1);
  });

  test('三日行程日期完整：11/21、11/22、11/23', () => {
    const dates = [...new Set(seedEvents.map((e) => e.date))].sort();
    expect(dates).toEqual(['2026-11-21', '2026-11-22', '2026-11-23']);
  });
});

describe('回归：蜈支洲岛取票码只出现一次（2026-11-17 真机重复 bug）', () => {
  const CODE = 'WZ-8842-7719';
  const attr = seedEvents.find((e) => e.id === 'ev-attr-1');

  test('取票码字段保留，描述里不再含取票码', () => {
    expect(attr?.ticketCode).toBe(CODE);
    expect(attr?.desc).toBe('提前 30 分钟到码头');
    expect(attr?.desc ?? '').not.toContain(CODE);
    expect(attr?.desc ?? '').not.toContain('取票码');
  });

  test('取票码在全部事件数据里只出现一次', () => {
    const occurrences = JSON.stringify(seedEvents).split(CODE).length - 1;
    expect(occurrences).toBe(1);
  });

  test('通用规则：任何事件的描述都不含它自己的取票码/订单号', () => {
    for (const ev of seedEvents) {
      if (ev.ticketCode) expect(ev.desc ?? '').not.toContain(ev.ticketCode);
      if (ev.orderNo) expect(ev.desc ?? '').not.toContain(ev.orderNo);
    }
  });
});

describe('费用：总额 ¥5,062，占比之和 100%', () => {
  test('总额 5,062 = 交通 2,480 + 酒店 1,560 + 餐饮 486 + 门票 536', () => {
    expect(expenseTotal(seedExpenses)).toBe(5062);
    const byCat = (c: string) =>
      seedExpenses.filter((e) => e.category === c).reduce((s, e) => s + e.amount, 0);
    expect(byCat('transport')).toBe(2480);
    expect(byCat('hotel')).toBe(1560);
    expect(byCat('food')).toBe(486);
    expect(byCat('ticket')).toBe(536);
  });

  test('最大余数法占比：49% + 31% + 10% + 10% = 100%', () => {
    const pcts = expensePercents(seedExpenses);
    expect(pcts).toEqual({ transport: 49, hotel: 31, food: 10, ticket: 10 });
    expect(Object.values(pcts).reduce((s, v) => s + v, 0)).toBe(100);
  });
});

describe('派生数据（与我的页 / 提醒设置页显示一致）', () => {
  test('日历节点数 17 = 7 个事件 + 10 档提醒', () => {
    expect(calendarNodeCount(seedEvents)).toBe(17);
  });

  test('共享只计已接受：2 人（第 3 人待接受不计）', () => {
    expect(seedShares).toHaveLength(3);
    expect(acceptedShareCount(seedShares)).toBe(2);
  });
});

describe('行李清单模板', () => {
  test('4 套模板齐全，家庭游版 16 项', () => {
    expect(Object.keys(seedPacks).sort()).toEqual([
      'family',
      'flight',
      'selfDrive',
      'train',
    ]);
    expect(seedPacks.family).toHaveLength(16);
    expect(seedPacks.family.map((i) => i.label)).toContain('身份证');
  });
});
