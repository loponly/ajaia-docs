import type { Editor } from "@tiptap/react";
import { Icon } from "./Icon";

type BtnProps = { id: string; icon: string; label: string; active?: boolean; onClick: () => void };

const Btn = ({ id, icon, label, active, onClick }: BtnProps) => (
  <button
    type="button"
    className={active ? "tb-btn active" : "tb-btn"}
    data-testid={`tb-${id}`}
    title={label}
    onMouseDown={(e) => e.preventDefault()}
    onClick={onClick}
  >
    <Icon name={icon} />
  </button>
);

export function Toolbar({ editor }: { editor: Editor }) {
  const chain = () => editor.chain().focus();
  const style = editor.isActive("heading", { level: 1 }) ? "h1" : editor.isActive("heading", { level: 2 }) ? "h2" : "p";
  const setStyle = (v: string) => {
    if (v === "p") chain().setParagraph().run();
    else chain().setHeading({ level: v === "h1" ? 1 : 2 }).run();
  };

  return (
    <div className="toolbar" data-testid="toolbar">
      <Btn id="undo" icon="undo" label="Undo" onClick={() => chain().undo().run()} />
      <Btn id="redo" icon="redo" label="Redo" onClick={() => chain().redo().run()} />
      <span className="sep" />
      <select data-testid="tb-style" value={style} onChange={(e) => setStyle(e.target.value)}>
        <option value="p">Normal text</option>
        <option value="h1">Heading 1</option>
        <option value="h2">Heading 2</option>
      </select>
      <span className="sep" />
      <Btn id="bold" icon="format_bold" label="Bold" active={editor.isActive("bold")} onClick={() => chain().toggleBold().run()} />
      <Btn id="italic" icon="format_italic" label="Italic" active={editor.isActive("italic")} onClick={() => chain().toggleItalic().run()} />
      <Btn id="underline" icon="format_underlined" label="Underline" active={editor.isActive("underline")} onClick={() => chain().toggleUnderline().run()} />
      <span className="sep" />
      <Btn id="bullet" icon="format_list_bulleted" label="Bulleted list" active={editor.isActive("bulletList")} onClick={() => chain().toggleBulletList().run()} />
      <Btn id="ordered" icon="format_list_numbered" label="Numbered list" active={editor.isActive("orderedList")} onClick={() => chain().toggleOrderedList().run()} />
    </div>
  );
}
