import { useMemo } from "react";
import { parseDay } from "../utils/date.js";

export default function useDomain(items) {
  const minStart = useMemo(
    () => Math.min(...items.map((i) => parseDay(i.start))),
    [items]
  );
  const maxEnd = useMemo(
    () => Math.max(...items.map((i) => parseDay(i.end))),
    [items]
  );
  return [minStart, maxEnd];
}