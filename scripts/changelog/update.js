#!/usr/bin/env node

/**
 * @file Renames the Unreleased section of `CHANGELOG.md` with the current
 * version and date, then creates a new Unreleased section.
 *
 * If the first command-line argument is `-a` or `--add`, then CHANGELOG.md will
 * be staged.
 */

const fs = require('fs')
const pkg = require('../../package.json')
const {simpleGit} = require('simple-git')

async function main() {
  const git = simpleGit()
  const stagedFiles = await git.diff(['--cached', '--name-only'])
  if (/^CHANGELOG\.md$/m.test(stagedFiles)) {
    console.error(
      'CHANGELOG.md cannot be staged.\n' +
        'Please run `git reset -- CHANGELOG.md` to fix.',
    )
    process.exitCode = 1
    return
  }

  const versionRegExp = new RegExp(`^## v${escapePattern(pkg.version)} -`, 'm')
  let changelog = fs.readFileSync('CHANGELOG.md', 'utf8')
  if (versionRegExp.test(changelog)) {
    console.error(
      `CHANGELOG.md already contains a section for v${pkg.version}.`,
    )
    process.exitCode = 1
    return
  }

  const date = new Date().toISOString().split('T')[0]
  changelog = changelog.replace(
    /^## Unreleased\n\n(.+?)^## v/ms,
    `## Unreleased\n\n## v${pkg.version} - ${date}\n\n$1## v`,
  )

  fs.writeFileSync('CHANGELOG.md', changelog)

  const addArg = process.argv[2]
  if (addArg === '-a' || addArg === '--add') {
    const git = simpleGit()
    await git.add(['CHANGELOG.md'])
  }
}

/**
 * Escapes a regular expression pattern for use in a RegExp constructor.
 * @param {string} pattern The regular expression pattern to escape.
 * @returns {string} The escaped pattern.
 */
function escapePattern(pattern) {
  return pattern.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&').replace(/-/g, '\\x2d')
}

main().catch(err => {
  console.error(err)
  process.exitCode = 1
})
