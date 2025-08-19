/**
 * Assigns items (with start/end dates) into horizontal lanes
 * so that items in the same lane do not overlap in time.
 *
 * Greedy algorithm:
 * - Sort items by start date (and end date as tie-breaker)
 * - For each item, try to place it in the first lane that is free
 *   before its start date
 * - If no lane is available, create a new lane
 *
 * Returns:
 *   Array of lanes, where each lane is an array of items
 */

function toDayUTC(iso) {
  // Parse "YYYY-MM-DD" into a UTC-based day integer
  const [y,m,d] = iso.split("-").map(Number);
  return Date.UTC(y, m-1, d) / 86400000; // convert ms → days
}

export default function assignLanes(items) {
  const sorted = [...items].sort((a,b) => {
    const da = toDayUTC(a.start), db = toDayUTC(b.start);
    if (da !== db) return da - db;
    return toDayUTC(a.end) - toDayUTC(b.end);
  });

  const lanes = [];       // final array of lanes
  const laneEndDays = []; // track the last end day used in each lane

  // Place each item into the earliest available lane
  for (const it of sorted) {
    const s = toDayUTC(it.start);
    const e = toDayUTC(it.end);

    let placed = false;

    // Try to fit the item into an existing lane
    for (let i = 0; i < lanes.length; i++) {
      if (laneEndDays[i] < s) { // lane is free before this item starts
        lanes[i].push(it);
        laneEndDays[i] = e;     // update lane's last occupied end
        placed = true;
        break;
      }
    }

    if (!placed) {
      lanes.push([it]);
      laneEndDays.push(e);
    }
  }

  return lanes;
}
