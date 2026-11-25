import { tokens as t, type } from "@/theme/tokens";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Icon, type IconName } from "./icons";

// TMX / Night / Reaction Button. 배경 위에 놓는 원형 아이콘 버튼과 아래 글자입니다.
// 피드 카드(공감·공유·더보기)와 내 마음 상세(수정·삭제·공유)가 함께 씁니다.
export function CircleAction({
  icon,
  caption,
  label,
  selected = false,
  bright = false,
  onPress,
}: {
  icon: IconName;
  caption: string;
  label: string;
  selected?: boolean;
  // 시안의 수정·삭제는 아래 글자가 밝은 색입니다.
  bright?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !onPress, selected }}
      disabled={!onPress}
      hitSlop={4}
      onPress={onPress}
      style={styles.action}
    >
      <View style={[styles.circle, selected && styles.selected]}>
        <Icon name={icon} color={t.storyText} />
      </View>
      <Text style={[styles.caption, bright && styles.bright]}>{caption}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  action: { alignItems: "center", gap: 6, minWidth: 44 },
  // color/reaction-fill · reaction-stroke · reaction-selected-stroke (#F0E8D9의 4.5% / 14% / 50%)
  circle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(240,232,217,0.14)",
    backgroundColor: "rgba(240,232,217,0.045)",
    alignItems: "center",
    justifyContent: "center",
  },
  selected: { borderColor: "rgba(240,232,217,0.5)" },
  caption: { ...type.micro, color: t.muted },
  bright: { color: t.text },
});
