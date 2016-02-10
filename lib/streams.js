var JSON5 = require('./json5');
var Transform = require('stream').Transform;
var inherits = require('util').inherits;

/**
 * This stream tries to parse its input as JSON5.
 * If it succeeds, it emits the resulting object as a JSON string.
 * Hint: feed on one character at a time to ensure best results.
 */
function TryJSON5toJSONstream(indents) {
    Transform.call(this, {encoding: 'utf8'});

    this._buffer = '';
    this._indents = indents === undefined ? 4 : indents;
}

inherits(TryJSON5toJSONstream, Transform);

TryJSON5toJSONstream.prototype._transform = function(chunk, encoding, callback) {
    this._buffer += chunk;
    var value;
    try {
        value = JSON5.parse(this._buffer);
        this._buffer = '';
    } catch (err) {
        callback();
        return;
    }
    this.push(this._stringify(value));
    callback();
};

TryJSON5toJSONstream.prototype._flush = function(callback) {
    var data = this._buffer.trim();
    var value;
    if (data) {
        try {
            value = JSON5.parse(data);
        } catch (err) {
            this.emit('error', err);
            return;
        }
        this.push(this._stringify(value));
    }

    callback();
};

TryJSON5toJSONstream.prototype._stringify = function stringify(obj) {
    return JSON.stringify(obj, null, this._indents) + (this._indents ? "\n" : '');
};


/**
 * CharacterGateStream
 * Emits chunks of characters delimited some values.
 * Useful for splitting up input streams of JSON5 into bite-sized portions for
 * the parser.
 */

function CharacterGateStream(chars) {
    Transform.call(this, {encoding: 'utf8'});
    this._chars = chars;
    this._buffer = '';
}

inherits(CharacterGateStream, Transform);

CharacterGateStream.prototype._transform = function(chunk, _, callback) {
    chunk = '' + chunk;
    for (var i=0; i<chunk.length; i++) {
        if (this._chars.indexOf(chunk[i]) > -1) {
            this._buffer += chunk.slice(0, i + 1);
            this.push(this._buffer);
            this._buffer = '';

            // reset to begining of remaining chunk
            chunk = chunk.slice(i + 1);
            i = 0;
        }
    }
    // no matches in remaining chars so add them to buff anyways
    this._buffer += chunk;
    callback();
};

CharacterGateStream.prototype._flush = function(callback) {
    if (this._buffer) this.push(this._buffer);
    callback();
};


/**
 * a utility function to create a transform that logs everything it sees.
 */
function logger(title) {
    var stream = new Transform({encoding: 'utf8'});
    stream._transform = function(chunk, enc, cb) {
        console.log(title, '' + chunk);
        this.push(chunk);
        cb();
    };
    return stream;
}


module.exports = {
    JSON5toJSONstream: TryJSON5toJSONstream,
    CharacterGateStream: CharacterGateStream,
    logger: logger
};
