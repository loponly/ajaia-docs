import { useEffect, useRef, useState } from "react";
import type { User } from "../../shared/users";
import type { DocListItem, DocView } from "../../shared/types";
import { api } from "./api";
import { Avatar } from "./Avatar";
import { Icon } from "./Icon";
import { Logo } from "./Logo";
import { navigate } from "./nav";
import { showToast } from "./Toast";

type Docs = { owned: DocListItem[]; shared: DocListItem[] };
type Tab = "owned" | "shared";

const EMPTY: Record<Tab, string> = {
  owned: "No documents yet. Start a new one above.",
  shared: "Nothing has been shared with you yet.",
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });

export function Home({ user, onLogout }: { user: User; onLogout: () => void }) {
  const [docs, setDocs] = useState<Docs | null>(null);
  const [tab, setTab] = useState<Tab>("owned");
  const [query, setQuery] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api<Docs>("/api/docs")
      .then(setDocs)
      .catch((e: Error) => showToast(e.message));
  }, []);

  const open = (p: Promise<DocView>) =>
    p.then((d) => navigate(`/d/${d.id}`)).catch((e: Error) => showToast(e.message));

  const upload = (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return open(api<DocView>("/api/import", "POST", form));
  };

  const rows = (docs?.[tab] ?? []).filter((d) => d.title.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <>
      <header className="topbar">
        <Logo />
        <div className="search">
          <Icon name="search" />
          <input data-testid="search" placeholder="Search" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <Avatar user={user} onLogout={onLogout} />
      </header>
      <section className="start">
        <h2>Start a new document</h2>
        <div className="cards">
          <button className="card" data-testid="new-doc" onClick={() => open(api<DocView>("/api/docs", "POST", {}))}>
            <span className="thumb">
              <Icon name="add" />
            </span>
            Blank document
          </button>
          <button className="card" onClick={() => fileInput.current?.click()}>
            <span className="thumb">
              <Icon name="upload_file" />
            </span>
            Import file
            <small>.txt, .md, .docx up to 2 MB</small>
          </button>
          <input
            ref={fileInput}
            type="file"
            hidden
            accept=".txt,.md,.docx"
            data-testid="import-input"
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (file) void upload(file);
            }}
          />
        </div>
      </section>
      <main className="list">
        <div className="tabs">
          <button className={tab === "owned" ? "active" : ""} data-testid="tab-owned" onClick={() => setTab("owned")}>
            Owned by me
          </button>
          <button className={tab === "shared" ? "active" : ""} data-testid="tab-shared" onClick={() => setTab("shared")}>
            Shared with me
          </button>
        </div>
        {docs && rows.length === 0 && <p className="empty">{query ? "No matching documents." : EMPTY[tab]}</p>}
        {rows.map((d) => (
          <button key={d.id} className="doc-row" data-testid="doc-row" data-title={d.title} onClick={() => navigate(`/d/${d.id}`)}>
            <Icon name="description" />
            <span className="doc-title">{d.title}</span>
            <span className="doc-owner">
              {tab === "owned" ? "me" : d.ownerName}
              {tab === "shared" && <em className="chip">{d.role === "editor" ? "Can edit" : "View only"}</em>}
            </span>
            <span className="doc-date">{formatDate(d.updatedAt)}</span>
          </button>
        ))}
      </main>
    </>
  );
}
