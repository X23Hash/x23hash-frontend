import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Icon } from "@/components/ui/icons";
import { useSideInsets } from "@/components/ui/side-insets";
import { tokens as t, type } from "@/theme/tokens";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { scheduleOnRN } from "react-native-worklets";
import type { Story } from "../types";
import { StoryActions } from "./story-actions";

// 03.02·03.03 전체보기 시트. 화면 88% 높이, 본문은 시트 안에서만 스크롤하고
// 끝에 서명이 보이면 다 읽은 것입니다. 공감·공유·더보기는 하단에 고정합니다.
// 닫기: X · 손잡이 · 딤 탭 · 아래로 끌기(본문이 맨 위일 때만).
export function FullStorySheet({
  story,
  onClose,
  onReact,
  onShare,
  onMore,
}: {
  story: Story | null;
  onClose: () => void;
  onReact?: () => void;
  onShare?: () => void;
  onMore?: () => void;
}) {
  const insets = useSafeAreaInsets();
  const side = useSideInsets();
  const drag = useSharedValue(0);
  const scrollY = useSharedValue(0);
  // 본문을 올렸다가 맨 위로 돌아와 계속 끄는 경우, 그 시점부터의 이동만 시트에 반영합니다.
  const base = useSharedValue(0);
  const settle = (velocityY: number) => {
    "worklet";
    if (drag.value > 120 || (drag.value > 24 && velocityY > 900))
      scheduleOnRN(onClose);
    drag.value = withTiming(0, { duration: 180 });
  };
  // 손잡이·날짜 줄은 본문 위치와 상관없이 끌어내릴 수 있습니다.
  const grip = Gesture.Pan()
    .onUpdate((event) => {
      drag.value = Math.max(0, event.translationY);
    })
    .onEnd((event) => settle(event.velocityY));
  // 본문은 맨 위에 있을 때만 시트가 따라 내려옵니다. 그 외에는 본문이 스크롤됩니다.
  const pull = Gesture.Pan()
    .onBegin(() => {
      base.value = 0;
    })
    .onUpdate((event) => {
      if (scrollY.value > 0) {
        base.value = event.translationY;
        drag.value = 0;
        return;
      }
      drag.value = Math.max(0, event.translationY - base.value);
    })
    .onEnd((event) => settle(event.velocityY));
  const reading = Gesture.Simultaneous(pull, Gesture.Native());
  const lowered = useAnimatedStyle(() => ({
    transform: [{ translateY: drag.value }],
  }));
  return (
    <BottomSheet
      visible={story !== null}
      onClose={onClose}
      style={styles.sheet}
    >
      {story && (
        <Animated.View style={[styles.panel, lowered]}>
          <GestureDetector gesture={grip}>
            <View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="닫기"
                onPress={onClose}
                style={styles.grab}
              >
                <View style={styles.handle} />
              </Pressable>
              {/* 접는 기기에서는 시트 오른쪽 위가 옆 상태 표시와 겹칠 수 있어 닫기만 안쪽에 둡니다. */}
              <View
                style={[
                  styles.top,
                  { paddingRight: t.gutter + side.safeRight },
                ]}
              >
                <Text style={styles.date}>{story.postedAt}</Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="닫기"
                  hitSlop={12}
                  onPress={onClose}
                >
                  <Icon name="close" color={t.storyText} />
                </Pressable>
              </View>
            </View>
          </GestureDetector>
          <GestureDetector gesture={reading}>
            <ScrollView
              style={styles.scroll}
              contentContainerStyle={styles.content}
              showsVerticalScrollIndicator={false}
              // 맨 위에서 당길 때 본문이 튕기지 않고 시트가 내려오도록 합니다.
              bounces={false}
              overScrollMode="never"
              scrollEventThrottle={16}
              onScroll={(event) => {
                scrollY.value = event.nativeEvent.contentOffset.y;
              }}
            >
              <Text style={styles.body}>{story.body}</Text>
              <View style={styles.signature}>
                <View style={styles.dash} />
                <Text style={styles.signatureText}>익명의 X가 남긴 마음</Text>
              </View>
            </ScrollView>
          </GestureDetector>
          <View style={[styles.actions, { paddingBottom: insets.bottom + 14 }]}>
            <StoryActions
              story={story}
              row
              onReact={onReact}
              onShare={onShare}
              onMore={onMore}
            />
          </View>
        </Animated.View>
      )}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  // 끌어내릴 때 패널만 움직이도록 공용 시트의 바탕·여백은 비우고 패널이 대신 가집니다.
  sheet: {
    height: "88%",
    padding: 0,
    paddingBottom: 0,
    gap: 0,
    backgroundColor: "transparent",
  },
  panel: {
    flex: 1,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: t.surface,
  },
  grab: { alignItems: "center", paddingTop: 12, paddingBottom: 14 },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: t.selected,
  },
  top: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: t.gutter,
    paddingBottom: 12,
  },
  date: { ...type.caption, color: t.storyText, opacity: 0.55 },
  scroll: { flex: 1 },
  content: { paddingHorizontal: t.gutter, paddingBottom: 28 },
  body: { ...type.body, color: t.storyText },
  signature: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 40,
  },
  dash: { width: 12, height: 1, backgroundColor: t.selected },
  signatureText: { ...type.caption, color: t.selected },
  actions: {
    paddingTop: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: t.line,
  },
});
