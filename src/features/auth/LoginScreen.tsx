import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { StatusPage, statusTop } from "@/components/ui/status-page";
import { tokens as t, type } from "@/theme/tokens";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { mockAuthEnabled } from "./auth-session";

export type LoginPhase = "idle" | "busy" | "failed";
// 07.01 전체 화면(알림·MY·설정에서 진입) · 07.02 글쓰기 시트 · 07.03 공감·신고·차단 시트
export type LoginEntry = "page" | "write" | "react";

const sheetTitles = {
  write: "마음을 남기려면\n로그인해 주세요.",
  react: "공감을 남기려면\n로그인해 주세요.",
} as const;

// 07.01–07.05 로그인. 카카오만 실제 연동이고 Apple·Google은 공급자 설정 전이라 비활성입니다.
export function LoginScreen({
  entry,
  phase,
  failDetail,
  kakaoEnabled,
  onKakao,
  onCancel,
  onMockLogin,
}: {
  entry: LoginEntry;
  phase: LoginPhase;
  failDetail?: string;
  kakaoEnabled: boolean;
  onKakao: () => void;
  onCancel: () => void;
  onMockLogin: () => void;
}) {
  // 07.04 로그인 / 진행 중
  if (phase === "busy")
    return (
      <StatusPage top={statusTop.plain} title="로그인하는 중이에요.">
        <Button busy label="로그인하는 중…" />
        <Button variant="secondary" label="취소" onPress={onCancel} />
      </StatusPage>
    );
  // 07.05 로그인 / 실패
  if (phase === "failed")
    return (
      <StatusPage
        top={statusTop.plain}
        title={"로그인하지\n못했어요."}
        description={
          // 테스트 배포에서 실패 원인을 현장에서 읽기 위한 표시. production 번들에는 포함되지 않습니다.
          mockAuthEnabled && failDetail
            ? `연결을 확인하고 다시 시도해 주세요.\n${failDetail}`
            : "연결을 확인하고 다시 시도해 주세요."
        }
      >
        <Button
          label="다시 시도하기"
          disabled={!kakaoEnabled}
          onPress={onKakao}
        />
        <Button variant="secondary" label="나중에 할게요" onPress={onCancel} />
      </StatusPage>
    );
  const providers = (
    <>
      {/* 순서: Apple → Google → 카카오 */}
      <ProviderButton label="Apple로 계속하기" style={styles.apple} />
      <ProviderButton
        label="Google로 계속하기"
        style={styles.google}
        ink={t.text}
      />
      <ProviderButton
        label="카카오로 계속하기"
        style={styles.kakao}
        onPress={kakaoEnabled ? onKakao : undefined}
      />
    </>
  );
  const mock = mockAuthEnabled && (
    // 개발용 화면 연결. 실제 계정으로 로그인하지 않습니다.
    <Button
      variant="text"
      label="Mock 로그인으로 연결 확인"
      onPress={onMockLogin}
    />
  );
  if (entry === "page")
    return (
      <StatusPage
        top={statusTop.plain}
        title={"계속하려면\n로그인이 필요해요."}
      >
        {providers}
        <Button variant="text" label="나중에 할게요" onPress={onCancel} />
        {mock}
      </StatusPage>
    );
  return (
    <BottomSheet visible onClose={onCancel}>
      <Text accessibilityRole="header" style={styles.title}>
        {sheetTitles[entry]}
      </Text>
      <View style={styles.buttons}>
        {providers}
        <Button variant="secondary" label="나중에 할게요" onPress={onCancel} />
        {mock}
      </View>
    </BottomSheet>
  );
}

function ProviderButton({
  label,
  style,
  ink = "#000000",
  onPress,
}: {
  label: string;
  style: object;
  ink?: string;
  onPress?: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !onPress }}
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [
        styles.provider,
        style,
        (!onPress || pressed) && styles.dim,
      ]}
    >
      <Text style={[styles.providerLabel, { color: ink }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  title: { ...type.dialogTitle, color: t.text },
  // 시안(07.02): 제목 아래 16pt에 첫 버튼, 버튼 사이 16pt. 시트의 기본 간격 18에서 보정합니다.
  buttons: { gap: 16, marginTop: -2 },
  provider: {
    alignSelf: "stretch",
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  providerLabel: { ...type.button },
  apple: { backgroundColor: "#FFFFFF" },
  google: { borderWidth: 1, borderColor: t.selected },
  kakao: { backgroundColor: "#FEE500" },
  // 아직 연동하지 않은 공급자와 누르는 동안은 흐리게 보입니다.
  dim: { opacity: 0.4 },
});
