import { AuthProvider } from "@/features/auth/auth-session";
import { mergeGuestHidden } from "@/features/posts/api";
import { WritingSessionProvider } from "@/features/writing/writing-session";
import "@/global.css";
import "@/lib/register-device-store";
import { tokens } from "@/theme/tokens";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";

void SplashScreen.preventAutoHideAsync();
export default function RootLayout() {
  const [loaded, error] = useFonts({
    MaruBuri: require("@/assets/fonts/MaruBuri-Regular.ttf"),
    "MaruBuri-SemiBold": require("@/assets/fonts/MaruBuri-SemiBold.ttf"),
    Pretendard: require("@/assets/fonts/Pretendard-Regular.otf"),
    "Pretendard-Medium": require("@/assets/fonts/Pretendard-Medium.otf"),
    "Pretendard-SemiBold": require("@/assets/fonts/Pretendard-SemiBold.otf"),
  });
  useEffect(() => {
    if (loaded || error) void SplashScreen.hideAsync();
  }, [loaded, error]);
  if (!loaded && !error) return null;
  return (
    // 로그인·복원 완료 직후 게스트 숨김을 계정으로 병합합니다(서버 정책: 로그인 직후 1회).
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider onAuthenticated={() => void mergeGuestHidden()}>
        <WritingSessionProvider>
          <StatusBar style="light" />
          <Stack
            screenOptions={{
              headerShown: false,
              animation: "slide_from_right",
              contentStyle: { backgroundColor: tokens.background },
            }}
          >
            <Stack.Screen
              name="login"
              options={{
                presentation: "transparentModal",
                animation: "fade",
                contentStyle: { backgroundColor: "transparent" },
              }}
            />
          </Stack>
        </WritingSessionProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
