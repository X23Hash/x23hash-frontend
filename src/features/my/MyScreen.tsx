import { BellButton } from "@/components/ui/bell-button";
import { Button } from "@/components/ui/button";
import { ActionButton } from "@/components/ui/feed-actions";
import { FlowPage, flowStyles as f } from "@/components/ui/flow-page";
import { Icon } from "@/components/ui/icons";
import { tokens as t, type } from "@/theme/tokens";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

// 05.01 내 마음 없음 · 05.02(05.10) 내 마음 목록 · 로그인 전 안내입니다.
export type MyStory = {
  id: string;
  title: string;
  excerpt: string;
  meta: string;
};

export function MyScreen({
  guest,
  loading,
  error,
  stories,
  hasMore,
  bellDot,
  onLogin,
  onOpen,
  onRetry,
  onLoadMore,
  onSettings,
  onBell,
}: {
  guest: boolean;
  loading: boolean;
  error: boolean;
  stories: MyStory[];
  hasMore: boolean;
  bellDot: boolean;
  onLogin: () => void;
  onOpen: (id: string) => void;
  onRetry: () => void;
  onLoadMore: () => void;
  onSettings: () => void;
  onBell: () => void;
}) {
  return (
    <FlowPage
      right={
        !guest && (
          <View style={styles.tools}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="설정"
              onPress={onSettings}
              style={styles.gear}
            >
              <Icon name="gear-six" />
            </Pressable>
            <BellButton dot={bellDot} onPress={onBell} />
          </View>
        )
      }
      // 하단 고정 바(탭 레이아웃)가 콘텐츠를 가리지 않도록 자리를 비워둡니다.
      footer={<View style={styles.barSpace} />}
    >
      {guest ? (
        <>
          <Text accessibilityRole="header" style={f.title}>
            로그인하면{"\n"}내 이야기를{"\n"}볼 수 있어요.
          </Text>
          <Text style={f.muted}>
            로그인한 뒤 남긴 이야기가{"\n"}이곳에 모여요.
          </Text>
          <ActionButton label="로그인하기" onPress={onLogin} />
        </>
      ) : loading && stories.length === 0 ? (
        <View style={f.group}>
          <ActivityIndicator
            accessibilityLabel="내 마음 불러오는 중"
            color={t.muted}
          />
          <Text style={f.muted}>내 마음을 불러오고 있어요.</Text>
        </View>
      ) : error && stories.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.label}>MY X</Text>
          <Text accessibilityRole="header" style={styles.title}>
            내 마음을{"\n"}불러오지 못했어요.
          </Text>
          <Text style={styles.description}>
            연결을 확인하고 다시 시도해 주세요.
          </Text>
          <View style={styles.more}>
            <Button
              small
              variant="secondary"
              label="다시 불러오기"
              onPress={onRetry}
            />
          </View>
        </View>
      ) : stories.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.label}>MY X</Text>
          <Text accessibilityRole="header" style={styles.title}>
            아직 남긴{"\n"}마음이 없어요.
          </Text>
        </View>
      ) : (
        <View style={styles.list}>
          <Text style={styles.label}>MY X</Text>
          <Text accessibilityRole="header" style={styles.title}>
            내가 남긴 마음
          </Text>
          <View style={styles.cards}>
            {stories.map((story) => (
              <Pressable
                key={story.id}
                accessibilityRole="button"
                onPress={() => onOpen(story.id)}
                style={({ pressed }) => [
                  styles.card,
                  pressed && { opacity: 0.7 },
                ]}
              >
                <Text numberOfLines={1} style={styles.cardTitle}>
                  {story.title}
                </Text>
                {story.excerpt !== "" && (
                  <Text numberOfLines={2} style={styles.excerpt}>
                    {story.excerpt}
                  </Text>
                )}
                <Text style={styles.meta}>{story.meta}</Text>
              </Pressable>
            ))}
          </View>
          {error && (
            <Text accessibilityRole="alert" style={styles.description}>
              다음 마음을 불러오지 못했어요.
            </Text>
          )}
          {(hasMore || error) && (
            <View style={styles.more}>
              <Button
                small
                variant="secondary"
                label={
                  loading ? "불러오는 중…" : error ? "다시 불러오기" : "더 보기"
                }
                disabled={loading}
                onPress={error ? onRetry : onLoadMore}
              />
            </View>
          )}
        </View>
      )}
    </FlowPage>
  );
}
const styles = StyleSheet.create({
  // 시안: 설정·벨 아이콘의 가운데가 오른쪽에서 67pt·23pt. 헤더의 오른쪽 여백(24)을 되돌려 끝에 붙입니다.
  tools: { flexDirection: "row", marginRight: -t.gutter },
  gear: { width: 40, height: 44, alignItems: "center", justifyContent: "center" },
  // 시안: 라벨이 헤더 아래 34pt(목록)·146pt(빈 상태). 본문 여백 24를 뺀 값입니다.
  list: { paddingTop: 10 },
  empty: { paddingTop: 122 },
  label: { ...type.caption, color: t.muted },
  title: { ...type.heading, color: t.text, marginTop: 18 },
  description: { ...type.guide, color: t.muted, marginTop: 16 },
  cards: { gap: 16, marginTop: 18 },
  card: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
    borderRadius: 24,
    backgroundColor: t.surface,
  },
  cardTitle: { ...type.choiceSerif, color: t.text },
  excerpt: { ...type.caption, color: t.muted, marginTop: 20 },
  meta: { ...type.caption, color: t.muted, marginTop: 12 },
  more: { marginTop: 20 },
  barSpace: { height: 92 },
});
