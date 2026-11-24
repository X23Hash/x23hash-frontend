import { tokens as t } from "@/theme/tokens";
import { StyleSheet, View } from "react-native";
import { Icon } from "./icons";

// 약관 동의·탈퇴 확인의 원형 체크 표시. 누르는 동작은 감싸는 줄이 맡습니다.
export function CheckCircle({ checked }: { checked: boolean }) {
  return (
    <View style={[styles.circle, checked && styles.checked]}>
      {checked && <Icon name="check" size={14} color={t.background} />}
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: t.selected,
    alignItems: "center",
    justifyContent: "center",
  },
  checked: { borderColor: t.text, backgroundColor: t.text },
});
