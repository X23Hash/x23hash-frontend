import { BellButton } from "@/components/ui/bell-button";
import { Button } from "@/components/ui/button";
import { Icon, Logo } from "@/components/ui/icons";
import { fullBleed, useSideInsets } from "@/components/ui/side-insets";
import { tokens as t, type } from "@/theme/tokens";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
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
  const side = useSideInsets(fullBleed);
  // 배경은 화면 끝까지 두고 글·버튼은 가운데 열 안에 둡니다.
  const inside = { paddingLeft: side.left, paddingRight: side.right };
  const [height, setHeight] = useState(812);
  const [hidden, setHidden] = useState(false);
  // 03.02 전체보기 시트로 읽고 있는 글. 공감 상태가 바뀌어도 최신 값을 보이도록 ID만 보관합니다.
  const [readingId, setReadingId] = useState<string | null>(null);
  const reading = feed.items.find((item) => item.id === readingId) ?? null;
  const scroll = useRef(initialScroll);
  // 보고 있는 글의 순서. 화면 크기가 바뀌면(접는 기기를 접거나 펼 때) 카드 높이가 달라지므로
  // 스크롤 위치가 아니라 이 순서로 같은 글에 다시 맞춥니다. 크기가 바뀌는 도중의 어긋난 위치는 무시합니다.
  const page = useRef(0);
  useEffect(() => {
    const frame = requestAnimationFrame(() =>
      listRef.current?.scrollToOffset({
        offset: page.current * height,
        animated: false,
      }),
    );
    return () => cancelAnimationFrame(frame);
  }, [height]);
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
          { scrollTop?: number } | number | null | undefined;
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
  const toTop = (refreshAtTop: boolean) => {
    if (scroll.current.y > 1)
      listRef.current?.scrollToOffset({ offset: 0, animated: true });
    else if (refreshAtTop) feed.refresh();
  };
  return (
    <View style={styles.outer}>
      <View
        style={[styles.screen, fullBleed && styles.bleed]}
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
          // 맨 위에서 아래로 당기면 새로 고칩니다. (웹은 브라우저 동작을 따릅니다.)
          // iOS는 기본 표시가 화면 맨 위(카메라 영역 뒤)에 그려지고, 아래로 옮기면 훨씬 더 당겨야 해서
          // 기본 표시는 숨기고 헤더 아래에 직접 그립니다. Android는 기본 표시를 헤더 아래로 내립니다.
          refreshControl={
            <RefreshControl
              refreshing={feed.refreshing}
              onRefresh={feed.refresh}
              tintColor="transparent"
              colors={[t.background]}
              progressBackgroundColor={t.text}
              progressViewOffset={
                Platform.OS === "android" ? insets.top + 44 : undefined
              }
            />
          }
          onEndReached={feed.loadMore}
          onEndReachedThreshold={0.5}
          scrollEventThrottle={16}
          onScroll={(event) => {
            // 탭이 숨겨지는 순간 브라우저가 쏘는 0 스크롤 이벤트로 추적 위치가 깨지지 않게 합니다.
            if (!focused.current) return;
            const y = event.nativeEvent.contentOffset.y;
            const nearest = Math.round(y / height);
            if (Math.abs(y - nearest * height) < 1) page.current = nearest;
            const next = updateScroll(
              scroll.current,
              event.nativeEvent.contentOffset.y,
            );
            if (next.hidden !== scroll.current.hidden) setHidden(next.hidden);
            scroll.current = next;
          }}
          ListEmptyComponent={
            feed.loading ? (
              <View style={[styles.loading, inside, { minHeight: height }]}>
                <ActivityIndicator
                  accessibilityLabel="마음 불러오는 중"
                  color={t.muted}
                />
                <Text style={styles.description}>마음을 불러오고 있어요.</Text>
              </View>
            ) : (
              // 03.06 마음 없음 · 03.07 불러오기 실패
              <View style={inside}>
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
              </View>
            )
          }
          ListFooterComponent={
            feed.items.length > 0 && (feed.loading || feed.error) ? (
              <View style={[inside, snapStart, { height }]}>
                <View style={styles.pagination}>
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
              </View>
            ) : null
          }
        />
        {/* 화면 맨 위(상태 표시줄 자리)를 눌러도 맨 위 글로 올라갑니다. 시스템 동작에 기대지 않고 직접 받습니다. */}
        <Pressable
          accessible={false}
          onPress={() => toTop(false)}
          style={[styles.statusBar, { height: insets.top }]}
        />
        <View
          pointerEvents="box-none"
          style={[
            styles.header,
            { top: insets.top, left: side.left, right: side.right },
          ]}
        >
          {/* 인스타그램과 같은 동작: 로고를 누르면 맨 위 글로 올라가고, 이미 맨 위면 새로 고칩니다. */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="맨 위로"
            hitSlop={8}
            onPress={() => toTop(true)}
          >
            <Logo />
          </Pressable>
          {!hidden && (
            <View style={[styles.bell, { right: side.safeRight - side.right }]}>
              <BellButton dot={bellDot} onPress={onBell} />
            </View>
          )}
        </View>
        {Platform.OS === "ios" && feed.refreshing && (
          <ActivityIndicator
            accessibilityLabel="새로 고치는 중"
            color={t.text}
            style={[styles.refreshing, { top: insets.top + 52 }]}
          />
        )}
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
  bleed: { maxWidth: "100%" },
  list: { flex: 1 },
  header: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  bell: { position: "absolute", right: 0 },
  refreshing: { position: "absolute", alignSelf: "center" },
  statusBar: { position: "absolute", top: 0, left: 0, right: 0 },
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
    flex: 1,
    padding: 24,
    paddingBottom: 130,
    gap: 18,
    justifyContent: "center",
  },
});
