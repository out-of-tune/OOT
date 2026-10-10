import KeyvMemcache from "@keyv/memcache";
import { KeyvAdapter } from "@apollo/utils.keyvadapter";
import Keyv from "keyv";
import { MEMCACHED_HOST } from "../helpers/settings.js";

// The adapter is typed against the CommonJS build of keyv. At runtime both builds are the same class.
type AdapterKeyv = ConstructorParameters<typeof KeyvAdapter<string>>[0];

/** Shared cache of Apollo Server, stored in memcached. */
const memcache = new KeyvAdapter<string>(new Keyv({ store: new KeyvMemcache(MEMCACHED_HOST) }) as unknown as AdapterKeyv);

export default memcache;
