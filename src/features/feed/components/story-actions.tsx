import { CircleAction as Action } from "@/components/ui/circle-action";
import { StyleSheet, View } from "react-native";
import type { Story } from "../types";

// 공감·공유·더보기 버튼. 피드 카드는 세로 열, 전체보기 시트는 가로 줄로 씁니다.
// 내 글에는 공유만 보입니다(서버도 공감·신고·차단을 403으로 거부).
export function StoryActions({
  story,
  row = false,
  onReact,
  onShare,
  onMore,
}: {
  story: Story;
  row?: boolean;
  onReact?: () => void;
  onShare?: () => void;
  onMore?: () => void;
}) {
  return (
    <View style={row ? styles.row : styles.column}>
      {!story.isMine && (
        <Action
          icon={story.reacted ? "heart-filled" : "heart"}
          // 공감 수는 서버가 내려줍니다. 0이면 "공감" 글자를 보입니다(사용자 결정 2026-11-24).
          caption={
            story.reactionCount > 0
              ? story.reactionCount.toLocaleString()
              : "공감"
          }
          label={story.reacted ? "공감 취소" : "공감"}
          selected={story.reacted}
          onPress={onReact}
        />
      )}
      <Action icon="share" caption="공유" label="공유" onPress={onShare} />
      {!story.isMine && (
        <Action icon="more" caption="더보기" label="더보기" onPress={onMore} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  column: { gap: 6 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 49,
  },
});
