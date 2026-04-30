import { useContext, useCallback, useEffect, useMemo, useRef } from 'react';
import {
  Modal,
  Pressable,
  Animated,
  View,
  StyleSheet,
  type ViewStyle,
} from 'react-native';
import { FloaterContext } from './context';
import { useFloaterApi, useFloaterState } from './use-floater-actions';
import { useBarAnimation } from './use-bar-animation';
import { ActionButton } from './action-button';
import { OverflowPopover } from './overflow-popover';
import { rowLayout } from './layouts/row';
import { radialLayout } from './layouts/radial';
import type { LayoutModule } from './layouts/types';
import type { FloaterAction, FloaterLayout } from './types';
import { warnDev } from './warn';

const layouts: Record<FloaterLayout, LayoutModule> = {
  row: rowLayout,
  radial: radialLayout,
};

export function FloaterBar() {
  const ctx = useContext(FloaterContext);
  const { open, actions, options } = useFloaterState();
  const { hide } = useFloaterApi();
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

  // Static (non-animated) part of the bar style — only changes when theme,
  // layout, or radius change. Pulled out of render so we don't rebuild a
  // 12-key style object on every animation frame's commit.
  const theme = ctx?.config.theme;
  const layout = ctx?.config.layout;
  const radius = ctx?.config.radius;
  const layoutMod = layout ? layouts[layout] : null;

  const staticBarStyle = useMemo<ViewStyle | null>(() => {
    if (!theme || !layoutMod || radius == null) return null;
    return {
      backgroundColor: theme.bg,
      borderRadius: theme.radius,
      padding: theme.padding,
      columnGap: theme.gap,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.border,
      ...theme.shadow,
      ...layoutMod.barStyle(theme, radius),
    };
  }, [theme, layoutMod, radius]);

  // Pre-compute per-button layout styles once per (layout, slotCount, theme.actionH, radius).
  const maxVisibleResolved =
    options.maxVisible ?? ctx?.config.maxVisible ?? 3;
  const slotCount = useMemo(() => {
    const visibleCount = Math.min(actions.length, maxVisibleResolved);
    const hasOverflow = actions.length > maxVisibleResolved;
    return visibleCount + (hasOverflow ? 1 : 0);
  }, [actions.length, maxVisibleResolved]);

  const actionStyles = useMemo<ViewStyle[]>(() => {
    if (!theme || !layoutMod || radius == null || slotCount === 0) return [];
    return Array.from({ length: slotCount }, (_, i) =>
      layoutMod.actionStyle(i, slotCount, theme, radius),
    );
  }, [theme, layoutMod, radius, slotCount]);

  // Dev-only: warn once per show() when an icon-only layout receives actions
  // with labels. The labels are still set as accessibilityLabel; they just
  // don't render visually.
  const warnedSetRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    if (!open || !layoutMod?.iconOnly) return;
    for (const a of actions) {
      if (a.label && !warnedSetRef.current.has(a.id)) {
        warnedSetRef.current.add(a.id);
        warnDev(
          `action "${a.id}" has a label but the "${layout}" layout is icon-only — label suppressed (kept as accessibilityLabel)`,
        );
      }
    }
  }, [open, actions, layout, layoutMod]);

  if (!ctx || !mounted || !theme || !staticBarStyle || !layoutMod) return null;

  const { closeOnOutsideTap, closeOnBackPress } = ctx.config;
  const visible = actions.slice(0, maxVisibleResolved);
  const overflow = actions.slice(maxVisibleResolved);
  const hasOverflow = overflow.length > 0;
  const forceIconOnly = layoutMod.iconOnly;
  const floating = layoutMod.floatingButtons;

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
          style={[staticBarStyle, { transform: [{ translateY }], opacity }]}
          accessibilityRole="toolbar"
          accessibilityLabel="Floating actions"
        >
          {layoutMod.ornament?.(theme, radius!)}
          {visible.map((a, i) => (
            <ActionButton
              key={a.id}
              action={a}
              theme={theme}
              style={actionStyles[i]}
              onPress={() => handleSelect(a)}
              forceIconOnly={forceIconOnly}
              floating={floating}
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
              triggerStyle={actionStyles[visible.length]}
              floating={floating}
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
