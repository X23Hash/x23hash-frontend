import { Button } from "@/components/ui/button";
import { FlowPage } from "@/components/ui/flow-page";
import { StatusPage } from "@/components/ui/status-page";
import { ApiError } from "@/lib/api";
import { tokens as t, type } from "@/theme/tokens";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { BodyInput } from "./BodyInput";
import { characters, validBody } from "./body-rules";
import { useWritingSession } from "./writing-session";

// 05.06 수정 / 본문 수정. 기존 본문으로 시작하는 별도 세션(WritingSessionProvider initialBody) 안에서 씁니다.
// 저장 실패는 02.12 구성을 다시 씁니다. 쓰던 내용은 그대로 두고 다시 시도하거나 돌아가서 고칩니다.
export function EditScreen({
  original,
  save,
  onBack,
}: {
  original: string;
  // 성공하면 호출한 쪽이 완료 화면(05.07)으로 넘깁니다.
  save: (body: string) => Promise<void>;
  onBack: () => void;
}) {
  const { draft } = useWritingSession();
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);
  // 변경이 없으면 저장하지 않습니다(자료: 변경 없으면 호출 안 함).
  const changed = draft.body !== original;
  const submit = () => {
    if (busy) return;
    setBusy(true);
    save(draft.body).catch((error) => {
      setBusy(false);
      setFailure(
        error instanceof ApiError && error.code !== "NETWORK"
          ? error.message
          : "쓰던 내용은 그대로 있어요.\n연결을 확인하고 다시 시도해 주세요.",
      );
    });
  };
  if (failure)
    return (
      <StatusPage
        icon="alert-error"
        iconColor={t.danger}
        title="남기지 못했어요."
        description={failure}
        onBack={() => setFailure(null)}
      >
        <Button
          busy={busy}
          label={busy ? "다시 남기는 중…" : "다시 시도하기"}
          onPress={submit}
        />
        <Button
          variant="secondary"
          label="돌아가서 수정하기"
          disabled={busy}
          onPress={() => setFailure(null)}
        />
      </StatusPage>
    );
  return (
    <FlowPage
      onBack={onBack}
      footer={
        <View style={styles.footer}>
          <Button
            busy={busy}
            label={busy ? "수정하는 중…" : "수정하기"}
            disabled={!changed || !validBody(draft.body)}
            onPress={submit}
          />
        </View>
      }
    >
      <View>
        <Text style={styles.label}>EDIT</Text>
        <Text accessibilityRole="header" style={styles.title}>
          남긴 마음을{"\n"}수정해 주세요.
        </Text>
        <BodyInput />
        <Text style={styles.count}>
          {characters(draft.body).length.toLocaleString()} / 1,000자
        </Text>
      </View>
    </FlowPage>
  );
}

const styles = StyleSheet.create({
  // 시안: 라벨이 헤더 아래 34pt(본문 여백 24 + 10), 제목은 라벨 아래 18pt, 입력창은 제목 아래 18pt.
  label: { ...type.caption, color: t.muted, marginTop: 10 },
  title: { ...type.heading, color: t.text, marginTop: 18, marginBottom: 18 },
  count: { ...type.caption, color: t.muted, marginTop: 11 },
  footer: { paddingHorizontal: t.gutter, paddingBottom: t.gutter },
});
