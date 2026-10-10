import type { SearchObject } from "./search";

/** Edges that expand or collapse follow for one node type. */
export interface ActionRule {
  nodeType: string;
  edges: string[];
}

interface BaseNodeRule {
  searchObject: SearchObject;
  searchString: string;
}

export interface ColorRule extends BaseNodeRule {
  /** RRGGBBAA hex string without `#`. */
  color: string;
}

export interface CompareSizeRule extends BaseNodeRule {
  sizeType: "compare";
  size: number;
}

export interface MapSizeRule extends BaseNodeRule {
  sizeType: "map";
  min: number;
  max: number;
}

export type SizeRule = CompareSizeRule | MapSizeRule;
export type NodeRule = ColorRule | SizeRule;

/** Rules for one node type. The first rule is the default rule. */
export interface NodeRuleset<TRule extends NodeRule = NodeRule> {
  nodeLabel: string;
  rules: TRule[];
}

export interface TooltipRule {
  nodeLabel: string;
  attribute: string;
}

export interface EdgeColorRule {
  edgeLabel: string;
  /** RRGGBBAA hex string without `#`. */
  color: string;
}

export interface LineLayoutOptions {
  xOffset: number;
  yOffset: number;
  slope: number;
  distance: number;
  invertedAxis?: boolean;
}

export interface MapLayoutOptions {
  xOffset: number;
  yOffset: number;
  xAttributeKey: string;
  yAttributeKey: string;
  mapXLength: number;
  mapYLength: number;
  xBoundaryMin: number;
  yBoundaryMin: number;
  xBoundaryMax: number;
  yBoundaryMax: number;
  jitter?: boolean;
}

export type LayoutConfiguration =
  | {
      nodeLabel: string;
      layoutType: "line";
      layoutTypeOptions: LineLayoutOptions;
    }
  | {
      nodeLabel: string;
      layoutType: "map";
      layoutTypeOptions: MapLayoutOptions;
    };

export interface Configuration {
  actionConfiguration: {
    expand: ActionRule[];
    collapse: ActionRule[];
  };
  appearanceConfiguration: {
    nodeConfiguration: {
      color: NodeRuleset<ColorRule>[];
      size: NodeRuleset<SizeRule>[];
      tooltip: TooltipRule[];
    };
    edgeConfiguration: {
      color: EdgeColorRule[];
      size: unknown[];
    };
  };
  /** Pinned layouts per node type. Missing in configurations saved before this field existed. */
  layoutConfiguration?: LayoutConfiguration[];
}

export type NodeRuleType = "color" | "size";
