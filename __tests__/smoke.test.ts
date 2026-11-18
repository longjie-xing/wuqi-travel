/**
 * 冒烟测试：App 入口能正常 import，无语法/模块错误。
 * 只做 import，不做重型组件渲染，不跑模拟器。
 * （静态 import：Jest 30 的 CJS 转换不支持动态 import()，
 * 故不用 await import，入口在文件加载时即被执行——
 * 若注册失败，整个 suite 失败，正是本测试要抓的。）
 */
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

import App from '../App';
import '../index';

describe('冒烟：App 入口', () => {
  test('App.tsx 能正常 import，默认导出为组件函数', () => {
    expect(typeof App).toBe('function');
  });

  test('index.ts 注册入口可 import（registerRootComponent 已执行）', () => {
    expect(App).toBeDefined();
  });
});
