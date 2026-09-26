import { generateSearchObject, searchObjectForType } from "../searchObject";

// Expected values were recorded from the original parser (ANTLR 4.13 JavaScript target)
// before the port to antlr4ng. The port must keep the exact behavior.
const recorded: [string, unknown][] = [
  [
    "",
    {
      valid: true,
      errors: [],
      attributes: [],
      tip: {
        type: "nodeType",
        text: "",
      },
    },
  ],
  [
    "a",
    {
      valid: true,
      errors: [],
      nodeType: "a",
      attributes: [],
      tip: {
        type: "nodeType",
        text: "a",
      },
    },
  ],
  [
    "artist",
    {
      valid: true,
      errors: [],
      nodeType: "artist",
      attributes: [],
      tip: {
        type: "nodeType",
        text: "artist",
      },
    },
  ],
  [
    "artist:",
    {
      valid: false,
      errors: ["mismatched input '<EOF>' expecting WHITESPACE"],
      nodeType: "artist",
      attributes: [],
      tip: {
        type: "attribute",
        text: "",
        nodeType: "artist",
      },
    },
  ],
  [
    "artist: ",
    {
      valid: false,
      errors: ["mismatched input '<EOF>' expecting {WORD, TEXT}"],
      nodeType: "artist",
      attributes: [
        {
          attributeSearch: "",
          operator: "",
          attributeData: "",
        },
      ],
      tip: {
        type: "attribute",
        text: "",
        nodeType: "artist",
      },
    },
  ],
  [
    "artist: name",
    {
      valid: false,
      errors: ["mismatched input '<EOF>' expecting OPERATOR"],
      nodeType: "artist",
      attributes: [
        {
          attributeSearch: "name",
          operator: "",
          attributeData: "",
        },
      ],
      tip: {
        type: "attribute",
        text: "name",
        nodeType: "artist",
      },
    },
  ],
  [
    "artist: name=",
    {
      valid: false,
      errors: ["missing {WORD, TEXT, DECIMAL} at '<EOF>'"],
      nodeType: "artist",
      attributes: [
        {
          attributeSearch: "name",
          operator: "=",
          attributeData: "",
        },
      ],
      tip: {
        type: "attribute",
        text: "name",
        nodeType: "artist",
      },
    },
  ],
  [
    "artist: name=bob",
    {
      valid: true,
      errors: [],
      nodeType: "artist",
      attributes: [
        {
          attributeSearch: "name",
          operator: "=",
          attributeData: "bob",
        },
      ],
    },
  ],
  [
    'artist: name="bob marley"',
    {
      valid: true,
      errors: [],
      nodeType: "artist",
      attributes: [
        {
          attributeSearch: "name",
          operator: "=",
          attributeData: '"bob marley"',
        },
      ],
    },
  ],
  [
    "artist: name=bob popularity>50",
    {
      valid: true,
      errors: [],
      nodeType: "artist",
      attributes: [
        {
          attributeSearch: "name",
          operator: "=",
          attributeData: "bob",
        },
        {
          attributeSearch: "popularity",
          operator: ">",
          attributeData: "50",
        },
      ],
    },
  ],
  [
    "artist: popularity>=50 popularity<=70",
    {
      valid: true,
      errors: [],
      nodeType: "artist",
      attributes: [
        {
          attributeSearch: "popularity",
          operator: ">=",
          attributeData: "50",
        },
        {
          attributeSearch: "popularity",
          operator: "<=",
          attributeData: "70",
        },
      ],
    },
  ],
  [
    "artist: name like %bob%",
    {
      valid: true,
      errors: [],
      nodeType: "artist",
      attributes: [
        {
          attributeSearch: "name",
          operator: " like ",
          attributeData: "bob",
        },
      ],
    },
  ],
  [
    "artist: name LIKE %bob%",
    {
      valid: true,
      errors: [],
      nodeType: "artist",
      attributes: [
        {
          attributeSearch: "name",
          operator: " LIKE ",
          attributeData: "bob",
        },
      ],
    },
  ],
  [
    "artist: name!=bob",
    {
      valid: true,
      errors: [],
      nodeType: "artist",
      attributes: [
        {
          attributeSearch: "name",
          operator: "!=",
          attributeData: "bob",
        },
      ],
    },
  ],
  [
    "artist:name=bob",
    {
      valid: false,
      errors: ["mismatched input 'name' expecting WHITESPACE"],
      nodeType: "name",
      attributes: [],
      tip: {
        type: "nodeType",
        text: "name",
      },
    },
  ],
  [
    "genre: name=rock ",
    {
      valid: false,
      errors: ["mismatched input '<EOF>' expecting {WORD, TEXT}"],
      nodeType: "genre",
      attributes: [
        {
          attributeSearch: "name",
          operator: "=",
          attributeData: "rock",
        },
        {
          attributeSearch: "",
          operator: "",
          attributeData: "",
        },
      ],
      tip: {
        type: "attribute",
        text: "",
        nodeType: "genre",
      },
    },
  ],
  [
    'genre: "alias name"=frabab',
    {
      valid: true,
      errors: [],
      nodeType: "genre",
      attributes: [
        {
          attributeSearch: '"alias name"',
          operator: "=",
          attributeData: "frabab",
        },
      ],
    },
  ],
  [
    "artist: popularity>5.5",
    {
      valid: true,
      errors: [],
      nodeType: "artist",
      attributes: [
        {
          attributeSearch: "popularity",
          operator: ">",
          attributeData: "5.5",
        },
      ],
    },
  ],
  [
    "artist: name=bob pop",
    {
      valid: false,
      errors: ["mismatched input '<EOF>' expecting OPERATOR"],
      nodeType: "artist",
      attributes: [
        {
          attributeSearch: "name",
          operator: "=",
          attributeData: "bob",
        },
        {
          attributeSearch: "pop",
          operator: "",
          attributeData: "",
        },
      ],
      tip: {
        type: "attribute",
        text: "pop",
        nodeType: "artist",
      },
    },
  ],
  [
    "artist: name=bob popularity",
    {
      valid: false,
      errors: ["mismatched input '<EOF>' expecting OPERATOR"],
      nodeType: "artist",
      attributes: [
        {
          attributeSearch: "name",
          operator: "=",
          attributeData: "bob",
        },
        {
          attributeSearch: "popularity",
          operator: "",
          attributeData: "",
        },
      ],
      tip: {
        type: "attribute",
        text: "popularity",
        nodeType: "artist",
      },
    },
  ],
  [
    "song: name=\u00dcber",
    {
      valid: true,
      errors: [],
      nodeType: "song",
      attributes: [
        {
          attributeSearch: "name",
          operator: "=",
          attributeData: "\u00dcber",
        },
      ],
    },
  ],
  [
    "artist genre",
    {
      valid: true,
      errors: [],
      nodeType: "artist",
      attributes: [],
      tip: {
        type: "nodeType",
        text: "artist",
      },
    },
  ],
  [
    "artist: =bob",
    {
      valid: false,
      errors: [
        "extraneous input '=' expecting {WORD, TEXT}",
        "mismatched input '<EOF>' expecting OPERATOR",
      ],
      nodeType: "artist",
      attributes: [
        {
          attributeSearch: "=bob",
          operator: "",
          attributeData: "",
        },
      ],
      tip: {
        type: "attribute",
        text: "=bob",
        nodeType: "artist",
      },
    },
  ],
  [
    "artist: name=bob=",
    {
      valid: true,
      errors: [],
      nodeType: "artist",
      attributes: [
        {
          attributeSearch: "name",
          operator: "=",
          attributeData: "bob",
        },
      ],
    },
  ],
  [
    "Auftrag: ph<2.5",
    {
      valid: true,
      errors: [],
      nodeType: "Auftrag",
      attributes: [
        {
          attributeSearch: "ph",
          operator: "<",
          attributeData: "2.5",
        },
      ],
    },
  ],
  [
    'artist: name="a" name="b"',
    {
      valid: true,
      errors: [],
      nodeType: "artist",
      attributes: [
        {
          attributeSearch: "name",
          operator: "=",
          attributeData: '"a"',
        },
        {
          attributeSearch: "name",
          operator: "=",
          attributeData: '"b"',
        },
      ],
    },
  ],
  [
    "artist: name = bob",
    {
      valid: false,
      errors: [
        "extraneous input ' ' expecting OPERATOR",
        "extraneous input ' ' expecting {WORD, TEXT, DECIMAL}",
      ],
      nodeType: "artist",
      attributes: [
        {
          attributeSearch: "name",
          operator: "=",
          attributeData: " bob",
        },
      ],
    },
  ],
];

describe("generateSearchObject", () => {
  it.each(recorded)("parses %j like the original parser", (input, expected) => {
    expect(JSON.parse(JSON.stringify(generateSearchObject(input)))).toEqual(
      expected,
    );
  });
});

describe("searchObjectForType", () => {
  it("matches all nodes of the type when the condition is empty", () => {
    expect(searchObjectForType("artist", " ").valid).toBe(true);
  });
  it("adds the condition to the type", () => {
    const searchObject = searchObjectForType("artist", "name=Björk");
    expect(searchObject.valid).toBe(true);
    expect(searchObject.nodeType).toBe("artist");
  });
});
