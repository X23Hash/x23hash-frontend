import { useSession } from "@/features/auth/auth-session";
import {
  episodeIds,
  type EpisodeId,
  type SceneId,
} from "@/features/onboarding/episodes";
import { OnboardingScreen } from "@/features/onboarding/OnboardingScreen";
import {
  historyFor,
  clearProgress,
  loadProgress,
  saveProgress,
} from "@/features/onboarding/progress";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import { useEffect, useRef, useState } from "react";

// 세 에피소드 균등 배정. 암호학적 난수를 쓰고, 없는 실행 환경에서만 Math.random으로 대신합니다.
const assign = (): EpisodeId => {
  const crypto = (globalThis as { crypto?: Crypto }).crypto;
  const value = crypto?.getRandomValues
    ? crypto.getRandomValues(new Uint32Array(1))[0]
    : Math.floor(Math.random() * 2 ** 32);
  return episodeIds[value % episodeIds.length];
};

// 미완료 진행은 저장된 장면을 복원하고, 없으면 세 에피소드를 균등 배정합니다.
// 시스템 뒤로는 직전 장면을 복원하고, 첫 장면에서는 둘러보기 이력을 남긴 채 그대로 나갑니다.
// 화면의 X와 여운의 "다른 마음 읽어보기"는 이력을 남기고 피드로 갑니다.
export default function OnboardingRoute() {
  const { status } = useSession();
  const navigation = useNavigation();
  // 검수용(개발 환경 전용): ?sim=kakao|insta|jani는 저장값을 덮어쓰고, ?reset=1은 저장을 지우고 새로 배정합니다.
  const { sim, reset } = useLocalSearchParams<{ sim?: string; reset?: string }>();
  const [initial] = useState(() => {
    if (__DEV__ && reset === "1") clearProgress();
    const forced = __DEV__ && episodeIds.includes(sim as EpisodeId);
    const saved = forced ? null : loadProgress();
    if (saved && !saved.done) return saved;
    const assigned = {
      episode: forced ? (sim as EpisodeId) : (saved?.episode ?? assign()),
      scene: "enter" as SceneId,
      done: false,
    };
    saveProgress(assigned);
    return assigned;
  });
  const [scene, setScene] = useState<SceneId>(initial.scene);
  const history = useRef<SceneId[]>(historyFor(initial.scene));
  // beforeRemove 리스너에서 최신 값을 읽기 위한 동기 상태입니다.
  const live = useRef({ scene: initial.scene, finished: false });
  const record = (next: SceneId, done: boolean) =>
    saveProgress({ episode: initial.episode, scene: next, done });
  const show = (next: SceneId) => {
    live.current.scene = next;
    setScene(next);
    record(next, false);
  };
  const finish = () => {
    live.current.finished = true;
    record(live.current.scene, true);
  };
  const toFeed = () => {
    finish();
    router.replace("/");
  };
  useEffect(
    () =>
      navigation.addListener("beforeRemove", (event) => {
        if (live.current.finished) return;
        const previous = history.current.pop();
        if (previous) {
          event.preventDefault();
          show(previous);
          return;
        }
        // 첫 장면에서 나가면 둘러보기 이력으로 남겨 재방문 시 피드로 들어갑니다.
        record(live.current.scene, true);
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [navigation],
  );
  return (
    <OnboardingScreen
      episode={initial.episode}
      scene={scene}
      onClose={toFeed}
      onSelect={(to) => {
        if (to === "feed") return toFeed();
        if (to === "write") {
          finish();
          if (status === "ready") router.push("/write");
          else router.push({ pathname: "/login", params: { next: "write" } });
          return;
        }
        history.current.push(live.current.scene);
        show(to);
      }}
    />
  );
}
