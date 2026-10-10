import Viva from "vivagraphjs";

/** Screen rectangle in client coordinates. */
export interface SelectedArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface MultiSelectOverlay {
  onAreaSelected(callback: (area: SelectedArea) => void): void;
  destroy(): void;
}

const SELECTION_CLASS = "graph-selection-indicator";

function createOverlay(overlayDom: HTMLElement): MultiSelectOverlay {
  let indicator = overlayDom.querySelector<HTMLElement>(`.${SELECTION_CLASS}`);
  if (!indicator) {
    indicator = document.createElement("div");
    indicator.className = SELECTION_CLASS;
    overlayDom.appendChild(indicator);
  }
  const selectionIndicator = indicator;
  selectionIndicator.style.display = "none";

  const listeners: ((area: SelectedArea) => void)[] = [];
  const dragndrop = Viva.Graph.Utils.dragndrop(overlayDom);
  const selectedArea: SelectedArea = { x: 0, y: 0, width: 0, height: 0 };
  let startX = 0;
  let startY = 0;

  const updateIndicator = () => {
    selectionIndicator.style.left = `${selectedArea.x}px`;
    selectionIndicator.style.top = `${selectedArea.y}px`;
    selectionIndicator.style.width = `${selectedArea.width}px`;
    selectionIndicator.style.height = `${selectedArea.height}px`;
  };

  dragndrop.onStart((event) => {
    startX = selectedArea.x = event.clientX;
    startY = selectedArea.y = event.clientY;
    selectedArea.width = selectedArea.height = 0;
    updateIndicator();
    selectionIndicator.style.display = "block";
  });

  dragndrop.onDrag((event) => {
    selectedArea.width = Math.abs(event.clientX - startX);
    selectedArea.height = Math.abs(event.clientY - startY);
    selectedArea.x = Math.min(event.clientX, startX);
    selectedArea.y = Math.min(event.clientY, startY);
    updateIndicator();
    listeners.forEach((callback) => callback(selectedArea));
  });

  dragndrop.onStop(() => {
    selectionIndicator.style.display = "none";
  });

  overlayDom.style.display = "block";

  return {
    onAreaSelected: (callback) => listeners.push(callback),
    destroy: () => {
      overlayDom.style.display = "none";
      dragndrop.release();
    },
  };
}

/** Shows the rectangle selection overlay and reports the selected area while the user drags. */
export function startMultiSelect({
  onAreaSelectedCallback,
  overlayCssSelector,
}: {
  onAreaSelectedCallback: (area: SelectedArea) => void;
  overlayCssSelector: string;
}): MultiSelectOverlay {
  const overlayDom = document.querySelector<HTMLElement>(overlayCssSelector);
  if (!overlayDom)
    throw new Error(`Selection overlay "${overlayCssSelector}" not found`);
  const overlay = createOverlay(overlayDom);
  overlay.onAreaSelected(onAreaSelectedCallback);
  return overlay;
}
