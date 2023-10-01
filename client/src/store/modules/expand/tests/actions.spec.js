import { actions } from "../actions";
;
import Viva from "vivagraphjs";
import GraphService from "@/store/services/GraphService";
import SpotifyService from "@/store/services/SpotifyService";
import { getAllNodes } from "@/assets/js/graphHelper";
vi.mock("@/store/services/GraphService");
vi.mock("@/store/services/SpotifyService");
vi.mock("@/assets/js/graphHelper");

const { expandAction, addToGraph } = actions;

describe("expandAction", () => {
  let dispatch;
  let commit;
  let rootState;
  let state;
  beforeEach(() => {
    (dispatch = vi.fn()),
      (commit = vi.fn()),
      (state = {
        failedExpandedNodes: [],
      });
    rootState = {
      authentication: {
        loginState: false,
      },
      spotify: {
        accessToken: "iamanaccesstoken",
      },
      expand: {
        failedExpandedConnections: [],
      },
      mainGraph: {
        Graph: Viva.Graph.graph(),
        renderState: {
          layout: {
            getNodePosition: vi.fn(),
          },
        },
      },
      configurations: {
        layoutConfiguration: [],
        actionConfiguration: {
          expand: [],
          collapse: [],
        },
      },
      schema: {
        nodeTypes: [
          {
            label: "artist",
            attributes: ["name", "id", "popularity", "sid", "mbid", "images"],
          },
          {
            label: "genre",
            attributes: ["name", "id"],
          },
          {
            label: "album",
            attributes: ["name", "id"],
          },
          {
            label: "song",
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
              endpoint: "graphQl",
            },
            outbound: {
              from: "genre",
              to: "genre",
              connectionName: "supergenres",
              endpoint: "graphQl",
            },
          },
          {
            label: "Artist_to_Genre",
            inbound: {
              from: "artist",
              to: "genre",
              connectionName: "genres",
              endpoint: "graphQl",
            },
            outbound: {
              from: "genre",
              to: "artist",
              connectionName: "artists",
              endpoint: "graphQl",
            },
          },
          {
            label: "Album_to_Artist",
            inbound: {
              from: "album",
              to: "artist",
              connectionName: "artists",
              endpoint: "spotify",
            },
            outbound: {
              from: "artist",
              to: "album",
              connectionName: "albums",
              endpoint: "spotify",
            },
          },
          {
            label: "Song_to_Album",
            inbound: {
              from: "song",
              to: "album",
              connectionName: "albums",
              endpoint: "spotify",
            },
            outbound: {
              from: "album",
              to: "song",
              connectionName: "songs",
              endpoint: "spotify",
            },
          },
        ],
      },
      expand: {
        failedExpandedConnections: [],
      },
    };
    const nodes = [
      {
        id: "Genre/20",
        data: {
          label: "genre",
        },
      },
      {
        id: "Genre/203",
        data: {
          label: "genre",
        },
      },
    ];

    nodes.forEach((node) => {
      rootState.mainGraph.Graph.addNode(node.id, node.data);
    });
    GraphService.getNodes.mockResolvedValue({
      genre: [
        {
          artists: [
            {
              id: "Artist/20",
              name: "Jorn Van Deynhoven",
            },
            {
              id: "Artist/2",
              name: "Kiholm",
            },
          ],
        },
      ],
    });
    rootState.mainGraph.renderState.layout.getNodePosition.mockReturnValue({
      x: 100,
      y: 100,
    });
    rootState.mainGraph.renderState.layout.isNodePinned = vi.fn();
    rootState.mainGraph.renderState.layout.isNodePinned.mockReturnValueOnce(
      true,
    );
    rootState.mainGraph.renderState.layout.isNodePinned.mockReturnValueOnce(
      false,
    );
    rootState.configurations.actionConfiguration.expand = [
      {
        nodeType: "genre",
        edges: ["Artist_to_Genre"],
      },
    ];
  });
  it("adds nodes and links when a node is clicked", async () => {
    await expandAction(
      {
        rootState,
        commit,
        dispatch,
        state,
      },
      {
        nodes: [
          {
            data: {
              label: "genre",
            },
            id: "Genre/20",
          },
        ],
      },
    );

    const nodes = [
      {
        id: "Artist/20",
        data: {
          name: "Jorn Van Deynhoven",
          label: "artist",
        },
      },
      {
        id: "Artist/2",
        data: {
          name: "Kiholm",
          label: "artist",
        },
      },
    ];
    const links = [
      {
        fromId: "Genre/20",
        toId: "Artist/20",
        linkTypes: ["Artist_to_Genre"],
      },
      {
        fromId: "Genre/20",
        toId: "Artist/2",
        linkTypes: ["Artist_to_Genre"],
      },
    ];
    expect(dispatch).toHaveBeenNthCalledWith(4, "addToGraph", {
      nodes: nodes,
      links: links,
    });
  });

  it("checks if a node is in the database when retrieved with Spotify", async () => {
    rootState.configurations.actionConfiguration.expand = [
      {
        nodeType: "album",
        edges: ["Album_to_Artist"],
      },
    ];
    const node = {
      id: "album/1",
      data: {
        label: "album",
        sid: "1",
        artists: [
          {
            id: "2",
          },
        ],
      },
    };

    const mockedSpotifyData = Promise.resolve({
      artists: [
        {
          id: "2",
          name: "bob",
          followers: 244,
          popularity: 2,
        },
      ],
    });

    const mockedGraphQlData = {
      artist: [
        {
          id: "Artist/15",
          sid: "2",
          followers: 230,
          popularity: 1,
        },
      ],
    };

    SpotifyService.getArtistsById.mockReturnValue(mockedSpotifyData);
    GraphService.getNodes.mockReturnValue(mockedGraphQlData);
    await expandAction(
      {
        rootState,
        commit,
        dispatch,
        state,
      },
      {
        nodes: [node],
      },
    );

    const nodes = [
      {
        id: "Artist/15",
        data: {
          label: "artist",
          sid: "2",
          followers: 230,
          popularity: 1,
        },
      },
    ];
    const links = [
      {
        fromId: "album/1",
        toId: "Artist/15",
        linkTypes: ["Album_to_Artist"],
      },
    ];
    expect(dispatch).toHaveBeenNthCalledWith(4, "addToGraph", {
      nodes: nodes,
      links: links,
    });
  });

  it("it adds artists from Spotify", async () => {
    rootState.configurations.actionConfiguration.expand = [
      {
        nodeType: "album",
        edges: ["Album_to_Artist"],
      },
    ];
    const node = {
      id: "album/1",
      data: {
        label: "album",
        sid: "1",
        artists: [
          {
            id: "2",
          },
        ],
      },
    };
    const mockedSpotifyData = Promise.resolve({
      artists: [
        {
          id: "2",
          name: "bob",
          followers: 244,
          popularity: 2,
        },
      ],
    });
    const mockedGraphQlData = {
      artist: [],
    };
    SpotifyService.getArtistsById.mockReturnValue(mockedSpotifyData);
    GraphService.getNodes.mockReturnValue(mockedGraphQlData);
    await expandAction(
      {
        rootState,
        commit,
        dispatch,
        state,
      },
      {
        nodes: [node],
      },
    );

    const nodes = [
      {
        id: "artist/2",
        data: {
          label: "artist",
          sid: "2",
          followers: 244,
          popularity: 2,
          name: "bob",
        },
      },
    ];
    const links = [
      {
        fromId: "album/1",
        toId: "artist/2",
        linkTypes: ["Album_to_Artist"],
      },
    ];
    expect(dispatch).toHaveBeenNthCalledWith(4, "addToGraph", {
      nodes: nodes,
      links: links,
    });
  });

  it("it adds nothing when the result is empty", async () => {
    const node = {
      id: "Genre/20",
      data: {
        label: "genre",
      },
    };
    const mockedGraphQlData = {
      genre: [
        {
          artists: [],
        },
      ],
    };
    GraphService.getNodes.mockReturnValue(mockedGraphQlData);
    await expandAction(
      {
        rootState,
        commit,
        dispatch,
        state,
      },
      {
        nodes: [node],
      },
    );

    expect(dispatch).toHaveBeenNthCalledWith(4, "addToGraph", {
      nodes: [],
      links: [],
    });
  });

  it("gets songs from album node", async () => {
    rootState.configurations.actionConfiguration.expand = [
      {
        nodeType: "album",
        edges: ["Song_to_Album"],
      },
    ];
    const node = {
      id: "album/1",
      data: {
        label: "album",
        sid: "1",
        artists: [
          {
            id: "2",
          },
        ],
      },
    };
    const mockedSpotifyData = Promise.resolve({
      items: [
        {
          id: "2",
          name: "song 2",
        },
      ],
    });

    // const mockedSpotifyData = {
    //   items: [{
    //     id: "2",
    //     name: "song 2"
    //   }]
    // }
    SpotifyService.getSongsFromAlbum.mockReturnValue(mockedSpotifyData);
    await expandAction(
      {
        rootState,
        commit,
        dispatch,
        state,
      },
      {
        nodes: [node],
      },
    );

    const nodes = [
      {
        id: "song/2",
        data: {
          label: "song",
          sid: "2",
          name: "song 2",
        },
      },
    ];
    const links = [
      {
        fromId: "album/1",
        toId: "song/2",
        linkTypes: ["Song_to_Album"],
      },
    ];
    expect(dispatch).toHaveBeenNthCalledWith(4, "addToGraph", {
      nodes: nodes,
      links: links,
    });
  });

  it("gets albums from artist node", async () => {
    rootState.configurations.actionConfiguration.expand = [
      {
        nodeType: "artist",
        edges: ["Album_to_Artist"],
      },
    ];
    const node = {
      id: "artist/1",
      data: {
        label: "artist",
        sid: "1",
      },
    };
    const mockedSpotifyData = Promise.resolve({
      items: [
        {
          id: "2",
          name: "album 2",
        },
      ],
    });
    SpotifyService.getAlbumsFromArtist.mockReturnValue(mockedSpotifyData);
    await expandAction(
      {
        rootState,
        commit,
        dispatch,
        state,
      },
      {
        nodes: [node],
      },
    );

    const nodes = [
      {
        id: "album/2",
        data: {
          label: "album",
          sid: "2",
          name: "album 2",
        },
      },
    ];
    const links = [
      {
        fromId: "artist/1",
        toId: "album/2",
        linkTypes: ["Album_to_Artist"],
      },
    ];
    expect(dispatch).toHaveBeenNthCalledWith(4, "addToGraph", {
      nodes: nodes,
      links: links,
    });
  });
});

