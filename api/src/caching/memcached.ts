import Keyv from "keyv"
import KeyvMemcache from "@keyv/memcache";
import { KeyvAdapter } from "@apollo/utils.keyvadapter"
import { MEMCACHED_HOST } from "../helpers/settings.js";

const servers = [
    MEMCACHED_HOST,
].join(",");
  
const memcache = new KeyvMemcache(servers)

export default new KeyvAdapter(new Keyv({ store: memcache }))
  