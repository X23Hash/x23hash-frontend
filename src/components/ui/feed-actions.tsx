import { tokens as t } from "@/theme/tokens";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Icon, type IconName } from "./icons";

export function IconButton({
  icon,
  label,
  caption,
  bright = false,
  active = false,
  badge = false,
  onPress,
}: {
  onPress?: () => void;
  icon: IconName;
  label: string;
  caption?: string;
  bright?: boolean;
  // 선택 상태(예: 공감한 글의 하트 채움)
  active?: boolean;
  // 우상단 점(예: 안 읽은 알림)
  badge?: boolean;
}) {
  return (
    <View style={styles.action}>
      <Pressable
        onPress={onPress}
        disabled={!onPress}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ disabled: !onPress, selected: active }}
        style={[styles.icon, bright && styles.bright]}
      >
        <Icon
          name={active && icon === "heart" ? "heart-filled" : icon}
          color={bright ? t.background : t.text}
        />
        {badge && <View style={styles.badge} />}
      </Pressable>
      {caption && <Text style={styles.caption}>{caption}</Text>}
    </View>
  );
}
export function ActionButton({
  label,
  onPress,
  disabled = false,
}: {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || !onPress }}
      disabled={disabled || !onPress}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        (disabled || !onPress) && { opacity: 0.45 },
        pressed && { opacity: 0.7 },
      ]}
    >
      <Text style={styles.buttonText}>{label}</Text>
    </Pressable>
  );
}
const styles = StyleSheet.create({
  action: { alignItems: "center", gap: 5 },
  icon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: t.line,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(48,45,39,0.45)",
  },
  bright: { backgroundColor: t.text, borderColor: t.text },
  badge: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#d8b98a",
  },
  caption: { color: t.muted, fontSize: 11, fontFamily: t.sans },
  button: {
    minHeight: 48,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: t.line,
    alignSelf: "flex-start",
    backgroundColor: t.surface,
  },
  buttonText: { fontFamily: t.sans, color: t.text, fontSize: 14 },
});
