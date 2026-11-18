import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useStore, sortedEvents } from '../store';
import { THEMES } from '../theme';
import { DAY_LABELS } from '../data/seed';

export default function TripScreen() {
  const store = useStore();
  const theme = THEMES[store.theme];
  const [open, setOpen] = useState<Record<number, boolean>>({ 1: true, 2: true, 3: true });
  const [expanded, setExpanded] = useState<string | null>(null);
  const events = sortedEvents(store.events);

  return (
    <ScrollView style={[styles.root, { backgroundColor: theme.bg }]} contentContainerStyle={styles.pad}>
      <Text style={[styles.title, { color: theme.text }]}>多日完整时间线</Text>
      <Text style={[styles.sub, { color: theme.muted }]}>按时间排序 · 点节点可展开详情、编辑 / 删除</Text>
      {([1, 2, 3] as const).map((day) => {
        const list = events.filter((e) => e.day === day);
        return (
          <View key={day}>
            <TouchableOpacity onPress={() => setOpen((o) => ({ ...o, [day]: !o[day] }))}>
              <Text style={[styles.day, { color: theme.primary }]}>{DAY_LABELS[day]}</Text>
            </TouchableOpacity>
            {open[day] &&
              list.map((e) => (
                <View key={e.id} style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
                  <TouchableOpacity onPress={() => setExpanded(expanded === e.id ? null : e.id)}>
                    <Text style={[styles.time, { color: theme.primary }]}>{e.time}</Text>
                    <Text style={[styles.t, { color: theme.text }]}>{e.title}</Text>
                    {e.seat ? <Text style={[styles.b, { color: theme.muted }]}>座位 {e.seat}</Text> : null}
                    {e.gate ? <Text style={[styles.b, { color: theme.muted }]}>登机口 / 检票口 {e.gate}</Text> : null}
                  </TouchableOpacity>
                  {expanded === e.id ? (
                    <View style={styles.detail}>
                      {e.from ? <Text style={[styles.b, { color: theme.muted }]}>{e.from} → {e.to}</Text> : null}
                      {e.orderNo ? <Text style={[styles.b, { color: theme.muted }]}>订单号 {e.orderNo}</Text> : null}
                      {e.ticketCode ? <Text style={[styles.b, { color: theme.muted }]}>取票码 {e.ticketCode}</Text> : null}
                      {e.desc ? <Text style={[styles.b, { color: theme.muted }]}>{e.desc}</Text> : null}
                      <Text style={[styles.b, { color: theme.muted }]}>
                        提醒：提前 {e.rem1Hours}h / {e.rem2Hours}h
                      </Text>
                      <TouchableOpacity
                        onPress={() =>
                          Alert.alert('删除行程', `确定删除「${e.title}」吗？`, [
                            { text: '取消', style: 'cancel' },
                            { text: '删除', style: 'destructive', onPress: () => store.deleteEvent(e.id) },
                          ])
                        }>
                        <Text style={[styles.del, { color: theme.danger }]}>删除此节点</Text>
                      </TouchableOpacity>
                    </View>
                  ) : null}
                </View>
              ))}
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  pad: { padding: 16, paddingBottom: 32 },
  title: { fontSize: 18, fontWeight: '800' },
  sub: { fontSize: 12, marginVertical: 6 },
  day: { fontSize: 15, fontWeight: '700', marginTop: 12, marginBottom: 6 },
  card: { borderRadius: 12, borderWidth: 1, padding: 12, marginBottom: 8 },
  time: { fontSize: 14, fontWeight: '700' },
  t: { fontSize: 14, fontWeight: '600', marginTop: 2 },
  b: { fontSize: 13, lineHeight: 19 },
  detail: { marginTop: 8, borderTopWidth: 1, borderTopColor: '#E5E7EB', paddingTop: 8 },
  del: { fontSize: 13, marginTop: 8, fontWeight: '600' },
});
