import { backgroundFor } from "@/features/feed/api/feed-api";
import { StoryBackground } from "@/features/feed/components/story-background";
import { deletePost, getMyPost, getPost, updatePost } from "@/features/posts/api";
import { invalidateFeed } from "@/features/posts/feed-refresh";
import type { PostView } from "@/features/posts/types";
import { StoryDetailScreen } from "@/features/stories/StoryDetailScreen";
import { StorySheets, type SheetMode } from "@/features/stories/StorySheets";
import {
  DeleteConfirmPage,
  DeleteDonePage,
  EditDonePage,
} from "@/features/stories/StoryStatusPages";
import { EditScreen } from "@/features/writing/EditScreen";
import { WritingSessionProvider } from "@/features/writing/writing-session";
import { ApiError } from "@/lib/api";
import { formatStamp } from "@/lib/format";
import { randomId } from "@/lib/ids";
import { router, useLocalSearchParams } from "expo-router";
import { usePreventRemove } from "expo-router/react-navigation";
import { useCallback, useEffect, useRef, useState } from "react";

// 05.03–05.07·05.11: 내 마음 상세와 수정·삭제 흐름. 한 라우트 안의 단계로 다룹니다.
type Phase = "view" | "edit" | "edited" | "confirmDelete" | "deleted";

// 공유 링크 공개 상세와 내 마음 상세(mine=1)를 함께 처리합니다.
// 없거나 공개 중단·차단이면 서버가 404로 거부해 열람 불가를 표시합니다.
export default function StoryRoute() {
  const { id, mine } = useLocalSearchParams<{ id: string; mine?: string }>();
  const [sheet, setSheet] = useState<SheetMode | null>(null);
  const [post, setPost] = useState<PostView | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const [phase, setPhase] = useState<Phase>("view");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  // 한 번의 수정·삭제 시도에 하나씩 만들고, 실패 후 재시도에도 같은 값을 씁니다.
  const operation = useRef<string | null>(null);
  const load = useCallback(() => {
    if (!id) return;
    setLoading(true);
    setError(false);
    setUnavailable(false);
    (mine === "1" ? getMyPost(id) : getPost(id))
      .then(setPost)
      .catch((cause) => {
        if (cause instanceof ApiError && cause.status === 404)
          setUnavailable(true);
        else setError(true);
      })
      .finally(() => setLoading(false));
  }, [id, mine]);
  useEffect(() => {
    queueMicrotask(load);
  }, [load]);
  // 수정·삭제 확인·수정 완료에서의 뒤로는 상세로 돌아갑니다. 삭제 완료의 뒤로는 그대로 나갑니다.
  usePreventRemove(
    phase === "edit" || phase === "edited" || phase === "confirmDelete",
    () => {
      if (!deleting) setPhase("view");
    },
  );
  const leave = () =>
    router.canGoBack() ? router.back() : router.replace("/");
  const open = (next: Phase) => {
    operation.current = null;
    setDeleteError(null);
    setPhase(next);
  };
  if (phase === "deleted")
    return <DeleteDonePage onBackToMy={() => router.dismissTo("/my")} />;
  if (phase === "confirmDelete" && post)
    return (
      <DeleteConfirmPage
        busy={deleting}
        error={deleteError}
        onCancel={() => setPhase("view")}
        onDelete={() => {
          operation.current ??= randomId();
          setDeleting(true);
          setDeleteError(null);
          deletePost(post.id, operation.current)
            .then(() => {
              // 피드와 MY 목록에서 바로 빠지도록 다시 불러오게 합니다.
              invalidateFeed();
              setPhase("deleted");
            })
            .catch((cause) =>
              setDeleteError(
                cause instanceof ApiError && cause.code !== "NETWORK"
                  ? cause.message
                  : "삭제하지 못했어요.\n연결을 확인하고 다시 시도해 주세요.",
              ),
            )
            .finally(() => setDeleting(false));
        }}
      />
    );
  if (phase === "edited") return <EditDonePage onView={() => setPhase("view")} />;
  const owned = mine === "1" && post?.isMine === true;
  return (
    // 수정 중 상세로 돌아갔다 와도 쓰던 내용이 남도록 세션을 상세 화면 수명에 맞춥니다.
    // 저장에 성공해 본문이 바뀌면 새 본문으로 다시 시작합니다.
    <WritingSessionProvider
      key={post ? `${post.id}:${post.body}` : "empty"}
      initialBody={post?.body}
    >
      {phase === "edit" && post ? (
        <EditScreen
          original={post.body}
          onBack={() => setPhase("view")}
          save={async (body) => {
            operation.current ??= randomId();
            const updated = await updatePost(post.id, body, operation.current);
            invalidateFeed();
            setPost(updated);
            setPhase("edited");
          }}
        />
      ) : (
        <>
          <StoryDetailScreen
            story={
              post && !unavailable
                ? {
                    id: post.id,
                    body: post.body,
                    postedAt: post.updatedAt
                      ? `${formatStamp(post.publishedAt)} · 수정됨`
                      : formatStamp(post.publishedAt),
                    isMine: post.isMine,
                    suspended: post.visibility === "SUSPENDED",
                  }
                : null
            }
            backdrop={
              post && (
                <StoryBackground
                  background={backgroundFor(post.id, post.background)}
                />
              )
            }
            loading={loading}
            error={error}
            onRetry={load}
            onBack={leave}
            onEdit={owned ? () => open("edit") : undefined}
            onDelete={owned ? () => open("confirmDelete") : undefined}
            onShare={() => setSheet("share")}
            onExplore={() =>
              router.canGoBack() ? router.dismissTo("/") : router.replace("/")
            }
          />
          {sheet && (
            <StorySheets
              storyId={id ?? ""}
              shareUrl={post?.shareUrl}
              mode={sheet}
              onChange={setSheet}
              onClose={() => setSheet(null)}
            />
          )}
        </>
      )}
    </WritingSessionProvider>
  );
}
