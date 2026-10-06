import { tagsOf, type MusicTag } from "@/lib/metadata";
import type { NodeData, NodeId } from "@/types/graph";

/**
 * An axis of the compass layout:
 * - `attribute`: a number of the node, for example the release year or the rating.
 * - `tags`: from tag `from` to tag `to`. A node moves toward the tag that more of its
 *   MusicBrainz users gave, relative to its most given tag.
 */
export type CompassAxis =
  | { kind: "attribute"; attribute: string; label: string }
  | { kind: "tags"; from: string; to: string };

/**
 * Labels of the two ends of an axis, low end first. A number axis names its smallest and
 * largest value, for example "Year 1974" and "2017".
 */
export function axisEnds(
  axis: CompassAxis,
  [min, max]: [number, number] = [Number.NaN, Number.NaN],
): [string, string] {
  if (axis.kind === "tags") return [axis.from, axis.to];
  const format = (value: number) =>
    Number.isInteger(value) ? String(value) : value.toFixed(1);
  return Number.isFinite(min) && Number.isFinite(max)
    ? [`${axis.label} ${format(min)}`, format(max)]
    : [`${axis.label} ↓`, `${axis.label} ↑`];
}

/** The share of a tag in a node: its count divided by the count of the most given tag of the node. */
function share(tags: MusicTag[], name: string, top: number) {
  return (tags.find((tag) => tag.name === name)?.count ?? 0) / top;
}

/**
 * The value of a node on an axis, or undefined when the node has no value there.
 * A tag axis gives -1 (only `from`) to 1 (only `to`). A node with neither tag has no value:
 * it would land in the middle and read as "balanced", which it is not.
 */
export function axisValue(
  axis: CompassAxis,
  data: Partial<NodeData>,
): number | undefined {
  if (axis.kind === "attribute") {
    const value = Number(data[axis.attribute]);
    return data[axis.attribute] == null || !Number.isFinite(value)
      ? undefined
      : value;
  }
  const tags = tagsOf(data);
  const top = Math.max(0, ...tags.map((tag) => tag.count));
  if (top === 0) return undefined;
  const from = share(tags, axis.from, top);
  const to = share(tags, axis.to, top);
  return from === 0 && to === 0 ? undefined : to - from;
}

/**
 * The tags that most nodes have, the most common first. Ties go to the tag with more votes
 * in total, then by name.
 */
export function commonTags(nodes: Partial<NodeData>[], limit = 30): string[] {
  const usage = new Map<string, { nodes: number; votes: number }>();
  nodes.forEach((data) =>
    tagsOf(data).forEach((tag) => {
      const entry = usage.get(tag.name) ?? { nodes: 0, votes: 0 };
      entry.nodes += 1;
      entry.votes += tag.count;
      usage.set(tag.name, entry);
    }),
  );
  return [...usage]
    .sort(
      ([nameA, a], [nameB, b]) =>
        b.nodes - a.nodes || b.votes - a.votes || nameA.localeCompare(nameB),
    )
    .slice(0, limit)
    .map(([name]) => name);
}

export interface CompassItem {
  id: NodeId;
  name: string;
  x: number | undefined;
  y: number | undefined;
}

export interface CompassArea {
  /** Width and height of the plane, in graph units. Its center is the origin. */
  width: number;
  height: number;
  /** Smallest distance between two node centers, in graph units. */
  spacing: number;
  /** +1 when larger graph y is higher on screen (3D), -1 when it is lower (2D). */
  up: 1 | -1;
}

/** Range of the values: tag axes always span -1 to 1, so their middle means "balanced". */
export function axisRange(
  values: number[],
  axis: CompassAxis,
): [number, number] {
  if (axis.kind === "tags") return [-1, 1];
  const min = Math.min(...values);
  const max = Math.max(...values);
  // One value, or none: a range around it, so the plane is not divided by zero.
  if (values.length === 0) return [0, 1];
  return min === max ? [min - 1, max + 1] : [min, max];
}

/** Rounds of the pass that pushes overlapping nodes apart. */
const SEPARATION_ROUNDS = 40;

