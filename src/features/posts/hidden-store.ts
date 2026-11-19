import { deviceStore } from "../../lib/device-store.ts";

// 로그인 전(게스트) 숨긴 글 저장. 서버 정책: 게스트 숨김은 기기(웹은 브라우저)에 저장하고
// 프론트가 피드에서 걸러낸 뒤, 로그인 직후 계정 숨김에 합칩니다.
// 저장소가 없거나 실패하면 앱 실행 동안만 메모리에 유지합니다.
const key = "x23hash.hidden.v1";
let memory: string[] = [];

export function loadHidden(): string[] {
  try {
    const raw = deviceStore()?.getItem(key);
    if (raw) {
      const data = JSON.parse(raw) as unknown;
      if (Array.isArray(data))
        return data.filter((id): id is string => typeof id === "string");
    }
  } catch {
    // 손상된 저장값은 무시합니다.
  }
  return memory;
}

export function addHidden(postId: string) {
  const next = [...new Set([...loadHidden(), postId])];
  memory = next;
  try {
    deviceStore()?.setItem(key, JSON.stringify(next));
  } catch {
    // 저장 실패해도 메모리 필터는 유지됩니다.
  }
}

export function clearHidden() {
  memory = [];
  try {
    deviceStore()?.removeItem(key);
  } catch {
    // 정리 실패는 무시합니다.
  }
}
