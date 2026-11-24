import { tokens as t, type } from "@/theme/tokens";
import type { PropsWithChildren } from "react";
import { StyleSheet, Text, View } from "react-native";
import { FlowPage } from "./flow-page";
import { Icon, type IconName } from "./icons";

// 확인·진행·완료·실패 화면의 공통 구성(예: 02.07–02.13).
// 아이콘 원 → 제목 → 설명을 헤더 아래 고정 위치에 두고, 버튼(children)은 화면 하단에 붙입니다.
export function StatusPage({
  icon,
  iconColor = t.text,
  title,
  description,
  onBack,
  onClose,
  children,
}: PropsWithChildren<{
  icon: IconName;
  iconColor?: string;
  title: string;
  description?: string;
  onBack?: () => void;
  onClose?: () => void;
}>) {
  return (
    <FlowPage
      onBack={onBack}
      onClose={onClose}
      footer={<View style={styles.actions}>{children}</View>}
    >
      <View style={styles.block}>
        <View style={styles.icon}>
          <Icon name={icon} size={26} color={iconColor} />
        </View>
        <Text accessibilityRole="header" style={styles.title}>
          {title}
        </Text>
        {description && <Text style={styles.description}>{description}</Text>}
      </View>
    </FlowPage>
  );
}

const styles = StyleSheet.create({
  // 시안: 아이콘 원의 위쪽이 헤더 아래 149pt. 본문 여백 24를 뺀 값입니다.
  block: { paddingTop: 125 },
  icon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: t.raised,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { ...type.heading, color: t.text, marginTop: 16 },
  description: { ...type.guide, color: t.muted, marginTop: 16 },
  actions: { paddingHorizontal: t.gutter, paddingBottom: t.gutter, gap: 12 },
});
