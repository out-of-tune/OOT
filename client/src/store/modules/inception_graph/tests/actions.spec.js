import actions from "../actions";
import GraphService from "@/store/services/GraphService";
import "babel-polyfill";
global.expect = require("expect");
jest.mock("@/store/services/GraphService");

const { generateInceptionGraph } = actions;

describe("generateInceptionGraph", () => {
  let commit;
  let dispatch;
  let rootState;
  beforeEach(() => {
    commit = jest.fn();
    dispatch = jest.fn();
    rootState = {
      authentication: {
        clientAuthenticationToken: "",
      },
    };
  });
  it("adds nodes and links of an initial connection", async () => {
    GraphService.getNodes.mockReturnValue({
      genre: [
        {
          id: "Genre/239",
          name: "rio de la plata",
          subgenres: [],
        },
        {
          id: "Genre/402",
          name: "jazz",
          subgenres: [
            {
              id: "Genre/22083",
              name: "electro jazz",
            },
            {
              id: "Genre/26688",
              name: "broken beat",
            },
          ],
        },
      ],
    });

    await generateInceptionGraph({ commit, dispatch, rootState });
    const nodes = [
      {
        id: "Genre/239",
        data: {
          name: "rio de la plata",
          label: "genre",
        },
      },
      {
        id: "Genre/402",
        data: {
          name: "jazz",
          label: "genre",
        },
      },
      {
        id: "Genre/22083",
        data: {
          name: "electro jazz",
          label: "genre",
        },
      },
      {
        id: "Genre/26688",
        data: {
          name: "broken beat",
          label: "genre",
        },
      },
    ];
    const links = [
      {
        fromId: "Genre/402",
        toId: "Genre/22083",
        linkName: "Genre_to_Genre",
      },
      {
        fromId: "Genre/402",
        toId: "Genre/26688",
        linkName: "Genre_to_Genre",
      },
    ];
    expect(commit).toHaveBeenCalledWith("ADD_TO_GRAPH", { nodes, links });
  });
});
