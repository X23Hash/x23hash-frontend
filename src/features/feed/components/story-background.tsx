import { tokens as t } from "@/theme/tokens";
import { Image as ExpoImage } from "expo-image";
import { Image, StyleSheet, View } from "react-native";
import Svg, {
  Defs,
  LinearGradient,
  RadialGradient,
  Rect,
  Stop,
} from "react-native-svg";
import type { Background } from "../types";

// 00-B 피드 배경 프리셋 6종(먹·새벽·노을·비·숲·와인). 값은 전달받은 원본 SVG(240×520) 그대로입니다.
// top → mid(55%) → canvas 세로 그라데이션 위에 glow 타원을 얹습니다.
// 웹은 SVG id가 문서 전체에서 공유되므로 프리셋 번호를 id에 넣어 카드끼리 섞이지 않게 합니다.
const presets = [
  { top: "#2A2621", mid: "#17150F", glow: "#6A5C49", opacity: 0.35, x: 72, y: 62.4 },
  { top: "#1D2236", mid: "#13151E", glow: "#5263A0", opacity: 0.55, x: 192, y: 52 },
  { top: "#3A2220", mid: "#1B1311", glow: "#B8653F", opacity: 0.45, x: 52.8, y: 52 },
  { top: "#1E2A30", mid: "#121819", glow: "#668492", opacity: 0.38, x: 172.8, y: 93.6 },
  { top: "#1C2720", mid: "#121612", glow: "#557458", opacity: 0.42, x: 48, y: 83.2 },
  { top: "#2F1820", mid: "#170F12", glow: "#83344A", opacity: 0.48, x: 182.4, y: 62.4 },
] as const;

// 원본의 그레인은 SVG 필터(feTurbulence)인데 react-native-svg가 네이티브에서 그리지 못합니다.
// 전달받은 SVG의 필터를 크롬으로 렌더해 질감 층만 뽑은 이미지(375×812 기준)를 얹습니다.
const grain = require("@/assets/images/feed/grain.png");

export function StoryBackground({ background }: { background: Background }) {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {background.type === "photo" ? (
        <>
          {/* 내 사진 배경은 흐림 + 어둡게 처리해 본문 대비를 확보합니다(02.04 규칙). */}
          <ExpoImage
            source={{ uri: background.imageUrl }}
            contentFit="cover"
            blurRadius={12}
            style={StyleSheet.absoluteFill}
            accessible={false}
          />
          <View style={[StyleSheet.absoluteFill, styles.shade]} />
        </>
      ) : (
        <Preset index={background.presetId - 1} />
      )}
      <Image
        source={grain}
        resizeMode="cover"
        style={styles.grain}
        accessible={false}
      />
    </View>
  );
}

function Preset({ index }: { index: number }) {
  const preset = presets[index] ?? presets[0];
  return (
    <Svg
      width="100%"
      height="100%"
      viewBox="0 0 240 520"
      preserveAspectRatio="none"
    >
      <Defs>
        <LinearGradient id={`base-${index}`} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={preset.top} />
          <Stop offset="0.55" stopColor={preset.mid} />
          <Stop offset="1" stopColor={t.background} />
        </LinearGradient>
        <RadialGradient
          id={`glow-${index}`}
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform={`translate(${preset.x} ${preset.y}) scale(180 197.6)`}
        >
          <Stop offset="0" stopColor={preset.glow} stopOpacity={preset.opacity} />
          <Stop offset="1" stopColor={preset.glow} stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Rect width="240" height="520" fill={`url(#base-${index})`} />
      <Rect width="240" height="520" fill={`url(#glow-${index})`} />
    </Svg>
  );
}

// 본문이 넘칠 때 마지막 줄을 흐리는 색. 그 높이(화면 약 70%)의 바탕색에 맞춰야 경계가 보이지 않습니다.
// 프리셋은 mid → canvas 구간의 색, 사진은 어둡게 덮은 먹빛을 씁니다.
export function fadeColors(background: Background): [string, string] {
  const [r, g, b] =
    background.type === "photo"
      ? [13, 10, 8]
      : mix(presets[background.presetId - 1]?.mid ?? presets[0].mid);
  return [`rgba(${r},${g},${b},0)`, `rgba(${r},${g},${b},1)`];
}
const mix = (mid: string) =>
  [1, 3, 5].map((at, channel) =>
    Math.round(
      parseInt(mid.slice(at, at + 2), 16) * 0.67 + [18, 17, 15][channel] * 0.33,
    ),
  );

const styles = StyleSheet.create({
  shade: { backgroundColor: "rgba(13,10,8,0.6)" },
  // 웹은 이미지 원본 크기가 기본 폭·높이로 잡히므로 명시적으로 채웁니다.
  grain: { position: "absolute", top: 0, left: 0, width: "100%", height: "100%" },
});
