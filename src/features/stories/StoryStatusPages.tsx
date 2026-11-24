import { Button } from "@/components/ui/button";
import { StatusPage, statusTop } from "@/components/ui/status-page";

// 05.04 삭제 / 확인. 실패하면 화면을 유지하고 같은 버튼으로 다시 시도합니다.
export function DeleteConfirmPage({
  busy,
  error,
  onDelete,
  onCancel,
}: {
  busy: boolean;
  error: string | null;
  onDelete: () => void;
  onCancel: () => void;
}) {
  return (
    <StatusPage
      top={statusTop.manage}
      title={"이 마음을\n삭제할까요?"}
      description={error ?? "한 번 삭제하면 되돌릴 수 없어요."}
      onBack={busy ? undefined : onCancel}
    >
      <Button
        variant="danger"
        busy={busy}
        label={busy ? "삭제하는 중…" : "삭제하기"}
        onPress={onDelete}
      />
      <Button
        variant="secondary"
        label="취소"
        disabled={busy}
        onPress={onCancel}
      />
    </StatusPage>
  );
}

// 05.05 삭제 / 완료
export function DeleteDonePage({ onBackToMy }: { onBackToMy: () => void }) {
  return (
    <StatusPage top={statusTop.manage} icon="check" title="마음을 삭제했어요.">
      <Button label="MY로 돌아가기" onPress={onBackToMy} />
    </StatusPage>
  );
}

// 05.07 수정 / 완료
export function EditDonePage({ onView }: { onView: () => void }) {
  return (
    <StatusPage
      top={statusTop.manage}
      icon="check"
      title="마음을 수정했어요."
      description="수정한 내용이 피드에도 반영됐어요."
    >
      <Button label="수정한 마음 보기" onPress={onView} />
    </StatusPage>
  );
}
