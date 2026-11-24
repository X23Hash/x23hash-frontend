// 01.01–01.12 장면·CTA 전이(v0.2). 에피소드마다 진입 → 선택 → (행동 A) → 여운이고,
// 선택에서 "그냥 닫는다"는 바로 여운으로 갑니다(v0.1의 행동 B 삭제).
// 문구는 UI 시안 화면이 기준입니다. 카톡·인스타 여운은 Dev 문서와 문구가 달라 UI를 따랐습니다.
export type SceneId = "enter" | "choice" | "actionA" | "afterglow";
export type EpisodeId = "kakao" | "insta" | "jani";
export type Cta = { label: string; to: SceneId | "write" | "feed" };
export type Scene = {
  screen: string;
  // 여운 장면에만 있는 작은 라벨과 덧붙이는 문장
  label?: string;
  title: string;
  body?: string;
  ctas: Cta[];
};

export const episodeIds: EpisodeId[] = ["kakao", "insta", "jani"];

const afterglowCtas: Cta[] = [
  { label: "이 마음 남기기", to: "write" },
  { label: "다른 마음 읽어보기", to: "feed" },
];

export const episodes: Record<EpisodeId, Record<SceneId, Scene>> = {
  kakao: {
    enter: {
      screen: "01.01",
      title: "익숙한 이름인데,\n사진은 처음 보는 거였다.",
      ctas: [{ label: "프로필을 누른다", to: "choice" }],
    },
    choice: {
      screen: "01.02",
      title: "네 옆에,\n모르는 사람이 있었다.",
      ctas: [
        { label: "사진을 크게 본다", to: "actionA" },
        { label: "그냥 닫는다", to: "afterglow" },
      ],
    },
    actionA: {
      screen: "01.03",
      title: "너는 연애 중이구나.",
      ctas: [{ label: "프로필을 닫는다", to: "afterglow" }],
    },
    afterglow: {
      screen: "01.04",
      label: "다시 친구 목록",
      title: "잘 지내길 바랐는데,\n이렇게 잘 지낼 줄은 몰랐다.",
      body: "나만 아직 헤어진 날에\n살고 있었다.",
      ctas: afterglowCtas,
    },
  },
  insta: {
    enter: {
      screen: "01.05",
      title: "아이디는,\n아직 외우고 있었다.",
      ctas: [{ label: "계정을 검색한다", to: "choice" }],
    },
    choice: {
      screen: "01.06",
      title: "새 사진이\n올라와 있었다.",
      ctas: [
        { label: "최근 게시물을 누른다", to: "actionA" },
        { label: "그냥 닫는다", to: "afterglow" },
      ],
    },
    actionA: {
      screen: "01.07",
      title: "모르는 사람의 댓글\n신경쓰였다.",
      ctas: [{ label: "게시물을 닫는다", to: "afterglow" }],
    },
    afterglow: {
      screen: "01.08",
      label: "화면을 덮으며",
      title: "내가 없는 겨울이\n제법 따뜻한가 보다.",
      body: "그 크리스마스 트리 앞에\n나는 없었다.",
      ctas: afterglowCtas,
    },
  },
  jani: {
    enter: {
      screen: "01.09",
      title: "2시 47분\n넌 뭘하고 있을까",
      ctas: [{ label: "그 사람과의 대화를 연다", to: "choice" }],
    },
    choice: {
      screen: "01.10",
      title: "마지막 대화를\n다시 곱씹어 봤다.",
      ctas: [
        { label: "두 글자를 써본다", to: "actionA" },
        { label: "그냥 닫는다", to: "afterglow" },
      ],
    },
    actionA: {
      screen: "01.11",
      title: "보낼까, 말까.",
      ctas: [{ label: "두 글자를 지운다", to: "afterglow" }],
    },
    afterglow: {
      screen: "01.12",
      label: "보내지 않은 새벽",
      title: "후회 안 하겠냐고 물었지.\n응, 하고 있어.",
      body: "그 대답,\n아직 아무에게도 못 했다.",
      ctas: afterglowCtas,
    },
  },
};
