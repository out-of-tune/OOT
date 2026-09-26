import source from "../HelpView.vue?raw";

describe("HelpView", () => {
  it("links inside the page only with #, because the router uses the hash", () => {
    const hrefs = [...source.matchAll(/\shref="([^"]*)"/g)].map(
      (match) => match[1],
    );
    expect(hrefs.length).toBeGreaterThan(0);
    const relative = hrefs.filter((href) => !/^(#|https?:|mailto:)/.test(href));
    expect(relative).toEqual([]);
  });
});
