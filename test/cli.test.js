import {test} from 'node:test'
import assert from 'node:assert'
import {spawnSync} from 'node:child_process'
import fs from 'node:fs'
import {fileURLToPath} from 'node:url'
import {createRequire} from 'node:module'

const require = createRequire(import.meta.url)
const pkg = require('../package.json')

const cliPath = fileURLToPath(new URL('../lib/cli.js', import.meta.url))
const testJson5 = fileURLToPath(new URL('./test.json5', import.meta.url))
const invalidJson5 = fileURLToPath(new URL('./invalid.json5', import.meta.url))
const outputJson = fileURLToPath(new URL('./output.json', import.meta.url))
const testJson = fileURLToPath(new URL('./test.json', import.meta.url))

function run (args, input) {
    return spawnSync(process.execPath, [cliPath, ...args], {
        input: input !== undefined ? input : undefined,
        encoding: 'utf8',
    })
}

function cleanup (file) {
    try {
        fs.unlinkSync(file)
    } catch (err) {}
}

test('CLI: converts JSON5 to JSON from stdin to stdout', () => {
    const {stdout} = run([], fs.readFileSync(testJson5))
    assert.strictEqual(stdout, '{"a":1,"b":2}')
})

test('CLI: reads from the specified file', () => {
    const {stdout} = run([testJson5])
    assert.strictEqual(stdout, '{"a":1,"b":2}')
})

test('CLI: indents output with the number of spaces specified with -s', () => {
    const {stdout} = run([testJson5, '-s', '4'])
    assert.strictEqual(stdout, '{\n    "a": 1,\n    "b": 2\n}')
})

test('CLI: indents output with the number of spaces specified with --space', () => {
    const {stdout} = run([testJson5, '--space', '4'])
    assert.strictEqual(stdout, '{\n    "a": 1,\n    "b": 2\n}')
})

test('CLI: indents output with tabs when specified with -s', () => {
    const {stdout} = run([testJson5, '-s', 't'])
    assert.strictEqual(stdout, '{\n\t"a": 1,\n\t"b": 2\n}')
})

test('CLI: outputs to the specified file with -o', () => {
    try {
        run([testJson5, '-o', outputJson])
        assert.strictEqual(fs.readFileSync(outputJson, 'utf8'), '{"a":1,"b":2}')
    } finally {
        cleanup(outputJson)
    }
})

test('CLI: outputs to the specified file with --out-file', () => {
    try {
        run([testJson5, '--out-file', outputJson])
        assert.strictEqual(fs.readFileSync(outputJson, 'utf8'), '{"a":1,"b":2}')
    } finally {
        cleanup(outputJson)
    }
})

test('CLI: validates valid JSON5 files with -v', () => {
    const {status} = run([testJson5, '-v'])
    assert.strictEqual(status, 0)
})

test('CLI: validates valid JSON5 files with --validate', () => {
    const {status} = run([testJson5, '--validate'])
    assert.strictEqual(status, 0)
})

test('CLI: validates invalid JSON5 files with -v', () => {
    const {status, stderr} = run([invalidJson5, '-v'])
    assert.strictEqual(stderr, "JSON5: invalid character 'a' at 1:1\n")
    assert.strictEqual(status, 1)
})

test('CLI: outputs the version number when specified with -V', () => {
    const {stdout} = run(['-V'])
    assert.strictEqual(stdout, pkg.version + '\n')
})

test('CLI: outputs the version number when specified with --version', () => {
    const {stdout} = run(['--version'])
    assert.strictEqual(stdout, pkg.version + '\n')
})

test('CLI: outputs usage information when specified with -h', () => {
    const {stdout} = run(['-h'])
    assert.ok(/Usage/.test(stdout))
})

test('CLI: outputs usage information when specified with --help', () => {
    const {stdout} = run(['--help'])
    assert.ok(/Usage/.test(stdout))
})

test('CLI: is backward compatible with v0.5.1 with -c', () => {
    try {
        run(['-c', testJson5])
        assert.strictEqual(fs.readFileSync(testJson, 'utf8'), '{"a":1,"b":2}')
    } finally {
        cleanup(testJson)
    }
})

test('CLI: is backward compatible with v0.5.1 with --convert', () => {
    try {
        run(['--convert', testJson5])
        assert.strictEqual(fs.readFileSync(testJson, 'utf8'), '{"a":1,"b":2}')
    } finally {
        cleanup(testJson)
    }
})
