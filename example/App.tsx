import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  FloaterActionsProvider,
  useFloaterActions,
  type FloaterAction,
  type FloaterLayout,
} from 'react-native-floaty';

const glyph = { fontSize: 18, color: '#111' } as const;

const sampleActions: FloaterAction[] = [
  { id: 'archive', label: 'Archive', onSelect: () => {} },
  { id: 'read', label: 'Mark read', onSelect: () => {} },
  { id: 'delete', label: 'Delete', variant: 'danger', onSelect: () => {} },
  { id: 'snooze', label: 'Snooze', onSelect: () => {} },
  { id: 'label', label: 'Label', onSelect: () => {} },
];

const iconOnlyActions: FloaterAction[] = [
  { id: 'heart', icon: <Text style={glyph}>♥</Text>, ariaLabel: 'Like', onSelect: () => {} },
  { id: 'star', icon: <Text style={glyph}>★</Text>, ariaLabel: 'Star', onSelect: () => {} },
  { id: 'pin', icon: <Text style={glyph}>📍</Text>, ariaLabel: 'Pin', onSelect: () => {} },
  { id: 'share', icon: <Text style={glyph}>↗</Text>, ariaLabel: 'Share', onSelect: () => {} },
];

function Demo() {
  const { show } = useFloaterActions();
  const [pressedAction, setPressedAction] = useState<string>('—');

  const liveActions = sampleActions.map((a) => ({
    ...a,
    onSelect: () => setPressedAction(a.label!),
  }));

  return (
    <ScrollView contentContainerStyle={s.screen}>
      <Text style={s.h1}>react-native-floaty</Text>
      <Text style={s.muted}>Tap a trigger to summon the bar.</Text>

      <Trigger label="3 actions" onPress={() => show(liveActions.slice(0, 3))} />
      <Trigger label="5 actions (overflow)" onPress={() => show(liveActions)} />
      <Trigger
        label="Icon-only"
        onPress={() => show(iconOnlyActions, { maxVisible: 4 })}
      />
      <Trigger
        label="Stay open (dismissOnSelect: false)"
        onPress={() => show(liveActions.slice(0, 3), { dismissOnSelect: false })}
      />
      <Trigger
        label="Disabled item"
        onPress={() =>
          show([
            { id: 'a', label: 'Available', onSelect: () => setPressedAction('Available') },
            { id: 'd', label: 'Disabled', disabled: true, onSelect: () => setPressedAction('SHOULD NOT FIRE') },
          ])
        }
      />

      <View style={s.statusBox}>
        <Text style={s.statusLabel}>Last action</Text>
        <Text style={s.statusValue}>{pressedAction}</Text>
      </View>
    </ScrollView>
  );
}

function Trigger({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [s.trigger, pressed && s.triggerPressed]}
    >
      <Text style={s.triggerLabel}>{label}</Text>
    </Pressable>
  );
}

const LAYOUTS: { name: string; layout: FloaterLayout; theme?: object; radius?: number }[] = [
  { name: 'Default (row)', layout: 'row' },
  {
    name: 'Dark theme (row)',
    layout: 'row',
    theme: {
      bg: '#1a1d24',
      fg: '#fff',
      border: 'rgba(255,255,255,0.08)',
      actionBg: 'rgba(255,255,255,0.06)',
      actionBgPressed: 'rgba(255,255,255,0.16)',
      radius: 24,
    },
  },
  { name: 'Radial layout', layout: 'radial', radius: 90 },
];

export default function App() {
  const [variantIndex, setVariantIndex] = useState(0);
  const variant = LAYOUTS[variantIndex]!;

  return (
    <View style={s.root}>
      <StatusBar style="auto" />
      <View style={s.layoutPicker}>
        {LAYOUTS.map((l, i) => (
          <Pressable
            key={l.name}
            onPress={() => setVariantIndex(i)}
            style={[s.pill, i === variantIndex && s.pillActive]}
          >
            <Text style={[s.pillText, i === variantIndex && s.pillTextActive]}>
              {l.name}
            </Text>
          </Pressable>
        ))}
      </View>
      <FloaterActionsProvider
        key={variant.name}
        layout={variant.layout}
        radius={variant.radius}
        theme={variant.theme}
        maxVisible={3}
      >
        <Demo />
      </FloaterActionsProvider>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f7f7f9', paddingTop: 60 },
  screen: { padding: 24, gap: 12 },
  h1: { fontSize: 28, fontWeight: '700', color: '#111', marginBottom: 4 },
  muted: { color: '#666', marginBottom: 12 },
  trigger: {
    backgroundColor: '#111',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  triggerPressed: { backgroundColor: '#333' },
  triggerLabel: { color: '#fff', fontWeight: '600', fontSize: 15 },
  statusBox: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e7e7eb',
  },
  statusLabel: { color: '#888', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.6 },
  statusValue: { fontSize: 18, fontWeight: '600', color: '#111', marginTop: 4 },
  layoutPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 24,
    paddingBottom: 12,
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#d8d8df',
    backgroundColor: '#fff',
  },
  pillActive: { backgroundColor: '#111', borderColor: '#111' },
  pillText: { color: '#444', fontSize: 12, fontWeight: '500' },
  pillTextActive: { color: '#fff' },
});
