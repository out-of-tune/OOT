// @vitest-environment jsdom
import { THEMES, applyTheme, themeById, themeForGenres } from "../themes";

describe("themeForGenres", () => {
  const genre = (name: string, weight = 1) => ({ name, weight });

  it("picks the theme of the most common genres, by weight", () => {
    expect(
      themeForGenres([
        genre("bebop"),
        genre("modal jazz"),
        genre("indie rock"),
      ]),
    ).toBe("jazz");
    expect(themeForGenres([genre("techno"), genre("rock", 3)])).toBe("rock");
  });

  it("lets the longest keyword decide, so hip hop is not pop", () => {
    expect(themeForGenres([genre("conscious hip hop")])).toBe("hiphop");
    expect(themeForGenres([genre("dance pop")])).toBe("pop");
  });

  it("keeps the default theme without a known genre", () => {
    expect(themeForGenres([])).toBe("default");
    expect(themeForGenres([genre("polka")])).toBe("default");
  });
});

it("applyTheme sets every token on the root element", () => {
  const root = document.createElement("div");
  applyTheme(themeById("electronic"), root);
  expect(root.style.getPropertyValue("--color-accent")).toBe(
    THEMES.find((theme) => theme.id === "electronic")!.colors.accent,
  );
  expect(root.dataset.theme).toBe("electronic");
  expect(themeById("unknown").id).toBe("default");
});

it("the default theme has the colors of styles/main.css", async () => {
  const { readFileSync } = await import("node:fs");
  // The tests run in the client folder.
  const css = readFileSync("src/styles/main.css", "utf-8");
  const colors = themeById("default").colors;
  for (const [token, value] of [
    ["accent", colors.accent],
    ["brand", colors.brand],
    ["surface", colors.surface],
    ["line-strong", colors.lineStrong],
  ])
    expect(css).toContain(`--color-${token}: ${value};`);
});

describe("glyphs", () => {
  it("every genre theme has a glyph and the default theme has none", () => {
    for (const theme of THEMES)
      expect(Boolean(theme.glyph)).toBe(theme.id !== "default");
  });

  it("applyTheme sets the glyph as a CSS mask image", async () => {
    const { glyphUrl } = await import("../themes");
    const root = document.createElement("div");
    applyTheme(themeById("jazz"), root);
    expect(root.style.getPropertyValue("--theme-glyph")).toBe(
      glyphUrl(themeById("jazz").glyph),
    );
    expect(glyphUrl(themeById("jazz").glyph)).toMatch(
      /^url\("data:image\/svg\+xml,%3Csvg/,
    );
    applyTheme(themeById("default"), root);
    expect(root.style.getPropertyValue("--theme-glyph")).toBe("none");
  });
});

describe("switchTheme", () => {
  afterEach(() => {
    delete (document as { startViewTransition?: unknown }).startViewTransition;
    vi.unstubAllGlobals();
  });

  it("cross-fades a change with a view transition, and applies the first theme at once", async () => {
    const { switchTheme } = await import("../themes");
    const transition = vi.fn((update: () => void) => update());
    (document as { startViewTransition?: unknown }).startViewTransition =
      transition;
    vi.stubGlobal("matchMedia", () => ({ matches: false }));
    switchTheme(themeById("rock"), false);
    expect(transition).not.toHaveBeenCalled();
    expect(document.documentElement.dataset.theme).toBe("rock");
    switchTheme(themeById("jazz"), true);
    expect(transition).toHaveBeenCalledTimes(1);
    expect(document.documentElement.dataset.theme).toBe("jazz");
  });

  it("does not animate when the system asks for less motion", async () => {
    const { switchTheme } = await import("../themes");
    const transition = vi.fn();
    (document as { startViewTransition?: unknown }).startViewTransition =
      transition;
    vi.stubGlobal("matchMedia", () => ({ matches: true }));
    switchTheme(themeById("pop"), true);
    expect(transition).not.toHaveBeenCalled();
    expect(document.documentElement.dataset.theme).toBe("pop");
  });
});

it("every theme offers genres to start with, and genre themes a headline", async () => {
  const { activeThemeId } = await import("../themes");
  for (const theme of THEMES) {
    expect(theme.suggestions.length).toBeGreaterThanOrEqual(3);
    expect(Boolean(theme.tagline)).toBe(theme.id !== "default");
  }
  expect(activeThemeId({ uiTheme: "auto", autoTheme: "jazz" })).toBe("jazz");
  expect(activeThemeId({ uiTheme: "rock", autoTheme: "jazz" })).toBe("rock");
});

it("tells IDM apart from techno", () => {
  expect(themeForGenres([{ name: "idm", weight: 1 }])).toBe("idm");
  expect(themeForGenres([{ name: "electronica", weight: 1 }])).toBe("idm");
  expect(themeForGenres([{ name: "minimal techno", weight: 1 }])).toBe(
    "electronic",
  );
});

it("finds the Latin and the R&B themes", () => {
  expect(themeForGenres([{ name: "reggaeton", weight: 1 }])).toBe("latin");
  expect(themeForGenres([{ name: "latin pop", weight: 1 }])).toBe("latin");
  expect(themeForGenres([{ name: "neo soul", weight: 1 }])).toBe("rnb");
  expect(themeForGenres([{ name: "r&b", weight: 1 }])).toBe("rnb");
});
