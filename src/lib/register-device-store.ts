import * as SecureStore from "expo-secure-store";
import { registerDeviceStore } from "./device-store";

// 네이티브의 기기 저장소 등록. 새 네이티브 모듈 없이 이미 포함된 expo-secure-store를 씁니다.
// 웹 번들에는 register-device-store.web.ts(빈 모듈)가 대신 포함됩니다.
// ponytail: 값이 약 2KB를 넘으면 일부 iOS에서 저장이 거부될 수 있습니다(게스트 숨김 약 90건).
// 그 경우 호출부가 메모리로 유지하며, 한도가 문제 되면 파일 기반 저장으로 바꿉니다.
registerDeviceStore({
  getItem: (key) => SecureStore.getItem(key),
  setItem: (key, value) => SecureStore.setItem(key, value),
  removeItem: (key) => {
    SecureStore.deleteItemAsync(key).catch(() => {});
  },
});
