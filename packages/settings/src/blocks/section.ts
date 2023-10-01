import { Field } from "./field.js"

export class Section {
    private _name: string
    private _fields: Field<any>[] = []
    private _loaded: boolean

    private _format = (msg: string) => `Config section ${this._name} ${msg}`

    constructor(name: string, fields: Field<any>[]) {
        this._name = name
        this._fields = fields
        this._loaded = false
    }

    load = () => {
        if (this._loaded) return []
        else this._loaded = true

        let errors: string[] = []
        for (const field of this._fields) {
            try {
                const value = field.load()
                const valueString = field.isSensitive ? "" : `: ${value}`
                console.log(this._format(`loaded ${field.name}${valueString}`))
                this[field.name] = value
            } catch (error) {
                errors.push(this._format(error.message))
            }
        }
        return errors
    }
}