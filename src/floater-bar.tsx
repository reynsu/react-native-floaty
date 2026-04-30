import { useContext, useCallback } from 'react';
import {
  Modal,
  Pressable,
  Animated,
  View,
  StyleSheet,
} from 'react-native';
import { FloaterContext } from './context';
import { useFloaterActions } from './use-floater-actions';
import { useBarAnimation } from './use-bar-animation';
import { ActionButton } from './action-button';
import { OverflowPopover } from './overflow-popover';
import { rowLayout } from './layouts/row';
import { arcLayout } from './layouts/arc';
import type { FloaterAction } from './types';

const layouts = {
  row: rowLayout,
  arc: arcLayout,
} as const;

export function FloaterBar() {
  const ctx = useContext(FloaterContext);
  const { open, actions, options, hide } = useFloaterActions();
  const position = ctx?.config.position ?? 'bottom';
  const { mounted, translateY, opacity } = useBarAnimation(open, position);

  const handleSelect = useCallback(
    (action: FloaterAction) => {
      if (action.disabled) return;
      action.onSelect();
      if (options.dismissOnSelect !== false) hide();
    },
    [options.dismissOnSelect, hide],
  );

  if (!ctx || !mounted) return null;

  const {
    theme,
    layout,
    maxVisible: cfgMax,
    closeOnOutsideTap,
    closeOnBackPress,
    radius,
  } = ctx.config;
  const maxVisible = options.maxVisible ?? cfgMax;
  const visible = actions.slice(0, maxVisible);
  const overflow = actions.slice(maxVisible);
  const hasOverflow = overflow.length > 0;
  const slotCount = visible.length + (hasOverflow ? 1 : 0);
  const layoutMod = layouts[layout];

  return (
    <Modal
      transparent
      visible={mounted}
      animationType="none"
      onRequestClose={() => {
        if (closeOnBackPress) hide();
      }}
      statusBarTranslucent
    >
      <Pressable
        style={StyleSheet.absoluteFill}
        onPress={closeOnOutsideTap ? hide : undefined}
        accessibilityRole={closeOnOutsideTap ? 'button' : 'none'}
        accessibilityLabel={closeOnOutsideTap ? 'Close floating actions' : undefined}
        importantForAccessibility={closeOnOutsideTap ? 'yes' : 'no-hide-descendants'}
      />
      <View
        style={[
          s.positionWrap,
          position === 'top' ? s.top : s.bottom,
          position === 'bottom'
            ? { paddingBottom: theme.bottomInset }
            : { paddingTop: theme.bottomInset },
        ]}
        pointerEvents="box-none"
      >
        <Animated.View
          style={[
            {
              backgroundColor: theme.bg,
              borderRadius: theme.radius,
              padding: theme.padding,
              columnGap: theme.gap,
              borderWidth: StyleSheet.hairlineWidth,
              borderColor: theme.border,
              ...theme.shadow,
              transform: [{ translateY }],
              opacity,
            },
            layoutMod.barStyle(theme, radius),
          ]}
          accessibilityRole="toolbar"
          accessibilityLabel="Floating actions"
        >
          {visible.map((a, i) => (
            <ActionButton
              key={a.id}
              action={a}
              theme={theme}
              style={layoutMod.actionStyle(i, slotCount, theme, radius)}
              onPress={() => handleSelect(a)}
            />
          ))}
          {hasOverflow && (
            <OverflowPopover
              actions={overflow}
              theme={theme}
              onSelect={(a) => {
                if (!a.disabled) a.onSelect();
              }}
              onClose={() => {
                if (options.dismissOnSelect !== false) hide();
              }}
              triggerStyle={layoutMod.actionStyle(
                visible.length,
                slotCount,
                theme,
                radius,
              )}
            />
          )}
        </Animated.View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  positionWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  bottom: { bottom: 0 },
  top: { top: 0 },
});
