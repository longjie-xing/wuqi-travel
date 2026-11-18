/**
 * Jest 配置：jest-expo preset（与 Expo SDK 58 匹配）。
 * 测试命令：npm test（也可以 TZ=UTC / TZ=America/New_York /
 * TZ=Asia/Shanghai npx jest，分别在三个时区下跑同一套断言，
 * 验证北京时间格式化与设备本地时区无关）。
 */
module.exports = {
  preset: 'jest-expo',
};
