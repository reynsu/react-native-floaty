import { useState } from 'react';
import {
  Pressable,
  View,
  Text,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import type { FloaterAction, FloaterTheme } from './types';

type Props = {
  actions: FloaterAction[];
  theme: FloaterTheme;
  onSelect: (action: FloaterAction) => void;
  onClose: () => void;
  triggerStyle?: StyleProp<ViewStyle>;
};

export function OverflowPopover({
  actions,
  theme,
  onSelect,
  onClose,
  triggerStyle,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <View>
      <Pressable
        onPress={() => setIsOpen((prev) => !prev)}
        accessibilityRole="button"
        accessibilityLabel="More actions"
        accessibilityState={{ expanded: isOpen }}
        style={({ pressed }) => [
          {
            width: theme.actionH,
            height: theme.actionH,
            borderRadius: theme.radiusInner,
            backgroundColor: pressed ? theme.actionBgPressed : theme.actionBg,
            alignItems: 'center',
            justifyContent: 'center',
          },
          triggerStyle,
        ]}
      >
        <Text style={{ color: theme.fg, fontSize: 20, lineHeight: 22 }}>+</Text>
      </Pressable>
      {isOpen && (
        <View
          style={[
            s.popover,
            {
              backgroundColor: theme.bg,
              borderColor: theme.border,
              borderRadius: theme.radiusInner,
              ...theme.shadow,
            },
          ]}
          accessibilityRole="menu"
        >
          {actions.map((a) => {
            const accessibleName = a.ariaLabel ?? a.label;
            return (
              <Pressable
                key={a.id}
                onPress={() => {
                  if (a.disabled) return;
                  onSelect(a);
                  setIsOpen(false);
                  onClose();
                }}
                disabled={a.disabled}
                accessibilityRole="menuitem"
                accessibilityLabel={accessibleName}
                style={({ pressed }) => ({
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                  borderRadius: 8,
                  backgroundColor:
                    pressed && !a.disabled ? theme.actionBgPressed : 'transparent',
                  opacity: a.disabled ? 0.45 : 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  columnGap: 8,
                })}
              >
                {a.icon}
                {a.label && (
                  <Text
                    style={{
                      color: a.variant === 'danger' ? theme.danger : theme.fg,
                      fontSize: theme.actionFontSize,
                    }}
                  >
                    {a.label}
                  </Text>
                )}
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  popover: {
    position: 'absolute',
    bottom: '100%',
    right: 0,
    marginBottom: 8,
    minWidth: 180,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 6,
    rowGap: 2,
  },
});
