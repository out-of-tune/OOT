const SET_CONFIGURATION_URL = (state, url) => {
  state.url = url;
};

const SET_STORED_CONFIGURATION_NAMES = (state, storedConfigurationNames) => {
  state.storedConfigurationNames = storedConfigurationNames;
};

export const mutations = {
  SET_CONFIGURATION_URL,
  SET_STORED_CONFIGURATION_NAMES,
};
export default mutations;
