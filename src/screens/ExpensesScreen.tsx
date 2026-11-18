import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useStore, expensePercents, expenseTotal } from '../store';
import { THEMES } from '../theme';
import { EXPENSE_LABELS, type ExpenseCategory } from '../data/seed';

const CATS: ExpenseCategory[] = ['transport', 'hotel', 'food', 'ticket'];

export default function ExpensesScreen() {
  const store = useStore();
  const theme = THEMES[store.theme];
  const total = expenseTotal(store.expenses);
  const pcts = expensePercents(store.expenses);
  const [label, setLabel] = useState('');
  const [amount, setAmount] = useState('');
  const [cat, setCat] = useState<ExpenseCategory>('transport');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState('');

  const add = () => {
    const n = Number(amount);
    if (!label.trim() || !Number.isFinite(n) || n <= 0) {
      Alert.alert('请填写名称和正确的金额');
      return;
    }
    store.addExpense({ date: '2026-11-22', category: cat, label: label.trim(), amount: n, payer: '我', split: '3人均摊' });
    setLabel('');
    setAmount('');
  };

  return (
    <ScrollView style={[styles.root, { backgroundColor: theme.bg }]} contentContainerStyle={styles.pad}>
      <Text style={[styles.title, { color: theme.text }]}>费用记账</Text>
      <Text style={[styles.total, { color: theme.primary }]}>总额 ¥{total.toLocaleString()}</Text>
      {CATS.map((c) => {
        const sum = store.expenses.filter((e) => e.category === c).reduce((s, e) => s + e.amount, 0);
        return (
          <Text key={c} style={[styles.b, { color: theme.text }]}>
            {EXPENSE_LABELS[c]} ¥{sum.toLocaleString()} · {pcts[c]}%
          </Text>
        );
      })}
      <Text style={[styles.note, { color: theme.muted }]}>占比用最大余数法，合计恒为 100%</Text>

      <Text style={[styles.h, { color: theme.text }]}>记一笔</Text>
      <View style={styles.row}>
        {CATS.map((c) => (
          <TouchableOpacity key={c} onPress={() => setCat(c)} style={[styles.chip, { backgroundColor: cat === c ? theme.primary : theme.card, borderColor: theme.border }]}>
            <Text style={{ color: cat === c ? '#fff' : theme.text, fontSize: 12 }}>{EXPENSE_LABELS[c]}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TextInput value={label} onChangeText={setLabel} placeholder="名称 如 打车去机场" placeholderTextColor={theme.muted} style={[styles.input, { backgroundColor: theme.card, borderColor: theme.border, color: theme.text }]} />
      <TextInput value={amount} onChangeText={setAmount} placeholder="金额（元）" placeholderTextColor={theme.muted} keyboardType="numeric" style={[styles.input, { backgroundColor: theme.card, borderColor: theme.border, color: theme.text }]} />
      <TouchableOpacity onPress={add} style={[styles.btn, { backgroundColor: theme.primary }]}>
        <Text style={styles.btnText}>记账</Text>
      </TouchableOpacity>

      <Text style={[styles.h, { color: theme.text }]}>明细（点金额可改，点删除可删）</Text>
      {store.expenses.map((e) => (
        <View key={e.id} style={[styles.item, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={{ color: theme.text, fontSize: 14 }}>
            {e.date} · {EXPENSE_LABELS[e.category]} · {e.label} · {e.payer} · {e.split}
          </Text>
          {editingId === e.id ? (
            <View style={styles.row}>
              <TextInput value={editAmount} onChangeText={setEditAmount} keyboardType="numeric" style={[styles.miniInput, { borderColor: theme.border, color: theme.text }]} />
              <TouchableOpacity
                onPress={() => {
                  const n = Number(editAmount);
                  if (Number.isFinite(n) && n > 0) store.updateExpense(e.id, { amount: n });
                  setEditingId(null);
                }}>
                <Text style={{ color: theme.primary }}>保存</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.row}>
              <TouchableOpacity onPress={() => { setEditingId(e.id); setEditAmount(String(e.amount)); }}>
                <Text style={{ color: theme.primary, fontWeight: '700' }}>¥{e.amount.toLocaleString()}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() =>
                  Alert.alert('删除费用', `确定删除「${e.label} ¥${e.amount}」吗？`, [
                    { text: '取消', style: 'cancel' },
                    { text: '删除', style: 'destructive', onPress: () => store.deleteExpense(e.id) },
                  ])
                }>
                <Text style={{ color: theme.danger }}>删除</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  pad: { padding: 16, paddingBottom: 32 },
  title: { fontSize: 18, fontWeight: '800' },
  total: { fontSize: 26, fontWeight: '800', marginVertical: 6 },
  b: { fontSize: 13, lineHeight: 20 },
  note: { fontSize: 12, marginVertical: 4 },
  h: { fontSize: 15, fontWeight: '700', marginTop: 14, marginBottom: 6 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginVertical: 6, alignItems: 'center' },
  chip: { borderRadius: 16, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 7 },
  input: { borderRadius: 10, borderWidth: 1, padding: 12, marginVertical: 5, fontSize: 14 },
  miniInput: { borderRadius: 8, borderWidth: 1, padding: 8, width: 100, fontSize: 14 },
  btn: { borderRadius: 10, padding: 13, alignItems: 'center', marginTop: 6 },
  btnText: { color: '#fff', fontWeight: '700' },
  item: { borderRadius: 10, borderWidth: 1, padding: 12, marginBottom: 8 },
});