/** Moves nodes that are closer than `spacing` apart, in place, until none overlap or the rounds end. */
export function separate(points: { x: number; y: number }[], spacing: number) {
  for (let round = 0; round < SEPARATION_ROUNDS; round++) {
    let moved = false;
    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        const a = points[i];
        const b = points[j];
        let dx = b.x - a.x;
        let dy = b.y - a.y;
        let distance = Math.hypot(dx, dy);
        if (distance >= spacing) continue;
        if (distance === 0) {
          // Same place: a fixed direction that depends on the pair, so the result repeats.
          const angle = ((i * 7 + j * 13) % 360) * (Math.PI / 180);
          dx = Math.cos(angle);
          dy = Math.sin(angle);
          distance = 1;
        }
        const push = (spacing - distance) / 2 / distance;
        a.x -= dx * push;
        a.y -= dy * push;
        b.x += dx * push;
        b.y += dy * push;
        moved = true;
      }
    }
    if (!moved) return;
  }
}

/**
 * Positions on the compass plane. Nodes with values on both axes spread over the plane
 * and then move apart until they do not overlap. Nodes that miss a value go to rows under
 * the plane, sorted by name, so they do not read as placed.
 */
export function compassPositions(
  items: CompassItem[],
  xAxis: CompassAxis,
  yAxis: CompassAxis,
  area: CompassArea,
): Map<NodeId, { x: number; y: number }> {
  const placed = items.filter(
    (item) => item.x !== undefined && item.y !== undefined,
  );
  const unplaced = items
    .filter((item) => item.x === undefined || item.y === undefined)
    .sort((a, b) => a.name.localeCompare(b.name));
  const [xMin, xMax] = axisRange(
    placed.map((item) => item.x as number),
    xAxis,
  );
  const [yMin, yMax] = axisRange(
    placed.map((item) => item.y as number),
    yAxis,
  );
  const points = placed.map((item) => ({
    id: item.id,
    x: (((item.x as number) - xMin) / (xMax - xMin) - 0.5) * area.width,
    y:
      (((item.y as number) - yMin) / (yMax - yMin) - 0.5) *
      area.height *
      area.up,
  }));
  separate(points, area.spacing);

  const positions = new Map<NodeId, { x: number; y: number }>();
  points.forEach((point) =>
    positions.set(point.id, { x: point.x, y: point.y }),
  );
  const perRow = Math.max(1, Math.floor(area.width / area.spacing) + 1);
  // The rows start two spacings under the lowest placed node.
  const lowest = points.length
    ? Math.max(...points.map((point) => -point.y * area.up))
    : area.height / 2;
  unplaced.forEach((item, index) => {
    const row = Math.floor(index / perRow);
    const column = index % perRow;
    positions.set(item.id, {
      x: -area.width / 2 + column * area.spacing,
      y: -(lowest + area.spacing * (2 + row)) * area.up,
    });
  });
  return positions;
}

/** Tag names that differ only in spaces or dashes ("synth-pop", "synthpop") are one tag. */
const sameTag = (a: string, b: string) =>
  a.replace(/[^\p{L}\p{N}]/gu, "") === b.replace(/[^\p{L}\p{N}]/gu, "");

/**
 * Pairs of tags that split the nodes: for each pair, the most nodes that have one of the two
 * tags but not both. Such pairs make axes with nodes at both ends, like "tender" and
 * "abrasive". Each tag is used once. Candidates are the `pool` most common tags.
 */
export function opposedTagPairs(
  nodes: Partial<NodeData>[],
  count = 2,
  pool = 12,
): [string, string][] {
  const candidates = commonTags(nodes, pool);
  const tagSets = nodes.map(
    (data) => new Set(tagsOf(data).map((tag) => tag.name)),
  );
  const exclusive = (a: string, b: string) =>
    tagSets.filter((tags) => tags.has(a) !== tags.has(b)).length;
  const pairs: [string, string][] = [];
  const used = new Set<string>();
  for (let round = 0; round < count; round++) {
    let best: { pair: [string, string]; score: number } | undefined;
    for (const a of candidates)
      for (const b of candidates) {
        if (a >= b || used.has(a) || used.has(b) || sameTag(a, b)) continue;
        const score = exclusive(a, b);
        if (score > 0 && (!best || score > best.score))
          best = { pair: [a, b], score };
      }
    if (!best) break;
    pairs.push(best.pair);
    best.pair.forEach((tag) => used.add(tag));
  }
  return pairs;
}
