import { tokens as t, type } from "@/theme/tokens";
import type { PropsWithChildren, ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { FlowPage } from "./flow-page";
import { Icon, type IconName } from "./icons";

// 확인·진행·완료·실패·빈 상태 화면의 공통 구성(예: 02.07–02.13, 04.01, 05.04, 06.09, 07.01).
// 아이콘 원 → 제목 → 설명을 헤더 아래 고정 위치에 두고, 버튼(children)은 화면 하단에 붙입니다.
// 시안의 화면군마다 블록이 시작하는 높이가 달라 top으로 받습니다(본문 여백 24를 뺀 값).
export const statusTop = {
  writing: 125, // 02 글쓰기: 아이콘이 헤더 아래 149pt
  manage: 145, // 05 MY · 06 마음 관리: 169pt
  notice: 167, // 04 알림: 191pt
  plain: 92, // 07 로그인 · 08.06: 아이콘 없이 제목이 118pt
} as const;

export function StatusPage({
  icon,
  iconColor = t.text,
  top = statusTop.writing,
  title,
  description,
  inline,
  onBack,
  onClose,
  children,
}: PropsWithChildren<{
  // 아이콘이 없으면 제목이 아이콘 자리에서 시작합니다(05.04, 07.01).
  icon?: IconName;
  iconColor?: string;
  top?: number;
  title: string;
  description?: string;
  // 설명 아래 본문 안에 놓는 작은 버튼(예: 로그인하기, 다시 불러오기)
  inline?: ReactNode;
  onBack?: () => void;
  onClose?: () => void;
}>) {
  return (
    <FlowPage
      onBack={onBack}
      onClose={onClose}
      footer={children && <View style={styles.actions}>{children}</View>}
    >
      <View style={{ paddingTop: top }}>
        {icon && (
          <View style={styles.icon}>
            <Icon name={icon} size={26} color={iconColor} />
          </View>
        )}
        <Text
          accessibilityRole="header"
          style={[styles.title, !icon && styles.bare]}
        >
          {title}
        </Text>
        {description && <Text style={styles.description}>{description}</Text>}
        {inline && <View style={styles.inline}>{inline}</View>}
      </View>
    </FlowPage>
  );
}

const styles = StyleSheet.create({
  icon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: t.raised,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { ...type.heading, color: t.text, marginTop: 16 },
  bare: { marginTop: 2 },
  description: { ...type.guide, color: t.muted, marginTop: 16 },
  inline: { marginTop: 24 },
  actions: { paddingHorizontal: t.gutter, paddingBottom: t.gutter, gap: 12 },
});
