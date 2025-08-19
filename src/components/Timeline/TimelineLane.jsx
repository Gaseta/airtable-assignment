import React from "react";

export default function TimelineLane({ index, children }) {
  return (
    <div className="lane">
      <div className="index">#{index + 1}</div>
      <div className="row">{children}</div>
    </div>
  );
}