import { Icon } from "@/components/ui/icons";
import { tabBarBottom, tokens as t, type } from "@/theme/tokens";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { Story } from "../types";
import { StoryActions } from "./story-actions";
import { fadeColors, StoryBackground } from "./story-background";

// 웹의 pagingEnabled는 컨테이너에만 snap-type을 설정하므로 카드에 snap 지점을 직접 지정합니다.
export const snapStart =
  Platform.OS === "web"
    ? ({ scrollSnapAlign: "start" } as unknown as ViewStyle)
    : null;

// 03.01·03.04·03.05: 날짜·본문·서명 블록을 하단 기준선에 붙이고 오른쪽 버튼 열과 아랫선을 맞춥니다.
// 본문은 카드 안에서 스크롤하지 않습니다. 영역을 넘으면 마지막 줄을 흐리고 "전체보기"로 시트를 엽니다.
export function StoryCard({
  story,
  height,
  onReact,
  onShare,
  onMore,
  onReadAll,
}: {
  story: Story;
  height: number;
  onReact?: () => void;
  onShare?: () => void;
  onMore?: () => void;
  onReadAll?: () => void;
}) {
  const insets = useSafeAreaInsets();
  // 글자 수가 아니라 실제 렌더 높이로 넘침을 판정합니다.
  const [room, setRoom] = useState(0);
  const [full, setFull] = useState(0);
  const overflow = room > 0 && full > room + 1;
  const bar = tabBarBottom(insets.bottom);
  return (
    <View testID={story.id} style={[styles.card, snapStart, { height }]}>
      <StoryBackground background={story.background} />
      <View
        style={[
          styles.frame,
          { top: insets.top + 63, bottom: bar + 124 },
        ]}
      >
        <View style={styles.block}>
          <Text style={styles.date}>{story.postedAt}</Text>
          <View style={styles.clip}>
            {/* 네이티브의 Text는 부모 높이에 맞춰 잘려서 측정되므로, 스크롤을 끈 ScrollView로
                보이는 높이(onLayout)와 전체 높이(onContentSizeChange)를 따로 잽니다. */}
            <ScrollView
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
              style={styles.window}
              onLayout={(event) => setRoom(event.nativeEvent.layout.height)}
              onContentSizeChange={(_, contentHeight) => setFull(contentHeight)}
            >
              <Text style={styles.body}>{story.body}</Text>
            </ScrollView>
            {overflow && (
              <LinearGradient
                colors={fadeColors(story.background)}
                style={styles.fade}
                pointerEvents="none"
              />
            )}
          </View>
          {overflow && (
            <Pressable
              accessibilityRole="button"
              hitSlop={10}
              onPress={onReadAll}
              style={styles.readAll}
            >
              <Text style={styles.readAllText}>전체보기</Text>
            </Pressable>
          )}
          <View style={styles.signature}>
            <View style={styles.dash} />
            <Text style={styles.signatureText}>익명의 X가 남긴 마음</Text>
          </View>
        </View>
        <StoryActions
          story={story}
          onReact={onReact}
          onShare={onShare}
          onMore={onMore}
        />
      </View>
      <View style={[styles.hint, { bottom: bar + 70 }]}>
        <Icon name="arrow-up" size={16} color={t.selected} />
        <Text style={styles.hintText}>SCROLL</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: t.background, overflow: "hidden" },
  frame: {
    position: "absolute",
    left: t.gutter,
    right: 18,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 16,
  },
  block: { flex: 1, maxHeight: "100%", justifyContent: "flex-end" },
  date: { ...type.caption, color: t.storyText, opacity: 0.55, marginBottom: 10 },
  clip: { flexShrink: 1, overflow: "hidden" },
  // ScrollView 기본값(flexGrow 1)이면 짧은 글도 영역을 가득 채워 하단 정렬이 깨집니다.
  window: { flexGrow: 0 },
  body: { ...type.body, color: t.storyText },
  fade: { position: "absolute", left: 0, right: 0, bottom: 0, height: 40 },
  readAll: {
    alignSelf: "flex-start",
    marginTop: 14,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: t.storyText,
  },
  readAllText: { ...type.caption, color: t.text },
  signature: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 18,
  },
  dash: { width: 12, height: 1, backgroundColor: t.selected },
  signatureText: { ...type.caption, color: t.selected },
  hint: {
    position: "absolute",
    left: 0,
    right: 0,
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  hintText: { ...type.micro, color: t.selected, letterSpacing: 1.5 },
});
