import { Field, Types } from "../blocks/field.js";
import { Section } from "../blocks/section.js";

class GeneralSection extends Section {
    NODE_ENV: string
    proxyURI: string

    isDev = () => this.NODE_ENV === "development"
    isProd = () => this.NODE_ENV === "production"
}

const generalSection = new GeneralSection("General", [
    new Field("NODE_ENV", Types.string, "Mode to run the service in. One of 'production' or 'development'", {default: "production"}),
    new Field("proxyURI", Types.string, "URI of the NGINX proxy server", {envName: "PROXY_URI"}),
])

export default generalSection