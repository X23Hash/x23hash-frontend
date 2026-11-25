import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { FlowPage } from "@/components/ui/flow-page";
import { holdOverlay } from "@/components/ui/overlay-state";
import { StatusPage, statusTop } from "@/components/ui/status-page";
import { ApiError } from "@/lib/api";
import type { ReportReason } from "@/features/posts/types";
import { tokens as t, type } from "@/theme/tokens";
import { useEffect, useState, type PropsWithChildren } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

// 06.01–06.08 공유·더보기 시트와 숨기기·신고·차단 화면. 실제 저장 동작은 라우트가 actions로 주입합니다.
export type SheetMode =
  | "share"
  | "copied"
  | "manage"
  | "hide"
  | "hidden"
  | "report"
  | "reported"
  | "block";

export type SheetActions = {
  // 게스트는 로컬 저장, 로그인 사용자는 서버 저장을 라우트가 구현합니다.
  hide: () => Promise<void>;
  report: (reason: ReportReason) => Promise<{ alreadyReported: boolean }>;
  block: () => Promise<void>;
};

const reasons: { code: ReportReason; label: string }[] = [
  { code: "PRIVACY", label: "개인정보가 드러나 있어요" },
  { code: "ABUSE", label: "욕설·혐오 표현이 있어요" },
  { code: "SPAM", label: "광고·반복 게시글이에요" },
  { code: "OTHER", label: "기타" },
];

const errorText = (error: unknown) => {
  if (error instanceof ApiError) {
    if (error.retryAfter)
      return `${error.message} ${error.retryAfter}초 뒤에 다시 시도할 수 있어요.`;
    return error.message;
  }
  return "요청하지 못했어요. 연결을 확인하고 다시 시도해 주세요.";
};

