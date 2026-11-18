/**
 * 单一数据源（seed）—— H5 原型 v4 的逻辑复用。
 * 示例行程：2026-11-21 至 11-23 北京大兴 → 三亚 3 日行。
 * 注意：这是演示用示例数据，不是用户已确认的真实出行计划。
 * 所有时刻的“主时间”一律是延误后的北京时间；原时间只放括号备注。
 */

export type EventType =
  | 'flight'
  | 'train'
  | 'hotel'
  | 'attraction'
  | 'restaurant'
  | 'transport'
  | 'other';

export interface TripEvent {
  id: string;
  day: 1 | 2 | 3;
  date: string; // '2026-11-21'
  time: string; // '09:15' 北京时间
  endTime?: string;
  title: string;
  type: EventType;
  from?: string;
  to?: string;
  flightNo?: string;
  seat?: string; // 结构化字段，不是拼进描述的文本
  gate?: string; // 登机口 / 检票口
  orderNo?: string;
  ticketCode?: string;
  desc?: string;
  originalTime?: string; // 原时间，仅作备注，如 '08:35'
  /** 两档提醒（小时）：默认提前 3h + 1h，可按事件单独改 */
  rem1Hours: number;
  rem2Hours: number;
}

export interface PackItem {
  id: string;
  label: string;
  checked: boolean;
}

export type PackKey = 'family' | 'flight' | 'train' | 'selfDrive';

export const PACK_LABELS: Record<PackKey, string> = {
  family: '家庭游版',
  flight: '飞机出差版',
  train: '火车版',
  selfDrive: '自驾游版',
};

export type ExpenseCategory = 'transport' | 'hotel' | 'food' | 'ticket';

export const EXPENSE_LABELS: Record<ExpenseCategory, string> = {
  transport: '交通',
  hotel: '酒店',
  food: '餐饮',
  ticket: '门票',
};

export interface Expense {
  id: string;
  date: string;
  category: ExpenseCategory;
  label: string;
  amount: number;
  payer: string;
  split: string; // 分摊方式，如 '3人均摊'
}

export type ShareRole = 'view' | 'edit' | 'manage';
export type ShareStatus = 'accepted' | 'pending' | 'expired';

export const SHARE_ROLE_LABELS: Record<ShareRole, string> = {
  view: '仅查看',
  edit: '可编辑',
  manage: '可管理',
};

export interface Share {
  id: string;
  name: string;
  relation: string;
  contact: string;
  role: ShareRole;
  status: ShareStatus;
  expires: string; // 有效期，如 '2026-11-23' 或 '本次行程'
}

export type ThemeKey = 'business' | 'warm' | 'dark';

export const THEME_LABELS: Record<ThemeKey, string> = {
  business: '商务蓝',
  warm: '旅行暖',
  dark: '深色',
};

export const TRIP_DATES = ['2026-11-21', '2026-11-22', '2026-11-23'];

export const DAY_LABELS: Record<number, string> = {
  1: 'Day1 · 11/21 周六 · 北京 → 三亚',
  2: 'Day2 · 11/22 周日 · 三亚',
  3: 'Day3 · 11/23 周一 · 三亚 → 北京',
};

/** 主航班：CA1831，延误后 09:15（原 08:35，延误 40 分钟） */
export const seedEvents: TripEvent[] = [
  {
    id: 'ev-taxi-1',
    day: 1,
    date: '2026-11-21',
    time: '06:20',
    title: '打车出发去北京大兴机场',
    type: 'transport',
    from: '家',
    to: '北京大兴国际机场',
    desc: '车程约 55 分钟，提前 3 小时出发',
    rem1Hours: 0.5,
    rem2Hours: 0,
  },
  {
    id: 'ev-flight-1',
    day: 1,
    date: '2026-11-21',
    time: '09:15',
    title: 'CA1831 · 北京大兴 → 三亚凤凰',
    type: 'flight',
    from: '北京大兴 PKX',
    to: '三亚凤凰 SYX',
    flightNo: 'CA1831',
    seat: '18A',
    gate: 'C18',
    originalTime: '08:35',
    desc: '09:15 起飞（原 08:35，延误 40 分钟）· 登机口由 C12 变更为 C18',
    rem1Hours: 3,
    rem2Hours: 1,
  },
  {
    id: 'ev-hotel-1',
    day: 1,
    date: '2026-11-21',
    time: '14:00',
    title: '酒店办理入住 · 三亚湾度假酒店',
    type: 'hotel',
    orderNo: 'SY202611210836',
    desc: '预计 13:40 抵达、14:00 办理入住（延误已通知前台晚到）',
    rem1Hours: 1,
    rem2Hours: 0,
  },
  {
    id: 'ev-attr-1',
    day: 2,
    date: '2026-11-22',
    time: '09:00',
    title: '蜈支洲岛一日游',
    type: 'attraction',
    ticketCode: 'WZ-8842-7719',
    desc: '提前 30 分钟到码头',
    rem1Hours: 2,
    rem2Hours: 0.5,
  },
  {
    id: 'ev-food-1',
    day: 2,
    date: '2026-11-22',
    time: '18:30',
    title: '林姐香味海鲜 · 晚餐',
    type: 'restaurant',
    desc: '3 人桌 · 已预订',
    rem1Hours: 1,
    rem2Hours: 0,
  },
  {
    id: 'ev-checkout',
    day: 3,
    date: '2026-11-23',
    time: '11:00',
    title: '酒店退房',
    type: 'hotel',
    desc: '12:00 前退房',
    rem1Hours: 1,
    rem2Hours: 0,
  },
  {
    id: 'ev-flight-2',
    day: 3,
    date: '2026-11-23',
    time: '14:25',
    title: 'CA1832 · 三亚凤凰 → 北京大兴',
    type: 'flight',
    from: '三亚凤凰 SYX',
    to: '北京大兴 PKX',
    flightNo: 'CA1832',
    seat: '18A',
    gate: 'C18',
    desc: '值机 11/22 14:25 开放（起飞前 24 小时）',
    rem1Hours: 3,
    rem2Hours: 1,
  },
];

