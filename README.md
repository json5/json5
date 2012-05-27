# JSON5 – Modern JSON

JSON is strict. Keys need to be quoted; strings can only be double-quoted;
objects and arrays can't have trailing commas; and comments aren't allowed.

Using such a strict subset of "JavaScript object notation" was likely for the
best at the time, but with modern ECMAScript 5 engines like V8 in Chrome and
Node, these limitations are cumbersome.

JSON5 aims to do for JSON what ES5 and HTML5 did for JavaScript and HTML.
It also aims to continue being a subset of regular JavaScript — ES5 flavor.

## Features

This project is a WIP, so these aren't necessarily all implemented yet, but
these are the goals:

- Object keys don't need to be quoted if they contain no special characters.
  Yes, even reserved keywords are valid unquoted keys in ES5.

- Strings can be single-quoted.

- Strings can be multi-line; just prefix the newline with a backslash.

- Objects and arrays can have trailing commas.

- Both inline (single-line) and block (multi-line) comments are allowed.

- *[TODO]* Octal and hexadecimal numbers are allowed. *[Is this a bad idea?]*

## Example

```js
{
    foo: 'bar',
    while: true,
    
    this: 'is a\
 multi-line string',
 
    // this is an inline comment
    here: 'is another', // inline comment
    
    /* this is a block comment
       it continues on another line */
       
    finally: 'a trailing comma',
    oh: [
        'we shouldn\'t forget',
        'arrays can have',
        'trailing commas too',
    ],
}
```

## License

MIT License. © 2012 Aseem Kishore.

## Credits

[Michael Bolin](http://bolinfest.com/) independently arrived at and published
some of these same ideas with awesome explanations and detail.
Recommended reading:
[Suggested Improvements to JSON](http://bolinfest.com/essays/json.html)

[Douglas Crockford](http://www.crockford.com/) of course designed and built
JSON, but his state machine diagrams on the [JSON website](http://json.org/),
as cheesy as it may sound, gave me motivation and confidence that building a
new parser to implement these ideas this was within my reach!
This code is also modeled directly off of Doug's open-source [json_parse.js](
https://github.com/douglascrockford/JSON-js/blob/master/json_parse.js) parser.
I'm super grateful for that clean and well-documented code.
