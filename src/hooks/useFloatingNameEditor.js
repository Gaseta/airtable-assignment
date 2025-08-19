import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export default function useFloatingNameEditor({ onCommit, onCancel }) {
  const [editor, setEditor] = useState(null); // { id, value, x, y }

  const open = (id, value, anchorEl) => {
    const rect = anchorEl.getBoundingClientRect();
    setEditor({ id, value, x: rect.left + rect.width / 2, y: rect.bottom });
  };
  const close = () => setEditor(null);

  useEffect(() => {
    if (!editor) return;
    const closeAll = () => setEditor(null);
    window.addEventListener("scroll", closeAll, true);
    window.addEventListener("resize", closeAll, true);
    return () => {
      window.removeEventListener("scroll", closeAll, true);
      window.removeEventListener("resize", closeAll, true);
    };
  }, [editor]);

  const node = editor
    ? createPortal(
        <div className="floatingEditor" style={{ left: `${editor.x}px`, top: `${editor.y}px` }}>
          <input
            className="floatingInput"
            autoFocus
            defaultValue={editor.value}
            onBlur={(e) => {
              const v = e.currentTarget.value.trim();
              if (v) onCommit(editor.id, v);
              close();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const v = e.currentTarget.value.trim();
                if (v) onCommit(editor.id, v);
                close();
              }
              if (e.key === "Escape") {
                onCancel?.(editor.id);
                close();
              }
            }}
          />
        </div>,
        document.body
      )
    : null;

  return { open, close, node };
}
