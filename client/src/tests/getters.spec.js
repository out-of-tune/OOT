import getters from "../store/getters.js";

describe("getNodeLabelNames", () => {
  let state;
  beforeEach(() => {
    state = {
      schema: {
        nodeTypes: [
          {
            label: "artist",
            attributes: ["name", "id"],
          },
          {
            label: "genre",
            attributes: ["name", "id"],
          },
        ],
        edgeTypes: [
          {
            label: "Genre_to_Genre",
            inbound: {
              from: "genre",
              to: "genre",
              connectionName: "subgenres",
            },
            outbound: {
              from: "genre",
              to: "genre",
              connectionName: "supergenres",
            },
          },
          {
            label: "Artist_to_Genre",
            inbound: { from: "artist", to: "genre", connectionName: "genres" },
            outbound: {
              from: "genre",
              to: "artist",
              connectionName: "artists",
            },
          },
        ],
      },
    };
  });
  it("returns label names", () => {
    const actual = getters.getNodeLabelNames(state);

    expect(actual).toEqual(["artist", "genre"]);
  });
});

describe("getEdgeNamesForNodeLabel", () => {
  let state;
  beforeEach(() => {
    state = {
      schema: {
        nodeTypes: [
          {
            label: "artist",
            attributes: ["name", "id"],
          },
          {
            label: "genre",
            attributes: ["name", "id"],
          },
        ],
        edgeTypes: [
          {
            label: "Genre_to_Genre",
            inbound: {
              from: "genre",
              to: "genre",
              connectionName: "subgenres",
            },
            outbound: {
              from: "genre",
              to: "genre",
              connectionName: "supergenres",
            },
          },
          {
            label: "Artist_to_Genre",
            inbound: { from: "artist", to: "genre", connectionName: "genres" },
            outbound: {
              from: "genre",
              to: "artist",
              connectionName: "artists",
            },
          },
        ],
      },
    };
  });
  it("returns edge names for node type", () => {
    const actual = getters.getEdgeNamesForNodeLabel(state)("genre");
    expect(actual).toStrictEqual(["Genre_to_Genre", "Artist_to_Genre"]);
  });
});
