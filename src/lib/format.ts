// 서버 ISO(UTC) 시각을 사용자 기기 시간대의 표시 문자열로 바꿉니다.
// Hermes의 Intl 지원 차이를 피하려고 Date 게터로 직접 조립합니다.
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()}`;
}

// 약관 문서의 시행일 표기 "YYYY년 M월 D일"(08.02).
export function formatLongDate(iso: string | null | undefined): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
}

// v0.2 글 메타 표기 "YYYY.MM.DD. HH:mm".
export function formatStamp(iso: string | null | undefined): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const two = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}.${two(date.getMonth() + 1)}.${two(date.getDate())}. ${two(date.getHours())}:${two(date.getMinutes())}`;
}

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${formatDate(iso)} ${date.getHours()}:${minutes}`;
}

// 알림 목록의 시각 표기(04.02 시안의 "방금 전"·"오늘"). 시안이 구간을 정하지 않아
// 10분 안은 "방금 전", 같은 날은 "오늘", 하루 전은 "어제", 그 밖은 날짜로 보입니다.
export function formatRecent(
  iso: string | null | undefined,
  now: Date = new Date(),
): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const elapsed = now.getTime() - date.getTime();
  if (elapsed >= 0 && elapsed < 10 * 60 * 1000) return "방금 전";
  const day = (value: Date) =>
    new Date(value.getFullYear(), value.getMonth(), value.getDate()).getTime();
  const days = Math.round((day(now) - day(date)) / 86400000);
  if (days === 0) return "오늘";
  if (days === 1) return "어제";
  return formatDate(iso);
}
