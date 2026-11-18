import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useStore } from '../store';
import { THEMES } from '../theme';
import { OCR_PRESETS, TRIP_DATES, type EventType } from '../data/seed';

type FormType = 'flight' | 'train' | 'hotel' | 'attraction' | 'selfDrive';

const TYPE_LABELS: Record<FormType, string> = {
  flight: '飞机',
  train: '高铁 / 火车',
  hotel: '酒店',
  attraction: '景点',
  selfDrive: '自驾',
};

export default function AddScreen({ navigation }: any) {
  const store = useStore();
  const theme = THEMES[store.theme];
  const [type, setType] = useState<FormType>('flight');
  const [date, setDate] = useState('2026-11-21');
  const [time, setTime] = useState('09:15');
  const [title, setTitle] = useState('');
  const [seat, setSeat] = useState('');
  const [gate, setGate] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [ocrResult, setOcrResult] = useState<string | null>(null);

  const day = (TRIP_DATES.indexOf(date) + 1) as 1 | 2 | 3;
  const showSeat = type !== 'selfDrive';

  const saveManual = () => {
    if (!title.trim()) {
      Alert.alert('请先填写标题', '例如：CA1831 北京大兴 → 三亚凤凰');
      return;
    }
    const evType: EventType = type === 'selfDrive' ? 'transport' : type;
    store.addEvent({
      day,
      date,
      time,
      title: title.trim(),
      type: evType,
      seat: showSeat && seat.trim() ? seat.trim() : undefined,
      gate: gate.trim() || undefined,
      from: from.trim() || undefined,
      to: to.trim() || undefined,
      rem1Hours: 3,
      rem2Hours: 1,
    });
    setTitle('');
    setSeat('');
    setGate('');
    Alert.alert('已保存', `已加入 ${date} ${time} 的时间线`, [
      { text: '查看行程', onPress: () => navigation.navigate('行程') },
      { text: '继续添加', style: 'cancel' },
    ]);
  };

  const runOcr = (kind: 'flight' | 'train' | 'hotel') => {
    // 模拟识别·非真实 OCR：按类型返回不同预设，不读图片内容。
    const p = OCR_PRESETS[kind];
    setOcrResult(
      `模拟识别结果（${kind}）：${p.flightNo ?? ''} ${p.date ?? ''} ${p.time ?? ''} 座位 ${p.seat ?? '—'} 登机口 ${p.gate ?? '—'} 订单 ${p.orderNo ?? '—'} —— 请核对后确认保存`,
    );
  };

  const saveOcr = () => {
    // 查重：同航班号 + 日期已存在 -> 提示覆盖 / 取消；日期超范围 -> 拒绝。
    const p = OCR_PRESETS.flight;
    if (p.date && !TRIP_DATES.includes(p.date)) {
      Alert.alert('日期超出范围', '识别日期不在 11/21–11/23 行程内，已拒绝保存');
      return;
    }
    const dup = store.events.find((e) => e.flightNo && e.flightNo === p.flightNo && e.date === p.date);
    if (dup) {
      Alert.alert('重复导入', `${p.flightNo} ${p.date} 已存在，是否覆盖？`, [
        { text: '取消', style: 'cancel' },
        {
          text: '覆盖',
          onPress: () => {
            store.updateEvent(dup.id, { time: p.time ?? dup.time, seat: p.seat, gate: p.gate });
            setOcrResult(null);
          },
        },
      ]);
      return;
    }
    store.addEvent({
      day: 1,
      date: p.date ?? '2026-11-21',
      time: p.time ?? '09:15',
      title: `${p.flightNo} · ${p.from} → ${p.to}`,
      type: 'flight',
      flightNo: p.flightNo,
      seat: p.seat,
      gate: p.gate,
      from: p.from,
      to: p.to,
      rem1Hours: 3,
      rem2Hours: 1,
    });
    setOcrResult(null);
  };

  const inputStyle = { backgroundColor: theme.card, borderColor: theme.border, color: theme.text };

  return (
    <ScrollView style={[styles.root, { backgroundColor: theme.bg }]} contentContainerStyle={styles.pad}>
      <Text style={[styles.title, { color: theme.text }]}>手动添加</Text>
      <View style={styles.row}>
        {(Object.keys(TYPE_LABELS) as FormType[]).map((k) => (
          <TouchableOpacity
            key={k}
            onPress={() => setType(k)}
            style={[styles.chip, { backgroundColor: type === k ? theme.primary : theme.card, borderColor: theme.border }]}>
            <Text style={{ color: type === k ? '#fff' : theme.text, fontSize: 12 }}>{TYPE_LABELS[k]}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={[styles.label, { color: theme.muted }]}>日期（仅 11/21–11/23）</Text>
      <View style={styles.row}>
        {TRIP_DATES.map((d) => (
          <TouchableOpacity key={d} onPress={() => setDate(d)} style={[styles.chip, { backgroundColor: date === d ? theme.primary : theme.card, borderColor: theme.border }]}>
            <Text style={{ color: date === d ? '#fff' : theme.text, fontSize: 12 }}>{d}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TextInput value={time} onChangeText={setTime} placeholder="时间 如 09:15" placeholderTextColor={theme.muted} style={[styles.input, inputStyle]} />
      <TextInput value={title} onChangeText={setTitle} placeholder="标题 如 CA1831 北京大兴 → 三亚凤凰" placeholderTextColor={theme.muted} style={[styles.input, inputStyle]} />
      <TextInput value={from} onChangeText={setFrom} placeholder="出发地（可选）" placeholderTextColor={theme.muted} style={[styles.input, inputStyle]} />
      <TextInput value={to} onChangeText={setTo} placeholder="目的地（可选）" placeholderTextColor={theme.muted} style={[styles.input, inputStyle]} />
      {showSeat ? (
        <TextInput value={seat} onChangeText={setSeat} placeholder="座位号（结构化字段）如 18A / 05车12F" placeholderTextColor={theme.muted} style={[styles.input, inputStyle]} />
      ) : (
        <Text style={[styles.note, { color: theme.muted }]}>自驾类型不显示座位号</Text>
      )}
      <TextInput value={gate} onChangeText={setGate} placeholder="登机口 / 检票口 如 C18" placeholderTextColor={theme.muted} style={[styles.input, inputStyle]} />
      <TouchableOpacity onPress={saveManual} style={[styles.btn, { backgroundColor: theme.primary }]}>
        <Text style={styles.btnText}>保存到时间线</Text>
      </TouchableOpacity>

      <Text style={[styles.title2, { color: theme.text }]}>截图识别（模拟）</Text>
      <Text style={[styles.note, { color: theme.muted }]}>
        模拟识别·非真实 OCR：上传图片后按类型返回预设结果，请核对后确认。真 OCR 待接后端。
      </Text>
      <View style={styles.row}>
        <TouchableOpacity onPress={() => runOcr('flight')} style={[styles.chip, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={{ color: theme.text }}>机票示例</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => runOcr('train')} style={[styles.chip, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={{ color: theme.text }}>高铁示例</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => runOcr('hotel')} style={[styles.chip, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={{ color: theme.text }}>酒店示例</Text>
        </TouchableOpacity>
      </View>
      {ocrResult ? (
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={{ color: theme.text, fontSize: 13, lineHeight: 19 }}>{ocrResult}</Text>
          <TouchableOpacity onPress={saveOcr} style={[styles.btn, { backgroundColor: theme.primary, marginTop: 10 }]}>
            <Text style={styles.btnText}>确认保存</Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  pad: { padding: 16, paddingBottom: 32 },
  title: { fontSize: 18, fontWeight: '800' },
  title2: { fontSize: 16, fontWeight: '800', marginTop: 20 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginVertical: 8 },
  chip: { borderRadius: 16, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 7 },
  label: { fontSize: 12, marginTop: 8 },
  input: { borderRadius: 10, borderWidth: 1, padding: 12, marginVertical: 5, fontSize: 14 },
  btn: { borderRadius: 10, padding: 13, alignItems: 'center', marginTop: 10 },
  btnText: { color: '#fff', fontWeight: '700' },
  note: { fontSize: 12, lineHeight: 17, marginVertical: 4 },
  card: { borderRadius: 12, borderWidth: 1, padding: 12, marginTop: 10 },
});
