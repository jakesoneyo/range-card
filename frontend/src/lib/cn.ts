/** 조건부 클래스명 조합 — clsx 수준의 니즈뿐이라 의존성 추가 없이 한 줄로 해결. */
export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}
