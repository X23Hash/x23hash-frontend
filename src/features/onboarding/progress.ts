import { deviceStore } from "../../lib/device-store.ts";
import type { EpisodeId, SceneId } from "./episodes";

// episodes.ts와의 일치는 scripts/onboarding.test.mjs에서 전수 대조로 검증합니다.
const validEpisodes: readonly string[] = ["kakao", "insta", "jani"];
const validScenes: readonly string[] = ["enter", "choice", "actionA", "afterglow"];

// 첫 방문 배정·진행 저장. 웹은 브라우저 localStorage, 네이티브는 기기 저장소에 보존해
// 앱을 다시 켜도 유지합니다. 저장소가 없거나 실패하면 앱 실행 동안만 메모리에 보존합니다.
export type OnboardingProgress = {
  episode: EpisodeId;
  scene: SceneId;
  done: boolean;
};

const key = "x23hash.onboarding.v1";
let memory: string | null = null;

export function loadProgress(): OnboardingProgress | null {
  // 저장이 손상됐거나 읽을 수 없으면 이력이 없는 것으로 보고 새로 배정합니다.
  try {
    const raw = deviceStore()?.getItem(key) ?? memory;
    if (!raw) return null;
    const data = JSON.parse(raw) as Partial<OnboardingProgress>;
    // v0.1에서 저장된 행동 B는 v0.2에 없으므로 그 다음 장면인 여운으로 읽습니다.
    if ((data.scene as string) === "actionB") data.scene = "afterglow";
    if (!validEpisodes.includes(data.episode as string)) return null;
    if (!validScenes.includes(data.scene as string)) return null;
    return {
      episode: data.episode as EpisodeId,
      scene: data.scene as SceneId,
      done: data.done === true,
    };
  } catch {
    return null;
  }
}

export function saveProgress(progress: OnboardingProgress) {
  const raw = JSON.stringify(progress);
  memory = raw;
  try {
    deviceStore()?.setItem(key, raw);
  } catch {
    // 저장 실패(사생활 보호 모드 등)는 진행을 막지 않습니다. 메모리 보존만 유지합니다.
  }
}

export function clearProgress() {
  memory = null;
  try {
    deviceStore()?.removeItem(key);
  } catch {
    // 지우지 못해도 진행을 막지 않습니다.
  }
}

// 복원된 장면에서 뒤로 갈 때 같은 에피소드의 직전 장면을 되살리기 위한 경로입니다.
export function historyFor(scene: SceneId): SceneId[] {
  if (scene === "choice") return ["enter"];
  // 여운은 선택에서 바로 올 수도 있어, 두 경로에 공통인 선택까지만 되살립니다.
  if (scene === "actionA" || scene === "afterglow") return ["enter", "choice"];
  return [];
}
