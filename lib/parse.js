import * as util from "./util.js";

const TOKEN_EOF = 0;
const TOKEN_PUNCTUATOR = 1;
const TOKEN_NULL = 2;
const TOKEN_BOOLEAN = 3;
const TOKEN_NUMERIC = 4;
const TOKEN_STRING = 5;
const TOKEN_IDENTIFIER = 6;

let source;
let parseState;
let stack;
let pos;
let line;
let column;
let tokenType;
let tokenValue;
let key;
let root;

export function parse(text, reviver) {
  source = String(text);
  parseState = "start";
  stack = [];
  pos = 0;
  line = 1;
  column = 0;
  tokenType = undefined;
  tokenValue = undefined;
  key = undefined;
  root = undefined;

  do {
    lex();

    // This code is unreachable.
    // if (!parseStates[parseState]) {
    //     throw invalidParseState()
    // }

    processParseState(parseState);
  } while (tokenType !== TOKEN_EOF);

  if (typeof reviver === "function") {
    return internalize({ "": root }, "", reviver);
  }

  return root;
}

function internalize(holder, name, reviver) {
  const value = holder[name];
  if (value != null && typeof value === "object") {
    if (Array.isArray(value)) {
      for (let i = 0; i < value.length; i++) {
        const key = String(i);
        const replacement = internalize(value, key, reviver);
        if (replacement === undefined) {
          delete value[key];
        } else {
          Object.defineProperty(value, key, {
            value: replacement,
            writable: true,
            enumerable: true,
            configurable: true,
          });
        }
      }
    } else {
      for (const key in value) {
        const replacement = internalize(value, key, reviver);
        if (replacement === undefined) {
          delete value[key];
        } else {
          Object.defineProperty(value, key, {
            value: replacement,
            writable: true,
            enumerable: true,
            configurable: true,
          });
        }
      }
    }
  }

  return reviver.call(holder, name, value);
}

let lexState;
let buffer;
let doubleQuote;
let sign;
let c;
let cp;

function lex() {
  lexState = "default";
  buffer = "";
  doubleQuote = false;
  sign = 1;

  for (;;) {
    cp = source.codePointAt(pos);
    c = charAt(pos, cp);

    // This code is unreachable.
    // if (!lexStates[lexState]) {
    //     throw invalidLexState(lexState)
    // }

    if (processLexState(lexState)) {
      return;
    }
  }
}

function charAt(pos, cp) {
  if (cp === undefined) {
    return undefined;
  }

  return cp > 0xffff ? String.fromCodePoint(cp) : source[pos];
}

function peekCodePoint() {
  return source.codePointAt(pos);
}

function read() {
  const cp = source.codePointAt(pos);

  if (cp === undefined) {
    column++;
    return undefined;
  }

  const c = charAt(pos, cp);

  if (cp === 0x0a) {
    line++;
    column = 0;
  } else {
    column += c.length;
  }

  pos += c.length;

  return c;
}

