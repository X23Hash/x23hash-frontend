import { tokens as t } from "@/theme/tokens";
import { useLayoutEffect, useRef } from "react";
import { limitBody } from "./body-rules";
import { useWritingSession } from "./writing-session";

// 02.03 안내 문구와 02.05 빈 글 오류 문구. 오류일 때는 테두리를 붉게, 문구를 밝게 보입니다.
const placeholder = "그때 하지 못한 말,\n지금 남기고 싶은 말…";
const emptyMessage = "남길 말을 입력해 주세요.";
// 웹 IME 조합 중에는 자르지 않고 조합 완료 시 사용자 인식 문자 기준으로 제한합니다.
export function BodyInput({ error = false }: { error?: boolean }) {
  const { draft, update } = useWritingSession();
  const ref = useRef<HTMLTextAreaElement>(null);
  const composing = useRef(false);
  useLayoutEffect(() => {
    if (!ref.current || composing.current) return;
    if (
      ref.current.selectionStart !== draft.selection.start ||
      ref.current.selectionEnd !== draft.selection.end
    ) {
      ref.current.setSelectionRange(draft.selection.start, draft.selection.end);
    }
    ref.current.scrollTop = draft.scrollY;
  }, [draft.selection, draft.scrollY]);
  return (
    <textarea
      ref={ref}
      aria-label="남길 말"
      aria-invalid={error}
      className={error ? "body-input error" : "body-input"}
      value={draft.body}
      onCompositionStart={() => {
        composing.current = true;
      }}
      onCompositionEnd={(event) => {
        composing.current = false;
        update({ body: limitBody(event.currentTarget.value) });
      }}
      onChange={(event) =>
        update({
          body: composing.current
            ? event.target.value
            : limitBody(event.target.value),
        })
      }
      onSelect={(event) =>
        update({
          selection: {
            start: event.currentTarget.selectionStart,
            end: event.currentTarget.selectionEnd,
          },
        })
      }
      onScroll={(event) => update({ scrollY: event.currentTarget.scrollTop })}
      placeholder={error ? emptyMessage : placeholder}
      style={{
        boxSizing: "border-box",
        width: "100%",
        height: 240,
        resize: "none",
        padding: 20,
        border: `1px solid ${error ? t.danger : t.line}`,
        borderRadius: 20,
        outline: "none",
        color: t.text,
        background: t.surface,
        fontFamily: t.serif,
        fontSize: 15,
        lineHeight: "25.5px",
      }}
    />
  );
}
