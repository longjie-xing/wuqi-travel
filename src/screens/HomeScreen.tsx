import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useStore, sortedEvents } from '../store';
import { THEMES } from '../theme';
import { countdownTo, evTimestamp, formatDateTimeBJ, minusHours, weekdayBJ } from '../lib/time';
import { PACK_LABELS } from '../data/seed';

export default function HomeScreen() {
  const store = useStore();
  const theme = THEMES[store.theme];
  const flight = store.events.find((e) => e.flightNo === 'CA1831');
  const target = flight ? evTimestamp(flight.date, flight.time) : 0;
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const cd = countdownTo(target, now);
  const today = sortedEvents(store.events).filter((e) => e.date === '2026-11-21');
  const tomorrow = sortedEvents(store.events).filter((e) => e.date === '2026-11-22');
  const pack = store.packs.family;
  const done = pack.filter((p) => p.checked).length;

  return (
    <ScrollView style={[styles.root, { backgroundColor: theme.bg }]} contentContainerStyle={styles.pad}>
      <Text style={[styles.title, { color: theme.text }]}>距登机还有</Text>
      <Text style={[styles.count, { color: theme.primary }]}>
        {cd.days}天 {cd.hours}时 {cd.minutes}分 {cd.seconds}秒
      </Text>
      <Text style={[styles.sub, { color: theme.muted }]}>
        CA1831 · 11/21 09:15 起飞（原 08:35，延误 40 分钟）· 登机口 C18 · 座位 18A
      </Text>

      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={[styles.h, { color: theme.text }]}>⚠️ 延误 / 登机口变更预警</Text>
        <Text style={[styles.body, { color: theme.muted }]}>
          CA1831 延误 40 分钟，起飞 09:15，登机口由 C12 变更为 C18。后续提醒已自动顺延：
          出发提醒 {flight ? formatDateTimeBJ(minusHours(target, 3)) : ''} /{' '}
          {flight ? formatDateTimeBJ(minusHours(target, 1)) : ''}，值机 11/20 09:15 开放。
        </Text>
      </View>

      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={[styles.h, { color: theme.text }]}>☀️ 三亚天气 · 11/21</Text>
        <Text style={[styles.body, { color: theme.muted }]}>
          26°C 晴，适合短袖；紫外线强，记得防晒。出发前一天已推送穿衣建议。
        </Text>
      </View>

      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={[styles.h, { color: theme.text }]}>今日待办 · 11/21 {weekdayBJ(evTimestamp('2026-11-21', '09:15'))}</Text>
        {today.map((e) => (
          <Text key={e.id} style={[styles.body, { color: theme.text }]}>
            • {e.time} {e.title}
          </Text>
        ))}
        <Text style={[styles.body, { color: theme.muted }]}>
          行李：{PACK_LABELS.family} {done}/{pack.length} 已打包
        </Text>
      </View>

      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={[styles.h, { color: theme.text }]}>次日简略提醒 · 11/22</Text>
        {tomorrow.map((e) => (
          <Text key={e.id} style={[styles.body, { color: theme.muted }]}>
            • {e.time} {e.title}
          </Text>
        ))}
      </View>

      <Text style={[styles.foot, { color: theme.muted }]}>
        本地已保存（键 tripReminderProto.v3）· 云同步：待接后端
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  pad: { padding: 16, paddingBottom: 32 },
  title: { fontSize: 16, fontWeight: '600' },
  count: { fontSize: 28, fontWeight: '800', marginVertical: 4 },
  sub: { fontSize: 13, lineHeight: 19, marginBottom: 12 },
  card: { borderRadius: 12, borderWidth: 1, padding: 14, marginBottom: 12 },
  h: { fontSize: 15, fontWeight: '700', marginBottom: 6 },
  body: { fontSize: 13, lineHeight: 20 },
  foot: { fontSize: 12, textAlign: 'center', marginTop: 8 },
});
