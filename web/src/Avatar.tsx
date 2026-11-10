import { useState } from "react";
import type { User } from "../../shared/users";

const initials = (name: string) =>
  name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

export function Avatar({ user, onLogout }: { user: User; onLogout: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="avatar-wrap">
      <button className="avatar" data-testid="avatar" title={user.name} onClick={() => setOpen(!open)}>
        {initials(user.name)}
      </button>
      {open && (
        <div className="menu">
          <div className="menu-user">{user.name}</div>
          <button data-testid="menu-switch-user" onClick={onLogout}>
            Switch user
          </button>
          <button data-testid="menu-logout" onClick={onLogout}>
            Log out
          </button>
        </div>
      )}
    </div>
  );
}
