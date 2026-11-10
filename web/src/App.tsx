import { useEffect, useState } from "react";
import type { User } from "../../shared/users";
import { api } from "./api";
import { Editor } from "./Editor";
import { Home } from "./Home";
import { Login } from "./Login";
import { navigate, usePath } from "./nav";
import { Toast } from "./Toast";

export function App() {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const path = usePath();

  useEffect(() => {
    api<{ user: User }>("/api/me")
      .then((r) => setUser(r.user))
      .catch(() => setUser(null));
  }, []);

  const logout = async () => {
    await api("/api/logout", "POST").catch(() => {});
    setUser(null);
    navigate("/");
  };

  let page = null;
  if (user === null) page = <Login onLogin={setUser} />;
  else if (user) {
    const docId = path.match(/^\/d\/([^/]+)$/)?.[1];
    page = docId ? <Editor key={docId} id={docId} user={user} onLogout={logout} /> : <Home user={user} onLogout={logout} />;
  }
  return (
    <>
      {page}
      <Toast />
    </>
  );
}
