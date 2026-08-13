/**
 * 관리자 로그인 모달 — 전용 페이지 없이 지도 화면 구석 자물쇠 아이콘에서만 진입.
 * 데모 버튼도 admin/admin 값을 채워 동일한 정상 로그인 절차(useAdminLogin → bcrypt 검증)를
 * 호출할 뿐, 인증을 우회하는 별도 경로는 없다.
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

  function handleDemoLogin() {
    setUsername("admin");
    setPassword("admin");
    submit("admin", "admin").catch(() => {});
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

        <div className="mt-4 border-t border-border pt-4 text-center">
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={loginMutation.isPending}
            className="font-wordmark clip-corner-sm w-full border border-border bg-panel-2 py-2 text-sm text-ink transition-colors hover:border-accent hover:text-accent disabled:opacity-50"
          >
            회원가입 없이 둘러보기
          </button>
          <p className="mt-1.5 text-xs text-sub">
            회원가입 없이 체험해 볼 수 있습니다.
          </p>
        </div>
      </Panel>
    </div>
  );
}
