import { Button } from "@/components/ui/button";
import { FlowPage } from "@/components/ui/flow-page";
import { Icon } from "@/components/ui/icons";
import { StatusPage } from "@/components/ui/status-page";
import { tokens as t, type } from "@/theme/tokens";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { BodyInput } from "./BodyInput";
import { characters, validBody } from "./body-rules";
import { useWritingSession } from "./writing-session";

// 02.03 글쓰기 시작 · 02.05 빈 글 오류 · 02.06 긴 글 · 02.10 초안 이어쓰기 · 02.11 나가기 확인입니다.
export function EditorScreen({
  onExit,
  onSubmit,
  exitRequested,
  onKeepEditing,
}: {
  onExit: () => void;
  onSubmit: () => void;
  exitRequested: boolean;
  onKeepEditing: () => void;
}) {
  const { draft, clear } = useWritingSession();
  const [resuming, setResuming] = useState(Boolean(draft.body));
  // 빈 본문으로 남기기를 누른 뒤의 오류 표시. 입력하면 바로 사라집니다.
  const [emptyError, setEmptyError] = useState(false);
  const empty = draft.body.trim().length === 0;
  const error = emptyError && empty;
  if (exitRequested)
    return (
      <StatusPage
        icon="pause"
        title="잠시 쉬어갈까요?"
        description={
          "쓰던 마음은 초안으로 남겨둘게요.\n돌아오면 이어서 쓸 수 있어요."
        }
      >
        <Button label="계속 쓰기" onPress={onKeepEditing} />
        <Button variant="secondary" label="나중에 쓰기" onPress={onExit} />
      </StatusPage>
    );
  if (resuming)
    return (
      <StatusPage
        icon="pen"
        title={"쓰다 만\n마음이 있어요."}
        description={
          "쓰던 마음을 이어서 쓸까요?\n새로 시작하면 이전 초안은 사라져요."
        }
      >
        <Button label="이어서 쓰기" onPress={() => setResuming(false)} />
        <Button
          variant="secondary"
          label="새로 시작하기"
          onPress={() => {
            clear();
            setResuming(false);
          }}
        />
      </StatusPage>
    );
  return (
    <FlowPage
      onClose={onExit}
      footer={
        <View style={styles.footer}>
          <Text style={styles.guide}>
            익명으로 공개돼요. 실명·연락처는 적지 말아주세요.
          </Text>
          <Button
            label="이대로 남기기"
            disabled={error}
            onPress={() => {
              if (validBody(draft.body)) onSubmit();
              else setEmptyError(true);
            }}
          />
        </View>
      }
    >
      <View>
        <Text accessibilityRole="header" style={styles.title}>
          그 사람에게{"\n"}하지 못한 말이 있나요?
        </Text>
        <BodyInput error={error} />
        <Text style={styles.count}>
          {characters(draft.body).length.toLocaleString()} / 1,000자
        </Text>
        <Text style={styles.label}>
          배경 <Text style={styles.optional}> (선택)</Text>
        </Text>
        {/* 내 사진 배경(02.04)은 서버 업로드와 기기 사진 선택이 준비되면 연결합니다. 지금은 자리만 둡니다. */}
        <View
          accessibilityRole="button"
          accessibilityLabel="배경 사진 추가"
          accessibilityState={{ disabled: true }}
          style={styles.photo}
        >
          <Icon name="image" size={20} />
        </View>
      </View>
    </FlowPage>
  );
}

const styles = StyleSheet.create({
  // 시안: 제목 위쪽이 헤더 아래 35pt(본문 여백 24 + 11), 입력창은 제목 아래 54pt.
  title: { ...type.heading, color: t.text, marginTop: 11, marginBottom: 54 },
  count: { ...type.caption, color: t.muted, marginTop: 11 },
  label: { ...type.guide, color: t.text, marginTop: 40 },
  optional: { color: t.muted },
  photo: {
    width: 38,
    height: 38,
    borderRadius: 19,
    marginTop: 10,
    backgroundColor: t.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  footer: { paddingHorizontal: t.gutter, paddingBottom: t.gutter, gap: 16 },
  guide: { ...type.caption, color: t.muted, textAlign: "center" },
});
