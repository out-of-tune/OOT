import type { ActionContext } from "vuex";
import type { NgraphGraph } from "ngraph.graph";
import type { Layout, Renderer } from "vivagraphjs";
import type { Configuration } from "@/types/configuration";
import type { GraphLink, NodeData, NodeId } from "@/types/graph";
import type { Schema } from "@/types/schema";
import type { SearchObject } from "@/types/search";
import type { AppearanceState } from "./modules/appearance";
import type { AuthenticationState } from "./modules/authentication";
import type { ConfigurationIoState } from "./modules/configuration_io";
import type { EventsState } from "./modules/events";
import type { ExpandState } from "./modules/expand";
import type { FeedbackState } from "./modules/feedback";
import type { GraphCameraState } from "./modules/graph_camera";
import type { GraphIoState } from "./modules/graph_io";
import type { HistoryState } from "./modules/history";
import type { MusicPlayerState } from "./modules/music_player";
import type { PlaylistsState } from "./modules/playlists";
import type { SearchState } from "./modules/search";
import type { SelectionState } from "./modules/selection";
import type { ShareState } from "./modules/share";
import type { SnackbarState } from "./modules/snackbar";
import type { UserState } from "./modules/user";

/** Node shown in the info panel or the tooltip. `id` is 0 when no node is set. */
export interface NodeRef {
  id: NodeId | 0;
  data: Partial<NodeData>;
  links?: GraphLink[] | null;
}

export type ActiveMode = "expand" | "collapse" | "explore";

export interface MainGraphState {
  graphContainer: HTMLElement | null;
  Graph: NgraphGraph;
  currentNode: NodeRef;
  hoveredNode: NodeRef;
  displayState: {
    displayEdges: boolean;
    showTooltip: boolean;
  };
  renderState: {
    Renderer: Renderer | null;
    layout?: Layout;
    isRendered: boolean;
    layoutOptions: {
      springLength: number;
      springCoeff: number;
      dragCoeff: number;
      gravity: number;
    };
  };
}

export interface BaseState {
  mainGraph: MainGraphState;
  schema: Schema;
  configurations: Configuration;
  spotify: { accessToken: string };
  visibleItems: {
    queueDisplay: boolean;
    nodeInfo: boolean;
    addToQueueNotification: boolean;
  };
  activeMode: ActiveMode;
  searchObject: SearchObject;
  searchString: string;
}

export interface ModuleStates {
  appearance: AppearanceState;
  authentication: AuthenticationState;
  configuration_io: ConfigurationIoState;
  events: EventsState;
  expand: ExpandState;
  feedback: FeedbackState;
  graph_camera: GraphCameraState;
  graph_io: GraphIoState;
  history: HistoryState;
  music_player: MusicPlayerState;
  playlists: PlaylistsState;
  search: SearchState;
  selection: SelectionState;
  share: ShareState;
  snackbar: SnackbarState;
  user: UserState;
}

export type RootState = BaseState & ModuleStates;

/** Action context of a module with local state `S`. */
export type Context<S = RootState> = ActionContext<S, RootState>;
