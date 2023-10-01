import { Field, Types } from "../blocks/field.js";
import { Section } from "../blocks/section.js";

class ArangoSection extends Section {
    host: string
    port: number
    user: string
    password: string
    database: string
}

const arangoSection = new ArangoSection("ArangoDB", [
    new Field("host", Types.string, "Hostname/IP address of the ArangoDB server", {envName: "ARANGODB_HOST", default: "arangodb"}),
    new Field("port", Types.int, "Port of the ArangoDB server to connect to", {envName: "ARANGODB_PORT", default: 8529}),
    new Field("user", Types.string, "Username to connect to ArangoDB with", {envName: "ARANGODB_USER"}),
    new Field("password", Types.string, "Password of the specified user", {envName: "ARANGODB_PASSWORD", sensitive: true}),
    new Field("database", Types.string, "Name of the database that contains the out-of-tune data", {envName: "ARANGODB_DATABASE", default: "OOT"})
])

export default arangoSection