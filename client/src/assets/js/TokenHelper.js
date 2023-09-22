const getToken = (rootState) =>
  rootState.authentication.loginState
    ? rootState.authentication.accessToken
    : rootState.spotify.accessToken;

const getNewToken = async (dispatch, rootState) => {
  await dispatch("requireAccessToken");
  return rootState.spotify.accessToken;
};

export async function handleTokenError(
  fn,
  args,
  dispatch,
  rootState,
  tries = 0,
  newToken = null,
) {
  const token = newToken ? newToken : getToken(rootState);
  const promises = fn(...args, token);
  const p =
    promises instanceof Array
      ? Promise.all(promises)
      : Promise.resolve(promises);
  const data = await p.catch(async (error) => {
    if (error.response.status === 400 || error.response.status === 401) {
      const newToken = await getNewToken(dispatch, rootState);
      if (tries < 3)
        return handleTokenError(
          fn,
          args,
          dispatch,
          rootState,
          tries + 1,
          newToken,
        );
      else throw error;
    } else throw error;
  });
  return data;
}

async function getNewGraphqlToken(dispatch, rootState) {
  await dispatch("authenticateClient");
  return rootState.authentication.clientAuthenticationToken;
}

export async function handleGraphqlTokenError(
  fn,
  args,
  dispatch,
  rootState,
  tries = 0,
  newToken = null,
) {
  const token = newToken
    ? newToken
    : rootState.authentication.clientAuthenticationToken;
  const promises = fn(...args, token);
  const p =
    promises instanceof Array
      ? Promise.all(promises)
      : Promise.resolve(promises);
  const data = await p.catch(async (error) => {
    if (error.response.status == 500) {
      const newToken = await getNewGraphqlToken(dispatch, rootState);
      if (tries < 3) {
        dispatch(
          "setError",
          new Error(
            "I feel a disturbance in the connection. Trying again " +
              (tries + 1) +
              "...",
          ),
        );

        return handleGraphqlTokenError(
          fn,
          args,
          dispatch,
          rootState,
          tries + 1,
          newToken,
        );
      } else {
        dispatch(
          "setError",
          new Error("I have a bad feeling about this... No connection"),
        );
        throw error;
      }
    } else throw error;
  });
  return data;
}
