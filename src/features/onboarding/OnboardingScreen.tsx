import { Button } from "@/components/ui/button";
import { Icon, Logo } from "@/components/ui/icons";
import { tokens as t, type } from "@/theme/tokens";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
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
  const current = episodes[episode][scene];
  const panel = scene === "afterglow" ? null : panels[episode][scene];
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
              style={styles.close}
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
                    style={[
                      styles.panel,
                      {
                        aspectRatio: tallPanel(episode, scene)
                          ? 512 / 588
                          : 512 / 555,
                      },
                    ]}
                  />
                </FadeIn>
                <FadeIn delay={700}>
                  <Text accessibilityRole="header" style={styles.title}>
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
  // 시안: 패널이 헤더 아래 21pt, 제목은 패널 아래 24pt. 이미지의 투명 여백(위 16, 아래 32)만큼 빼서 맞춥니다.
  panel: { marginHorizontal: -t.gutter, marginTop: 5 },
  title: { ...type.heading, color: t.text, marginTop: -8 },
  // 시안: 라벨이 헤더 아래 148pt, 제목은 라벨 아래 17pt, 덧붙임은 제목 아래 23pt.
  afterglow: { paddingTop: 148 },
  label: { ...type.caption, color: t.muted },
  afterglowTitle: { marginTop: 17 },
  sub: { ...type.guide, color: t.muted, marginTop: 23 },
  ctas: { paddingHorizontal: t.gutter, paddingBottom: t.gutter, gap: 12 },
});
