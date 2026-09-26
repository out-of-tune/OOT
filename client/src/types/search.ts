export interface SearchAttribute {
  attributeSearch: string;
  operator: string;
  attributeData: string;
}

/** Hint for the autocomplete list of the advanced search. */
export interface SearchTip {
  type: "nodeType" | "attribute";
  text: string;
  nodeType?: string;
}

/** Parsed form of an advanced search string such as `artist: name="Bob" popularity>50`. */
export interface SearchObject {
  valid: boolean;
  errors: string[];
  nodeType?: string;
  attributes: SearchAttribute[];
  tip?: SearchTip;
}
