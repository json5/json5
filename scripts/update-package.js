#!/usr/bin/env node

/**
 * @file Updates `package.json5` to match `package.json`. If part or all of
 * `package.json` is staged, then `package.json5` will be updated to match the
 * staged version of `package.json` and then staged.
 */

const fs = require('fs')
const {simpleGit} = require('simple-git')
const JSON5 = require('..')

async function main() {
  let pkg
  let isStaged = false
  const git = simpleGit()
  const stagedFiles = await git.diff(['--cached', '--name-only'])
  if (/^package\.json$/m.test(stagedFiles)) {
    const pkgJSON = await git.show([':package.json'])
    pkg = JSON5.parse(pkgJSON)
    isStaged = true
  } else {
    pkg = require('../package.json')
  }

  const pkg5JSON5 =
    '// This is a generated file. Do not edit.\n' +
    JSON5.stringify(pkg, null, 2)
  fs.writeFileSync(require.resolve('../package.json5'), pkg5JSON5)

  if (isStaged) {
    await git.add(['package.json5'])
  }
}

main().catch(err => {
  console.error(err)
  process.exitCode = 1
})
