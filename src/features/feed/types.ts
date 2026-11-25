export const scenarios = [
  "normal",
  "loading",
  "empty",
  "error",
  "pagination-error",
  "long-text",
] as const;
export type FeedScenario = (typeof scenarios)[number];
// 00-B 피드 배경. 사진이 있으면 사진, 없으면 프리셋 6종 중 하나입니다.
export type Background =
  | { type: "preset"; presetId: 1 | 2 | 3 | 4 | 5 | 6 }
  | { type: "photo"; imageUrl: string };
// 피드 카드 화면 모델(v0.2). 날짜는 표시용 문자열 "YYYY.MM.DD. HH:mm"입니다.
export type Story = {
  id: string;
  body: string;
  postedAt: string;
  background: Background;
  reactionCount: number;
  reacted: boolean;
  isMine: boolean;
  shareUrl?: string;
};
export type FeedPage = { items: Story[]; next: string | null };
