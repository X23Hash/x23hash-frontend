import type { FeedPage, FeedScenario } from "../types";

// 개발 전용 검수 fixture. 실제 서버 커서와 같은 모양(string | null)을 사용합니다.
const bodies = [
  "퇴근길에 우리가 듣던 노래가 나왔어.\n무심코 네 번호를 눌러봤는데,\n마지막 네 자리가 기억나지 않더라.\n나도 조금씩 잊고 있었나 봐.",
  "비 오는 날이면 문득 떠올라.",
  "오늘은 돌아가는 길을 택했어.\n함께 걷던 골목에 꽃이 피었더라.\n언젠가는 아무렇지 않게\n그 길을 걸어갈 수 있겠지.",
];

export function createMockFeed(scenario: FeedScenario, delay = 550) {
  const failed = new Set<number>();
  return async (
    cursor: string | null,
    signal?: AbortSignal,
  ): Promise<FeedPage> => {
    const offset = cursor ? Number(cursor) : 0;
    await new Promise<void>((resolve, reject) => {
      let timer: ReturnType<typeof setTimeout> | undefined;
      const abort = () => {
        clearTimeout(timer);
        reject(new Error("aborted"));
      };
      if (signal?.aborted) {
        abort();
        return;
      }
      signal?.addEventListener("abort", abort, { once: true });
      if (scenario !== "loading")
        timer = setTimeout(() => {
          signal?.removeEventListener("abort", abort);
          resolve();
        }, delay);
    });
    if (
      ((scenario === "error" && offset === 0) ||
        (scenario === "pagination-error" && offset === 20)) &&
      !failed.has(offset)
    ) {
      failed.add(offset);
      throw new Error("mock request failed");
    }
    if (scenario === "empty") return { items: [], next: null };
    const items = Array.from(
      { length: Math.min(20, 60 - offset) },
      (_, index) => {
        const position = offset + index;
        const body = bodies[position % bodies.length];
        return {
          id: `mock-${position}`,
          postedAt: "2026.11.28. 23:08",
          background: {
            type: "preset" as const,
            presetId: ((position % 6) + 1) as 1 | 2 | 3 | 4 | 5 | 6,
          },
          reactionCount: position % 7,
          reacted: false,
          isMine: false,
          body:
            scenario === "long-text" && position === 0
              ? Array(12).fill(body).join("\n\n")
              : body,
        };
      },
    );
    const end = offset + items.length;
    return { items, next: end < 60 ? String(end) : null };
  };
}
