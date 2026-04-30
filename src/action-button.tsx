import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import type { FloaterAction, FloaterTheme } from './types';

type Props = {
  action: FloaterAction;
  theme: FloaterTheme;
  style?: StyleProp<ViewStyle>;
  onPress: () => void;
  /**
   * Suppress label rendering even if the action has one. Used by layouts that
   * are icon-only by design (e.g. radial). The label still backs the
   * accessibility name.
   */
  forceIconOnly?: boolean;
  /**
   * Render as a self-contained "floating chip": opaque bg + border + shadow.
   * Used when the bar's own bg is hidden (radial layout) so each button
   * stands on its own visually.
   */
  floating?: boolean;
};

export function ActionButton({
  action,
  theme,
  style,
  onPress,
  forceIconOnly,
  floating,
}: Props) {
  const hasLabel = !forceIconOnly && Boolean(action.label);
  const hasIcon = action.icon != null;
  const accessibleName = action.ariaLabel ?? action.label;
  const isDanger = action.variant === 'danger';
  const iconOnly = hasIcon && !hasLabel;

  return (
    <Pressable
      onPress={onPress}
      disabled={action.disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibleName}
      accessibilityState={{ disabled: !!action.disabled }}
      style={({ pressed }) => {
        const baseBg = floating ? theme.bg : theme.actionBg;
        const pressedBg = floating ? theme.bg : theme.actionBgPressed;
        const opacity = action.disabled
          ? 0.45
          : pressed && floating
            ? 0.72 // floating chips dim on press; flat buttons swap bg
            : 1;
        return [
          {
            height: theme.actionH,
            paddingHorizontal: hasLabel ? theme.actionPx : 0,
            paddingVertical: hasLabel ? theme.actionPy : 0,
            borderRadius: iconOnly ? theme.actionH / 2 : theme.radiusInner,
            backgroundColor: pressed && !action.disabled ? pressedBg : baseBg,
            opacity,
            flex: iconOnly ? 0 : 1,
            width: iconOnly ? theme.actionH : undefined,
            flexDirection: 'row' as const,
            alignItems: 'center' as const,
            justifyContent: 'center' as const,
            columnGap: 6,
            ...(floating
              ? {
                  borderWidth: StyleSheet.hairlineWidth,
                  borderColor: theme.border,
                  ...theme.shadow,
                }
              : null),
          },
          style,
        ];
      }}
    >
      {hasIcon && <View>{action.icon}</View>}
      {hasLabel && (
        <Text
          numberOfLines={1}
          ellipsizeMode="tail"
          style={{
            color: isDanger ? theme.danger : theme.fg,
            fontSize: theme.actionFontSize,
            fontWeight: theme.actionFontWeight,
          }}
        >
          {action.label}
        </Text>
      )}
    </Pressable>
  );
}
