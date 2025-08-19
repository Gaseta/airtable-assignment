import React from "react";

export default function TimelineItem({
  item,
  style,
  isInlineEditing,
  isDragging,
  onStartDrag,
  onCommitName,
  onEndEditing,
  onShowIfTruncated,
  onHideTooltip,
  onNameDoubleClick,
}) {
  return (
    <div
      className={`item${isDragging ? " dragging" : ""}`}
      style={style}
      onMouseDown={(e) => onStartDrag(e, item, "move")}
      title={`${item.name}  •  ${item.start} → ${item.end}`}
    >
      {isInlineEditing ? (
        <input
          className="inlineInput"
          autoFocus
          defaultValue={item.name}
          onBlur={(e) => onCommitName(item.id, e.currentTarget.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onCommitName(item.id, e.currentTarget.value);
            if (e.key === "Escape") onEndEditing();
          }}
        />
      ) : (
        <div
          className="name"
          onMouseEnter={(e) => onShowIfTruncated(e, item.name)}
          onMouseLeave={onHideTooltip}
          onDoubleClick={(e) => onNameDoubleClick(e, item)}
        >
          {item.name}
        </div>
      )}

      <div className="handles" onMouseDown={(e) => e.stopPropagation()}>
        <div
          className="handle handle--start"
          title="Resize start"
          onMouseDown={(e) => onStartDrag(e, item, "start")}
        />
        <div
          className="handle handle--end"
          title="Resize end"
          onMouseDown={(e) => onStartDrag(e, item, "end")}
        />
      </div>
    </div>
  );
}
