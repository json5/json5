declare module 'json5' {
  type StringifyOptions = Partial<{
    /**
     * A function that alters the behavior of the stringification process, or an array of String and Number objects that serve as a whitelist for selecting/filtering the properties of the value object to be included in the JSON5 string. If this value is null or not provided, all properties of the object are included in the resulting JSON5 string.
     */
    replacer: (this: any, key: string, value: any) => any;

    /**
     * A String or Number object that's used to insert white space into the output JSON5 string for readability purposes. If this is a Number, it indicates the number of space characters to use as white space; this number is capped at 10 (if it is greater, the value is just 10). Values less than 1 indicate that no space should be used. If this is a String, the string (or the first 10 characters of the string, if it's longer than that) is used as white space. If this parameter is not provided (or is null), no white space is used. If white space is used, trailing commas will be used in objects and arrays.
     */
    space: string | number;

    /**
     * A String representing the quote character to use when serializing strings.
     */
    quote: string;
  }>

  /**
   * Parses a JSON5 string, constructing the JavaScript value or object described
   * by the string. An optional reviver function can be provided to perform a
   * transformation on the resulting object before it is returned.
   * @param text The string to parse as JSON5.
   * @param reviver If a function, this prescribes how the value originally produced by parsing is transformed, before being returned.
   */
  export function parse(text: string, reviver?: (this: any, key: string, value: any) => any): any;

  /**
   * Converts a JavaScript value to a JSON5 string, optionally replacing values if a
   * replacer function is specified, or optionally including only the specified
   * properties if a replacer array is specified.
   * @param value The value to convert to a JSON5 string.
   * @param replacer A function that alters the behavior of the stringification process, or an array of String and Number objects that serve as a whitelist for selecting/filtering the properties of the value object to be included in the JSON5 string. If this value is null or not provided, all properties of the object are included in the resulting JSON5 string.
   * @param space A String or Number object that's used to insert white space into the output JSON5 string for readability purposes. If this is a Number, it indicates the number of space characters to use as white space; this number is capped at 10 (if it is greater, the value is just 10). Values less than 1 indicate that no space should be used. If this is a String, the string (or the first 10 characters of the string, if it's longer than that) is used as white space. If this parameter is not provided (or is null), no white space is used. If white space is used, trailing commas will be used in objects and arrays.
   */
  export function stringify(value: any, replacer?: (this: any, key: string, value: any) => any, space?: string | number): string;

  /**
   * Converts a JavaScript value to a JSON5 string, optionally replacing values if a
   * replacer function is specified, or optionally including only the specified
   * properties if a replacer array is specified.
   * @param value The value to convert to a JSON5 string.
   * @param options An object with the following properties:
   * 
   * `replacer`: Same as the `replacer` parameter.
   * 
   * `space`: Same as the `space` parameter.
   * 
   * `quote`: A String representing the quote character to use when serializing strings.
   */
  export function stringify(value: any, options?: StringifyOptions): string;
}
