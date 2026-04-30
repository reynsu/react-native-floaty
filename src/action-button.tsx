import { Pressable, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import type { FloaterAction, FloaterTheme } from './types';

type Props = {
  action: FloaterAction;
  theme: FloaterTheme;
  style?: StyleProp<ViewStyle>;
  onPress: () => void;
};

export function ActionButton({ action, theme, style, onPress }: Props) {
  const hasLabel = Boolean(action.label);
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
      style={({ pressed }) => [
        {
          height: theme.actionH,
          paddingHorizontal: hasLabel ? theme.actionPx : 0,
          paddingVertical: hasLabel ? theme.actionPy : 0,
          borderRadius: iconOnly ? theme.actionH / 2 : theme.radiusInner,
          backgroundColor: pressed && !action.disabled ? theme.actionBgPressed : theme.actionBg,
          opacity: action.disabled ? 0.45 : 1,
          flex: iconOnly ? 0 : 1,
          width: iconOnly ? theme.actionH : undefined,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          columnGap: 6,
        },
        style,
      ]}
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
