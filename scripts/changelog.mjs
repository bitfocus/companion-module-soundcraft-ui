/**
 * Creates a new changelog section from git commits since the last tag.
 *
 * Usage:
 *   node scripts/changelog.mjs <version>
 *
 * Example:
 *   node scripts/changelog.mjs 3.11.0
 */

import { execSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const CHANGELOG_PATH = resolve(ROOT, 'CHANGELOG.md')
const REPO_URL = 'https://github.com/bitfocus/companion-module-soundcraft-ui'

const version = process.argv[2]
if (!version) {
	throw new Error('Usage: node scripts/changelog.mjs <version>')
}

function git(cmd) {
	return execSync(cmd, { cwd: ROOT, encoding: 'utf-8' }).trim()
}

// Find the latest tag to use as the base for the changelog
const latestTag = git('git describe --tags --abbrev=0')
console.log(`Collecting commits since ${latestTag} ...`)

// Get commits since the last tag
const log = git(`git log ${latestTag}..HEAD --pretty=format:"%H %s"`)

if (!log) {
	throw new Error('No commits found since the last tag.')
}

const lines = log.split('\n').map((line) => {
	const spaceIndex = line.indexOf(' ')
	const hash = line.slice(0, spaceIndex)
	const message = line.slice(spaceIndex + 1)
	const shortHash = hash.slice(0, 7)
	return `- ${message} ([${shortHash}](${REPO_URL}/commit/${hash}))`
})

const today = new Date().toISOString().slice(0, 10)
const section = `# ${version} (${today})\n\n${lines.join('\n')}`

const existingChangelog = readFileSync(CHANGELOG_PATH, 'utf-8')
writeFileSync(CHANGELOG_PATH, `${section}\n\n${existingChangelog}`)

console.log(`\nAdded changelog section for ${version}:\n`)
console.log(section)
