import { Button } from "@/components/ui/button";
import { FlowPage, flowStyles as f } from "@/components/ui/flow-page";
import {
  getLegalDocument,
  type LegalDocument,
} from "@/features/auth/api/legal-api";
import { formatLongDate } from "@/lib/format";
import { tokens as t, type } from "@/theme/tokens";
import { Redirect, router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

// 08.02 이용약관 · 08.03 개인정보 처리방침. 서버의 현재 시행 문서를 표시합니다.
const kinds = {
  terms: { title: "이용약관", type: "TERMS" },
  privacy: { title: "개인정보 처리방침", type: "PRIVACY" },
} as const;

export default function LegalRoute() {
  const { kind } = useLocalSearchParams<{ kind: string }>();
  const target = kinds[kind as keyof typeof kinds];
  const [document, setDocument] = useState<LegalDocument | null>(null);
  const [error, setError] = useState(false);
  const load = useCallback(() => {
    if (!target) return;
    setError(false);
    setDocument(null);
    getLegalDocument(target.type)
      .then(setDocument)
      .catch(() => setError(true));
  }, [target]);
  useEffect(() => {
    queueMicrotask(load);
  }, [load]);
  if (!target) return <Redirect href="/settings" />;
  return (
    <FlowPage
      onBack={() =>
        router.canGoBack() ? router.back() : router.replace("/settings")
      }
    >
      {error ? (
        <View>
          <Text accessibilityRole="header" style={f.title}>
            문서를{"\n"}불러오지 못했어요.
          </Text>
          <Text style={styles.retryNote}>
            연결을 확인하고 다시 시도해 주세요.
          </Text>
          <View style={styles.retry}>
            <Button
              small
              variant="secondary"
              label="다시 불러오기"
              onPress={load}
            />
          </View>
        </View>
      ) : !document ? (
        <View style={f.group}>
          <ActivityIndicator
            accessibilityLabel="문서 불러오는 중"
            color={t.muted}
          />
          <Text style={f.muted}>문서를 불러오고 있어요.</Text>
        </View>
      ) : (
        <View>
          <Text style={styles.effective}>
            시행일 {formatLongDate(document.effectiveAt)} · v{document.version}
          </Text>
          {/* 서버 문서는 줄글이라 "제1조…" 같은 조항 줄과 첫 줄(문서 이름)만 제목처럼 밝게 보입니다. */}
          {document.body.split("\n").map((line, index) =>
            line.trim() === "" ? (
              <View key={index} style={styles.gap} />
            ) : (
              <Text
                key={index}
                style={
                  index === 0 || /^제\s*\d+\s*조/.test(line)
                    ? styles.heading
                    : styles.paragraph
                }
              >
                {line}
              </Text>
            ),
          )}
        </View>
      )}
    </FlowPage>
  );
}

const styles = StyleSheet.create({
  effective: { ...type.caption, color: t.muted, marginBottom: 20 },
  heading: { ...type.choice, color: t.text, marginBottom: 8 },
  paragraph: { ...type.guide, color: t.muted },
  gap: { height: 20 },
  retryNote: { ...type.guide, color: t.muted, marginTop: 16 },
  retry: { marginTop: 24 },
});
