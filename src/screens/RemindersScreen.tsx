import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useStore, sortedEvents, calendarNodeCount } from '../store';
import { THEMES } from '../theme';
import { evTimestamp, formatDateTimeBJ, minusHours } from '../lib/time';

const HOURS = [0, 0.5, 1, 1.5, 2, 3];

export default function RemindersScreen() {
  const store = useStore();
  const theme = THEMES[store.theme];
  const events = sortedEvents(store.events);
  const count = calendarNodeCount(events);

  const cycle = (cur: number) => {
    const i = HOURS.indexOf(cur);
    return HOURS[(i + 1) % HOURS.length];
  };

  return (
    <ScrollView style={[styles.root, { backgroundColor: theme.bg }]} contentContainerStyle={styles.pad}>
      <Text style={[styles.title, { color: theme.text }]}>提醒设置（按事件）</Text>
      <Text style={[styles.sub, { color: theme.muted }]}>
        每档点一下切换提前时间，改动直接写回并保存；显示的是绝对时刻（北京时间）。
      </Text>
      {events.map((e) => {
        const ts = evTimestamp(e.date, e.time);
        return (
          <View key={e.id} style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={{ color: theme.text, fontWeight: '700' }}>{e.time} {e.title}</Text>
            <View style={styles.row}>
              <Text style={{ color: theme.muted, fontSize: 13 }}>第 1 档：提前 {e.rem1Hours}h</Text>
              <TouchableOpacity onPress={() => store.updateEvent(e.id, { rem1Hours: cycle(e.rem1Hours) })} style={[styles.chip, { borderColor: theme.border }]}>
                <Text style={{ color: theme.primary }}>切换</Text>
              </TouchableOpacity>
              <Text style={{ color: theme.muted, fontSize: 13 }}>
                {e.rem1Hours > 0 ? formatDateTimeBJ(minusHours(ts, e.rem1Hours)) : '不提醒'}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={{ color: theme.muted, fontSize: 13 }}>第 2 档：提前 {e.rem2Hours}h</Text>
              <TouchableOpacity onPress={() => store.updateEvent(e.id, { rem2Hours: cycle(e.rem2Hours) })} style={[styles.chip, { borderColor: theme.border }]}>
                <Text style={{ color: theme.primary }}>切换</Text>
              </TouchableOpacity>
              <Text style={{ color: theme.muted, fontSize: 13 }}>
                {e.rem2Hours > 0 ? formatDateTimeBJ(minusHours(ts, e.rem2Hours)) : '不提醒'}
              </Text>
            </View>
          </View>
        );
      })}

      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={[styles.h, { color: theme.text }]}>渠道</Text>
        <TouchableOpacity onPress={() => store.setAlarmEnabled(!store.alarmEnabled)}>
          <Text style={{ color: theme.text }}>🔔 闹钟式强提醒：{store.alarmEnabled ? '已开启（响铃需确认才停）' : '已关闭'}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => store.setCalendarSync(!store.calendarSync)}>
          <Text style={{ color: theme.text, marginTop: 8 }}>
            📅 同步手机日历：{store.calendarSync ? `已开启（${count} 个节点）` : '未开启'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          disabled={!store.calendarSync}
          style={[styles.btn, { backgroundColor: store.calendarSync ? theme.primary : theme.muted }]}>
          <Text style={styles.btnText}>
            {store.calendarSync ? `同步到手机日历（${count} 个节点）` : '未开启日历同步'}
          </Text>
        </TouchableOpacity>
        <Text style={{ color: theme.muted, fontSize: 12, marginTop: 8 }}>
          TODO（待接后端）：真推送 / 真日历写入尚未接入，当前为界面占位。
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  pad: { padding: 16, paddingBottom: 32 },
  title: { fontSize: 18, fontWeight: '800' },
  sub: { fontSize: 12, marginVertical: 6 },
  card: { borderRadius: 12, borderWidth: 1, padding: 12, marginBottom: 10 },
  h: { fontSize: 15, fontWeight: '700', marginBottom: 6 },
  row: { flexDirection: 'row', gap: 8, marginTop: 8, alignItems: 'center', flexWrap: 'wrap' },
  chip: { borderRadius: 12, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 5 },
  btn: { borderRadius: 10, padding: 12, alignItems: 'center', marginTop: 10 },
  btnText: { color: '#fff', fontWeight: '700' },
});
