import { Button } from "@/components/ui/button";
import { Icon, Logo } from "@/components/ui/icons";
import { tokens as t, type } from "@/theme/tokens";
import { useFocusEffect } from "expo-router";
import { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FullStorySheet } from "./components/full-story-sheet";
import { snapStart, StoryCard } from "./components/story-card";
import type { Feed } from "./hooks/use-feed";
import { initialScroll, updateScroll } from "./scroll-controls";
import type { Story } from "./types";

export function FeedScreen({
  feed,
  bellDot = false,
  onBell,
  onReact,
  onShare,
  onMore,
}: {
  feed: Feed;
  bellDot?: boolean;
  onBell?: () => void;
  onReact?: (story: Story) => void;
  onShare?: (story: Story) => void;
  onMore?: (story: Story) => void;
}) {
  const insets = useSafeAreaInsets();
  const [height, setHeight] = useState(812);
  const [hidden, setHidden] = useState(false);
  // 03.02 전체보기 시트로 읽고 있는 글. 공감 상태가 바뀌어도 최신 값을 보이도록 ID만 보관합니다.
  const [readingId, setReadingId] = useState<string | null>(null);
  const reading = feed.items.find((item) => item.id === readingId) ?? null;
  const scroll = useRef(initialScroll);
  const listRef = useRef<FlatList<Story>>(null);
  const focused = useRef(true);
  // 웹은 탭이 숨겨질 때(display:none) 브라우저가 스크롤 위치를 버리므로, 복귀 시 추적해 둔 위치로 복원합니다.
  useFocusEffect(
    useCallback(() => {
      focused.current = true;
      // 포커스 직후엔 화면이 아직 display:none이라 적용될 때까지 몇 프레임 재시도합니다.
      const y = scroll.current.y;
      let frame = 0;
      let tries = 20;
      const restore = () => {
        scroll.current = { ...scroll.current, y, anchor: y, direction: 0 };
        listRef.current?.scrollToOffset({ offset: y, animated: false });
        const node = listRef.current?.getScrollableNode() as
          | { scrollTop?: number }
          | number
          | null
          | undefined;
        const applied =
          typeof node !== "object" ||
          node === null ||
          typeof node.scrollTop !== "number" ||
          Math.abs(node.scrollTop - y) <= 1;
        if (!applied && --tries > 0) frame = requestAnimationFrame(restore);
      };
      if (y > 0) frame = requestAnimationFrame(restore);
      return () => {
        cancelAnimationFrame(frame);
        focused.current = false;
      };
    }, []),
  );
  return (
    <View style={styles.outer}>
      <View
        style={styles.screen}
        onLayout={(event) => setHeight(event.nativeEvent.layout.height)}
      >
        <FlatList
          ref={listRef}
          testID="feed-list"
          data={feed.items}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <StoryCard
              story={item}
              height={height}
              onReact={onReact && (() => onReact(item))}
              onShare={onShare && (() => onShare(item))}
              onMore={onMore && (() => onMore(item))}
              onReadAll={() => setReadingId(item.id)}
            />
          )}
          style={styles.list}
          contentContainerStyle={
            feed.items.length === 0 ? { flexGrow: 1 } : undefined
          }
          pagingEnabled
          decelerationRate="fast"
          getItemLayout={(_, index) => ({
            length: height,
            offset: height * index,
            index,
          })}
          initialNumToRender={2}
          maxToRenderPerBatch={3}
          windowSize={5}
          showsVerticalScrollIndicator={false}
          onEndReached={feed.loadMore}
          onEndReachedThreshold={0.5}
          scrollEventThrottle={16}
          onScroll={(event) => {
            // 탭이 숨겨지는 순간 브라우저가 쏘는 0 스크롤 이벤트로 추적 위치가 깨지지 않게 합니다.
            if (!focused.current) return;
            const next = updateScroll(
              scroll.current,
              event.nativeEvent.contentOffset.y,
            );
            if (next.hidden !== scroll.current.hidden) setHidden(next.hidden);
            scroll.current = next;
          }}
          ListEmptyComponent={
            feed.loading ? (
              <View style={[styles.loading, { minHeight: height }]}>
                <ActivityIndicator
                  accessibilityLabel="마음 불러오는 중"
                  color={t.muted}
                />
                <Text style={styles.description}>마음을 불러오고 있어요.</Text>
              </View>
            ) : (
              // 03.06 마음 없음 · 03.07 불러오기 실패
              <View style={[styles.status, { paddingTop: height * 0.337 }]}>
                <View style={styles.statusIcon}>
                  <Icon name={feed.error ? "retry" : "bookmark"} size={26} />
                </View>
                <Text accessibilityRole="header" style={styles.statusTitle}>
                  {feed.error
                    ? "마음을\n불러오지 못했어요."
                    : "아직 남겨진\n마음이 없어요."}
                </Text>
                {feed.error && (
                  <>
                    <Text style={styles.description}>
                      연결을 확인하고 다시 시도해 주세요.
                    </Text>
                    <View style={styles.retry}>
                      <Button
                        small
                        variant="secondary"
                        label="다시 불러오기"
                        onPress={feed.retry}
                      />
                    </View>
                  </>
                )}
              </View>
            )
          }
          ListFooterComponent={
            feed.items.length > 0 && (feed.loading || feed.error) ? (
              <View style={[styles.pagination, snapStart, { height }]}>
                {feed.loading ? (
                  <ActivityIndicator
                    accessibilityLabel="다음 마음 불러오는 중"
                    color={t.text}
                  />
                ) : (
                  <>
                    <Text style={styles.description}>
                      다음 마음을 불러오지 못했어요.
                    </Text>
                    <Button
                      small
                      variant="secondary"
                      label="다음 마음 다시 불러오기"
                      onPress={feed.retry}
                    />
                  </>
                )}
              </View>
            ) : null
          }
        />
        <View
          pointerEvents="box-none"
          style={[styles.header, { top: insets.top }]}
        >
          <Logo />
          {!hidden && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={bellDot ? "알림 · 안 읽은 알림 있음" : "알림"}
              disabled={!onBell}
              onPress={onBell}
              style={styles.bell}
            >
              <Icon name="bell" />
              {bellDot && <View style={styles.dot} />}
            </Pressable>
          )}
        </View>
        <FullStorySheet
          story={reading}
          onClose={() => setReadingId(null)}
          onReact={onReact && reading ? () => onReact(reading) : undefined}
          onShare={onShare && reading ? () => onShare(reading) : undefined}
          onMore={onMore && reading ? () => onMore(reading) : undefined}
        />
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  outer: { flex: 1, backgroundColor: "#0c0b09", alignItems: "center" },
  screen: {
    flex: 1,
    width: "100%",
    maxWidth: t.maxWidth,
    backgroundColor: t.background,
  },
  list: { flex: 1 },
  header: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  bell: {
    position: "absolute",
    right: 0,
    width: 48,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  dot: {
    position: "absolute",
    top: 8,
    right: 9,
    width: 9,
    height: 9,
    borderRadius: 4.5,
    borderWidth: 1.5,
    borderColor: t.background,
    backgroundColor: t.text,
  },
  loading: { alignItems: "center", justifyContent: "center", gap: 16 },
  status: { paddingHorizontal: t.gutter },
  statusIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: t.raised,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  statusTitle: { ...type.heading, color: t.text },
  description: { ...type.guide, color: t.muted, marginTop: 12 },
  retry: { marginTop: 20 },
  pagination: {
    padding: 24,
    paddingBottom: 130,
    gap: 18,
    justifyContent: "center",
  },
});
