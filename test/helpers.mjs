// Shared fixtures: boot the Host half against an in-memory session store.
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
export const BUNDLE = pathToFileURL(join(ROOT, 'index.js')).href

/** One assistant message event carrying provider usage. */
export function message(id, turn, usage, options = {}) {
  return {
    type: 'assistant/message',
    seq: options.seq ?? 1,
    time: options.time ?? Date.now(),
    data: {
      turn,
      step: options.step ?? turn,
      message: {
        id,
        role: 'assistant',
        source: { kind: 'model', provider: options.provider ?? 'deepseek-official', model: options.model ?? 'deepseek-flash' },
      },
      usage: {
        inputTokens: usage[0] ?? 0,
        cacheReadTokens: usage[1] ?? 0,
        cacheWriteTokens: usage[2] ?? 0,
        outputTokens: usage[3] ?? 0,
        totalTokens: (usage[0] ?? 0) + (usage[1] ?? 0) + (usage[2] ?? 0) + (usage[3] ?? 0),
      },
    },
  }
}

/** A stored Session as the persistence service would report it. */
export function session(id, events, options = {}) {
  const header = {
    version: 4,
    id,
    createdAt: options.createdAt ?? Date.now() - 3_600_000,
    cwd: options.cwd ?? 'C:\\workspace',
    isSeeded: false,
    delegationDepth: options.delegationDepth ?? 0,
  }
  for (const [index, event] of events.entries()) event.seq = index
  return { id, header, events, revision: options.revision ?? 'r1' }
}

/** Boot the plugin with a fake Host context; returns the registered routes. */
export async function boot({ sessions = [], live = [], config = {}, services = {}, home } = {}) {
  const root = home ?? mkdtempSync(join(tmpdir(), 'dsh-usage-'))
  process.env.DSH_HOME = root

  const byId = new Map(sessions.map((entry) => [entry.id, entry]))
  const persistence = {
    async list() {
      return sessions.map((entry) => ({ header: entry.header, revision: entry.revision }))
    },
    async stat(id) {
      const found = byId.get(id)
      if (found === undefined) throw new Error(`no session ${id}`)
      return { header: found.header, revision: found.revision }
    },
    async open(id) {
      const found = byId.get(id)
      if (found === undefined) throw new Error(`no session ${id}`)
      return { header: found.header, async read() { return { events: found.events } }, async close() {} }
    },
  }

  const liveStore = live.length === 0 ? undefined : { list: () => live, get: (id) => live.find((entry) => String(entry.id) === String(id)) }

  const routes = new Map()
  const ctx = {
    effect(fn) {
      fn()
      return () => {}
    },
    get(name) {
      if (services[name] !== undefined) return services[name]
      if (name === 'sessionPersistence') return persistence
      if (name === 'sessions') return liveStore
      return undefined
    },
    connection: {
      fetch: {
        register(route) {
          routes.set(route.path, route.fetch)
          return Promise.resolve(async () => {})
        },
      },
    },
  }

  const module = await import(BUNDLE)
  module.apply(ctx, config)

  const call = async (path, query = {}) => {
    const handler = routes.get(path)
    if (handler === undefined) throw new Error(`route not registered: ${path}`)
    const url = new URL(`http://127.0.0.1${path}`)
    for (const [key, value] of Object.entries(query)) url.searchParams.set(key, value)
    const response = await handler(new Request(url))
    return { status: response.status, body: await response.json() }
  }

  return { routes, call, home: root }
}