function processLexState(state) {
  switch (state) {
    case "default": {
      switch (cp) {
        case 0x09: // \t
        case 0x0b: // \v
        case 0x0c: // \f
        case 0x20: // space
        case 0xa0:
        case 0xfeff:
        case 0x0a: // \n
        case 0x0d: // \r
        case 0x2028:
        case 0x2029:
          read();
          return;

        case 0x2f: // /
          read();
          lexState = "comment";
          return;

        case undefined:
          read();
          return newToken(TOKEN_EOF);
      }

      if (util.isSpaceSeparator(c)) {
        read();
        return;
      }

      // This code is unreachable.
      // if (!lexStates[parseState]) {
      //     throw invalidLexState(parseState)
      // }

      return processLexState(parseState);
    }

    case "comment": {
      switch (cp) {
        case 0x2a: // *
          read();
          lexState = "multiLineComment";
          return;

        case 0x2f: // /
          read();
          lexState = "singleLineComment";
          return;
      }

      throw invalidChar(read());
    }

    case "multiLineComment": {
      switch (cp) {
        case 0x2a: // *
          read();
          lexState = "multiLineCommentAsterisk";
          return;

        case undefined:
          throw invalidChar(read());
      }

      read();
      return;
    }

    case "multiLineCommentAsterisk": {
      switch (cp) {
        case 0x2a: // *
          read();
          return;

        case 0x2f: // /
          read();
          lexState = "default";
          return;

        case undefined:
          throw invalidChar(read());
      }

      read();
      lexState = "multiLineComment";
      return;
    }

    case "singleLineComment": {
      switch (cp) {
        case 0x0a: // \n
        case 0x0d: // \r
        case 0x2028:
        case 0x2029:
          read();
          lexState = "default";
          return;

        case undefined:
          read();
          return newToken(TOKEN_EOF);
      }

      read();
      return;
    }

    case "value": {
      switch (cp) {
        case 0x7b: // {
        case 0x5b: // [
          return newToken(TOKEN_PUNCTUATOR, read());

        case 0x6e: // n
          read();
          literal("ull");
          return newToken(TOKEN_NULL, null);

        case 0x74: // t
          read();
          literal("rue");
          return newToken(TOKEN_BOOLEAN, true);

        case 0x66: // f
          read();
          literal("alse");
          return newToken(TOKEN_BOOLEAN, false);

        case 0x2d: // -
        case 0x2b: // +
          if (cp === 0x2d) {
            sign = -1;
          }

          read();
          lexState = "sign";
          return;

        case 0x2e: // .
          buffer = read();
          lexState = "decimalPointLeading";
          return;

        case 0x30: // 0
          buffer = read();
          lexState = "zero";
          return;

        case 0x31: // 1
        case 0x32: // 2
        case 0x33: // 3
        case 0x34: // 4
        case 0x35: // 5
        case 0x36: // 6
        case 0x37: // 7
        case 0x38: // 8
        case 0x39: // 9
          buffer = read();
          lexState = "decimalInteger";
          return;

        case 0x49: // I
          read();
          literal("nfinity");
          return newToken(TOKEN_NUMERIC, Infinity);

        case 0x4e: // N
          read();
          literal("aN");
          return newToken(TOKEN_NUMERIC, NaN);

        case 0x22: // "
        case 0x27: // '
          doubleQuote = cp === 0x22;
          read();
          buffer = "";
          lexState = "string";
          return;
      }

      throw invalidChar(read());
    }

    case "identifierNameStartEscape": {
      if (cp !== 0x75) {
        // u
        throw invalidChar(read());
      }

      read();
      const u = unicodeEscape();
      switch (u) {
        case "$":
        case "_":
          break;

        default:
          if (!util.isIdStartChar(u, u.codePointAt(0))) {
            throw invalidIdentifier();
          }

          break;
      }

      buffer += u;
      lexState = "identifierName";
      return;
    }

    case "identifierName": {
      switch (cp) {
        case 0x24: // $
        case 0x5f: // _
        case 0x200c:
        case 0x200d:
          buffer += read();
          return;

        case 0x5c: // \
          read();
          lexState = "identifierNameEscape";
          return;
      }

      if (util.isIdContinueChar(c, cp)) {
        buffer += read();
        return;
      }

      return newToken(TOKEN_IDENTIFIER, buffer);
    }

    case "identifierNameEscape": {
      if (cp !== 0x75) {
        // u
        throw invalidChar(read());
      }

      read();
      const u = unicodeEscape();
      switch (u) {
        case "$":
        case "_":
        case "‌":
        case "‍":
          break;

        default:
          if (!util.isIdContinueChar(u, u.codePointAt(0))) {
            throw invalidIdentifier();
          }

          break;
      }

      buffer += u;
      lexState = "identifierName";
      return;
    }

    case "sign": {
      switch (cp) {
        case 0x2e: // .
          buffer = read();
          lexState = "decimalPointLeading";
          return;

        case 0x30: // 0
          buffer = read();
          lexState = "zero";
          return;

        case 0x31: // 1
        case 0x32: // 2
        case 0x33: // 3
        case 0x34: // 4
        case 0x35: // 5
        case 0x36: // 6
        case 0x37: // 7
        case 0x38: // 8
        case 0x39: // 9
          buffer = read();
          lexState = "decimalInteger";
          return;

        case 0x49: // I
          read();
          literal("nfinity");
          return newToken(TOKEN_NUMERIC, sign * Infinity);

        case 0x4e: // N
          read();
          literal("aN");
          return newToken(TOKEN_NUMERIC, NaN);
      }

      throw invalidChar(read());
    }

    case "zero": {
      switch (cp) {
        case 0x2e: // .
          buffer += read();
          lexState = "decimalPoint";
          return;

        case 0x65: // e
        case 0x45: // E
          buffer += read();
          lexState = "decimalExponent";
          return;

        case 0x78: // x
        case 0x58: // X
          buffer += read();
          lexState = "hexadecimal";
          return;
      }

      return newToken(TOKEN_NUMERIC, sign * 0);
    }

    case "decimalInteger": {
      switch (cp) {
        case 0x2e: // .
          buffer += read();
          lexState = "decimalPoint";
          return;

        case 0x65: // e
        case 0x45: // E
          buffer += read();
          lexState = "decimalExponent";
          return;
      }

      if (util.isDigit(cp)) {
        buffer += read();
        return;
      }

      return newToken(TOKEN_NUMERIC, sign * Number(buffer));
    }

    case "decimalPointLeading": {
      if (util.isDigit(cp)) {
        buffer += read();
        lexState = "decimalFraction";
        return;
      }

      throw invalidChar(read());
    }

    case "decimalPoint": {
      switch (cp) {
        case 0x65: // e
        case 0x45: // E
          buffer += read();
          lexState = "decimalExponent";
          return;
      }

      if (util.isDigit(cp)) {
        buffer += read();
        lexState = "decimalFraction";
        return;
      }

      return newToken(TOKEN_NUMERIC, sign * Number(buffer));
    }

    case "decimalFraction": {
      switch (cp) {
        case 0x65: // e
        case 0x45: // E
          buffer += read();
          lexState = "decimalExponent";
          return;
      }

      if (util.isDigit(cp)) {
        buffer += read();
        return;
      }

      return newToken(TOKEN_NUMERIC, sign * Number(buffer));
    }

    case "decimalExponent": {
      switch (cp) {
        case 0x2b: // +
        case 0x2d: // -
          buffer += read();
          lexState = "decimalExponentSign";
          return;
      }

      if (util.isDigit(cp)) {
        buffer += read();
        lexState = "decimalExponentInteger";
        return;
      }

      throw invalidChar(read());
    }

    case "decimalExponentSign": {
      if (util.isDigit(cp)) {
        buffer += read();
        lexState = "decimalExponentInteger";
        return;
      }

      throw invalidChar(read());
    }

    case "decimalExponentInteger": {
      if (util.isDigit(cp)) {
        buffer += read();
        return;
      }

      return newToken(TOKEN_NUMERIC, sign * Number(buffer));
    }

    case "hexadecimal": {
      if (util.isHexDigit(cp)) {
        buffer += read();
        lexState = "hexadecimalInteger";
        return;
      }

      throw invalidChar(read());
    }

    case "hexadecimalInteger": {
      if (util.isHexDigit(cp)) {
        buffer += read();
        return;
      }

      return newToken(TOKEN_NUMERIC, sign * Number(buffer));
    }

    case "string": {
      switch (cp) {
        case 0x5c: // \
          read();
          buffer += escape();
          return;

        case 0x22: // "
          if (doubleQuote) {
            read();
            return newToken(TOKEN_STRING, buffer);
          }

          buffer += read();
          return;

        case 0x27: // '
          if (!doubleQuote) {
            read();
            return newToken(TOKEN_STRING, buffer);
          }

          buffer += read();
          return;

        case 0x0a: // \n
        case 0x0d: // \r
          throw invalidChar(read());

        case undefined:
          throw invalidChar(read());
      }

      buffer += read();
      return;
    }

    case "start": {
      switch (cp) {
        case 0x7b: // {
        case 0x5b: // [
          return newToken(TOKEN_PUNCTUATOR, read());

        // This code is unreachable since the default lexState handles eof.
        // case undefined:
        //     return newToken(TOKEN_EOF)
      }

      lexState = "value";
      return;
    }

    case "beforePropertyName": {
      switch (cp) {
        case 0x24: // $
        case 0x5f: // _
          buffer = read();
          lexState = "identifierName";
          return;

        case 0x5c: // \
          read();
          lexState = "identifierNameStartEscape";
          return;

        case 0x7d: // }
          return newToken(TOKEN_PUNCTUATOR, read());

        case 0x22: // "
        case 0x27: // '
          doubleQuote = cp === 0x22;
          read();
          lexState = "string";
          return;
      }

      if (util.isIdStartChar(c, cp)) {
        buffer += read();
        lexState = "identifierName";
        return;
      }

      throw invalidChar(read());
    }

    case "afterPropertyName": {
      if (cp === 0x3a) {
        // :
        return newToken(TOKEN_PUNCTUATOR, read());
      }

      throw invalidChar(read());
    }

    case "beforePropertyValue": {
      lexState = "value";
      return;
    }

    case "afterPropertyValue": {
      switch (cp) {
        case 0x2c: // ,
        case 0x7d: // }
          return newToken(TOKEN_PUNCTUATOR, read());
      }

      throw invalidChar(read());
    }

    case "beforeArrayValue": {
      if (cp === 0x5d) {
        // ]
        return newToken(TOKEN_PUNCTUATOR, read());
      }

      lexState = "value";
      return;
    }

    case "afterArrayValue": {
      switch (cp) {
        case 0x2c: // ,
        case 0x5d: // ]
          return newToken(TOKEN_PUNCTUATOR, read());
      }

      throw invalidChar(read());
    }

    case "end": {
      // This code is unreachable since it's handled by the default lexState.
      // if (cp === undefined) {
      //     read()
      //     return newToken(TOKEN_EOF)
      // }

      throw invalidChar(read());
    }
  }
}

