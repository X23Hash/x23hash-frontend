// 공개 피드 조회를 화면 모델(Story)로 변환합니다. 게시글 계약 원본은 features/posts가 소유합니다.
// node 테스트가 직접 로드하는 모듈이라 Metro 전용 @ 별칭 대신 상대 경로를 씁니다.
import { formatStamp } from "../../../lib/format.ts";
import { listFeed } from "../../posts/api.ts";
import { loadHidden } from "../../posts/hidden-store.ts";
import type { PostView } from "../../posts/types.ts";
import type { Background, FeedPage, Story } from "../types.ts";

// background가 없는 글은 (hash(postId) % 6) + 1 프리셋으로 고정합니다(Dev v0.2 F).
// 같은 글은 항상 같은 배경이어야 하므로 난수를 쓰지 않습니다.
export function backgroundFor(
  id: string,
  saved?: PostView["background"],
): Background {
  if (saved?.type === "photo" && saved.imageUrl)
    return { type: "photo", imageUrl: saved.imageUrl };
  const fixed = saved?.type === "preset" ? Number(saved.presetId) : NaN;
  if (fixed >= 1 && fixed <= 6)
    return { type: "preset", presetId: fixed as 1 | 2 | 3 | 4 | 5 | 6 };
  let sum = 0;
  for (const char of id) sum += char.codePointAt(0) ?? 0;
  return { type: "preset", presetId: ((sum % 6) + 1) as 1 | 2 | 3 | 4 | 5 | 6 };
}

export const toStory = (post: PostView): Story => ({
  id: post.id,
  body: post.body,
  postedAt: formatStamp(post.publishedAt),
  background: backgroundFor(post.id, post.background),
  reactionCount: post.reactionCount,
  reacted: post.reacted,
  isMine: post.isMine,
  shareUrl: post.shareUrl,
});

// guestFilter: 게스트의 로컬 숨김을 걸러냅니다. 로그인 사용자는 서버가 숨김·차단을 반영합니다.
export function createFeedLoader(guestFilter: boolean) {
  return async (cursor: string | null): Promise<FeedPage> => {
    const page = await listFeed(cursor);
    const hidden = guestFilter ? new Set(loadHidden()) : null;
    return {
      items: page.items
        .filter((post) => !hidden?.has(post.id))
        .map(toStory),
      next: page.hasMore ? page.nextCursor : null,
    };
  };
}
