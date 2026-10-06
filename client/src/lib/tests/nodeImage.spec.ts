import createGraph from "ngraph.graph";
import { imageShapeOf, nodeImageUrl } from "../nodeImage";
import { coverUrl } from "../spotifyNode";

const image = (url: string, width?: number) => ({ url, width, height: width });

describe("coverUrl", () => {
  it("takes the smallest image that is at least 160 px wide", () => {
    expect(
      coverUrl([image("640", 640), image("300", 300), image("64", 64)]),
    ).toBe("300");
  });

  it("takes the largest image when none is wide enough, and the first without widths", () => {
    expect(coverUrl([image("64", 64), image("100", 100)])).toBe("100");
    expect(coverUrl(["plain.jpg", "small.jpg"])).toBe("plain.jpg");
    expect(coverUrl([])).toBeNull();
    expect(coverUrl(undefined)).toBeNull();
  });
});

describe("nodeImageUrl", () => {
  it("gives artists and albums their own image and genres none", () => {
    const graph = createGraph();
    const artist = graph.addNode("artist/a", {
      label: "artist",
      images: ["a.jpg"],
    });
    const genre = graph.addNode("genre/g", {
      label: "genre",
      images: ["g.jpg"],
    });
    expect(nodeImageUrl(graph, artist)).toBe("a.jpg");
    expect(nodeImageUrl(graph, genre)).toBeNull();
    expect(imageShapeOf(artist)).toBe("circle");
  });

  it("gives a song the cover of its album only while the album node is not in the graph", () => {
    const graph = createGraph();
    const song = graph.addNode("song/s", {
      label: "song",
      album: { images: [image("cover", 300)] },
    });
    expect(nodeImageUrl(graph, song)).toBe("cover");
    expect(imageShapeOf(song)).toBe("square");
    graph.addNode("album/b", { label: "album", images: [image("cover", 300)] });
    graph.addLink("song/s", "album/b");
    expect(nodeImageUrl(graph, song)).toBeNull();
  });
});
