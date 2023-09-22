const getNodeLabelNames = (state) => {
  return state.schema.nodeTypes.map((value) => value.label);
};
const getEdgeNamesForNodeLabel = (state) => {
  return (labelName) => {
    return state.schema.edgeTypes
      .filter(
        (value) =>
          value.inbound.from === labelName || value.outbound.from === labelName,
      )
      .map((value) => value.label);
  };
};

export const getters = {
  getNodeLabelNames,
  getEdgeNamesForNodeLabel,
};
export default getters;
