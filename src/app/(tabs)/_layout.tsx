import { Icon } from "@/components/ui/icons";
import { useOverlayOpen } from "@/components/ui/overlay-state";
import { useSession } from "@/features/auth/auth-session";
import { tabBarBottom, tokens as t, type } from "@/theme/tokens";
import { router, usePathname } from "expo-router";
import { useState } from "react";
import { TabList, Tabs, TabSlot, TabTrigger } from "expo-router/ui";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// 스토리·MY 공통 하단 내비게이션 바입니다. 탭 전환 시에도 바는 고정됩니다.
export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const { status } = useSession();
  const pathname = usePathname();
  const feedActive = pathname !== "/my";
  const covered = useOverlayOpen();
  // 기본 음소거. 재생할 음원은 아직 없어 상태만 바뀝니다(음원 추가 시 이 값을 재생에 연결).
  const [muted, setMuted] = useState(true);
  return (
    <Tabs style={styles.root}>
      {/* 웹에서 기본 flex-basis:auto가 내용 높이만큼 늘어나므로 부모 높이에 고정합니다. */}
      <TabSlot style={styles.root} />
      <View
        pointerEvents="box-none"
        style={[
          styles.overlay,
          { bottom: tabBarBottom(insets.bottom) },
          covered && styles.covered,
        ]}
      >
        <View pointerEvents="box-none" style={styles.bar}>
          <Pressable
            accessibilityRole="switch"
            accessibilityLabel="소리"
            aria-checked={!muted}
            onPress={() => setMuted((value) => !value)}
            style={styles.sound}
          >
            <Icon name={muted ? "speaker-slash" : "speaker-high"} size={22} />
          </Pressable>
          <View style={styles.tabs}>
            <TabTrigger
              name="index"
              accessibilityRole="tab"
              accessibilityState={{ selected: feedActive }}
              style={[styles.tab, feedActive && styles.selected]}
            >
              <Text style={styles.tabText}>스토리</Text>
            </TabTrigger>
            <TabTrigger
              name="my"
              accessibilityRole="tab"
              accessibilityState={{ selected: !feedActive }}
              style={[styles.tab, !feedActive && styles.selected]}
            >
              <Text style={styles.tabText}>MY</Text>
            </TabTrigger>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="글쓰기"
            onPress={() =>
              router.push(status === "ready" ? "/write" : "/login")
            }
            style={styles.fab}
          >
            <Icon name="plus" size={28} color={t.background} />
          </Pressable>
        </View>
      </View>
      <TabList style={styles.hiddenList}>
        <TabTrigger name="index" href="/" />
        <TabTrigger name="my" href="/my" />
      </TabList>
    </Tabs>
  );
}
const styles = StyleSheet.create({
  root: { flex: 1 },
  hiddenList: { display: "none" },
  overlay: { position: "absolute", left: 0, right: 0, alignItems: "center" },
  covered: { display: "none" },
  bar: {
    width: "100%",
    maxWidth: t.maxWidth,
    paddingHorizontal: t.gutter,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  sound: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: t.raised,
    alignItems: "center",
    justifyContent: "center",
  },
  tabs: {
    flex: 1,
    height: 48,
    flexDirection: "row",
    padding: 4,
    borderRadius: 24,
    backgroundColor: t.raised,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
  },
  selected: { backgroundColor: t.selected },
  tabText: { ...type.button, fontSize: 13, color: t.text },
  fab: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: t.text,
    alignItems: "center",
    justifyContent: "center",
  },
});