function newToken(type, value) {
  tokenType = type;
  tokenValue = value;
  return true;
}

function literal(s) {
  for (let i = 0; i < s.length; i++) {
    if (peekCodePoint() !== s.charCodeAt(i)) {
      throw invalidChar(read());
    }

    read();
  }
}

function escape() {
  switch (peekCodePoint()) {
    case 0x62: // b
      read();
      return "\b";

    case 0x66: // f
      read();
      return "\f";

    case 0x6e: // n
      read();
      return "\n";

    case 0x72: // r
      read();
      return "\r";

    case 0x74: // t
      read();
      return "\t";

    case 0x76: // v
      read();
      return "\v";

    case 0x30: // 0
      read();
      if (util.isDigit(peekCodePoint())) {
        throw invalidChar(read());
      }

      return "\0";

    case 0x78: // x
      read();
      return hexEscape();

    case 0x75: // u
      read();
      return unicodeEscape();

    case 0x0a: // \n
    case 0x2028:
    case 0x2029:
      read();
      return "";

    case 0x0d: // \r
      read();
      if (peekCodePoint() === 0x0a) {
        read();
      }

      return "";

    case 0x31: // 1
    case 0x32: // 2
    case 0x33: // 3
    case 0x34: // 4
    case 0x35: // 5
    case 0x36: // 6
    case 0x37: // 7
    case 0x38: // 8
    case 0x39: // 9
      throw invalidChar(read());

    case undefined:
      throw invalidChar(read());
  }

  return read();
}

