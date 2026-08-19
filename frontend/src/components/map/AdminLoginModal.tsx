/**
 * 관리자 로그인 모달 — 전용 페이지 없이 지도 화면 구석 자물쇠 아이콘에서만 진입.
 *
 * 이 프로젝트는 워크스페이스 표준 "회원가입 없이 둘러보기" 데모 원클릭 로그인을 의도적으로
 * 뺐다(다른 포폴 프로젝트와 다름) — Google AdSense 심사까지 노리는 실서비스 지향이라,
 * 익명 방문자가 관리자 계정으로 원클릭 로그인 가능한 버튼이 노출되는 게 부적절하다고 판단.
 * 관리자 로그인 자체(계정·bcrypt 검증)는 그대로 유지, UI 단의 원클릭 버튼만 제거.
 */
import { type FormEvent, useState } from "react";
import { X } from "lucide-react";
import { useAdminLogin } from "../../api/auth";
import { useAdminAuthStore } from "../../stores/adminAuth.store";
import { Panel } from "../ui/Panel";

export function AdminLoginModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const loginMutation = useAdminLogin();
  const setToken = useAdminAuthStore((state) => state.setToken);

  if (!isOpen) return null;

  async function submit(loginUsername: string, loginPassword: string) {
    const result = await loginMutation.mutateAsync({
      username: loginUsername,
      password: loginPassword,
    });
    setToken(result.accessToken);
    onClose();
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    // 실패 시 mutateAsync가 reject하는데, 화면 에러 표시는 loginMutation.isError로 이미
    // 처리되므로 여기서는 콘솔의 unhandled rejection만 막는다.
    submit(username, password).catch(() => {});
  }

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-bg/80 p-4">
      <Panel className="w-full max-w-sm p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-wordmark text-lg text-ink">관리자 로그인</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-sub hover:text-ink"
          >
            <X size={18} />
          </button>
        </div>
        <p className="mt-1 text-xs text-sub">
          맵 데이터 유지보수 전용 — 일반 이용에는 필요 없습니다.
        </p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <div>
            <label htmlFor="admin-username" className="block text-xs text-sub">
              아이디
            </label>
            <input
              id="admin-username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="clip-corner-sm mt-1 w-full border border-border bg-panel-2 px-3 py-2 text-sm text-ink outline-none focus:border-accent"
              autoComplete="username"
            />
          </div>
          <div>
            <label htmlFor="admin-password" className="block text-xs text-sub">
              비밀번호
            </label>
            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="clip-corner-sm mt-1 w-full border border-border bg-panel-2 px-3 py-2 text-sm text-ink outline-none focus:border-accent"
              autoComplete="current-password"
            />
          </div>

          {loginMutation.isError && (
            <p className="text-xs text-marker-secret">
              로그인에 실패했습니다. 아이디/비밀번호를 확인하세요.
            </p>
          )}

          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="font-wordmark clip-corner-sm w-full border border-accent bg-accent/15 py-2 text-sm text-accent transition-colors hover:bg-accent/25 disabled:opacity-50"
          >
            로그인
          </button>
        </form>
      </Panel>
    </div>
  );
}
