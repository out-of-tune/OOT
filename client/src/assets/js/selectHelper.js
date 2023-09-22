import Viva from "vivagraphjs";

const startMultiSelect = ({ onAreaSelectedCallback, overlayCssSelector }) => {
  var domOverlay = document.querySelector(overlayCssSelector);
  var overlay = createOverlay(domOverlay);
  overlay.onAreaSelected(onAreaSelectedCallback);

  return overlay;
};

function createOverlay(overlayDom) {
  var selectionClassName = "graph-selection-indicator";
  var selectionIndicator = overlayDom.querySelector("." + selectionClassName);
  if (!selectionIndicator) {
    selectionIndicator = document.createElement("div");
    selectionIndicator.className = selectionClassName;
    overlayDom.appendChild(selectionIndicator);
  }
  selectionIndicator.style.display = "none";

  var notify = [];
  var dragndrop = Viva.Graph.Utils.dragndrop(overlayDom);
  var selectedArea = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  };
  var startX = 0;
  var startY = 0;

  dragndrop.onStart(function (e) {
    startX = selectedArea.x = e.clientX;
    startY = selectedArea.y = e.clientY;
    selectedArea.width = selectedArea.height = 0;

    updateSelectedAreaIndicator();
    selectionIndicator.style.display = "block";
  });

  dragndrop.onDrag(function (e) {
    recalculateSelectedArea(e);
    updateSelectedAreaIndicator();
    notifyAreaSelected();
  });

  dragndrop.onStop(function () {
    selectionIndicator.style.display = "none";
  });

  overlayDom.style.display = "block";

  return {
    onAreaSelected: function (cb) {
      notify.push(cb);
    },
    destroy: function () {
      overlayDom.style.display = "none";
      dragndrop.release();
    },
  };

  function notifyAreaSelected() {
    notify.forEach(function (cb) {
      cb(selectedArea);
    });
  }

  function recalculateSelectedArea(e) {
    selectedArea.width = Math.abs(e.clientX - startX);
    selectedArea.height = Math.abs(e.clientY - startY);
    selectedArea.x = Math.min(e.clientX, startX);
    selectedArea.y = Math.min(e.clientY, startY);
  }

  function updateSelectedAreaIndicator() {
    selectionIndicator.style.left = selectedArea.x + "px";
    selectionIndicator.style.top = selectedArea.y + "px";
    selectionIndicator.style.width = selectedArea.width + "px";
    selectionIndicator.style.height = selectedArea.height + "px";
  }
}

export const selectHelper = {
  startMultiSelect,
};
export { startMultiSelect };

export default selectHelper;
