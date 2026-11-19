// 기기에 남는 키-값 저장소. 웹은 브라우저 localStorage를 쓰고,
// 네이티브는 앱 시작 시 register-device-store가 등록한 저장소를 씁니다.
// 둘 다 없으면(SSR·테스트) null이며 호출부가 메모리로 대체합니다.
export type DeviceStore = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
};

let registered: DeviceStore | null = null;

export function registerDeviceStore(store: DeviceStore | null) {
  registered = store;
}

export const deviceStore = (): DeviceStore | null =>
  (globalThis as { localStorage?: DeviceStore }).localStorage ?? registered;
