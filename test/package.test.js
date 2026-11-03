// The published package is self-contained: manifests, exports, module ids.
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { test } from 'node:test'
import { fileURLToPath, pathToFileURL } from 'node:url'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const manifest = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'))

test('the manifest names what the Loader expects', () => {
  assert.equal(manifest.name, 'dsh-usage')
  assert.equal(manifest.type, 'module')
  assert.equal(manifest.dsh.bundle.patch, './cordis.patch.yml')
  assert.equal(manifest.dsh.client.platform, 'web')
  assert.ok(Array.isArray(manifest.dsh.client.inject) && manifest.dsh.client.inject.length > 0)
})

test('every export points at a file that ships', () => {
  for (const [key, target] of Object.entries(manifest.exports)) {
    const files = target.includes('*') ? ['en', 'fr'].map((stem) => target.replace('*', stem)) : [target]
    for (const file of files) {
      assert.ok(existsSync(join(ROOT, file)), `export ${key} -> ${file} is missing`)
    }
  }
})

test('the files list covers every export and the bundle patch', () => {
  const patterns = manifest.files ?? []
  const covered = (path) => patterns.some((pattern) => (pattern.includes('*') ? new RegExp(`^${pattern.replace(/[.]/g, '\\.').replace(/\*/g, '.*')}$`).test(path) : pattern === path))
  const required = [
    manifest.exports['.'].replace('./', ''),
    manifest.exports['./client'].replace('./', ''),
    manifest.dsh.bundle.patch.replace('./', ''),
    manifest.exports['./icon'].replace('./', ''),
    'locale/en.json',
  ]
  for (const file of required) assert.ok(covered(file), `${file} would not be published`)
})

test('the client module id matches the package name', () => {
  // A mismatch is silent: the slots simply never fill.
  const source = readFileSync(join(ROOT, 'client.js'), 'utf8')
  const match = source.match(/__ModuleLoader__\.load\(\s*\{\s*id:\s*['"]([^'"]+)['"]/)
  assert.ok(match !== null, 'client.js registers with the module loader')
  assert.equal(match[1], manifest.name)
})

test('the Host half exports the Loader contract', async () => {
  const module = await import(pathToFileURL(join(ROOT, 'index.js')).href)
  assert.equal(typeof module.apply, 'function')
  assert.ok(Array.isArray(module.inject))
  assert.equal(typeof module.name, 'string')
})

test('the Harness version floor is declared', () => {
  assert.equal(typeof manifest.engines?.dsh, 'string')
  assert.ok(manifest.engines.dsh.length > 0)
})

test('the shipped files carry no machine-specific path', () => {
  const files = ['client.js', 'index.js', 'package.json', 'cordis.patch.yml']
  for (const file of files) {
    const text = readFileSync(join(ROOT, file), 'utf8')
    for (const needle of ['C:\\', 'C:/Users', '/Users/simon', 'Sandbox']) {
      assert.ok(!text.includes(needle), `${file} hard-codes ${needle}`)
    }
  }
})

test('the locale files parse and cover both shipped lists', () => {
  for (const file of ['locale/en.json', 'locale/fr.json']) {
    const parsed = JSON.parse(readFileSync(join(ROOT, file), 'utf8'))
    assert.equal(typeof parsed, 'object')
    assert.ok(Object.keys(parsed).length > 0)
  }
})
