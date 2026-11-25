import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { FlowPage } from "@/components/ui/flow-page";
import { Icon } from "@/components/ui/icons";
import { tokens as t, type } from "@/theme/tokens";
import Constants from "expo-constants";
import { Children, useState, type ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

// 08.01 설정과 08.04 로그아웃 확인 시트입니다. 계정·문의 값은 서버 설정 조회 결과를 표시합니다.
function Row({
  label,
  value,
  danger = false,
  right,
  onPress,
}: {
  label: string;
  value?: string;
  danger?: boolean;
  // 값·화살표 대신 놓는 요소(예: 스위치)
  right?: ReactNode;
  onPress?: () => void;
}) {
  return (
    <Pressable
      accessibilityRole={onPress ? "button" : undefined}
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && { opacity: 0.7 }]}
    >
      <Text style={[styles.rowLabel, danger && { color: t.danger }]}>
        {label}
      </Text>
      {right ??
        (value ? (
          <Text style={styles.value}>{value}</Text>
        ) : (
          onPress && <Icon name="caret" size={16} color={t.muted} />
        ))}
    </Pressable>
  );
}
function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>{title}</Text>
      <View style={styles.card}>
        {Children.toArray(children).map((child, index) => (
          <View key={index} style={[styles.item, index > 0 && styles.divided]}>
            {child}
          </View>
        ))}
      </View>
    </View>
  );
}

export function SettingsScreen({
  account,
  supportEmail,
  onBack,
  onLegal,
  onContact,
  onLogout,
  onDeleteAccount,
}: {
  // 서버 설정 조회 결과. 조회 전·실패 시에는 자리 문구를 표시합니다.
  account?: string;
  supportEmail?: string;
  onBack: () => void;
  onLegal: (kind: "terms" | "privacy") => void;
  onContact: (email: string) => void;
  onLogout: () => void;
  onDeleteAccount: () => void;
}) {
  const [confirming, setConfirming] = useState(false);
  return (
    <>
      <FlowPage onBack={onBack}>
        <View style={styles.sections}>
          <Section title="계정">
            <Row
              label={account ?? "로그인 계정"}
              value={account ? "로그인됨" : "불러오는 중"}
            />
          </Section>
          <Section title="알림">
            {/* 푸시는 아직 지원하지 않아 꺼진 채 잠긴 스위치로 둡니다. 권한·구독·서버 저장이 준비되면 연결합니다. */}
            <Row
              label="푸시 알림"
              right={
                <View
                  accessibilityRole="switch"
                  accessibilityLabel="푸시 알림"
                  accessibilityState={{ checked: false, disabled: true }}
                  style={styles.switch}
                >
                  <View style={styles.knob} />
                </View>
              }
            />
          </Section>
          <Section title="안내">
            <Row label="이용약관" onPress={() => onLegal("terms")} />
            <Row label="개인정보 처리방침" onPress={() => onLegal("privacy")} />
            {supportEmail ? (
              <Row label="문의하기" onPress={() => onContact(supportEmail)} />
            ) : (
              <Row label="문의하기" value="준비 중" />
            )}
            <Row
              label="버전"
              value={Constants.expoConfig?.version ?? "1.0.0"}
            />
          </Section>
          <Section title="계정 관리">
            <Row label="로그아웃" onPress={() => setConfirming(true)} />
            <Row danger label="탈퇴하기" onPress={onDeleteAccount} />
          </Section>
        </View>
      </FlowPage>
      <BottomSheet visible={confirming} onClose={() => setConfirming(false)}>
        <Text accessibilityRole="header" style={styles.title}>
          로그아웃할까요?
        </Text>
        <Text style={styles.description}>
          다시 로그인하면 남긴 마음을 다시 볼 수 있어요.
        </Text>
        <View style={styles.buttons}>
          <Button label="로그아웃" onPress={onLogout} />
          <Button
            variant="secondary"
            label="취소"
            onPress={() => setConfirming(false)}
          />
        </View>
      </BottomSheet>
    </>
  );
}
const styles = StyleSheet.create({
  // 시안: 구역 라벨 아래 6pt에 카드, 카드 아래 18pt에 다음 라벨. 줄 높이 52.
  sections: { gap: 18 },
  section: { gap: 6 },
  sectionLabel: { ...type.caption, color: t.muted },
  card: { borderRadius: 20, backgroundColor: t.surface, overflow: "hidden" },
  // 구분선은 줄 높이 52 안에 포함합니다.
  item: { height: 52 },
  divided: { borderTopWidth: 1, borderTopColor: t.line },
  row: {
    flex: 1,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rowLabel: { ...type.choice, color: t.text },
  value: { ...type.choice, color: t.muted },
  switch: {
    width: 44,
    height: 24,
    borderRadius: 12,
    padding: 3,
    backgroundColor: t.line,
  },
  knob: { width: 18, height: 18, borderRadius: 9, backgroundColor: t.selected },
  title: { ...type.dialogTitle, color: t.text },
  description: { ...type.guide, color: t.muted },
  buttons: { gap: 16, marginTop: -2 },
});
