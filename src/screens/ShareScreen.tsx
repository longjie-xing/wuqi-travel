import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useStore, acceptedShareCount } from '../store';
import { THEMES } from '../theme';
import { SHARE_ROLE_LABELS, type ShareRole } from '../data/seed';

const ROLES: ShareRole[] = ['view', 'edit', 'manage'];

export default function ShareScreen() {
  const store = useStore();
  const theme = THEMES[store.theme];
  const [name, setName] = useState('');
  const [relation, setRelation] = useState('');
  const [contact, setContact] = useState('');
  const accepted = store.shares.filter((s) => s.status === 'accepted');
  const pending = store.shares.filter((s) => s.status === 'pending');

  return (
    <ScrollView style={[styles.root, { backgroundColor: theme.bg }]} contentContainerStyle={styles.pad}>
      <Text style={[styles.title, { color: theme.text }]}>同行人共享（授权制）</Text>
      <Text style={[styles.sub, { color: theme.muted }]}>
        已接受 {acceptedShareCount(store.shares)} 人 · 待接受 {pending.length} 人（待接受不计入已授权）
      </Text>

      <Text style={[styles.h, { color: theme.text }]}>已接受</Text>
      {accepted.map((s) => (
        <View key={s.id} style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={{ color: theme.text, fontWeight: '700' }}>{s.name} · {s.relation} · {s.contact}</Text>
          <Text style={{ color: theme.muted, fontSize: 12 }}>有效期：{s.expires}</Text>
          <View style={styles.row}>
            {ROLES.map((r) => (
              <TouchableOpacity key={r} onPress={() => store.updateShareRole(s.id, r)} style={[styles.chip, { backgroundColor: s.role === r ? theme.primary : theme.card, borderColor: theme.border }]}>
                <Text style={{ color: s.role === r ? '#fff' : theme.text, fontSize: 12 }}>{SHARE_ROLE_LABELS[r]}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              onPress={() =>
                Alert.alert('撤销授权', `确定撤销 ${s.name} 的授权吗？撤销后对方立刻看不到。`, [
                  { text: '取消', style: 'cancel' },
                  { text: '撤销', style: 'destructive', onPress: () => store.revokeShare(s.id) },
                ])
              }>
              <Text style={{ color: theme.danger }}>撤销</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}

      <Text style={[styles.h, { color: theme.text }]}>待对方接受</Text>
      {pending.length === 0 ? <Text style={{ color: theme.muted }}>暂无</Text> : null}
      {pending.map((s) => (
        <View key={s.id} style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={{ color: theme.text }}>{s.name} · {s.relation} · 待接受</Text>
          <View style={styles.row}>
            <TouchableOpacity onPress={() => store.acceptShare(s.id)} style={[styles.btn, { backgroundColor: theme.primary }]}>
              <Text style={styles.btnText}>模拟对方接受</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => store.revokeShare(s.id)}>
              <Text style={{ color: theme.danger }}>撤销</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}

      <Text style={[styles.h, { color: theme.text }]}>发起新授权</Text>
      <TextInput value={name} onChangeText={setName} placeholder="姓名" placeholderTextColor={theme.muted} style={[styles.input, { backgroundColor: theme.card, borderColor: theme.border, color: theme.text }]} />
      <TextInput value={relation} onChangeText={setRelation} placeholder="关系 如 家人 / 同事" placeholderTextColor={theme.muted} style={[styles.input, { backgroundColor: theme.card, borderColor: theme.border, color: theme.text }]} />
      <TextInput value={contact} onChangeText={setContact} placeholder="联系方式" placeholderTextColor={theme.muted} style={[styles.input, { backgroundColor: theme.card, borderColor: theme.border, color: theme.text }]} />
      <TouchableOpacity
        onPress={() => {
          if (!name.trim()) { Alert.alert('请填写姓名'); return; }
          store.addShare({ name: name.trim(), relation: relation.trim() || '家人', contact: contact.trim(), role: 'view', expires: '本次行程' });
          setName(''); setRelation(''); setContact('');
        }}
        style={[styles.btn, { backgroundColor: theme.primary }]}>
        <Text style={styles.btnText}>发起授权</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  pad: { padding: 16, paddingBottom: 32 },
  title: { fontSize: 18, fontWeight: '800' },
  sub: { fontSize: 12, marginVertical: 6 },
  h: { fontSize: 15, fontWeight: '700', marginTop: 14, marginBottom: 6 },
  card: { borderRadius: 12, borderWidth: 1, padding: 12, marginBottom: 8 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8, alignItems: 'center' },
  chip: { borderRadius: 16, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 6 },
  input: { borderRadius: 10, borderWidth: 1, padding: 12, marginVertical: 5, fontSize: 14 },
  btn: { borderRadius: 10, padding: 12, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '700' },
});
