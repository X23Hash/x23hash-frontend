// v0.2 디자인 토큰(Dev v0.2 · E, 컬렉션 TMX Night). 원본은 UI 페이지 00-A입니다.
export const tokens = {
  background: "#12110F", // color/canvas
  surface: "#201E1A",
  raised: "#2E2B26",
  line: "#454038",
  selected: "#817D74",
  muted: "#B0A89A",
  text: "#F6F2E8",
  accent: "#E0B96A",
  danger: "#FF5A4F",
  storyText: "#F0E8D9", // 피드·시트 본문, 날짜, 서명
  inkShade: "#0D0A08", // 먹빛 그라데이션 오버레이
  serif: "MaruBuri",
  serifBold: "MaruBuri-SemiBold",
  sans: "Pretendard",
  sansMedium: "Pretendard-Medium",
  sansBold: "Pretendard-SemiBold",
  gutter: 24,
  maxWidth: 480,
} as const;

// 텍스트 스타일 11종. 행간은 시안의 비율을 px로 환산한 값입니다.
export const type = {
  heading: { fontFamily: tokens.serifBold, fontSize: 24, lineHeight: 35 },
  subhead: { fontFamily: tokens.serifBold, fontSize: 15, lineHeight: 22.5 },
  body: { fontFamily: tokens.serif, fontSize: 15, lineHeight: 25.5 },
  choiceSerif: { fontFamily: tokens.serif, fontSize: 15, lineHeight: 21 },
  note: { fontFamily: tokens.serif, fontSize: 16, lineHeight: 30 },
  dialogTitle: { fontFamily: tokens.sansBold, fontSize: 18, lineHeight: 25 },
  choice: { fontFamily: tokens.sans, fontSize: 15, lineHeight: 21 },
  button: { fontFamily: tokens.sansMedium, fontSize: 15, lineHeight: 18 },
  guide: { fontFamily: tokens.sans, fontSize: 13, lineHeight: 19.5 },
  caption: { fontFamily: tokens.sans, fontSize: 12, lineHeight: 18 },
  micro: { fontFamily: tokens.sansMedium, fontSize: 11, lineHeight: 16.5 },
} as const;
