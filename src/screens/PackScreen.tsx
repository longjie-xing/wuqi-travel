import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useStore } from '../store';
import { THEMES } from '../theme';
import { PACK_LABELS, type PackKey } from '../data/seed';

const KEYS: PackKey[] = ['family', 'flight', 'train', 'selfDrive'];

export default function PackScreen() {
  const store = useStore();
  const theme = THEMES[store.theme];
  const [key, setKey] = useState<PackKey>('family');
  const items = store.packs[key];
  const done = items.filter((i) => i.checked).length;

  return (
    <ScrollView style={[styles.root, { backgroundColor: theme.bg }]} contentContainerStyle={styles.pad}>
      <Text style={[styles.title, { color: theme.text }]}>行李清单</Text>
      <Text style={[styles.sub, { color: theme.muted }]}>
        {PACK_LABELS[key]} · {done}/{items.length} 已打包 · 按模板分别保存，切换不丢勾选
      </Text>
      <View style={styles.row}>
        {KEYS.map((k) => (
          <TouchableOpacity
            key={k}
            onPress={() => setKey(k)}
            style={[styles.chip, { backgroundColor: key === k ? theme.primary : theme.card, borderColor: theme.border }]}>
            <Text style={{ color: key === k ? '#fff' : theme.text, fontSize: 12 }}>{PACK_LABELS[k]}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {items.map((it) => (
        <TouchableOpacity
          key={it.id}
          onPress={() => store.togglePack(key, it.id)}
          style={[styles.item, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={{ fontSize: 16, color: theme.text }}>{it.checked ? '✅' : '⬜'}  {it.label}</Text>
        </TouchableOpacity>
      ))}
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={[styles.h, { color: theme.text }]}>证件有效期提醒</Text>
        <Text style={[styles.b, { color: theme.muted }]}>刘晨星身份证 2027 年 2 月到期 · 护照有效期请在出行前核对</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  pad: { padding: 16, paddingBottom: 32 },
  title: { fontSize: 18, fontWeight: '800' },
  sub: { fontSize: 12, marginVertical: 6 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginVertical: 8 },
  chip: { borderRadius: 16, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 7 },
  item: { borderRadius: 10, borderWidth: 1, padding: 13, marginBottom: 8 },
  card: { borderRadius: 12, borderWidth: 1, padding: 14, marginTop: 12 },
  h: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  b: { fontSize: 13, lineHeight: 19 },
});
