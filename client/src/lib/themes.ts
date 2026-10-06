// Color themes of the UI, one for each family of music genres. A theme sets only the
// design tokens of styles/main.css: the accent and brand colors and a slight tint of the
// panels. Layout, text colors and the colors of the graph stay the same.

export type ThemeId =
  | "default"
  | "jazz"
  | "rock"
  | "metal"
  | "electronic"
  | "idm"
  | "hiphop"
  | "rnb"
  | "pop"
  | "ambient"
  | "reggae"
  | "latin"
  | "folk"
  | "classical";

/** The tokens that a theme sets, as CSS colors. */
export interface ThemeColors {
  accent: string;
  accentStrong: string;
  brand: string;
  brandSoft: string;
  teal: string;
  surface: string;
  surfaceRaised: string;
  surfaceHover: string;
  line: string;
  lineStrong: string;
}

export interface Theme {
  id: ThemeId;
  name: string;
  /** Words in genre names that point to the theme, for the "match the graph" choice. */
  keywords: string[];
  /**
   * The small symbol of the theme: the inside of a 24 × 24 SVG of strokes, as in Lucide.
   * Panels and the tool rail show it in the theme color. The default theme has none.
   */
  glyph: string;
  /** A short headline for the empty graph, in the voice of the genre. Empty for the default theme. */
  tagline: string;
  /** Genres that the empty graph offers to start with. */
  suggestions: string[];
  colors: ThemeColors;
}

/** The CSS custom property of each token, as styles/main.css defines it. */
const PROPERTIES: Record<keyof ThemeColors, string> = {
  accent: "--color-accent",
  accentStrong: "--color-accent-strong",
  brand: "--color-brand",
  brandSoft: "--color-brand-soft",
  teal: "--color-teal",
  surface: "--color-surface",
  surfaceRaised: "--color-surface-raised",
  surfaceHover: "--color-surface-hover",
  line: "--color-line",
  lineStrong: "--color-line-strong",
};

