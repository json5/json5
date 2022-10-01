#!/usr/bin/env node

/**
 * @file Ensures that the Unreleased section of `CHANGELOG.md` has been updated
 * for features, fixes, and breaking changes, and exits with a non-zero exit
 * code otherwise.
 *
 * The first command-line argument is the path to the commit message; typically
 * `.git/COMMIT_EDITMSG`.
 */

const fs = require('fs')
const {default: parse} = require('@commitlint/parse')
const config = require('conventional-changelog-conventionalcommits')
const {simpleGit} = require('simple-git')
const {color} = require('../util')

async function main() {
  const {parserOpts} = await config()
  const messagePath = process.argv[2]
  const {type, notes} = await parse(
    fs.readFileSync(messagePath, 'utf8'),
    undefined,
    parserOpts,
  )

  if (
    type === 'feat' ||
    type === 'fix' ||
    notes.some(({title}) => /^BREAKING[- ]CHANGE$/.test(title))
  ) {
    const c = await color()
    const errorMessage =
      `${c.error('✖')} The Unreleased section of ${c.filename(
        'CHANGELOG.md',
      )} must be updated and staged for ${c.keyword('features')}, ${c.keyword(
        'fixes',
      )}, and ${c.keyword('breaking changes')}.\n` +
      `  Please update ${c.filename('CHANGELOG.md')}, run ${c.command(
        'git add CHANGELOG.md',
      )}, then try committing again.`

    const git = simpleGit()
    const stagedFiles = await git.diff(['--cached', '--name-only'])
    if (!/^CHANGELOG\.md$/m.test(stagedFiles)) {
      console.error(errorMessage)
      process.exitCode = 1
      return
    }

    const headChangelog = await git.show(['HEAD:CHANGELOG.md'])
    const stagedChangelog = await git.show([':CHANGELOG.md'])
    if (getUnreleased(headChangelog) === getUnreleased(stagedChangelog)) {
      console.error(errorMessage)
      process.exitCode = 1
      return
    }
  }
}

/**
 * Gets the Unreleased section of a changelog.
 * @param {string} changelog The contents of the changelog.
 * @returns {string | undefined} The contents of the Unreleased section of the
 * changelog or `undefined` if not found.
 */
function getUnreleased(changelog) {
  const unreleasedRegExp = /^## Unreleased\n\n(.+?)^## v/ms
  const [, unreleased] = unreleasedRegExp.exec(changelog) || []
  return unreleased
}

main().catch(err => {
  console.error(err.message)
  process.exitCode = 1
})
