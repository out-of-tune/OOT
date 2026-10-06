import {
  axisValue,
  commonTags,
  compassPositions,
  opposedTagPairs,
  separate,
  type CompassAxis,
} from "../compass";

const tags = (...pairs: [string, number][]) => ({
  mbTags: pairs.map(([name, count]) => ({ name, count })),
});
const tagAxis: CompassAxis = { kind: "tags", from: "ambient", to: "techno" };
const year: CompassAxis = {
  kind: "attribute",
  attribute: "releaseYear",
  label: "Year",
};

describe("axisValue", () => {
  it("reads a number attribute and refuses what is not a number", () => {
    expect(axisValue(year, { releaseYear: 1998 })).toBe(1998);
    expect(axisValue(year, { releaseYear: "x" })).toBeUndefined();
    expect(axisValue(year, {})).toBeUndefined();
  });

  it("places a node between two tags by their share of its top tag", () => {
    expect(axisValue(tagAxis, tags(["techno", 10], ["ambient", 5]))).toBe(0.5);
    expect(axisValue(tagAxis, tags(["ambient", 4]))).toBe(-1);
  });

  it("gives no value to a node with neither tag, or without tags", () => {
    expect(axisValue(tagAxis, tags(["rock", 3]))).toBeUndefined();
    expect(axisValue(tagAxis, {})).toBeUndefined();
  });
});

it("commonTags orders by the number of nodes, then by votes", () => {
  expect(
    commonTags([
      tags(["idm", 1], ["ambient", 9]),
      tags(["idm", 2]),
      tags(["ambient", 1], ["techno", 1]),
    ]),
  ).toEqual(["ambient", "idm", "techno"]);
});

it("separate leaves no two points closer than the spacing", () => {
  const points = [
    { x: 0, y: 0 },
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 0, y: 1 },
  ];
  separate(points, 10);
  for (let i = 0; i < points.length; i++)
    for (let j = i + 1; j < points.length; j++)
      expect(
        Math.hypot(points[i].x - points[j].x, points[i].y - points[j].y),
      ).toBeGreaterThan(9.99);
});

describe("compassPositions", () => {
  const area = { width: 1000, height: 1000, spacing: 10, up: -1 as const };

  it("spreads the values over the plane, high values up", () => {
    const positions = compassPositions(
      [
        { id: "old", name: "a", x: 1970, y: 1970 },
        { id: "new", name: "b", x: 2020, y: 2020 },
      ],
      year,
      year,
      area,
    );
    expect(positions.get("old")).toEqual({ x: -500, y: 500 });
    expect(positions.get("new")).toEqual({ x: 500, y: -500 });
  });

  it("keeps the middle of a tag axis in the middle of the plane", () => {
    const positions = compassPositions(
      [{ id: "n", name: "n", x: 0, y: 0 }],
      tagAxis,
      tagAxis,
      area,
    );
    const { x, y } = positions.get("n")!;
    expect([Math.abs(x), Math.abs(y)]).toEqual([0, 0]);
  });

  it("puts nodes without a value in rows under the plane, by name", () => {
    const positions = compassPositions(
      [
        { id: "placed", name: "p", x: 1, y: 1 },
        { id: "b", name: "b", x: undefined, y: 3 },
        { id: "a", name: "a", x: 2, y: undefined },
      ],
      year,
      year,
      area,
    );
    const a = positions.get("a")!;
    const b = positions.get("b")!;
    expect(a.x).toBeLessThan(b.x);
    expect(a.y).toBe(b.y);
    // Screen down is larger y in 2D.
    expect(a.y).toBeGreaterThan(positions.get("placed")!.y);
  });

  it("flips the plane for the 3D view, where larger y is higher", () => {
    const positions = compassPositions(
      [
        { id: "low", name: "a", x: 0, y: 0 },
        { id: "high", name: "b", x: 1, y: 1 },
        { id: "none", name: "c", x: undefined, y: undefined },
      ],
      year,
      year,
      { ...area, up: 1 },
    );
    expect(positions.get("high")!.y).toBeGreaterThan(positions.get("low")!.y);
    expect(positions.get("none")!.y).toBeLessThan(positions.get("low")!.y);
  });
});

it("opposedTagPairs picks tags that split the nodes and skips spellings of one tag", () => {
  const nodes = [
    tags(["ambient", 3], ["synthpop", 1]),
    tags(["ambient", 2], ["synth-pop", 1]),
    tags(["techno", 4], ["dark", 1]),
    tags(["techno", 1], ["bright", 2]),
    tags(["dark", 1], ["ambient", 1]),
  ];
  const pairs = opposedTagPairs(nodes);
  expect(pairs[0]).toEqual(["ambient", "techno"]);
  expect(
    pairs.some(
      (pair) => pair.includes("synthpop") && pair.includes("synth-pop"),
    ),
  ).toBe(false);
  expect(new Set(pairs.flat()).size).toBe(pairs.flat().length);
});
