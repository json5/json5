module.exports.whitespace = /\s/
const validIdentifierCharacters = /[a-zA-Z_$][a-zA-Z0-9_$]*/
module.exports.validIdentifierCharacters = validIdentifierCharacters
module.exports.entirelyValidIdentifier = new RegExp('^' + validIdentifierCharacters.source + '$')
module.exports.number = /^NaN|(?:[-+]?(?:(?:Infinity)|(?:0[xX][a-fA-F0-9]+)|(?:0[bB][01]+)|(?:0[oO][0-7]+)|(?:(?:(?:[1-9]\d*|0)?\.\d+|(?:[1-9]\d*|0)\.\d*|(?:[1-9]\d*|0))(?:[E|e][+|-]?\d+)?)))/
module.exports.SINGLE_QUOTE = "'"
module.exports.DOUBLE_QUOTE = '"'
