import { tokens as t } from "@/theme/tokens";
import { Pressable, StyleSheet, Text } from "react-native";

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
