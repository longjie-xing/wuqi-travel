import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useStore, calendarNodeCount, sortedEvents, expenseTotal } from '../store';
import { THEMES } from '../theme';
import { THEME_LABELS, type ThemeKey } from '../data/seed';

export default function MyScreen({ navigation }: any) {
  const store = useStore();
  const theme = THEMES[store.theme];
  const events = sortedEvents(store.events);

  return (
    <ScrollView style={[styles.root, { backgroundColor: theme.bg }]} contentContainerStyle={styles.pad}>
      <Text style={[styles.title, { color: theme.text }]}>我的</Text>
      <Text style={[styles.sub, { color: theme.muted }]}>
        行程 {events.length} 个事件 · 日历节点 {calendarNodeCount(events)} 个 · 费用总额 ¥{expenseTotal(store.expenses).toLocaleString()}
      </Text>

      <Text style={[styles.h, { color: theme.text }]}>主题</Text>
      <View style={styles.row}>
        {(Object.keys(THEME_LABELS) as ThemeKey[]).map((k) => (
          <TouchableOpacity
            key={k}
            onPress={() => store.setTheme(k)}
            style={[styles.chip, { backgroundColor: store.theme === k ? theme.primary : theme.card, borderColor: theme.border }]}>
            <Text style={{ color: store.theme === k ? '#fff' : theme.text }}>{THEME_LABELS[k]}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity onPress={() => navigation.navigate('费用')} style={[styles.link, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={{ color: theme.text }}>💰 费用记账 →</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('共享')} style={[styles.link, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={{ color: theme.text }}>👥 同行人共享 →</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('提醒设置')} style={[styles.link, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={{ color: theme.text }}>⏰ 提醒设置 →</Text>
      </TouchableOpacity>

      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={[styles.h, { color: theme.text }]}>数据与同步</Text>
        <Text style={[styles.b, { color: theme.muted }]}>本地存储键：tripReminderProto.v3（AsyncStorage，刷新不丢）</Text>
        <Text style={[styles.b, { color: theme.muted }]}>云同步：{store.cloudSyncTodo()}</Text>
        <Text style={[styles.b, { color: theme.muted }]}>推送 / 日历写入 / 真 OCR：待接后端，界面已标注占位，不假装已实现</Text>
        <Text style={[styles.b, { color: theme.muted }]}>版本 1.0.0 · bundleId com.wuqi.travel</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  pad: { padding: 16, paddingBottom: 32 },
  title: { fontSize: 18, fontWeight: '800' },
  sub: { fontSize: 12, marginVertical: 6 },
  h: { fontSize: 15, fontWeight: '700', marginTop: 14, marginBottom: 6 },
  row: { flexDirection: 'row', gap: 8, marginVertical: 6 },
  chip: { borderRadius: 16, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 7 },
  link: { borderRadius: 10, borderWidth: 1, padding: 14, marginBottom: 8 },
  card: { borderRadius: 12, borderWidth: 1, padding: 14, marginTop: 12 },
  b: { fontSize: 13, lineHeight: 19 },
});
