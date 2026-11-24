import { useSyncExternalStore } from "react";

// 시트가 열려 있는지. 하단 내비는 탭 레이아웃에 떠 있어 화면 안의 시트보다 위에 그려지므로,
// 시안처럼 시트가 내비를 덮게 하려면 열려 있는 동안 내비를 내려야 합니다.
let open = 0;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((listener) => listener());

export function holdOverlay() {
  open += 1;
  emit();
  return () => {
    open -= 1;
    emit();
  };
}

export const useOverlayOpen = () =>
  useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => open > 0,
    () => false,
  );
