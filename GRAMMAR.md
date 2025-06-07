## JSON5 Grammar

Features which exceed the JSON specification are flagged with the minimal feature set required for parsing them, either JSONC or JSON5.

### Overview

```plantuml
@startebnf

value = inert-content, ( primitive | array | object ), inert-content ;

inert-content = { whitespace | comment (* JSONC *) } ;

primitive = "null" | "true" | "false" | number | string ;

array = "[", ( inert-content | ( array-content, [ "," (* JSON5 *) ] ) ), "]";

array-content = value, { ",", value } ;

object = "{", ( inert-content | ( object-content, [ "," (* JSON5 *) ] ) ), "}" ;

object-content = key-value-pair, { ",", key-value-pair } ;

key-value-pair = ( string | identifier (* JSON5 *) ), inert-content, ":", value ;

identifier = identifier-start, { identifier-character };

(* Identifiers are in accord with the ECMAScript 5.1 specification:
    https://262.ecma-international.org/5.1/#sec-7.6

Note: Identifiers can also use \uXXXX-style escapes with codepoints corresponding
to valid identifier characters. For example:

{\u0061: 200} is the same as {a: 200} *)

@endebnf
```

### Basic character classes

```plantuml
@startebnf

whitespace = { "\t" (* tab *) | "\n" (* newline *) | "\f" (* form-feed / JSON5 *) | "\r" (* return *) | " " (* space *) | "\v" (* vertical tab / JSON5 *) | ? Unicode whitespace character ? (* JSON5 *) }- ;

(* Unicode whitespace: https://www.compart.com/en/unicode/category/Zs *)

sign = "+" | "-" ;

decimal-digit = 0-9 ;

non-zero-digit = 1-9;

hex-digit = 0-9A-Fa-f ;

safe-string-character = ? All Unicode matching /[^\x00\x0A\x0D\x22\x27\x5C\u2028\u2029]/ ? ;

(* Note: The above regex matches all characters other than NUL, LF, CR, quote,
single-quote, backslash, LINE SEPARATOR, and PARAGRAPH SEPARATOR. *)

identifier-start = A-Za-z | "_" | "$" | ? Unicode letter ? ;

(* Unicode letter (comprised of five categories):
    https://www.compart.com/en/unicode/category/Ll
    https://www.compart.com/en/unicode/category/Lm
    https://www.compart.com/en/unicode/category/Lo
    https://www.compart.com/en/unicode/category/Lt
    https://www.compart.com/en/unicode/category/Lu
*)

identifier-character = identifier-start | decimal-digit | "\u200C" (* ZERO WIDTH NON-JOINER *) | "\u200D" (* ZERO WIDTH JOINER *) | ? Unicode spacing combining mark ? | ? Unicode non-spacing mark ? | ? Unicode decimal digit number ? | ? Unicode connector punctuation ? ;

(* Unicode spacing combining mark: https://www.compart.com/en/unicode/category/Mc
Unicode non-spacing mark: https://www.compart.com/en/unicode/category/Mc
Unicode decimal digit number: https://www.compart.com/en/unicode/category/Nd
Unicode connector punctuation: https://www.compart.com/en/unicode/category/Pc *)

@endebnf
```

### Numbers

```plantuml
@startebnf

number = [sign], unsigned-number ;

unsigned-number = integer | floating | "NaN" (* JSON5 *) | "Infinity" (* JSON5 *) ;

integer = ( decimal | hex (* JSON5 *) ) ;

decimal = 0 | non-zero-digit, { decimal-digit } ;

hex (* JSON5 *) = "0x", { hex-digit }- ;

floating = ( ( ( decimal, ".", { decimal-digit } | ".", { decimal-digit }- ), [ exponent ] ) | decimal, exponent ) ;

(* Note: leading or trailing decimal point requires JSON5 *)

exponent = ("E" | 'e'), [ sign ], { decimal-digit }- ;

@endebnf
```

### Strings

```plantuml
@startebnf

string = double-quoted-string | single-quoted-string (* JSON5 *) ;

double-quoted-string = '"', { safe-string-character | "'" | escape }, '"';

single-quoted-string (* JSON5 *) = "'", { safe-string-character | '"' | escape }, "'";

escape = "\", ( simple-escape | short-escape (* JSON5 *) | unicode-escape ) ;

simple-escape = '"' | "'" | "`" | "0" | "b" | "f" | "n" | "r" | "t" | "v" | "\" | "\n" | "\r\n" | "\r" ;

(* quote, single-quote, backtick, null, backspace, form feed, newline, return, tab,
vertical tab, backslash, LF, CRLF, CR *)

(* Note: \0 cannot precede a 0-9 digit in a string. Use \x00 or \u0000 instead. *)

short-escape = "x", 2 * hex-digit ;

unicode-escape = "u", 4 * hex-digit ;
@endebnf
```

### Comments

```plantuml
@startebnf

comment (* JSONC *) = block-comment | line-comment ;

block-comment = "/*", ? any characters not containing the sequence "*/" ?, "*/";

line-comment = "//", ? any characters other than \n, \r, \u2028, or \u2029 ?, ( "\n" | "\r\n" | "\r" | ? LINE SEPARATOR ? (* JSON5 *) | ? PARAGRAPH SEPARATOR ? (* JSON5 *) ) ;

@endebnf
```
