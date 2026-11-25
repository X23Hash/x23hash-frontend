import {
  createContext,
  useContext,
  useState,
  type PropsWithChildren,
} from "react";

type Draft = {
  body: string;
  selection: { start: number; end: number };
  scrollY: number;
};
// 등록 시도. 결과를 확정할 때까지 보관하고, 같은 본문의 재시도에는 같은 ID를 씁니다.
export type Submission = { id: string; body: string };
const empty: Draft = { body: "", selection: { start: 0, end: 0 }, scrollY: 0 };
const Context = createContext<{
  draft: Draft;
  update: (patch: Partial<Draft>) => void;
  clear: () => void;
  submission: Submission | null;
  setSubmission: (submission: Submission | null) => void;
} | null>(null);
// initialBody: 글 수정(05.06)은 새 글 초안과 섞이지 않도록 기존 본문으로 시작하는 별도 세션을 씁니다.
export function WritingSessionProvider({
  initialBody = "",
  children,
}: PropsWithChildren<{ initialBody?: string }>) {
  const [draft, setDraft] = useState<Draft>({
    ...empty,
    body: initialBody,
    selection: { start: initialBody.length, end: initialBody.length },
  });
  const [submission, setSubmission] = useState<Submission | null>(null);
  return (
    <Context.Provider
      value={{
        draft,
        update: (patch) => setDraft((previous) => ({ ...previous, ...patch })),
        clear: () => setDraft(empty),
        submission,
        setSubmission,
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useWritingSession() {
  const value = useContext(Context);
  if (!value) throw new Error("WritingSessionProvider is required");
  return value;
}
