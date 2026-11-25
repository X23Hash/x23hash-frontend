import { tokens as t } from "@/theme/tokens";
import { Platform, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// 글 배경이 있는 화면(피드·상세)은 앱에서 배경을 화면 좌우 끝까지 채웁니다.
// 접는 기기의 펼친 화면처럼 넓을 때 양옆이 검게 비지 않게 하기 위해서입니다(사용자 결정 2026-11-25).
// 웹은 기존처럼 폭 480 열 안에만 배경을 둡니다.
export const fullBleed = Platform.OS !== "web";

// 접는 기기처럼 상태 표시(시계·카메라)가 화면 옆 위쪽에 놓이는 경우를 위한 좌우 값입니다.
// 내용(글·버튼·시트)은 폭 480 가운데 열을 그대로 다 쓰고(사용자 결정 2026-11-25: 실제로 겹치는 곳이 거의 없음),
// 상태 표시와 겹치는 화면 맨 위 줄의 아이콘(알림 벨·설정·닫기)만 safe 값만큼 안쪽에 둡니다.
// - left·right: 화면 가장자리에서 가운데 열까지의 거리. 부모가 이미 480 열이면 0입니다(bleed가 아닐 때).
// - safeLeft·safeRight: 같은 기준에서 옆 안전 영역까지 피한 거리. 일반 폰·웹에서는 left·right와 같습니다.
export function useSideInsets(bleed = false) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const margin = (width - Math.min(width, t.maxWidth)) / 2;
  const edge = bleed ? margin : 0;
  const safe = (inset: number) =>
    bleed ? Math.max(margin, inset) : Math.max(0, inset - margin);
  return {
    left: edge,
    right: edge,
    safeLeft: safe(insets.left),
    safeRight: safe(insets.right),
  };
}
