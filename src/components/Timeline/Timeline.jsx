import React, { useMemo, useState, useEffect } from "react";
import "../../app.css";
import { LEFT_GUTTER_PX, PX_DEFAULT, PX_MIN, PX_MAX } from "../../config/sizes.js";
import useDomain from "../../hooks/useDomain.js";
import useTruncationTooltip from "../../hooks/useTruncationTooltip.js";
import useFloatingNameEditor from "../../hooks/useFloatingNameEditor.js";
import assignLanes from "../../lib/assignLanes.js";
import TimelineAxis from "./TimelineAxis.jsx";
import TimelineLane from "./TimelineLane.jsx";
import TimelineItem from "./TimelineItem.jsx";
import { parseDay, toISO } from "../../utils/date.js";

export default function Timeline({ initialItems }) {
  const [items, setItems] = useState(() => initialItems.map((x) => ({ ...x })));
  const [pxPerDay, setPxPerDay] = useState(PX_DEFAULT);

  const [minDay, maxDay] = useDomain(items);
  const totalDays = maxDay - minDay + 1;
  const contentWidth = LEFT_GUTTER_PX + totalDays * pxPerDay;

  const lanes = useMemo(() => assignLanes(items), [items]);

  const { node: tooltipNode, showIfTruncated, hide: hideTooltip } = useTruncationTooltip();

  const [inlineEditingId, setInlineEditingId] = useState(null);
  const commitName = (id, name) => {
    if (!name || !name.trim()) return endEditing();
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, name: name.trim() } : it)));
    endEditing();
  };
  const endEditing = () => {
    setInlineEditingId(null);
    hideTooltip();
    floating.close();
  };
  const floating = useFloatingNameEditor({ onCommit: commitName, onCancel: endEditing });

  const onNameDoubleClick = (e, it) => {
    const el = e.currentTarget;
    if (el.scrollWidth <= el.clientWidth) {
      hideTooltip();
      setInlineEditingId(it.id);
    } else {
      hideTooltip();
      floating.open(it.id, it.name, el);
    }
  };

  // drag/resize
  const [drag, setDrag] = useState(null);
  useEffect(() => {
    if (!drag) return;
    const onMove = (e) => {
      const deltaPx = e.clientX - drag.startX;
      const deltaDays = Math.round(deltaPx / pxPerDay);
      setItems((prev) =>
        prev.map((it) => {
          if (it.id !== drag.id) return it;
          const s0 = drag.origStart;
          const e0 = drag.origEnd;
          if (drag.mode === "move") return { ...it, start: toISO(s0 + deltaDays), end: toISO(e0 + deltaDays) };
          if (drag.mode === "start") return { ...it, start: toISO(Math.min(s0 + deltaDays, e0)) };
          return { ...it, end: toISO(Math.max(e0 + deltaDays, s0)) };
        })
      );
    };
    const onUp = () => {
      document.body.classList.remove("is-dragging");
      setDrag(null);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp, { once: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [drag, pxPerDay]);

  const startDrag = (e, it, mode) => {
    if (inlineEditingId === it.id) return;
    hideTooltip();
    document.body.classList.add("is-dragging");
    setDrag({
      id: it.id,
      mode, // "move" | "start" | "end"
      startX: e.clientX,
      origStart: parseDay(it.start),
      origEnd: parseDay(it.end),
    });
  };

  const zoomIn = () => setPxPerDay((v) => Math.min(PX_MAX, v + 1));
  const zoomOut = () => setPxPerDay((v) => Math.max(PX_MIN, v - 1));

  return (
    <div className="app">
      <div className="toolbar">
        <h2>Timeline</h2>
        <span className="counter">{items.length} items</span>
        <div className="zoomGroup" role="group" aria-label="Timeline zoom">
          <button className="zoomBtn" onClick={zoomOut} title="Zoom out">−</button>
          <button className="zoomBtn" onClick={zoomIn} title="Zoom in">+</button>
        </div>
      </div>

      <div className="timelineWrap">
        <TimelineAxis />
        <div className="scroller">
          <div className="canvas" style={{ width: contentWidth }}>
            {lanes.map((laneItems, laneIdx) => (
              <TimelineLane key={laneIdx} index={laneIdx}>
                {laneItems.map((it) => {
                  const s = parseDay(it.start);
                  const e = parseDay(it.end);
                  const left = (s - minDay) * pxPerDay;
                  const width = (e - s + 1) * pxPerDay;
                  const isInlineEditing = inlineEditingId === it.id;
                  const isDragging = drag && drag.id === it.id;
                  return (
                    <TimelineItem
                      key={it.id}
                      item={it}
                      style={{ left, width }}
                      isInlineEditing={isInlineEditing}
                      isDragging={isDragging}
                      onStartDrag={startDrag}
                      onCommitName={commitName}
                      onEndEditing={endEditing}
                      onShowIfTruncated={showIfTruncated}
                      onHideTooltip={hideTooltip}
                      onNameDoubleClick={onNameDoubleClick}
                    />
                  );
                })}
              </TimelineLane>
            ))}
            {tooltipNode}
            {floating.node}
          </div>
        </div>
      </div>
    </div>
  );
}