export const seedPacks: Record<PackKey, PackItem[]> = {
  family: [
    { id: 'f1', label: '身份证', checked: true },
    { id: 'f2', label: '换洗衣物', checked: true },
    { id: 'f3', label: '防晒霜', checked: true },
    { id: 'f4', label: '泳衣', checked: false },
    { id: 'f5', label: '儿童药品', checked: false },
    { id: 'f6', label: '充电器', checked: false },
    { id: 'f7', label: '充电宝', checked: false },
    { id: 'f8', label: '雨伞', checked: false },
    { id: 'f9', label: '洗漱包', checked: false },
    { id: 'f10', label: '拖鞋', checked: false },
    { id: 'f11', label: '帽子', checked: false },
    { id: 'f12', label: '墨镜', checked: false },
    { id: 'f13', label: '零食', checked: false },
    { id: 'f14', label: '水杯', checked: false },
    { id: 'f15', label: '相机', checked: false },
    { id: 'f16', label: '防蚊液', checked: false },
  ],
  flight: [
    { id: 'a1', label: '身份证', checked: true },
    { id: 'a2', label: '充电器', checked: false },
    { id: 'a3', label: '笔记本电脑', checked: false },
    { id: 'a4', label: '换洗衣物', checked: false },
    { id: 'a5', label: '洗漱包', checked: false },
    { id: 'a6', label: '耳机', checked: false },
    { id: 'a7', label: '文件袋', checked: false },
    { id: 'a8', label: '口罩', checked: false },
  ],
  train: [
    { id: 't1', label: '身份证', checked: true },
    { id: 't2', label: '充电宝', checked: false },
    { id: 't3', label: '耳机', checked: false },
    { id: 't4', label: '零食', checked: false },
    { id: 't5', label: '水杯', checked: false },
    { id: 't6', label: '书', checked: false },
  ],
  selfDrive: [
    { id: 's1', label: '驾驶证', checked: true },
    { id: 's2', label: '行驶证', checked: false },
    { id: 's3', label: '备胎/工具', checked: false },
    { id: 's4', label: '行车记录仪', checked: false },
    { id: 's5', label: '零食/水', checked: false },
    { id: 's6', label: '急救包', checked: false },
    { id: 's7', label: '充电线', checked: false },
  ],
};

/** 费用示例：总额 ¥5,062 = 交通 2,480 + 酒店 1,560 + 餐饮 486 + 门票 536 */
export const seedExpenses: Expense[] = [
  { id: 'ex1', date: '2026-11-21', category: 'transport', label: 'CA1831 机票', amount: 2180, payer: '我', split: '3人均摊' },
  { id: 'ex2', date: '2026-11-21', category: 'transport', label: '打车去机场', amount: 300, payer: '我', split: '3人均摊' },
  { id: 'ex3', date: '2026-11-21', category: 'hotel', label: '三亚湾度假酒店 2 晚', amount: 1560, payer: '我', split: '3人均摊' },
  { id: 'ex4', date: '2026-11-22', category: 'food', label: '林姐香味海鲜', amount: 200, payer: '刘晨星', split: '3人均摊' },
  { id: 'ex5', date: '2026-11-22', category: 'food', label: '早餐/午餐', amount: 286, payer: '我', split: '3人均摊' },
  { id: 'ex6', date: '2026-11-22', category: 'ticket', label: '蜈支洲岛门票', amount: 536, payer: '我', split: '3人均摊' },
];

export const seedShares: Share[] = [
  { id: 'sh1', name: '刘晨星', relation: '家人', contact: '138****1234', role: 'view', status: 'accepted', expires: '本次行程' },
  { id: 'sh2', name: '妈妈', relation: '家人', contact: '139****5678', role: 'edit', status: 'accepted', expires: '本次行程' },
  { id: 'sh3', name: '王建国', relation: '同事', contact: '137****9012', role: 'view', status: 'pending', expires: '2026-11-23' },
];

/** 截图识别模拟预设（非真实 OCR）：按类型返回不同结果 */
export const OCR_PRESETS: Record<string, Partial<TripEvent>> = {
  flight: { type: 'flight', flightNo: 'CA1831', date: '2026-11-21', time: '09:15', seat: '18A', gate: 'C18', from: '北京大兴 PKX', to: '三亚凤凰 SYX' },
  train: { type: 'train', flightNo: 'G103', date: '2026-11-22', time: '07:00', seat: '05车12F', gate: '3检票口', from: '北京南', to: '上海虹桥' },
  hotel: { type: 'hotel', date: '2026-11-21', time: '14:00', orderNo: 'SY202611210836' },
};
