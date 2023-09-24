import { SchemaDirectiveVisitor } from "@graphql-tools/utils";
class DeprecatedDirective extends SchemaDirectiveVisitor {
    visitFieldDefinition(field) {
        field.isDeprecated = true;
        field.deprecationReason = this.args.reason;
    }
    visitEnumValue(value) {
        value.isDeprecated = true;
        value.deprecationReason = this.args.reason;
    }
}
export default DeprecatedDirective;
