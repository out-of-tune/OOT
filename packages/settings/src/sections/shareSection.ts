import { Field, Types } from "../blocks/field.js";
import { Section } from "../blocks/section.js";

class ShareSection extends Section {
    port: number
    types: string[]
    directory: string
}

const shareSection = new ShareSection("API", [
    new Field("port", Types.int, "Port that the Share service is listening on", {envName: "SHARE_PORT", default: 4444}),
    new Field("types", Types.array(Types.string), "Supported share types", {envName: "SHARE_TYPES"}),
    new Field("directory", Types.string, "Directory to store shared objects in", {envName: "SHARE_LOC"}),
])

export default shareSection