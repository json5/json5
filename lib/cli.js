#!/usr/bin/env node

// cli.js
// JSON5 command-line interface.

var FS = require('fs');
var JSON5 = require('./json5');
var Path = require('path');
var Transform = require('stream').Transform;
var yargs = require('yargs')
        .help('h').alias('h', 'help')
        .option('c', {
            alias: 'compile',
            describe: 'Compiles JSON5 files into sibling JSON files with the same basenames.',
            type: 'boolean'
        })
        .option('stdin', {
            describe: 'read JSON5 from STDIN, write JSON to STDOUT',
            type: 'boolean'
        })
        .option('indent', {
            describe: 'intentation level for pretty-printing JSON',
            default: 4
        })
        .strict()
        .check(function(argv, opts) {
            if (argv.c && argv.stdin) {
                throw new Error('conflicting options: -c and --stdin');
            }

            if (argv.c && argv._.length === 0) {
                throw new Error('-c set, but no JSON5 files given');
            }

            if (!argv.c && !argv.stdin) {
                throw new Error('not enough options');
            }

            return true;
        });

var argv = yargs.argv;

function compileFiles(files, indent) {
    var cwd = process.cwd();

    // iterate over each file and convert JSON5 files to JSON:
    files.forEach(function (file) {
        var path = Path.resolve(cwd, file);
        var basename = Path.basename(path, '.json5');
        var dirname = Path.dirname(path);

        var json5 = FS.readFileSync(path, 'utf8');
        var obj = JSON5.parse(json5);
        var json = JSON.stringify(obj, null, indent) + (indent ? "\n" : '');

        path = Path.join(dirname, basename + '.json');
        FS.writeFileSync(path, json, 'utf8');
    });
}

// stream that accumulates data, trying to parse it as JSON5
function JSON5toJSONstream(spacing) {
    var stream = new Transform({ encoding: 'utf8' });
    var currentData = '';
    var indent = spacing === undefined ? 4 : spacing;

    function stringify(val) {
        return JSON.stringify(val, null, indent) + (indent ? "\n" : '');
    }

    stream._transform = function(chunk, encoding, callback) {
        currentData += chunk;
        var value;
        try {
            value = JSON5.parse(currentData);
            currentData = '';
        } catch (err) {
            callback();
            return;
        }
        this.push(stringify(value));
        callback();
    };

    // clean up any remaining stuff in currentData
    stream._flush = function(callback) {
        var data = currentData.trim();
        var value;
        if (data) {
            try {
                value = JSON5.parse(data);
            } catch (err) {
                this.emit('error', err);
                return;
            }
            this.push(stringify(value));
        }

        callback();
    };

    return stream;
}

// stream that emits one character at a time
function charStream() {
    var stream = new Transform({ encoding: 'utf8' });
    stream._transform = function(chunk, _, callback) {
        var str = '' + chunk;
        for (var i = 0; i < str.length; i++) {
            this.push(str[i]);
        }
        callback();
    };
    return stream;
}

function streamInOut(input, output, indent)  {
    var chars = charStream();
    var transcoder = JSON5toJSONstream(indent);
    input.pipe(chars).pipe(transcoder).pipe(output);
}

function main() {
    if (argv.c) return compileFiles(argv._, argv.indent);
    if (argv.stdin) return streamInOut(process.stdin, process.stdout, argv.indent);
}

main();
