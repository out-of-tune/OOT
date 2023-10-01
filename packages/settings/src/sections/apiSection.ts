import { Field, Types } from "../blocks/field.js";
import { Section } from "../blocks/section.js";

class APISection extends Section {
    port: number
    memcachedHost: string
}

const apiSection = new APISection("API", [
    new Field("memcachedHost", Types.string, "Hostname/IP address of the memcached server", {envName: "MEMCACHED_HOST", default: "memcached"}),
    new Field("port", Types.int, "Port that the API server is listening on", {envName: "APOLLO_PORT", default: 3003}),
])

export default apiSection