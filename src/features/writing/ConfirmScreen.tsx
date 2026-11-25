import { Button } from "@/components/ui/button";
import { StatusPage } from "@/components/ui/status-page";

// 02.07 남기기 확인. 이 단계에서는 글을 만들지 않습니다.
export function ConfirmScreen({
  onEdit,
  onSubmit,
}: {
  onEdit: () => void;
  onSubmit: () => void;
}) {
  return (
    <StatusPage
      icon="pen"
      title="이 마음을 남길까요?"
      description={
        "작성자 이름 없이 스토리 피드에 올라가요.\n남긴 마음은 MY에서 수정하거나 삭제할 수 있어요.\n실명이나 연락처는 남기지 말아주세요."
      }
    >
      <Button label="남기기" onPress={onSubmit} />
      <Button variant="secondary" label="돌아가서 수정하기" onPress={onEdit} />
    </StatusPage>
  );
}
