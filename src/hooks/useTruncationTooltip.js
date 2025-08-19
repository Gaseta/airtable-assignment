import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export default function useTruncationTooltip() {
  const [tip, setTip] = useState(null);

  const showIfTruncated = (e, text) => {
    const el = e.currentTarget;
    if (el.scrollWidth <= el.clientWidth) return;
    const rect = el.getBoundingClientRect();
    setTip({ text, x: rect.left + rect.width / 2, y: rect.top });
  };
  const hide = () => setTip(null);

  useEffect(() => {
    if (!tip) return;
    const close = () => setTip(null);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close, true);
    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close, true);
    };
  }, [tip]);

  const node = tip
    ? createPortal(
        <div className="tooltip" style={{ left: `${tip.x}px`, top: `${tip.y}px` }}>
          {tip.text}
        </div>,
        document.body
      )
    : null;

  return { node, showIfTruncated, hide };
}
