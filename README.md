# 吾栖出行 App · Expo 骨架

> 正式名：吾栖出行（Wuqi Travel）· slug `wuqi-travel` ·
> bundleId / package `com.wuqi.travel` · version `1.0.0`
> 改名历史：2026-11-17 由「出行行程提醒」更名为「吾栖出行」；
> 项目文件夹名 `trip-reminder-app` 保留不变（避免路径变动），
> 仅 App 名 / slug / 包名同步更新。
> 复用 H5 原型 v4 已验证的 11 项 V1 功能，不重做需求。
> 示例行程为 2026-11-21 至 11-23 北京大兴 → 三亚 3 日行演示数据，
> 不是用户已确认的真实出行计划。

## 技术栈

- **Expo + React Native + TypeScript**（Expo SDK 58，React 19，RN 0.88）
- **导航：React Navigation**（bottom-tabs + native-stack）
  - 选它而不是 Expo Router：Tab + Stack 结构更直观，与 H5 原型
    “底部五 Tab + 我的页跳子页”一一对应，类型错误更少。
- **本地持久化：AsyncStorage**，键名 `tripReminderProto.v3`
  （沿用 H5 原型 v3 的数据结构思路），刷新 / 重启不丢。
- **时间：固定北京时间**。所有显示一律走 `src/lib/time.ts`
  的“时间戳 +8h 后取 UTC 分量”算法，与设备本地时区、ICU
  locale 数据均无关。绝不用本地时区 getter（`getHours` /
  `getDate` / `getDay` 等），也不再用 `Intl.DateTimeFormat` /
  `formatToParts` 做显示——两次教训：-8 小时 bug 是格式化跟
  本地时区走偏了；2026-11-17 真机 11/NaN bug 是 iPhone Hermes
  下 `formatToParts` 拆出的分量不可解析。

## 目录结构

```
trip-reminder-app/
├── App.tsx                  # Tab(首页/行程/添加/清单/我的) + Stack(费用/共享/提醒设置)
├── app.json                 # name/slug/bundleId/version，iOS+安卓
├── package.json
├── jest.config.js           # Jest 配置（preset: jest-expo）
├── __tests__/               # 自动测试：time / seed / smoke
├── maestro/                 # 端到端测试：5 个 Maestro flow（CI 里跑）
├── .github/workflows/e2e.yml # CI：unit（Jest+tsc）与 e2e（Maestro+模拟器）
├── src/
│   ├── data/seed.ts         # 单一数据源：3日行程/清单/费用/共享/OCR预设
│   ├── lib/time.ts          # 北京时间格式化（铁律见文件头）
│   ├── store/index.tsx      # 单一 state + AsyncStorage + 派生计算
│   ├── theme.ts             # 商务蓝 / 旅行暖 / 深色
│   └── screens/             # Home/Trip/Add/Pack/My/Expenses/Share/Reminders
```

## 在手机上跑（不需要 Mac）

1. 手机安装免费 App **Expo Go**（iPhone App Store / 安卓应用市场搜 Expo Go）。
2. 电脑上：
   ```bash
   cd trip-reminder-app
   npm install
   npx expo start
   ```
3. 终端出现二维码后，用手机 Expo Go 扫码（同一 Wi-Fi 下）。
   也可以按 `a` 跑安卓模拟器、按 `i` 跑 iOS 模拟器（需要 Mac）。
4. 改代码后手机自动热更新，不用重新扫码。

## 云打包（生成 APK / IPA，不用本地装 Xcode / Android Studio）

需要先有 Expo 账号 + `eas login`，再填 `app.json` 里的
`extra.eas.projectId`（`eas init` 会自动填）：

```bash
npm i -g eas-cli
eas login
eas build --platform android --profile preview   # APK
eas build --platform ios --profile preview       # IPA（需 Apple Developer 账号）
```

> 本次骨架搭建**不生成 APK/IPA，不申请任何账号，不让用户付费**。
> 上架（App Store / Google Play）等用户下一步确认再做。

## 功能对照（11 项 V1，全在骨架里）

