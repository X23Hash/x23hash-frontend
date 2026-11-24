// 05.02 목록 카드의 제목 줄과 발췌. v0.2는 글에 제목이 없어 본문에서 뽑습니다.
// 시안 예시가 본문의 마지막 줄을 제목으로, 그 앞 줄들을 발췌로 보여 주므로 같은 규칙을 씁니다.
// 한 줄짜리 글은 제목만 있고 발췌가 없습니다.
export function cardLines(body: string): { title: string; excerpt: string } {
  const lines = body
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  return {
    title: lines.at(-1) ?? "",
    excerpt: lines.slice(0, -1).join("\n"),
  };
}
