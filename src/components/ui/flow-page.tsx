import { tokens as t, type } from "@/theme/tokens";
import type { PropsWithChildren, ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Icon, Logo } from "./icons";
import { useSideInsets } from "./side-insets";

// TMX / Night / Header: 가운데 로고, 왼쪽은 뒤로(Back) 또는 닫기(Close), 오른쪽은 화면별 아이콘.
export function FlowPage({
  onBack,
  onClose,
  right,
  footer,
  children,
}: PropsWithChildren<{
  onBack?: () => void;
  onClose?: () => void;
  right?: ReactNode;
  footer?: ReactNode;
}>) {
  const insets = useSafeAreaInsets();
  const side = useSideInsets();
  const leave = onBack ?? onClose;
  return (
    <KeyboardAvoidingView
      style={styles.outer}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View
        style={[
          styles.page,
          { paddingTop: insets.top, paddingBottom: insets.bottom },
        ]}
      >
        <View style={styles.header}>
          <Logo />
          {leave && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={onBack ? "뒤로" : "닫기"}
              hitSlop={12}
              onPress={leave}
              style={[styles.left, { left: t.gutter + side.safeLeft }]}
            >
              <Icon name={onBack ? "caret-left" : "close"} />
            </Pressable>
          )}
          {right && (
            <View style={[styles.right, { right: t.gutter + side.safeRight }]}>
              {right}
            </View>
          )}
        </View>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.body}
        >
          <Animated.View
            entering={FadeInDown.duration(260)}
            style={styles.animated}
          >
            {children}
          </Animated.View>
        </ScrollView>
        {footer}
      </View>
    </KeyboardAvoidingView>
  );
}
export const flowStyles = StyleSheet.create({
  title: { ...type.heading, color: t.text },
  text: { ...type.choice, color: t.text },
  muted: { ...type.guide, color: t.muted },
  group: { gap: 16 },
});
const styles = StyleSheet.create({
  outer: { flex: 1, backgroundColor: t.background, alignItems: "center" },
  page: { flex: 1, width: "100%", maxWidth: t.maxWidth },
  header: { height: 44, alignItems: "center", justifyContent: "center" },
  left: { position: "absolute", left: t.gutter },
  right: {
    position: "absolute",
    right: t.gutter,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  body: { flexGrow: 1, padding: t.gutter, paddingBottom: 48 },
  animated: { flex: 1, gap: 24 },
});
