import { Button } from "@/components/ui/button";
import { Icon, Logo } from "@/components/ui/icons";
import { useSideInsets } from "@/components/ui/side-insets";
import { tokens as t, type } from "@/theme/tokens";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { episodes, type Cta, type EpisodeId, type SceneId } from "./episodes";
import { FadeIn } from "./fade-in";

// 장면 뒤에 어둡게 깔리는 사진(시안 PDF의 원본 사진).
const backgrounds = {
  kakao: require("@/assets/images/onboarding/bedroom-night.jpg"),
  insta: require("@/assets/images/onboarding/cafe-drinks.jpg"),
  jani: require("@/assets/images/onboarding/bus-dusk.jpg"),
} as const;

// 카톡·인스타·메시지 화면은 연출용 이미지입니다(사용자가 전달한 원본, 512×555·인스타 게시물만 512×588).
// 패널 둘레에 그림자용 투명 여백(375pt 폭 기준 좌우 24, 위 16, 아래 32)이 포함돼 있어 화면 폭 전체로 깔아야 패널이 좌우 여백 24에 맞습니다.
const panels = {
  kakao: {
    enter: require("@/assets/images/onboarding/panels/kakao-enter.png"),
    choice: require("@/assets/images/onboarding/panels/kakao-choice.png"),
    actionA: require("@/assets/images/onboarding/panels/kakao-action.png"),
  },
  insta: {
    enter: require("@/assets/images/onboarding/panels/insta-enter.png"),
    choice: require("@/assets/images/onboarding/panels/insta-choice.png"),
    actionA: require("@/assets/images/onboarding/panels/insta-action.png"),
  },
  jani: {
    enter: require("@/assets/images/onboarding/panels/jani-enter.png"),
    choice: require("@/assets/images/onboarding/panels/jani-choice.png"),
    actionA: require("@/assets/images/onboarding/panels/jani-action.png"),
  },
} as const;
const tallPanel = (episode: EpisodeId, scene: SceneId) =>
  episode === "insta" && scene === "actionA";

// 01.01–01.12. 진입·선택·행동 A는 연출 패널 + 한 문장, 여운은 라벨·문장·덧붙임만 보입니다.
// 표에 적힌 CTA만 동작하며 패널 안의 요소는 눌리지 않습니다.
export function OnboardingScreen({
  episode,
  scene,
  onSelect,
  onClose,
}: {
  episode: EpisodeId;
  scene: SceneId;
  onSelect: (to: Cta["to"]) => void;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();
  const side = useSideInsets();
  const current = episodes[episode][scene];
  const panel = scene === "afterglow" ? null : panels[episode][scene];
  // 화면이 낮으면(접는 기기의 바깥·안쪽 화면 등) 패널을 줄여 문장이 버튼에 가리지 않게 합니다.
  // 패널 이미지에는 투명 여백(좌우 24, 위 16, 아래 32)이 있어 축소 비율만큼 여백 보정도 줄입니다.
  const window = useWindowDimensions();
  const column = Math.min(window.width, t.maxWidth);
  const ratio = tallPanel(episode, scene) ? 588 / 512 : 555 / 512;
  const footer = current.ctas.length * 48 + (current.ctas.length - 1) * 12 + 24;
  const titleHeight =
    current.title.split("\n").length * type.heading.lineHeight;
  const room =
    window.height - insets.top - insets.bottom - 44 - footer - 61 - titleHeight;
  const scale = Math.max(0.6, Math.min(1, room / (column * ratio - 48)));
  return (
    <View style={styles.outer}>
      {/* 여운은 사진 없이 바탕색만 둡니다(시안). */}
      {panel && (
        <>
          <Image
            source={backgrounds[episode]}
            contentFit="cover"
            accessible={false}
            style={StyleSheet.absoluteFill}
          />
          <LinearGradient
            colors={["rgba(18,17,15,0.78)", "rgba(18,17,15,0.9)", t.background]}
            locations={[0, 0.45, 0.7]}
            style={StyleSheet.absoluteFill}
          />
        </>
      )}
      <View
        style={[
          styles.page,
          { paddingTop: insets.top, paddingBottom: insets.bottom },
        ]}
      >
        <View style={styles.header}>
          <Logo />
          {panel && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="닫기"
              hitSlop={12}
              onPress={onClose}
              style={[styles.close, { left: t.gutter + side.safeLeft }]}
            >
              <Icon name="close" />
            </Pressable>
          )}
        </View>
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={styles.scroll}
          contentContainerStyle={styles.body}
        >
          {/* 장면이 바뀔 때마다 연출을 처음부터 다시 재생합니다. */}
          <View key={`${episode}-${scene}`} testID={current.screen}>
            {panel ? (
              <>
                <FadeIn duration={900}>
                  <Image
                    source={panel}
                    contentFit="contain"
                    accessible={false}
                    style={{
                      width: column * scale,
                      aspectRatio: 1 / ratio,
                      marginLeft: -t.gutter * scale,
                      marginTop: 21 - 16 * scale,
                    }}
                  />
                </FadeIn>
                <FadeIn delay={700}>
                  <Text
                    accessibilityRole="header"
                    style={[styles.title, { marginTop: 24 - 32 * scale }]}
                  >
                    {current.title}
                  </Text>
                </FadeIn>
              </>
            ) : (
              <View style={styles.afterglow}>
                <FadeIn delay={300}>
                  <Text style={styles.label}>{current.label}</Text>
                </FadeIn>
                <FadeIn delay={650}>
                  <Text
                    accessibilityRole="header"
                    style={[styles.title, styles.afterglowTitle]}
                  >
                    {current.title}
                  </Text>
                </FadeIn>
                <FadeIn delay={1000}>
                  <Text style={styles.sub}>{current.body}</Text>
                </FadeIn>
              </View>
            )}
          </View>
        </ScrollView>
        <FadeIn
          key={`${episode}-${scene}-ctas`}
          delay={panel ? 1250 : 1550}
          style={styles.ctas}
        >
          {current.ctas.map((cta, index) => (
            <Button
              key={cta.label}
              variant={index === 0 ? "primary" : "secondary"}
              label={cta.label}
              onPress={() => onSelect(cta.to)}
            />
          ))}
        </FadeIn>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: { flex: 1, backgroundColor: t.background, alignItems: "center" },
  page: { flex: 1, width: "100%", maxWidth: t.maxWidth },
  header: { height: 44, alignItems: "center", justifyContent: "center" },
  close: { position: "absolute", left: t.gutter },
  scroll: { flex: 1 },
  body: { flexGrow: 1, paddingHorizontal: t.gutter, paddingBottom: 16 },
  // 시안: 패널이 헤더 아래 21pt, 제목은 패널 아래 24pt. 여백 보정은 축소 비율과 함께 위에서 계산합니다.
  title: { ...type.heading, color: t.text },
  // 시안: 라벨이 헤더 아래 148pt, 제목은 라벨 아래 17pt, 덧붙임은 제목 아래 23pt.
  afterglow: { paddingTop: 148 },
  label: { ...type.caption, color: t.muted },
  afterglowTitle: { marginTop: 17 },
  sub: { ...type.guide, color: t.muted, marginTop: 23 },
  ctas: { paddingHorizontal: t.gutter, paddingBottom: t.gutter, gap: 12 },
});
