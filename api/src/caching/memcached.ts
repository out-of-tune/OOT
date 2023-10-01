import Keyv from "keyv"
import KeyvMemcache from "@keyv/memcache";
import { KeyvAdapter } from "@apollo/utils.keyvadapter"
import { Config } from "@out-of-tune/settings";

const servers = [
    Config.apollo.memcachedHost,
].join(",");
  
const memcache = new KeyvMemcache(servers)

export default new KeyvAdapter(new Keyv({ store: memcache }))
  