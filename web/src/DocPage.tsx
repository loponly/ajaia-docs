import { useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import type { User } from "../../shared/users";
import type { DocView } from "../../shared/types";
import { Avatar } from "./Avatar";
import { Logo } from "./Logo";
import { ShareModal } from "./ShareModal";
import { Toolbar } from "./Toolbar";
import { useAutosave } from "./useAutosave";

const STATUS = { saved: "All changes saved", saving: "Saving…", error: "Couldn't save" };

export function DocPage({ doc, user, onLogout }: { doc: DocView; user: User; onLogout: () => void }) {
  const canEdit = doc.role !== "viewer";
  const [title, setTitle] = useState(doc.title);
  const [shares, setShares] = useState(doc.shares);
  const [sharing, setSharing] = useState(false);
  const { status, save } = useAutosave(doc.id);
  const editor = useEditor({
    extensions: [StarterKit, Underline],
    content: doc.html,
    editable: canEdit,
    onUpdate: ({ editor }) => save({ html: editor.getHTML() }),
  });

  return (
    <div className="editor-page">
      <header className="editor-header">
        <div className="header-row">
          <Logo />
          <input
            className="title-input"
            data-testid="doc-title"
            value={title}
            maxLength={200}
            readOnly={!canEdit}
            onChange={(e) => {
              setTitle(e.target.value);
              if (e.target.value.trim()) save({ title: e.target.value });
            }}
          />
          <span className="save-status" data-testid="save-status">
            {STATUS[status]}
          </span>
          <span className="spacer" />
          {doc.role === "owner" ? (
            <button className="share-pill" data-testid="share-button" onClick={() => setSharing(true)}>
              Share
            </button>
          ) : (
            <span className="chip" data-testid="access-chip">
              {canEdit ? "Can edit" : "View only"}
            </span>
          )}
          <Avatar user={user} onLogout={onLogout} />
        </div>
        {canEdit && editor && (
          <div className="toolbar-band">
            <Toolbar editor={editor} />
          </div>
        )}
      </header>
      <div className="canvas">
        <div className="page" data-testid="editor">
          <EditorContent editor={editor} />
        </div>
      </div>
      {sharing && (
        <ShareModal docId={doc.id} title={title} ownerName={doc.ownerName} shares={shares} onChange={setShares} onClose={() => setSharing(false)} />
      )}
    </div>
  );
}