export const THEMES: Theme[] = [
  {
    id: "default",
    name: "out-of-tune",
    keywords: [],
    glyph: "",
    tagline: "",
    suggestions: ["rock", "jazz", "hip hop", "electronic"],
    colors: {
      accent: "#2d9cdb",
      accentStrong: "#56ccf2",
      brand: "#da6a1d",
      brandSoft: "#f2994a",
      teal: "#1dcdda",
      surface: "#141417",
      surfaceRaised: "#1c1c21",
      surfaceHover: "#26262c",
      line: "#2c2c33",
      lineStrong: "#3a3a43",
    },
  },
  {
    id: "jazz",
    name: "Jazz",
    keywords: ["jazz", "bebop", "swing", "bossa", "blues"],
    glyph:
      "<path d='M9 18V5l12-2v13'/><circle cx='6' cy='18' r='3'/><circle cx='18' cy='16' r='3'/>",
    tagline: "Late night set",
    suggestions: ["jazz", "bebop", "modal jazz", "cool jazz"],
    colors: {
      accent: "#3566c8",
      accentStrong: "#7ea6f2",
      brand: "#c9a227",
      brandSoft: "#e3c766",
      teal: "#d8b46a",
      surface: "#12141c",
      surfaceRaised: "#1a1d28",
      surfaceHover: "#242836",
      line: "#2a2e3c",
      lineStrong: "#3a3f50",
    },
  },
  {
    id: "rock",
    name: "Rock",
    keywords: [
      "rock",
      "punk",
      "grunge",
      "garage",
      "indie",
      "britpop",
      "shoegaze",
      "blues rock",
    ],
    glyph:
      "<rect x='3' y='3' width='18' height='18' rx='2'/><circle cx='12' cy='13' r='4.5'/><path d='M7 7h3M15 7h2'/>",
    tagline: "Valves and volume",
    suggestions: ["rock", "grunge", "britpop", "psychedelic rock"],
    colors: {
      accent: "#9b2226",
      accentStrong: "#e9a23b",
      brand: "#eadfc4",
      brandSoft: "#f5ecd6",
      teal: "#c9a24a",
      surface: "#16110f",
      surfaceRaised: "#1f1815",
      surfaceHover: "#2a201c",
      line: "#342823",
      lineStrong: "#46362f",
    },
  },

  {
    id: "metal",
    name: "Metal",
    keywords: [
      "metal",
      "doom",
      "thrash",
      "hardcore",
      "grindcore",
      "sludge",
      "djent",
      "metalcore",
    ],
    glyph:
      "<path d='M12 21.5C8.5 18 5 13.2 5 8.6 5 5.3 8 3.5 12 3.5s7 1.8 7 5.1c0 4.6-3.5 9.4-7 12.9z'/>",
    tagline: "Seven strings",
    suggestions: ["metal", "heavy metal", "doom metal", "thrash metal"],
    colors: {
      accent: "#5b6270",
      accentStrong: "#c3cad6",
      brand: "#d93a33",
      brandSoft: "#ef6a5f",
      teal: "#dfe4ec",
      surface: "#0f1012",
      surfaceRaised: "#16171a",
      surfaceHover: "#1f2024",
      line: "#292a2f",
      lineStrong: "#383a40",
    },
  },

  {
    id: "electronic",
    name: "Techno and house",
    keywords: [
      "electronic",
      "electro",
      "techno",
      "house",
      "trance",
      "edm",
      "dubstep",
      "drum and bass",
      "synth",
      "krautrock",
      "minimal",
      "garage house",
    ],
    glyph:
      "<rect x='2' y='9' width='4' height='6' rx='1'/><rect x='7.3' y='9' width='4' height='6' rx='1'/><rect x='12.7' y='9' width='4' height='6' rx='1'/><rect x='18' y='9' width='4' height='6' rx='1'/>",
    tagline: "Warehouse, 128 BPM",
    suggestions: ["techno", "house", "electronic", "minimal techno"],
    colors: {
      accent: "#c2410c",
      accentStrong: "#ff7a3d",
      brand: "#e8e8e8",
      brandSoft: "#ffffff",
      teal: "#46f28c",
      surface: "#121212",
      surfaceRaised: "#1a1a1a",
      surfaceHover: "#242424",
      line: "#2c2c2c",
      lineStrong: "#3c3c3c",
    },
  },
  {
    id: "idm",
    name: "IDM",
    keywords: [
      "idm",
      "glitch",
      "braindance",
      "intelligent dance",
      "breakcore",
      "electronica",
      "drill and bass",
    ],
    glyph:
      "<circle cx='12' cy='12' r='7'/><path d='M12 1v6M12 17v6M1 12h6M17 12h6'/>",
    tagline: "Braindance",
    suggestions: ["idm", "electronica", "glitch", "ambient techno"],
    colors: {
      accent: "#3d3dd6",
      accentStrong: "#a5a5ff",
      brand: "#d4ff3a",
      brandSoft: "#e9ff99",
      teal: "#ff4d8d",
      surface: "#101114",
      surfaceRaised: "#17181c",
      surfaceHover: "#202126",
      line: "#292a30",
      lineStrong: "#393a42",
    },
  },

  {
    id: "hiphop",
    name: "Hip hop",
    keywords: [
      "hip hop",
      "hip-hop",
      "rap",
      "trap",
      "grime",
      "drill",
      "boom bap",
    ],
    glyph:
      "<rect x='9' y='2' width='6' height='12' rx='3'/><path d='M19 10v2a7 7 0 0 1-14 0v-2M12 19v3'/>",
    tagline: "From the block",
    suggestions: ["hip hop", "rap", "conscious hip hop", "trap"],
    colors: {
      accent: "#7b3fb0",
      accentStrong: "#c08cf0",
      brand: "#f2b631",
      brandSoft: "#ffd36e",
      teal: "#f2b631",
      surface: "#141218",
      surfaceRaised: "#1c1922",
      surfaceHover: "#26222e",
      line: "#2e2936",
      lineStrong: "#3f3949",
    },
  },
  {
    id: "rnb",
    name: "R&B and soul",
    keywords: [
      "r&b",
      "rnb",
      "soul",
      "neo soul",
      "funk",
      "gospel",
      "motown",
      "quiet storm",
      "new jack swing",
    ],
    glyph: "<path d='M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z'/>",
    tagline: "Late night, slow jams",
    suggestions: ["r&b", "soul", "neo soul", "funk"],
    colors: {
      accent: "#6d3fa0",
      accentStrong: "#c9a4ff",
      brand: "#e8a0bf",
      brandSoft: "#f6cfe0",
      teal: "#7fb7ff",
      surface: "#141120",
      surfaceRaised: "#1b1729",
      surfaceHover: "#252034",
      line: "#2d283d",
      lineStrong: "#3e3752",
    },
  },

  {
    id: "pop",
    name: "Pop",
    keywords: ["pop", "dance", "disco", "k-pop"],
    glyph:
      "<path d='M12 3l1.9 5.8L20 10l-6.1 1.9L12 18l-1.9-6.1L4 10l6.1-1.2z'/><path d='M19 17l.7 1.8 1.8.7-1.8.7L19 22l-.7-1.8-1.8-.7 1.8-.7z'/>",
    tagline: "Chart room",
    suggestions: ["pop", "dance pop", "art pop", "k-pop"],
    colors: {
      accent: "#c22f7a",
      accentStrong: "#ff7ab8",
      brand: "#ffb020",
      brandSoft: "#ffcf66",
      teal: "#5ad1ff",
      surface: "#171318",
      surfaceRaised: "#201a21",
      surfaceHover: "#2b232c",
      line: "#342a35",
      lineStrong: "#463947",
    },
  },
  {
    id: "ambient",
    name: "Ambient",
    keywords: [
      "ambient",
      "drone",
      "new age",
      "downtempo",
      "chillout",
      "lo-fi",
      "lofi",
      "field recording",
    ],
    glyph:
      "<circle cx='12' cy='12' r='2'/><circle cx='12' cy='12' r='6'/><circle cx='12' cy='12' r='10'/>",
    tagline: "Music for slow rooms",
    suggestions: ["ambient", "drone", "downtempo", "trip hop"],
    colors: {
      accent: "#3a7a80",
      accentStrong: "#9ed3cc",
      brand: "#c4bedf",
      brandSoft: "#e2ddf2",
      teal: "#9ed3cc",
      surface: "#121516",
      surfaceRaised: "#191d1f",
      surfaceHover: "#222829",
      line: "#2a3133",
      lineStrong: "#394345",
    },
  },

  {
    id: "reggae",
    name: "Reggae",
    keywords: ["reggae", "dub", "ska", "dancehall", "afrobeat", "roots"],
    glyph:
      "<circle cx='12' cy='12' r='4'/><path d='M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M6.3 17.7l-1.4 1.4M19.1 4.9l-1.4 1.4'/>",
    tagline: "Sunrise session",
    suggestions: ["reggae", "roots reggae", "dub", "ska"],
    colors: {
      accent: "#23804e",
      accentStrong: "#4cd384",
      brand: "#f4c430",
      brandSoft: "#ffdc6b",
      teal: "#e9573f",
      surface: "#121612",
      surfaceRaised: "#1a1f19",
      surfaceHover: "#232a22",
      line: "#2b332a",
      lineStrong: "#3b4539",
    },
  },
  {
    id: "latin",
    name: "Latin",
    keywords: [
      "latin",
      "reggaeton",
      "salsa",
      "bachata",
      "cumbia",
      "merengue",
      "tango",
      "urbano",
      "dembow",
      "son cubano",
      "bolero",
    ],
    glyph:
      "<path d='M7 3h10l-2.2 18H9.2z'/><path d='M7 3c0 1.6 10 1.6 10 0'/><path d='M8 9h8M8.6 15h6.8'/>",
    tagline: "Noche tropical",
    suggestions: ["latin", "reggaeton", "salsa", "bachata"],
    colors: {
      accent: "#b8235a",
      accentStrong: "#ff6f91",
      brand: "#ffb347",
      brandSoft: "#ffd28a",
      teal: "#2ed3a7",
      surface: "#17111a",
      surfaceRaised: "#201823",
      surfaceHover: "#2b212f",
      line: "#342838",
      lineStrong: "#46374b",
    },
  },

  {
    id: "folk",
    name: "Folk and country",
    keywords: [
      "folk",
      "country",
      "americana",
      "bluegrass",
      "singer-songwriter",
      "acoustic",
    ],
    glyph:
      "<path d='M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 19 2c1 2 2 4.2 2 8 0 5.5-4.8 10-10 10Z'/><path d='M2 21c0-3 1.9-5.4 5.1-6C9.5 14.5 12 13 13 12'/>",
    tagline: "Front porch",
    suggestions: ["folk", "country", "americana", "bluegrass"],
    colors: {
      accent: "#8b5a2b",
      accentStrong: "#d9a066",
      brand: "#c97b4a",
      brandSoft: "#e8b48a",
      teal: "#a7c080",
      surface: "#16130f",
      surfaceRaised: "#1f1b16",
      surfaceHover: "#2a241d",
      line: "#332c24",
      lineStrong: "#453c31",
    },
  },
  {
    id: "classical",
    name: "Classical",
    keywords: [
      "classical",
      "baroque",
      "orchestra",
      "opera",
      "romantic",
      "chamber",
      "minimalism",
    ],
    glyph:
      "<path d='M18.5 8c-1.4 0-2.6-.8-3.2-2A6.9 6.9 0 0 0 2 9v11a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-8.5C22 9.6 20.4 8 18.5 8'/><path d='M2 14h20M6 14v4M10 14v4M14 14v4M18 14v4'/>",
    tagline: "Concert hall",
    suggestions: ["classical", "baroque", "opera", "minimalism"],
    colors: {
      accent: "#6b5a3e",
      accentStrong: "#cbb88f",
      brand: "#e8dcc0",
      brandSoft: "#f5eedc",
      teal: "#b8a27a",
      surface: "#151412",
      surfaceRaised: "#1d1b18",
      surfaceHover: "#282520",
      line: "#312d27",
      lineStrong: "#433e35",
    },
  },
];

