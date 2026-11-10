import { USERS, type User } from "../../shared/users";
import { api } from "./api";
import { Logo } from "./Logo";
import { showToast } from "./Toast";

export function Login({ onLogin }: { onLogin: (user: User) => void }) {
  const login = (userId: string) =>
    api<{ user: User }>("/api/login", "POST", { userId })
      .then((r) => onLogin(r.user))
      .catch((e: Error) => showToast(e.message));
  return (
    <div className="login-page">
      <div className="login-card">
        <Logo />
        <p className="hint">Demo accounts — try sharing between Alice and Bob</p>
        {USERS.map((u) => (
          <button key={u.id} className="login-user" data-testid={`login-user-${u.id}`} onClick={() => login(u.id)}>
            <strong>{u.name}</strong>
            <span>{u.email}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
