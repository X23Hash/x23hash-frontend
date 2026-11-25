import { Button } from "@/components/ui/button";
import { CircleAction } from "@/components/ui/circle-action";
import { FlowPage, flowStyles as f } from "@/components/ui/flow-page";
import { Icon, Logo } from "@/components/ui/icons";
import { fullBleed, useSideInsets } from "@/components/ui/side-insets";
import { StatusPage, statusTop } from "@/components/ui/status-page";
import { tabBarBottom, tokens as t, type } from "@/theme/tokens";
import type { ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// 05.03(05.11) 내 마음 상세 · 공유 링크 공개 상세 · 06.09 열람 불가 상태입니다.
export type StoryDetailModel = {
  id: string;
  body: string;
  // "YYYY.MM.DD. HH:mm" 또는 수정된 글은 "… · 수정됨"
  postedAt: string;
  isMine: boolean;
  suspended: boolean;
};

export function StoryDetailScreen({
  story,
  backdrop,
  loading,
  error,
  onRetry,
  onBack,
  onEdit,
  onDelete,
  onShare,
  onExplore,
}: {
  story: StoryDetailModel | null;
  // 글 배경(프리셋·사진). 라우트가 피드와 같은 배경 컴포넌트를 넣어 줍니다.
  backdrop: ReactNode;
  loading: boolean;
  error: boolean;
  onRetry: () => void;
  onBack: () => void;
  // 내 마음 상세(MY·등록 완료·알림에서 진입)에서만 넘깁니다.
  onEdit?: () => void;
  onDelete?: () => void;
  onShare: () => void;
  onExplore: () => void;
}) {
  const insets = useSafeAreaInsets();
  const side = useSideInsets(fullBleed);
  if (loading)
    return (
      <FlowPage onBack={onBack}>
        <View style={f.group}>
          <ActivityIndicator
            accessibilityLabel="마음 불러오는 중"
            color={t.muted}
          />
          <Text style={f.muted}>마음을 불러오고 있어요.</Text>
        </View>
      </FlowPage>
    );
  // 일시적인 조회 실패는 열람 불가와 구분해 재시도를 제공합니다.
  if (error)
    return (
      <StatusPage
        icon="retry"
        top={statusTop.manage}
        title={"마음을\n불러오지 못했어요."}
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
    );
  // 06.09 삭제 · 비공개 · 차단 · 권한 없음
  if (!story)
    return (
      <StatusPage
        icon="alert"
        top={statusTop.manage}
        title={"이 마음을\n볼 수 없어요."}
        description={
          "공개가 중단되었거나 접근할 수 없어요.\n다른 마음을 만나보세요."
        }
      >
        <Button label="다른 마음 읽어보기" onPress={onExplore} />
      </StatusPage>
    );
  return (
    <View style={styles.outer}>
      <View style={[styles.screen, fullBleed && styles.bleed]}>
        {backdrop}
        <View
          style={[
            styles.header,
            { top: insets.top, left: side.left, right: side.right },
          ]}
        >
          <Logo />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="뒤로"
            hitSlop={12}
            onPress={onBack}
            style={[
              styles.back,
              { left: t.gutter + side.safeLeft - side.left },
            ]}
          >
            <Icon name="caret-left" />
          </Pressable>
        </View>
        <View
          style={[
            styles.frame,
            {
              top: insets.top + 63,
              bottom: tabBarBottom(insets.bottom) + 122,
              left: t.gutter + side.left,
              right: 18 + side.right,
            },
          ]}
        >
          <View style={styles.block}>
            <Text style={styles.date}>{story.postedAt}</Text>
            {/* 상세에는 전체보기가 없으므로 긴 글은 본문 영역 안에서 스크롤합니다. */}
            <ScrollView
              showsVerticalScrollIndicator={false}
              style={styles.window}
            >
              <Text style={styles.body}>{story.body}</Text>
            </ScrollView>
            <View style={styles.signature}>
              <View style={styles.dash} />
              <Text
                accessibilityRole={story.suspended ? "alert" : undefined}
                style={styles.signatureText}
              >
                {story.suspended
                  ? "공개가 중단된 마음이에요. 나에게만 보여요."
                  : story.isMine
                    ? "이 마음은 익명으로 공개돼요."
                    : "익명의 X가 남긴 마음"}
              </Text>
            </View>
          </View>
          <View style={styles.actions}>
            {onEdit && (
              <CircleAction
                bright
                icon="pen"
                caption="수정"
                label="수정"
                onPress={onEdit}
              />
            )}
            {onDelete && (
              <CircleAction
                bright
                icon="trash"
                caption="삭제"
                label="삭제"
                onPress={onDelete}
              />
            )}
            {!story.suspended && (
              <CircleAction
                icon="share"
                caption="공유"
                label="공유"
                onPress={onShare}
              />
            )}
          </View>
        </View>
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
    overflow: "hidden",
  },
  bleed: { maxWidth: "100%" },
  header: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  back: { position: "absolute", left: t.gutter },
  // 피드 카드와 같은 틀: 글 블록과 오른쪽 버튼 열을 아래 기준선에 붙입니다.
  frame: {
    position: "absolute",
    left: t.gutter,
    right: 18,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 16,
  },
  // 시안: 서명 줄이 버튼 열 아랫선보다 11pt 위에서 끝납니다.
  block: {
    flex: 1,
    maxHeight: "100%",
    justifyContent: "flex-end",
    paddingBottom: 11,
  },
  date: { ...type.caption, color: t.storyText, marginBottom: 12 },
  window: { flexGrow: 0 },
  body: { ...type.body, color: t.storyText },
  signature: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 10,
  },
  dash: { width: 12, height: 1, backgroundColor: t.selected },
  signatureText: { ...type.caption, color: t.storyText },
  actions: { gap: 6 },
});
