import { Button } from "@/components/ui/button";
import { CheckCircle } from "@/components/ui/check-circle";
import { FlowPage } from "@/components/ui/flow-page";
import { StatusPage, statusTop } from "@/components/ui/status-page";
import { tokens as t, type } from "@/theme/tokens";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

const notices = [
  "내가 남긴 마음과 공감이 모두 삭제돼요.",
  "알림과 계정 정보가 삭제돼요.",
  "삭제한 내용은 되돌릴 수 없어요.",
];

// 08.05 탈퇴 안내·확인과 08.06 완료입니다. 서버가 삭제를 확인한 뒤에만 완료를 표시합니다.
export function DeleteAccountScreen({
  onBack,
  onFinish,
  // 같은 탈퇴 시도(operationId)의 요청·결과 확인을 라우트가 구현합니다.
  withdraw,
}: {
  onBack: () => void;
  onFinish: () => void;
  withdraw: () => Promise<void>;
}) {
  const [checked, setChecked] = useState(false);
  const [phase, setPhase] = useState<"confirm" | "busy" | "failed" | "done">(
    "confirm",
  );
  const busy = phase === "busy";
  const run = () => {
    setPhase("busy");
    withdraw()
      .then(() => setPhase("done"))
      .catch(() => setPhase("failed"));
  };
  if (phase === "done")
    return (
      <StatusPage top={statusTop.plain} title="탈퇴했어요.">
        <Button label="처음으로" onPress={onFinish} />
      </StatusPage>
    );
  return (
    <FlowPage
      onBack={busy ? undefined : onBack}
      footer={
        <View style={styles.footer}>
          <Button label="계속 사용하기" disabled={busy} onPress={onBack} />
          <Button
            variant="dangerSecondary"
            busy={busy}
            label={
              busy
                ? "탈퇴하는 중…"
                : phase === "failed"
                  ? "다시 시도하기"
                  : "탈퇴하기"
            }
            disabled={!checked}
            onPress={run}
          />
        </View>
      }
    >
      <View>
        <Text accessibilityRole="header" style={styles.title}>
          탈퇴하기 전에{"\n"}확인해 주세요.
        </Text>
        <View style={styles.card}>
          {notices.map((notice) => (
            <Text key={notice} style={styles.notice}>
              {notice}
            </Text>
          ))}
        </View>
        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked, disabled: busy }}
          disabled={busy}
          onPress={() => setChecked((previous) => !previous)}
          style={styles.confirm}
        >
          <CheckCircle checked={checked} />
          <Text style={styles.confirmLabel}>위 내용을 확인했어요.</Text>
        </Pressable>
        {phase === "failed" && (
          <Text accessibilityRole="alert" style={styles.failure}>
            탈퇴를 처리하지 못했어요.{"\n"}연결을 확인하고 다시 시도해 주세요.
          </Text>
        )}
      </View>
    </FlowPage>
  );
}

const styles = StyleSheet.create({
  // 시안: 제목이 헤더 아래 35pt(본문 여백 24 + 11), 카드는 제목 아래 6pt, 확인 줄은 카드 아래 7pt.
  title: { ...type.heading, color: t.text, marginTop: 11 },
  card: {
    marginTop: 6,
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 14,
    borderRadius: 20,
    backgroundColor: t.surface,
  },
  notice: { ...type.choice, color: t.text },
  confirm: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 7,
  },
  confirmLabel: { ...type.choice, color: t.text },
  failure: { ...type.guide, color: t.danger, marginTop: 12 },
  footer: { paddingHorizontal: t.gutter, paddingBottom: t.gutter, gap: 12 },
});
