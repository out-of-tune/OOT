import type { RootState } from "@/store/types";

export type TokenDispatch = (type: string, payload?: unknown) => unknown;
export type TokenState = Pick<RootState, "authentication" | "spotify">;

const MAX_RETRIES = 3;

/** The user token when the user is logged in, else the public app token. */
const getToken = (rootState: TokenState) =>
  rootState.authentication.loginState
    ? rootState.authentication.accessToken
    : rootState.spotify.accessToken;

const getNewToken = async (dispatch: TokenDispatch, rootState: TokenState) => {
  await dispatch("requireAccessToken");
  return rootState.spotify.accessToken;
};

/** HTTP status of a failed request, or `undefined` for network errors and other exceptions. */
export const statusOf = (error: unknown): number | undefined =>
  (error as { response?: { status?: number } } | null)?.response?.status;

/** The resolved result of a request function that returns one value or an array of promises. */
export type Settled<R> = R extends readonly (infer P)[]
  ? Awaited<P>[]
  : Awaited<R>;

const settle = <R>(result: R): Promise<Settled<R>> =>
  (Array.isArray(result)
    ? Promise.all(result)
    : Promise.resolve(result)) as Promise<Settled<R>>;

/**
 * Calls a Spotify request function with the current token as the last argument.
 * If Spotify rejects the token (400 or 401), gets a new public token and retries up to three times.
 */
export async function handleTokenError<TArgs extends unknown[], R>(
  fn: (...args: [...TArgs, string]) => R,
  args: TArgs,
  dispatch: TokenDispatch,
  rootState: TokenState,
  tries = 0,
  newToken: string | null = null,
): Promise<Settled<R>> {
  const token = newToken ?? getToken(rootState);
  try {
    return await settle(fn(...args, token));
  } catch (error) {
    const status = statusOf(error);
    if ((status === 400 || status === 401) && tries < MAX_RETRIES) {
      const refreshedToken = await getNewToken(dispatch, rootState);
      return handleTokenError(
        fn,
        args,
        dispatch,
        rootState,
        tries + 1,
        refreshedToken,
      );
    }
    throw error;
  }
}

/**
 * Calls a GraphQL request function. On a server error (500) it tells the user and retries up to three times.
 */
export async function handleGraphqlTokenError<TArgs extends unknown[], R>(
  fn: (...args: TArgs) => R,
  args: TArgs,
  dispatch: TokenDispatch,
  rootState: unknown,
  tries = 0,
): Promise<Settled<R>> {
  try {
    return await settle(fn(...args));
  } catch (error) {
    if (statusOf(error) !== 500) throw error;
    if (tries < MAX_RETRIES) {
      dispatch(
        "setError",
        new Error(
          `I feel a disturbance in the connection. Trying again ${tries + 1}...`,
        ),
      );
      return handleGraphqlTokenError(fn, args, dispatch, rootState, tries + 1);
    }
    dispatch(
      "setError",
      new Error("I have a bad feeling about this... No connection"),
    );
    throw error;
  }
}
