import { useState, type FormEvent } from "react";
import type { DocView, Role, ShareEntry } from "../../shared/types";
import { api } from "./api";

type Props = {
  docId: string;
  title: string;
  ownerName: string;
  shares: ShareEntry[];
  onChange: (shares: ShareEntry[]) => void;
  onClose: () => void;
};

export function ShareModal({ docId, title, ownerName, shares, onChange, onClose }: Props) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("viewer");
  const [error, setError] = useState("");

  const update = (p: Promise<DocView>) =>
    p
      .then((d) => {
        onChange(d.shares);
        setError("");
        return true;
      })
      .catch((e: Error) => {
        setError(e.message);
        return false;
      });

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (await update(api<DocView>(`/api/docs/${docId}/share`, "POST", { email, role }))) setEmail("");
  };

  return (
    <div className="modal-backdrop">
      <div className="modal" data-testid="share-modal">
        <h2>Share '{title}'</h2>
        <form className="share-form" onSubmit={submit}>
          <input data-testid="share-email" type="email" placeholder="Add people by email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <select data-testid="share-role" value={role} onChange={(e) => setRole(e.target.value as Role)}>
            <option value="viewer">Viewer</option>
            <option value="editor">Editor</option>
          </select>
          <button className="primary" data-testid="share-submit">
            Share
          </button>
        </form>
        {error && (
          <p className="error" data-testid="share-error">
            {error}
          </p>
        )}
        <h3>People with access</h3>
        <div className="person" data-testid="share-person">
          <span>{ownerName}</span>
          <small>Owner</small>
        </div>
        {shares.map((s) => (
          <div className="person" key={s.userId} data-testid="share-person">
            <span>
              {s.name} <small>{s.email}</small>
            </span>
            <small>{s.role === "editor" ? "Editor" : "Viewer"}</small>
            <button
              className="link"
              data-testid="share-remove"
              onClick={() => void update(api<DocView>(`/api/docs/${docId}/share/${s.userId}`, "DELETE"))}
            >
              Remove
            </button>
          </div>
        ))}
        <div className="modal-actions">
          <button className="primary" data-testid="share-done" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