function hexEscape() {
  let buffer = "";

  if (!util.isHexDigit(peekCodePoint())) {
    throw invalidChar(read());
  }

  buffer += read();

  if (!util.isHexDigit(peekCodePoint())) {
    throw invalidChar(read());
  }

  buffer += read();

  return String.fromCodePoint(parseInt(buffer, 16));
}

function unicodeEscape() {
  let buffer = "";
  let count = 4;

  while (count-- > 0) {
    if (!util.isHexDigit(peekCodePoint())) {
      throw invalidChar(read());
    }

    buffer += read();
  }

  return String.fromCodePoint(parseInt(buffer, 16));
}

function processParseState(state) {
  switch (state) {
    case "start": {
      if (tokenType === TOKEN_EOF) {
        throw invalidEOF();
      }

      push();
      return;
    }

    case "beforePropertyName": {
      switch (tokenType) {
        case TOKEN_IDENTIFIER:
        case TOKEN_STRING:
          key = tokenValue;
          parseState = "afterPropertyName";
          return;

        case TOKEN_PUNCTUATOR:
          // This code is unreachable since it's handled by the lexState.
          // if (tokenValue !== '}') {
          //     throw invalidToken()
          // }

          pop();
          return;

        case TOKEN_EOF:
          throw invalidEOF();
      }

      return;

      // This code is unreachable since it's handled by the lexState.
      // throw invalidToken()
    }

    case "afterPropertyName": {
      // This code is unreachable since it's handled by the lexState.
      // if (tokenType !== TOKEN_PUNCTUATOR || tokenValue !== ':') {
      //     throw invalidToken()
      // }

      if (tokenType === TOKEN_EOF) {
        throw invalidEOF();
      }

      parseState = "beforePropertyValue";
      return;
    }

    case "beforePropertyValue": {
      if (tokenType === TOKEN_EOF) {
        throw invalidEOF();
      }

      push();
      return;
    }

    case "beforeArrayValue": {
      if (tokenType === TOKEN_EOF) {
        throw invalidEOF();
      }

      if (tokenType === TOKEN_PUNCTUATOR && tokenValue === "]") {
        pop();
        return;
      }

      push();
      return;
    }

    case "afterPropertyValue": {
      // This code is unreachable since it's handled by the lexState.
      // if (tokenType !== TOKEN_PUNCTUATOR) {
      //     throw invalidToken()
      // }

      if (tokenType === TOKEN_EOF) {
        throw invalidEOF();
      }

      switch (tokenValue) {
        case ",":
          parseState = "beforePropertyName";
          return;

        case "}":
          pop();
      }

      return;

      // This code is unreachable since it's handled by the lexState.
      // throw invalidToken()
    }

    case "afterArrayValue": {
      // This code is unreachable since it's handled by the lexState.
      // if (tokenType !== TOKEN_PUNCTUATOR) {
      //     throw invalidToken()
      // }

      if (tokenType === TOKEN_EOF) {
        throw invalidEOF();
      }

      switch (tokenValue) {
        case ",":
          parseState = "beforeArrayValue";
          return;

        case "]":
          pop();
      }

      return;

      // This code is unreachable since it's handled by the lexState.
      // throw invalidToken()
    }

    case "end": {
      // This code is unreachable since it's handled by the lexState.
      // if (tokenType !== TOKEN_EOF) {
      //     throw invalidToken()
      // }

      return;
    }
  }
}

