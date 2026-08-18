/**
 * 이미지 URL의 실제 로드 성공/실패를 브라우저에서 프리로드로 확인하는 훅.
 * MapCanvas(뷰어)에서 사용 — 컴포넌트 파일에 훅을
 * 같이 export하면 react-refresh fast-refresh 경고가 나서 별도 파일로 분리했다.
 */
import { useEffect, useState } from "react";

export type ImageLoadState = "loading" | "loaded" | "error";

export function useImageLoadState(url: string | undefined): ImageLoadState {
  const [state, setState] = useState<ImageLoadState>("loading");

  useEffect(() => {
    if (!url) {
      setState("error");
      return;
    }
    setState("loading");
    const img = new Image();
    img.onload = () => setState("loaded");
    img.onerror = () => setState("error");
    img.src = url;
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [url]);

  return state;
}
