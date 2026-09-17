/**
 * Parses a JSON5 string, constructing the JavaScript value or object described
 * by the string.
 * @template T The type of the return value.
 * @param text The string to parse as JSON5.
 * @param reviver A function that prescribes how the value originally produced by
 * parsing is transformed before being returned.
 */
export function parse<T = any>(
    text: string,
    reviver?: ((this: any, key: string, value: any) => any) | null,
): T

export type StringifyOptions = {
    replacer?:
        | ((this: any, key: string, value: any) => any)
        | (string | number)[]
        | null
    space?: string | number | null
    quote?: string | null
}

/**
 * Converts a JavaScript value to a JSON5 string.
 * @param value The value to convert to a JSON5 string.
 * @param replacer A function that alters the behavior of the stringification
 * process, or an array of allowlisted property names.
 * @param space The number of spaces (capped at 10) or the string used to indent.
 */
export function stringify(
    value: any,
    replacer?:
        | ((this: any, key: string, value: any) => any)
        | (string | number)[]
        | null,
    space?: string | number | null,
): string
/**
 * Converts a JavaScript value to a JSON5 string.
 * @param value The value to convert to a JSON5 string.
 * @param options An object with replacer, space, and quote options.
 */
export function stringify(value: any, options?: StringifyOptions): string

declare const JSON5: {
    parse: typeof parse
    stringify: typeof stringify
}

export default JSON5
