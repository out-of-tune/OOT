type TypeFunction<T> = (raw: string) => T
type FieldOptions<T> = {
    default?: T
    sensitive?: boolean
    envName?: string
}

export class Types {
    static string: TypeFunction<string> = (raw) => raw
    static number: TypeFunction<number> = (raw) => {
        const num = Number(raw)
        if (Number.isNaN(num))
            throw new Error(`'${raw}' is not a valid number`)
        return num
    }
    static int: TypeFunction<number> = (raw) => Math.floor(Types.number(raw))
    static array = <T>(underlying: TypeFunction<T>) => (raw: string): T[] => raw.split(' ').map(underlying)
}

export class Field<T> {
    name: string
    description: string
    default?: T
    envName: string
    isMandatory: boolean
    isSensitive: boolean
    _converter: TypeFunction<T>

    constructor(name: string, type: TypeFunction<T>, description: string, options?: FieldOptions<T>) {
        this.name = name
        this.description = description
        this._converter = type

        const fieldOptions = {
            sensitive: false,
            envName: name,
            ...options
        }
        this.default = fieldOptions.default
        this.isSensitive = fieldOptions.sensitive
        this.envName = fieldOptions.envName
    }

    private _convert = (raw: string) => {
        try {
            if (raw.length === 0) throw Error(`${this.name} is empty`)
            return this._converter(raw)
        } catch (error) {
            throw new Error(`Couldn't convert value for field ${this.name}: ${error.message}`)
        }
    }

    private _register = (value?: string) => {
        if (typeof(value) === "string") return this._convert(value)
        else if (this.default !== undefined) return this.default
        else throw new Error(`Couldn't register value for field ${this.name}: No value supplied and no default`)
    }

    load = () => this._register(process.env[this.envName])
}
