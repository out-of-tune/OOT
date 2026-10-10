# Plan: 3D graph view with three.js

The graph gets a second view in 3D, next to the current 2D view. A button in the tool rail switches between them. The 3D view uses `3d-force-graph`, a maintained library on top of three.js with a 3D force layout, an orbit camera and node picking.

## 1. Current state

The store talks to VivaGraphJS directly. These are all the calls it makes:

| Area | Calls |
| --- | --- |
| Node and link style | `getGraphics().getNodeUI(id).color / .size / .position`, `getLinkUI(id).color` |
| Layout | `layout.getNodePosition`, `setNodePosition`, `pinNode`, `isNodePinned` |
| Camera | `moveTo`, `zoomIn`, `zoomOut`, `getTransform().scale`, `on("scale")` |
| Lifecycle | `run`, `rerender`, `pause`, `resume`, `dispose`, `updateSize` |
| Screen projection | `transformGraphToClientCoordinates` (labels), `transformClientToGraphCoordinates` (labels, rectangle selection) |
| Labels | `placeNode(callback)`, called for each node on each frame |
| Input | `Viva.Graph.webglInputEvents`: enter, leave, click, down, move, up |

## 2. Design

1. A renderer contract in `src/lib/view/contract.ts` holds exactly the calls above. The store and the components use only the contract.
2. Two adapters implement it:
   - `lib/view/vivaView.ts` wraps VivaGraphJS. The 2D behavior does not change.
   - `lib/view/threeView.ts` wraps `3d-force-graph`.
3. The ngraph graph stays the only source of truth. The 3D adapter listens to its change events and updates the 3D scene.
4. Screen projection becomes one call, `toScreen(position)`, that returns the screen point and whether it is in front of the camera. Labels and rectangle selection project each node to the screen. This works in 2D and 3D, so `transformClientToGraphCoordinates` goes away.
5. The view mode (`2d` or `3d`) is root state, saved in local storage. A switch disposes the old renderer and builds the new one on the same graph. It keeps the pinned nodes. It applies the configuration again, because colors and sizes live in the renderer objects.
6. The 3D chunk (three.js, the force layout and 3d-force-graph) is about 364 kB with gzip. It is a separate chunk. The app loads it the first time the 3D view opens.

## 3. Feature mapping in 3D

| Feature | 3D behavior |
| --- | --- |
| Node color and alpha | One sphere per node with its own material. Alpha maps to material opacity. |
| Node size | Sphere scale. |
| Link color and alpha | One line material per link. |
| Pin and unpin | Fixed coordinates (`fx`, `fy`, `fz`) of the force simulation. |
| Pause (Space) | The simulation stops moving nodes (velocity decay 1). The camera still works. |
| Fit (F) and search results | `zoomToFit` on the given nodes. |
| Move to node | The camera looks at the node from its current distance. |
| Zoom labels | Scale is the reference camera distance divided by the current distance. Labels show past the same threshold as in 2D. |
| Hover, click | `onNodeHover`, `onNodeClick`. |
| Drag with the selection (group move) | `onNodeDrag` and `onNodeDragEnd` map to the same store actions as mouse down, move and up. The move includes z. |
| Rectangle selection (Shift + drag) | Projection of each node to the screen, then the same rectangle test. |
| Line and map layouts | They set x and y and keep z at 0, so they draw on a plane. |

## 4. Checks

- The adapters have unit tests with a fake engine: sync of added and removed nodes and links, color and alpha mapping, pinning, projection.
- The existing store tests keep passing. The three label tests change from `transformClientToGraphCoordinates` to `toScreen`.
- A browser check in both views: search, expand, hover, click, select, pin, pause, fit, labels, switching back and forth.

## 5. Risks

| Risk | Control |
| --- | --- |
| Many Vuex commits per frame for labels | Same cost as the 2D view today. Labels stay behind the zoom threshold. |
| WebGL not available | The switch catches the error, stays in 2D and shows a message. |
| Different layout feel in 3D | The 3D view uses the library defaults. They can be tuned later. |
