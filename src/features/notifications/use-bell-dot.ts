import { useEffect, useState } from "react";
import { getUnreadCount } from "./api";

// 벨의 점은 서버 unreadCount > 0일 때만 표시합니다(게스트는 개인 API 호출 금지).
export function useBellDot(ready: boolean) {
  const [dot, setDot] = useState(false);
  useEffect(() => {
    if (!ready) return;
    let active = true;
    getUnreadCount()
      .then((count) => {
        if (active) setDot(count > 0);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [ready]);
  return ready && dot;
}
