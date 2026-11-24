import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "@/components/ui/check-circle";
import { Icon } from "@/components/ui/icons";
import { tokens as t, type } from "@/theme/tokens";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { getLegalDocuments, type LegalDocument } from "./api/legal-api";

// 07.06 약관 / 동의. 현재 시행 중인 약관 버전을 조회해 그 버전으로 동의를 저장합니다.
// 시트를 닫으면(바깥 탭) 로그인 자체를 취소합니다.
export function ConsentScreen({
  onCancel,
  onViewDocument,
  onAgree,
}: {
  onCancel: () => void;
  onViewDocument: (kind: "terms" | "privacy") => void;
  // 서버 저장 실패 시 reject합니다. 체크 상태는 화면이 보존합니다.
  onAgree: (termsVersion: string, privacyVersion: string) => Promise<void>;
}) {
  const [documents, setDocuments] = useState<LegalDocument[] | null>(null);
  const [documentsError, setDocumentsError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  // 최초에는 모두 미선택입니다.
  const [checked, setChecked] = useState([false, false, false]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);
  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      setDocumentsError(false);
      getLegalDocuments()
        .then((list) => {
          if (active) setDocuments(list);
        })
        .catch(() => {
          if (active) setDocumentsError(true);
        });
    });
    return () => {
      active = false;
    };
  }, [reloadKey]);
  const terms = documents?.find((document) => document.type === "TERMS");
  const privacy = documents?.find((document) => document.type === "PRIVACY");
  const all = checked.every(Boolean);
  const toggle = (index: number) =>
    setChecked((previous) =>
      previous.map((value, at) => (at === index ? !value : value)),
    );
  const agree = () => {
    if (!terms || !privacy) return;
    setSaving(true);
    setSaveError(false);
    onAgree(terms.version, privacy.version).catch(() => {
      // 저장 실패는 체크를 유지하고 재시도를 안내합니다.
      setSaveError(true);
      setSaving(false);
    });
  };
  const close = saving ? () => {} : onCancel;
  if (!documents && !documentsError)
    return (
      <BottomSheet visible onClose={close}>
        <ActivityIndicator accessibilityLabel="약관 불러오는 중" color={t.muted} />
        <Text style={styles.note}>약관을 불러오고 있어요.</Text>
      </BottomSheet>
    );
  if (documentsError || !terms || !privacy)
    return (
      <BottomSheet visible onClose={close}>
        <Text accessibilityRole="header" style={styles.title}>
          약관을{"\n"}불러오지 못했어요.
        </Text>
        <Text style={styles.note}>연결을 확인하고 다시 시도해 주세요.</Text>
        <Button
          label="다시 불러오기"
          onPress={() => setReloadKey((value) => value + 1)}
        />
      </BottomSheet>
    );
  const rows = [
    { label: "[필수] 이용약관", view: () => onViewDocument("terms") },
    { label: "[필수] 개인정보 처리방침", view: () => onViewDocument("privacy") },
    { label: "[필수] 만 14세 이상이에요", view: undefined },
  ];
  return (
    <BottomSheet visible onClose={close}>
      <Text accessibilityRole="header" style={styles.title}>
        시작하기 전에{"\n"}확인해 주세요.
      </Text>
      <View style={styles.card}>
        <Row
          label="모두 동의하기"
          checked={all}
          onPress={() => setChecked([!all, !all, !all])}
        />
        <View style={styles.line} />
        {rows.map((row, index) => (
          <Row
            key={row.label}
            label={row.label}
            checked={checked[index]}
            onPress={() => toggle(index)}
            onView={row.view}
          />
        ))}
      </View>
      {saveError && (
        <Text accessibilityRole="alert" style={styles.note}>
          동의를 저장하지 못했어요. 다시 시도해 주세요.
        </Text>
      )}
      <Button
        busy={saving}
        label={saving ? "저장하는 중…" : "동의하고 시작하기"}
        disabled={!all}
        onPress={agree}
      />
    </BottomSheet>
  );
}

function Row({
  label,
  checked,
  onPress,
  onView,
}: {
  label: string;
  checked: boolean;
  onPress: () => void;
  onView?: () => void;
}) {
  return (
    <View style={styles.row}>
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked }}
        onPress={onPress}
        style={styles.check}
      >
        <CheckCircle checked={checked} />
        <Text style={styles.label}>{label}</Text>
      </Pressable>
      {onView && (
        <Pressable
          accessibilityRole="link"
          accessibilityLabel={`${label} 보기`}
          hitSlop={8}
          onPress={onView}
          style={styles.view}
        >
          <Icon name="caret" size={16} color={t.muted} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  title: { ...type.dialogTitle, color: t.text },
  note: { ...type.guide, color: t.muted },
  // 시안: 제목 아래 16pt에 카드. 시트의 기본 간격 18에서 보정합니다.
  card: { borderRadius: 20, backgroundColor: t.raised, marginTop: -2 },
  line: { height: 1, backgroundColor: t.line },
  row: { height: 52, flexDirection: "row", alignItems: "center" },
  check: {
    flex: 1,
    height: "100%",
    paddingLeft: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  label: { ...type.choice, color: t.text },
  view: {
    width: 48,
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
});