export function StorySheets({
  storyId,
  shareUrl,
  mode,
  guest = false,
  onRequireLogin,
  actions,
  onChange,
  onClose,
}: {
  storyId: string;
  shareUrl?: string;
  mode: SheetMode;
  // 게스트의 신고·차단은 로그인(07.03)부터 진행하고, 숨김은 로컬 저장을 허용합니다.
  guest?: boolean;
  onRequireLogin?: (intent: "report" | "block") => void;
  actions?: SheetActions;
  onChange: (mode: SheetMode) => void;
  onClose: () => void;
}) {
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [alreadyReported, setAlreadyReported] = useState(false);
  const run = (
    task: (() => Promise<void>) | undefined,
    onDone: () => void,
  ) => {
    if (!task || busy) return;
    setBusy(true);
    setError(null);
    task()
      .then(() => {
        setBusy(false);
        onDone();
      })
      .catch((cause) => {
        // 실패는 현재 화면과 선택을 보존합니다.
        setBusy(false);
        setError(errorText(cause));
      });
  };
  const copy = async () => {
    const origin =
      (globalThis as { location?: { origin: string } }).location?.origin ??
      "https://x23hash.pages.dev";
    const url = shareUrl ?? `${origin}/stories/${storyId}`;
    try {
      await (
        globalThis as {
          navigator?: {
            clipboard?: { writeText: (text: string) => Promise<void> };
          };
        }
      ).navigator?.clipboard?.writeText(url);
      onChange("copied");
    } catch {
      setError(`링크를 복사하지 못했어요. 주소: ${url}`);
    }
  };
  const failure = error && (
    <Text accessibilityRole="alert" style={styles.failure}>
      {error}
    </Text>
  );
  // 06.04–06.08은 시안에서 시트가 아니라 전체 화면입니다. 피드 위를 덮고 하단 내비를 내립니다.
  if (mode === "hide")
    return (
      <PageOverlay>
        <StatusPage
          top={statusTop.manage}
          title={"이 마음을\n숨길까요?"}
          description={
            error ??
            "이 마음이 내 스토리 목록에서 사라져요.\n글쓴이에게는 알려지지 않아요."
          }
        >
          <Button
            busy={busy}
            label={busy ? "숨기는 중…" : "숨기기"}
            onPress={() => run(actions?.hide, () => onChange("hidden"))}
          />
          <Button
            variant="secondary"
            label="취소"
            disabled={busy}
            onPress={onClose}
          />
        </StatusPage>
      </PageOverlay>
    );
  if (mode === "hidden")
    return (
      <PageOverlay>
        <StatusPage
          icon="check"
          top={statusTop.manage}
          title="이 마음을 숨겼어요."
        >
          <Button label="다른 마음 읽어보기" onPress={onClose} />
        </StatusPage>
      </PageOverlay>
    );
  if (mode === "report")
    return (
      <PageOverlay>
        <FlowPage
          onBack={busy ? undefined : onClose}
          footer={
            <View style={styles.footer}>
              <Button
                busy={busy}
                label={busy ? "접수하는 중…" : "신고 접수하기"}
                disabled={!reason}
                onPress={() =>
                  reason &&
                  run(
                    actions &&
                      (async () => {
                        const receipt = await actions.report(reason);
                        setAlreadyReported(receipt.alreadyReported);
                      }),
                    () => onChange("reported"),
                  )
                }
              />
            </View>
          }
        >
          <View>
            <Text style={styles.label}>REPORT</Text>
            <Text accessibilityRole="header" style={styles.heading}>
              신고하는 이유를{"\n"}알려주세요.
            </Text>
            <Text style={styles.guide}>
              신고한 사람의 정보는 전달되지 않아요.
            </Text>
            <View accessibilityRole="radiogroup" style={styles.reasons}>
              {reasons.map((item) => {
                const selected = reason === item.code;
                return (
                  <Pressable
                    key={item.code}
                    accessibilityRole="radio"
                    accessibilityState={{ selected, disabled: busy }}
                    disabled={busy}
                    onPress={() => setReason(item.code)}
                    style={[styles.reason, selected && styles.reasonSelected]}
                  >
                    <Text style={styles.reasonText}>{item.label}</Text>
                  </Pressable>
                );
              })}
            </View>
            {failure}
          </View>
        </FlowPage>
      </PageOverlay>
    );
  if (mode === "reported")
    return (
      <PageOverlay>
        <StatusPage
          icon="check"
          top={statusTop.manage}
          title={
            alreadyReported ? "이미 접수된 신고예요." : "신고를 접수했어요."
          }
          description={"보내주신 내용을 확인한 뒤\n필요한 조치를 할게요."}
        >
          <Button label="다른 마음 읽어보기" onPress={onClose} />
        </StatusPage>
      </PageOverlay>
    );
  if (mode === "block")
    return (
      <PageOverlay>
        <StatusPage
          top={statusTop.manage}
          title={"이 작성자를\n차단할까요?"}
          description={
            error ??
            "이 작성자의 마음이 목록에서 숨겨져요.\n차단 사실은 상대에게 알려지지 않아요."
          }
        >
          <Button
            variant="danger"
            busy={busy}
            label={busy ? "차단하는 중…" : "차단하기"}
            onPress={() => run(actions?.block, onClose)}
          />
          <Button
            variant="secondary"
            label="취소"
            disabled={busy}
            onPress={onClose}
          />
        </StatusPage>
      </PageOverlay>
    );
  return (
    <BottomSheet visible onClose={onClose}>
      {/* 05.08·06.01 공유 / 마음 링크 */}
      {mode === "share" && (
        <>
          <Text accessibilityRole="header" style={styles.title}>
            이 마음을 나누고 싶다면
          </Text>
          <Text style={styles.description}>
            작성자 정보 없이,{"\n"}공개된 마음만 나눠요.
          </Text>
          {failure}
          <View style={styles.buttons}>
            <Button label="링크 복사" onPress={() => void copy()} />
            <Button variant="secondary" label="닫기" onPress={onClose} />
          </View>
        </>
      )}
      {/* 05.09·06.02 공유 / 복사 완료 */}
      {mode === "copied" && (
        <>
          <Text accessibilityRole="header" style={styles.title}>
            링크를 복사했어요.
          </Text>
          <View style={styles.buttons}>
            <Button label="확인" onPress={onClose} />
          </View>
        </>
      )}
      {/* 06.03 더보기 / 마음 관리 */}
      {mode === "manage" && (
        <>
          <Text accessibilityRole="header" style={styles.title}>
            이 마음
          </Text>
          <View style={styles.buttons}>
            <Button
              variant="secondary"
              label="이 마음 숨기기"
              onPress={() => onChange("hide")}
            />
            <Button
              variant="dangerSecondary"
              label="이 마음 신고하기"
              onPress={() =>
                guest ? onRequireLogin?.("report") : onChange("report")
              }
            />
            <Button
              variant="secondary"
              label="이 작성자 차단하기"
              onPress={() =>
                guest ? onRequireLogin?.("block") : onChange("block")
              }
            />
            <Button variant="secondary" label="닫기" onPress={onClose} />
          </View>
        </>
      )}
    </BottomSheet>
  );
}

// 전체 화면 단계를 피드 위에 덮습니다. 떠 있는 동안 하단 내비를 내립니다.
function PageOverlay({ children }: PropsWithChildren) {
  useEffect(() => holdOverlay(), []);
  return <View style={styles.page}>{children}</View>;
}

// 시안(05.08): 제목 아래 20pt에 설명, 그 아래 22pt에 버튼, 버튼 사이 16pt. 시트의 기본 간격 18에서 보정합니다.
const styles = StyleSheet.create({
  title: { ...type.dialogTitle, color: t.text },
  description: { ...type.choice, color: t.muted, marginTop: 2 },
  buttons: { gap: 16, marginTop: 4 },
  failure: { ...type.guide, color: t.text, marginTop: 16 },
  page: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0, zIndex: 10 },
  footer: { paddingHorizontal: t.gutter, paddingBottom: t.gutter },
  // 06.06: 라벨이 헤더 아래 34pt, 제목 18pt 아래, 안내 22pt 아래, 첫 사유 20pt 아래.
  label: { ...type.caption, color: t.muted, marginTop: 10 },
  heading: { ...type.heading, color: t.text, marginTop: 18 },
  guide: { ...type.guide, color: t.muted, marginTop: 22 },
  reasons: { gap: 16, marginTop: 20 },
  reason: {
    height: 56,
    paddingHorizontal: 20,
    justifyContent: "center",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: t.line,
    backgroundColor: t.surface,
  },
  reasonSelected: { borderColor: t.text, backgroundColor: t.selected },
  reasonText: { ...type.choice, color: t.text },
});