function push() {
  let value;

  switch (tokenType) {
    case TOKEN_PUNCTUATOR:
      switch (tokenValue) {
        case "{":
          value = {};
          break;

        case "[":
          value = [];
          break;
      }

      break;

    case TOKEN_NULL:
    case TOKEN_BOOLEAN:
    case TOKEN_NUMERIC:
    case TOKEN_STRING:
      value = tokenValue;
      break;

    // This code is unreachable.
    // default:
    //     throw invalidToken()
  }

  if (root === undefined) {
    root = value;
  } else {
    const parent = stack[stack.length - 1];
    if (Array.isArray(parent)) {
      parent.push(value);
    } else {
      Object.defineProperty(parent, key, {
        value,
        writable: true,
        enumerable: true,
        configurable: true,
      });
    }
  }

  if (value !== null && typeof value === "object") {
    stack.push(value);

    if (Array.isArray(value)) {
      parseState = "beforeArrayValue";
    } else {
      parseState = "beforePropertyName";
    }
  } else {
    const current = stack[stack.length - 1];
    if (current == null) {
      parseState = "end";
    } else if (Array.isArray(current)) {
      parseState = "afterArrayValue";
    } else {
      parseState = "afterPropertyValue";
    }
  }
}

function pop() {
  stack.pop();

  const current = stack[stack.length - 1];
  if (current == null) {
    parseState = "end";
  } else if (Array.isArray(current)) {
    parseState = "afterArrayValue";
  } else {
    parseState = "afterPropertyValue";
  }
}

// This code is unreachable.
// function invalidParseState () {
//     return new Error(`JSON5: invalid parse state '${parseState}'`)
// }

// This code is unreachable.
// function invalidLexState (state) {
//     return new Error(`JSON5: invalid lex state '${state}'`)
// }

function invalidChar(c) {
  if (c === undefined) {
    return syntaxError(`JSON5: invalid end of input at ${line}:${column}`);
  }

  return syntaxError(
    `JSON5: invalid character '${formatChar(c)}' at ${line}:${column}`,
  );
}

function invalidEOF() {
  return syntaxError(`JSON5: invalid end of input at ${line}:${column}`);
}

// This code is unreachable.
// function invalidToken () {
//     if (tokenType === TOKEN_EOF) {
//         return syntaxError(`JSON5: invalid end of input at ${line}:${column}`)
//     }

//     const c = String.fromCodePoint(tokenValue.codePointAt(0))
//     return syntaxError(`JSON5: invalid character '${formatChar(c)}' at ${line}:${column}`)
// }

function invalidIdentifier() {
  column -= 5;
  return syntaxError(
    `JSON5: invalid identifier character at ${line}:${column}`,
  );
}

function formatChar(c) {
  const replacements = {
    "'": "\\'",
    '"': '\\"',
    "\\": "\\\\",
    "\b": "\\b",
    "\f": "\\f",
    "\n": "\\n",
    "\r": "\\r",
    "\t": "\\t",
    "\v": "\\v",
    "\0": "\\0",
    "\u2028": "\\u2028",
    "\u2029": "\\u2029",
  };

  if (replacements[c]) {
    return replacements[c];
  }

  if (c < " ") {
    const hexString = c.charCodeAt(0).toString(16);
    return "\\x" + ("00" + hexString).substring(hexString.length);
  }

  return c;
}

function syntaxError(message) {
  const err = new SyntaxError(message);
  err.lineNumber = line;
  err.columnNumber = column;
  return err;
}
