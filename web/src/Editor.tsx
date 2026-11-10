import { useEffect, useState } from "react";
import type { User } from "../../shared/users";
import type { DocView } from "../../shared/types";
import { api } from "./api";
import { DocPage } from "./DocPage";
import { navigate } from "./nav";
import { showToast } from "./Toast";

export function Editor({ id, user, onLogout }: { id: string; user: User; onLogout: () => void }) {
  const [doc, setDoc] = useState<DocView | null>(null);

  useEffect(() => {
    api<DocView>(`/api/docs/${id}`)
      .then(setDoc)
      .catch((e: Error) => {
        showToast(e.message);
        navigate("/");
      });
  }, [id]);

  return doc ? <DocPage doc={doc} user={user} onLogout={onLogout} /> : null;
}
