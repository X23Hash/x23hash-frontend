import { tokens as t } from "@/theme/tokens";
import { SvgXml } from "react-native-svg";
import { iconXml, logoXml } from "./icon-data";

export type IconName = keyof typeof iconXml;

export function Icon({
  name,
  color = t.text,
  size = 24,
}: {
  name: IconName;
  color?: string;
  size?: number;
}) {
  return (
    <SvgXml
      xml={iconXml[name]}
      width={size}
      height={size}
      color={color}
      aria-hidden={true}
    />
  );
}

// 헤더 로고(원본 103×28). 높이만 받아 비율을 유지합니다.
export function Logo({ height = 28 }: { height?: number }) {
  return (
    <SvgXml
      xml={logoXml}
      width={(height * 103) / 28}
      height={height}
      accessibilityRole="image"
      accessibilityLabel="X23#"
    />
  );
}