describe("addToGraph", () => {
  let rootState;
  let commit;
  let dispatch;
  let nodes;
  let links;

  beforeEach(() => {
    global.Math.random = () => 1;
    rootState = {
      configurations: {
        layoutConfiguration: [
          {
            nodeLabel: "Kunde",
            isUpdating: false,
            layoutType: "line",
            layoutTypeOptions: {
              xOffset: 0,
              yOffset: 0,
              invertedAxis: false,
              slope: 0,
              sortParameter: "Kunden",
              distance: 1000,
            },
          },
          {
            nodeLabel: "Auftrag",
            isUpdating: true,
            layoutType: "line",
            layoutTypeOptions: {
              xOffset: 0,
              yOffset: 0,
              invertedAxis: false,
              slope: 10,
              sortParameter: "Auftraggeber",
              distance: 10,
            },
          },
        ],
      },
      mainGraph: {
        Graph: Viva.Graph.graph(),
        renderState: {
          layout: {
            getNodePosition: (linkId) => {
              return {
                x: 100,
                y: 100,
              };
            },
          },
        },
      },
    };
    commit = vi.fn();
    dispatch = vi.fn();
    nodes = [
      {
        id: "Auftrag/1",
        data: {
          label: "Auftrag",
        },
      },
      {
        id: "Auftrag/2",
        data: {
          label: "Auftrag",
        },
      },
      {
        id: "Kunde/1",
        data: {
          label: "Kunde",
        },
      },
      {
        id: "Kunde/2",
        data: {
          label: "Kunde",
        },
      },
      {
        id: "Auftrag/10",
        data: {
          label: "Auftrag",
        },
      },
    ];
    links = [];
  });
  it("dispatches all applyAllconfigurations", () => {
    getAllNodes.mockReturnValue([
      {
        id: 1,
        data: {},
        links: [],
      },
      {
        id: 2,
        data: {},
        links: [],
      },
    ]);
    addToGraph(
      {
        commit,
        dispatch,
        rootState,
      },
      {
        nodes,
        links,
      },
    );
    expect(dispatch).toHaveBeenCalledWith("applyAllConfigurations");
  });

  it("moves node to nearby position", async () => {
    const nodes = [
      {
        id: "Genre/1",
        data: {
          label: "genre",
        },
      },
      {
        id: "Artist/20",
        data: {
          name: "Jorn Van Deynhoven",
          label: "artist",
        },
      },
      {
        id: "Artist/2",
        data: {
          name: "Kiholm",
          label: "artist",
        },
      },
    ];
    const links = [
      {
        fromId: "Genre/1",
        toId: "Artist/20",
        linkTypes: ["Artist_to_Genre"],
      },
      {
        fromId: "Genre/1",
        toId: "Artist/2",
        linkTypes: ["Artist_to_Genre"],
      },
    ];
    nodes.forEach((node) => {
      rootState.mainGraph.Graph.addNode(node.id, node.data);
    });
    links.forEach((link) => {
      rootState.mainGraph.Graph.addLink(link.fromId, link.toId, {
        linkTypes: [link.linkName],
      });
    });
    addToGraph(
      {
        dispatch,
        rootState,
        commit,
      },
      {
        nodes: [
          {
            id: "Genre/20",
            data: {
              label: "genre",
            },
          },
        ],
        links: [
          {
            fromId: "Genre/20",
            toId: "Artist/20",
            linkTypes: ["Artist_to_Genre"],
          },
        ],
      },
    );
    expect(commit).toHaveBeenNthCalledWith(2, "SET_NODE_POSITION", {
      nodeId: "Artist/20",
      xPosition: 299.0205045059134,
      yPosition: 139.73386615901225,
    });
  });
});
