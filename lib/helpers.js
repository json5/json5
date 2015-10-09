// helper functions for use in json5 and tests

function isWordChar(char) {
    return (char >= 'a' && char <= 'z') ||
        (char >= 'A' && char <= 'Z') ||
        (char >= '0' && char <= '9') ||
        char === '_' || char === '$';
}

function isWordStart(char) {
    return (char >= 'a' && char <= 'z') ||
        (char >= 'A' && char <= 'Z') ||
        char === '_' || char === '$';
}

function isWord(key) {
    if (typeof key !== 'string') {
        return false;
    }
    if (!isWordStart(key[0])) {
        return false;
    }
    var i = 1, length = key.length;
    while (i < length) {
        if (!isWordChar(key[i])) {
            return false;
        }
        i++;
    }
    return true;
}

module.exports = {
  isWord: isWord
};