/** The theme that shows: the chosen one, or for "auto" the one that matches the graph. */
export const activeThemeId = (appearance: {
  uiTheme: ThemeId | "auto";
  autoTheme: ThemeId;
}): ThemeId =>
  appearance.uiTheme === "auto" ? appearance.autoTheme : appearance.uiTheme;

export const themeById = (id: string): Theme =>
  THEMES.find((theme) => theme.id === id) ?? THEMES[0];

/** The glyph as a whole SVG document, for inline use or a CSS mask. */
export const glyphSvg = (glyph: string) =>
  `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'>${glyph}</svg>`;

/** The glyph as a CSS image value, or `none`. */
export const glyphUrl = (glyph: string) =>
  glyph
    ? `url("data:image/svg+xml,${encodeURIComponent(glyphSvg(glyph))}")`
    : "none";

/**
 * Sets the tokens of the theme on the root element, so every Tailwind class follows. The
 * name goes into `data-theme` and the glyph into `--theme-glyph`, for the decorations of
 * styles/themes.css.
 */
export function applyTheme(
  theme: Theme,
  root: HTMLElement = document.documentElement,
) {
  (Object.keys(PROPERTIES) as (keyof ThemeColors)[]).forEach((token) =>
    root.style.setProperty(PROPERTIES[token], theme.colors[token]),
  );
  root.style.setProperty("--theme-glyph", glyphUrl(theme.glyph));
  root.dataset.theme = theme.id;
}

