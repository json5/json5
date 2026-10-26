export declare function isSpaceSeparator(c?: number): boolean
export declare function isIdStartChar(c?: number): boolean
export declare function isIdContinueChar(c?: number): boolean
export declare function isDigit(c?: number): boolean
export declare function isHexDigit(c?: number): boolean
export declare function setObjectProperty(obj: any, key: string | number | symbol, value: any): void
export declare function getCodePointLength(c?: number): number
export declare class ValueSourceWrapper {
    constructor (source: string, value: any)
}
