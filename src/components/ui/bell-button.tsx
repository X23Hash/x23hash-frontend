import { tokens as t } from "@/theme/tokens";
import { Pressable, StyleSheet, View } from "react-native";
import { Icon } from "./icons";

// 헤더 오른쪽 끝의 알림 벨. 안 읽은 알림이 있으면 점을 얹습니다.
export function BellButton({
  dot = false,
  onPress,
}: {
  dot?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={dot ? "알림 · 안 읽은 알림 있음" : "알림"}
      disabled={!onPress}
      onPress={onPress}
      style={styles.bell}
    >
      <Icon name="bell" />
      {dot && <View style={styles.dot} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bell: { width: 48, height: 44, alignItems: "center", justifyContent: "center" },
  dot: {
    position: "absolute",
    top: 8,
    right: 9,
    width: 9,
    height: 9,
    borderRadius: 4.5,
    borderWidth: 1.5,
    borderColor: t.background,
    backgroundColor: t.text,
  },
});