| 功能 | 位置 |
|---|---|
| 行程时间线 | 行程页：多日可折叠、按时间排序、节点可编辑/删除 |
| 出发提醒 / 登机检票提醒 | 提醒设置页：按每个事件独立两档，显示绝对时刻 |
| 截图识别 | 添加页：明确标注“模拟识别·非真实 OCR”，按类型返回预设，查重+日期校验 |
| 手动添加 | 添加页：座位号为结构化字段，日期/到达时间/登机口，自驾隐藏座位 |
| 行李清单 | 清单页：4 套模板按模板分别存勾选，首页实时读数 |
| 天气延误预警 | 首页：延误/登机口变更卡 + 天气卡（数据为示例，待接真实接口） |
| 酒店景点管理 | 行程页：订单号 SY202611210836、取票码 WZ-8842-7719 |
| 费用记账 | 费用页：交通/酒店/餐饮/门票，可编辑/删除，最大余数法合计 100%，总额 ¥5,062 |
| 同行人共享 | 共享页：授权制，只计已接受 2 人，待接受单列，撤销二次确认 |
| 日历同步 | 提醒设置页：节点数按真实事件+提醒算，开关关闭时按钮置灰 |
| 多主题 | 我的页：商务蓝 / 旅行暖 / 深色切换 |

## 待接后端（TODO，占位，不假装已实现）

- 推送：`expo-notifications` 真推送尚未接入
- 日历写入：`expo-calendar` 真写入尚未接入（当前只算节点数）
- 云同步：Supabase 同步尚未接入（`store.cloudSyncTodo()`）
- 真 OCR：截图识别当前为模拟预设

## 自动测试

以后改完代码不用再手动把 5 个 Tab 点一遍验证，跑一条命令就行：

```bash
npm test
```

用 Jest（jest-expo preset，与 Expo SDK 58 匹配），共 23 条断言，
分在 `__tests__/` 三个文件里：

| 文件 | 覆盖内容 |
|---|---|
| `time.test.ts` | 北京时间格式化：航班 09:15、出发提醒 11/21 06:15 / 08:15、值机 11/20 09:15、星期、addDays、00:00 / 23:59 边界、倒计时；回归断言：延误顺延提醒文案绝不出现 NaN（2026-11-17 真机 11/NaN bug）；跨时区一致性 |
| `seed.test.ts` | 种子数据 + 派生数据：蜈支洲岛取票码 WZ-8842-7719 只出现一次、费用总额 ¥5,062、占比 49% + 31% + 10% + 10% = 100%、日历节点 17 个、已接受共享 2 人、4 套行李模板 |
| `smoke.test.ts` | App.tsx / index.ts 能正常 import（只做 import，不渲染、不跑模拟器） |

跨时区复核（同一套断言在三个时区下各跑一遍，结果必须完全一致）：

```bash
TZ=UTC npx jest
TZ=America/New_York npx jest
TZ=Asia/Shanghai npx jest
```

## 端到端测试：Maestro + GitHub Actions

UI 层自动点按用 Maestro，流程在 `maestro/` 里（5 个 flow，见下表）。
每次启动都清掉应用数据，保证各 flow 独立。

| flow | 覆盖内容 |
|---|---|
| `home.yaml` | 首页倒计时、CA1831 11/21 09:15、延误顺延 11/21 06:15 / 08:15、回归：文案绝不出现 NaN、今日待办 |
| `trip.yaml` | 行程页三天时间线、展开蜈支洲岛节点、取票码 WZ-8842-7719 可见 |
| `add.yaml` | 手动加一班高铁（座位号 05车12F），保存后在行程页可见新节点 |
| `pack.yaml` | 家庭游版初始 3/16，勾选“泳衣”后变 4/16，切换模板不丢勾选 |
| `expenses.yaml` | 从“我的”进费用记账，总额 ¥5,062，四分类金额 2,480 / 1,560 / 486 / 536 |

取票码“只出现一次”的计数检查不在 flow 里（Maestro YAML 数不了出现次数），
CI 里用 `uiautomator dump` 抓当前屏数一次（见 workflow 注释）；
数据层面的同款断言已在 Jest `seed.test.ts` 里。

**触发方式**：推到 `main`、提 PR、或在 GitHub 仓库 Actions 页手动
Run workflow（workflow_dispatch）都会跑。一次 CI 同时跑 `unit`
（Jest + tsc）和 `e2e`（Maestro + 模拟器）两个 job。

**本地跑不了模拟器**：本机云端没有 KVM（CPU 无虚拟化指令集、
`/dev/kvm` 不存在），也装不了 Android 模拟器；本地只能跑
`npm test`。想在本地跑 Maestro 需要一台带 KVM/Hyper-V 的机器，
命令是：

```bash
npm run test:e2e   # 需先装 Maestro CLI 并起好模拟器、装好 APK
```

**在 CI 里看结果**：仓库 → Actions → 选某次 “E2E (Maestro)” 运行 →
`e2e` job 看每条 flow 的通过/失败；失败截图与日志在运行页底部的
Artifacts 里，artifact 名叫 **maestro-results**（含各 flow 的截图、
命令日志、JUnit 报告 `report.xml`，保留 14 天）。

## 验证

```bash
npm install
npm test        # 23 条断言全过
npx tsc --noEmit
```