/**
 * The theme whose keywords the genre names match most often, each name counted with its
 * weight. "Hip hop" wins over "pop" in "hip hop", because the longest keyword that a name
 * contains decides. Without a match, the default theme.
 */
export function themeForGenres(
  genres: { name: string; weight: number }[],
): ThemeId {
  const scores = new Map<ThemeId, number>();
  for (const { name, weight } of genres) {
    const lower = name.toLowerCase();
    let best: { id: ThemeId; length: number } | undefined;
    for (const theme of THEMES)
      for (const keyword of theme.keywords)
        if (lower.includes(keyword) && (!best || keyword.length > best.length))
          best = { id: theme.id, length: keyword.length };
    if (best) scores.set(best.id, (scores.get(best.id) ?? 0) + weight);
  }
  let winner: ThemeId = "default";
  let top = 0;
  scores.forEach((score, id) => {
    if (score > top) {
      top = score;
      winner = id;
    }
  });
  return winner;
}

/**
 * Applies a theme. A change after the first one cross-fades the whole page with a view
 * transition, where the browser has them and the system allows motion. The browser
 * draws the fade from two snapshots, so no style changes during it.
 */
export function switchTheme(theme: Theme, animate: boolean) {
  const apply = () => applyTheme(theme);
  const reduce =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!animate || reduce || typeof document.startViewTransition !== "function")
    apply();
  else document.startViewTransition(apply);
}
