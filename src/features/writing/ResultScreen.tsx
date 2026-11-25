import { Button } from "@/components/ui/button";
import { StatusPage } from "@/components/ui/status-page";
import { ApiError } from "@/lib/api";
import { tokens as t } from "@/theme/tokens";
import { useEffect, useRef, useState } from "react";

// 02.08 등록 중 · 02.09 완료 · 02.12 실패/결과 확인 · 02.13 재시도입니다.
// 재시도는 기존 시도의 결과 확인부터 시작합니다(submit의 checkFirst).
type Phase =
  | { name: "submitting" }
  | { name: "retrying" }
  | { name: "done"; postId: string }
  | {
      name: "failed";
      message: string;
      authRequired: boolean;
      waitUntil: number | null;
    };

const unknownFailure =
  "쓰던 내용은 그대로 있어요.\n연결을 확인하고 다시 시도해 주세요.";
const failureOf = (error: unknown): Phase => {
  if (error instanceof ApiError) {
    if (error.status === 401)
      return {
        name: "failed",
        message: "로그인이 만료됐어요.\n다시 로그인하면 쓰던 마음으로 돌아와요.",
        authRequired: true,
        waitUntil: null,
      };
    return {
      name: "failed",
      // 연결 문제는 시안 문구, 검증·도배 방지처럼 서버가 이유를 알려주는 경우는 그 문구를 보입니다.
      message: error.code === "NETWORK" ? unknownFailure : error.message,
      authRequired: false,
      waitUntil: error.retryAfter ? Date.now() + error.retryAfter * 1000 : null,
    };
  }
  return {
    name: "failed",
    message: unknownFailure,
    authRequired: false,
    waitUntil: null,
  };
};

export function ResultScreen({
  submit,
  onDone,
  onExplore,
  onMyStory,
  onEdit,
  onLogin,
}: {
  // checkFirst가 참이면 기존 시도 결과를 먼저 확인한 뒤 미등록일 때만 다시 등록합니다.
  submit: (checkFirst: boolean) => Promise<string>;
  // 성공 확정 직후 1회(초안·시도 정리와 목록 무효화용)
  onDone: (postId: string) => void;
  onExplore: () => void;
  onMyStory: (postId: string) => void;
  onEdit: () => void;
  onLogin: () => void;
}) {
  const [phase, setPhase] = useState<Phase>({ name: "submitting" });
  const [now, setNow] = useState(() => Date.now());
  const startedRef = useRef(false);
  const doneRef = useRef(onDone);
  useEffect(() => {
    doneRef.current = onDone;
  });
  const run = (retry: boolean) => {
    setPhase(retry ? { name: "retrying" } : { name: "submitting" });
    submit(retry)
      .then((postId) => {
        doneRef.current(postId);
        setPhase({ name: "done", postId });
      })
      .catch((error) => setPhase(failureOf(error)));
  };
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    run(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // 도배 방지(429)의 retryAfter 동안 재시도 버튼을 비활성화하고 남은 시간을 안내합니다.
  const waitUntil = phase.name === "failed" ? phase.waitUntil : null;
  useEffect(() => {
    if (!waitUntil) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [waitUntil]);
  const waitSeconds = waitUntil
    ? Math.max(0, Math.ceil((waitUntil - now) / 1000))
    : 0;
  if (phase.name === "submitting" || phase.name === "retrying") {
    const retrying = phase.name === "retrying";
    return (
      <StatusPage
        icon={retrying ? "retry" : "pen"}
        title={retrying ? "다시 남기고 있어요." : "마음을 남기고 있어요."}
      >
        <Button busy label={retrying ? "다시 남기는 중…" : "남기는 중…"} />
      </StatusPage>
    );
  }
  if (phase.name === "done")
    return (
      <StatusPage icon="check" title="마음을 남겼어요.">
        <Button label="다른 마음 읽어보기" onPress={onExplore} />
        <Button
          variant="secondary"
          label="내가 남긴 마음 보기"
          onPress={() => onMyStory(phase.postId)}
        />
      </StatusPage>
    );
  return (
    <StatusPage
      icon="alert-error"
      iconColor={t.danger}
      title="남기지 못했어요."
      description={
        waitSeconds > 0
          ? `${phase.message}\n${waitSeconds}초 뒤에 다시 시도할 수 있어요.`
          : phase.message
      }
      onBack={onEdit}
    >
      {phase.authRequired ? (
        <Button label="다시 로그인하기" onPress={onLogin} />
      ) : (
        <Button
          label="다시 시도하기"
          disabled={waitSeconds > 0}
          onPress={() => run(true)}
        />
      )}
      <Button variant="secondary" label="돌아가서 수정하기" onPress={onEdit} />
    </StatusPage>
  );
}
