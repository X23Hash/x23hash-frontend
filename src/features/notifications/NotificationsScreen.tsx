import { Button } from "@/components/ui/button";
import { FlowPage, flowStyles as f } from "@/components/ui/flow-page";
import { StatusPage, statusTop } from "@/components/ui/status-page";
import { tokens as t, type } from "@/theme/tokens";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

// 04.01 빈 상태 · 04.02 목록 · 04.03 로그인 전입니다.
export type NotificationItem = {
  id: string;
  title: string;
  time: string;
  unread: boolean;
};

export function NotificationsScreen({
  guest,
  loading,
  error,
  items,
  hasMore,
  onBack,
  onLogin,
  onRetry,
  onLoadMore,
  onOpen,
}: {
  guest: boolean;
  loading: boolean;
  error: boolean;
  items: NotificationItem[];
  hasMore: boolean;
  onBack: () => void;
  onLogin: () => void;
  onRetry: () => void;
  onLoadMore: () => void;
  onOpen: (id: string) => void;
}) {
  // 비로그인을 0건으로 보여주지 않습니다(04.03).
  if (guest)
    return (
      <StatusPage
        icon="bell"
        top={statusTop.notice}
        title={"로그인하면 알림을\n받을 수 있어요."}
        inline={<Button small label="로그인하기" onPress={onLogin} />}
        onBack={onBack}
      />
    );
  if (items.length === 0 && !loading)
    return error ? (
      <StatusPage
        icon="retry"
        top={statusTop.notice}
        title={"알림을\n불러오지 못했어요."}
        description="연결을 확인하고 다시 시도해 주세요."
        inline={
          <Button
            small
            variant="secondary"
            label="다시 불러오기"
            onPress={onRetry}
          />
        }
        onBack={onBack}
      />
    ) : (
      <StatusPage
        icon="bell"
        top={statusTop.notice}
        title={"아직 도착한\n알림이 없어요."}
        onBack={onBack}
      />
    );
  return (
    <FlowPage onBack={onBack}>
      {items.length === 0 ? (
        <View style={f.group}>
          <ActivityIndicator
            accessibilityLabel="알림 불러오는 중"
            color={t.muted}
          />
          <Text style={f.muted}>알림을 불러오고 있어요.</Text>
        </View>
      ) : (
        <View style={styles.list}>
          {items.map((item) => (
            <Pressable
              key={item.id}
              accessibilityRole="button"
              accessibilityLabel={
                item.unread ? `읽지 않음. ${item.title}` : item.title
              }
              onPress={() => onOpen(item.id)}
              style={({ pressed }) => [
                styles.card,
                item.unread && styles.unread,
                pressed && { opacity: 0.7 },
              ]}
            >
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.time}>{item.time}</Text>
            </Pressable>
          ))}
          {error && (
            <Text accessibilityRole="alert" style={f.muted}>
              다음 알림을 불러오지 못했어요.
            </Text>
          )}
          {(hasMore || error) && (
            <Button
              small
              variant="secondary"
              label={
                loading ? "불러오는 중…" : error ? "다시 불러오기" : "더 보기"
              }
              disabled={loading}
              onPress={error ? onRetry : onLoadMore}
            />
          )}
        </View>
      )}
    </FlowPage>
  );
}
const styles = StyleSheet.create({
  // 시안: 첫 카드가 헤더 아래 26pt(본문 여백 24 + 2), 카드 사이 12pt.
  list: { gap: 12, paddingTop: 2 },
  // 읽지 않은 알림은 밝은 테두리로 구분합니다. 테두리 두께만큼 높이가 달라지지 않게 늘 1pt를 둡니다.
  card: {
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 16,
    gap: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: t.surface,
    backgroundColor: t.surface,
  },
  unread: { borderColor: t.selected },
  title: { ...type.choice, color: t.text },
  time: { ...type.caption, color: t.muted },
});
