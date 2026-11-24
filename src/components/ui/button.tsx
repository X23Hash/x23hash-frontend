import { tokens as t, type } from "@/theme/tokens";
import { Pressable, StyleSheet, Text } from "react-native";

// TMX / Night / Button. Loading은 primary에 진행 문구(label)를 넣고 busy로 잠급니다.
export type ButtonVariant =
  | "primary"
  | "secondary"
  | "danger"
  | "dangerSecondary"
  | "text";

const fill: Record<ButtonVariant, string> = {
  primary: t.text,
  secondary: t.raised,
  danger: t.danger,
  dangerSecondary: t.raised,
  text: "transparent",
};
const ink: Record<ButtonVariant, string> = {
  primary: t.background,
  secondary: t.text,
  danger: t.background,
  dangerSecondary: t.danger,
  text: t.muted,
};

export function Button({
  label,
  variant = "primary",
  small = false,
  disabled = false,
  busy = false,
  onPress,
}: {
  label: string;
  variant?: ButtonVariant;
  // 본문 안에 놓는 작은 버튼(예: 다시 불러오기, 로그인하기). 글자 폭에 맞춥니다.
  small?: boolean;
  disabled?: boolean;
  busy?: boolean;
  onPress?: () => void;
}) {
  const locked = disabled || busy || !onPress;
  // Disabled 변형은 surface 바탕에 흐린 글자입니다. 진행 중(busy)은 색을 유지합니다.
  const dimmed = (disabled || !onPress) && !busy && variant !== "text";
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: locked, busy }}
      disabled={locked}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        small && styles.small,
        { backgroundColor: dimmed ? t.surface : fill[variant] },
        pressed && { opacity: 0.7 },
      ]}
    >
      <Text
        style={[
          styles.label,
          small && styles.smallLabel,
          { color: dimmed ? t.selected : ink[variant] },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignSelf: "stretch",
    height: 48,
    borderRadius: 24,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  small: { alignSelf: "flex-start", height: 36, paddingHorizontal: 20 },
  label: { ...type.button },
  smallLabel: { fontSize: 13 },
});
